import {
    DEFAULT_TITLE_MODEL_ID,
    MODELS,
    type ModelId,
} from '@/lib/config/models';
import { createProviderInstance } from '@/lib/config/providers';
import { generateTitle } from '@/lib/llm/generate-title';
import { streamText } from 'ai';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import {
    type Conversation,
    conversationsTable,
    messagesTable,
} from '../db/schema';
import { j, privateProcedure } from '../jstack';

export const completionsRouter = j.router({
    create: privateProcedure
        .input(
            z.object({
                id: z.string(),
                messages: z.array(
                    z.object({
                        id: z.string(),
                        role: z.enum(['user', 'assistant']),
                        content: z.string(),
                    })
                ),
                modelId: z.enum(
                    MODELS.map((model) => model.id) as [ModelId, ...ModelId[]]
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, user } = ctx;
            const { id, messages: inputMessages, modelId } = input;

            let [conversation] = await db
                .select()
                .from(conversationsTable)
                .where(eq(conversationsTable.id, id));

            if (!conversation) {
                [conversation] = await db
                    .insert(conversationsTable)
                    .values({
                        id,
                        modelId,
                        userId: user.id,
                    })
                    .returning();
            }

            if (!conversation) {
                throw new HTTPException(404, {
                    message: 'Failed to create conversation',
                });
            }

            const providerId = MODELS.find(
                (model) => model.id === modelId
            )?.provider;

            if (!providerId) {
                throw new HTTPException(400, {
                    message: 'Invalid model ID',
                });
            }

            const provider = createProviderInstance(providerId);

            const coreMessages = inputMessages.map((message) => ({
                role: message.role,
                content: message.content,
            }));

            const result = streamText({
                model: provider(modelId),
                messages: coreMessages,
                onFinish: async (message) => {
                    await db.insert(messagesTable).values({
                        conversationId: id,
                        role: 'assistant',
                        content: message.text,
                    });
                },
            });

            await Promise.allSettled([
                (async () => {
                    const updateData: Partial<Conversation> = {
                        modelId,
                    };

                    if (inputMessages.length === 1) {
                        const title = await generateTitle(
                            providerId,
                            DEFAULT_TITLE_MODEL_ID,
                            inputMessages
                        );
                        updateData.title = title;
                    }

                    await db
                        .update(conversationsTable)
                        .set(updateData)
                        .where(eq(conversationsTable.id, id));
                })(),

                (async () => {
                    const messages = await db
                        .select()
                        .from(messagesTable)
                        .where(eq(messagesTable.conversationId, id));

                    for (const message of inputMessages) {
                        if (!messages.find((m) => m.id === message.id)) {
                            await db.insert(messagesTable).values({
                                conversationId: id,
                                role: message.role,
                                content: message.content,
                            });
                        }
                    }

                    for (const message of messages) {
                        if (!inputMessages.find((m) => m.id === message.id)) {
                            await db
                                .delete(messagesTable)
                                .where(eq(messagesTable.id, message.id));
                        }
                    }
                })(),
            ]);

            return result.toDataStreamResponse();
        }),
});

export default completionsRouter;
