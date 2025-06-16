import {
    DEFAULT_TITLE_MODEL_ID,
    MODELS,
    type ModelId,
} from '@/lib/config/models';
import { createProviderInstance } from '@/lib/config/providers';
import { generateTitle } from '@/lib/llm/generate-title';
import { smoothStream, streamText } from 'ai';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { conversationsTable, messagesTable } from '../db/schema';
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
        .mutation(async ({ ctx, input, c }) => {
            const { db, user } = ctx;
            const { id, messages: inputMessages, modelId } = input;

            // Validate model and provider upfront
            const model = MODELS.find((m) => m.id === modelId);
            if (!model || !model.provider) {
                throw new HTTPException(400, {
                    message: 'Invalid model ID',
                });
            }
            const titleProvider = MODELS.find(
                (model) => model.id === DEFAULT_TITLE_MODEL_ID
            )?.provider;
            const llmProvider = createProviderInstance(model.provider);

            if (!titleProvider) {
                throw new HTTPException(400, {
                    message: 'Invalid title model ID',
                });
            }

            if (!llmProvider) {
                throw new HTTPException(400, {
                    message: 'Invalid model provider',
                });
            }

            // Get or create conversation first
            let [conversation] = await db
                .select()
                .from(conversationsTable)
                .where(eq(conversationsTable.id, id));

            if (!conversation) {
                try {
                    [conversation] = await db
                        .insert(conversationsTable)
                        .values({
                            id,
                            modelId,
                            userId: user.id,
                        })
                        .returning();
                } catch (error) {
                    // Handle potential duplicate key error
                    [conversation] = await db
                        .select()
                        .from(conversationsTable)
                        .where(eq(conversationsTable.id, id));
                }
            }

            if (!conversation) {
                throw new HTTPException(500, {
                    message: 'Failed to create or retrieve conversation',
                });
            }

            // Update conversation model if changed
            if (conversation.modelId !== modelId) {
                try {
                    await db
                        .update(conversationsTable)
                        .set({ modelId })
                        .where(eq(conversationsTable.id, id));
                } catch (error) {
                    console.error(
                        'Failed to update conversation model:',
                        error
                    );
                    // Continue with old model rather than failing
                }
            }

            // Handle message synchronization sequentially to minimize race conditions
            try {
                // Get existing messages
                const existingMessages = await db
                    .select()
                    .from(messagesTable)
                    .where(eq(messagesTable.conversationId, id));

                // Delete messages that are no longer in the input
                const messagesToDelete = existingMessages.filter(
                    (msg) => !inputMessages.find((m) => m.id === msg.id)
                );

                for (const message of messagesToDelete) {
                    try {
                        await db
                            .delete(messagesTable)
                            .where(eq(messagesTable.id, message.id));
                    } catch (error) {
                        console.error(
                            `Failed to delete message ${message.id}:`,
                            error
                        );
                    }
                }

                // Insert new messages with their original IDs
                const messagesToInsert = inputMessages.filter(
                    (msg) => !existingMessages.find((m) => m.id === msg.id)
                );

                for (const message of messagesToInsert) {
                    try {
                        await db.insert(messagesTable).values({
                            id: message.id, // Keep original ID
                            conversationId: id,
                            role: message.role,
                            content: message.content,
                        });
                    } catch (error) {
                        console.error(
                            `Failed to insert message ${message.id}:`,
                            error
                        );
                        // For critical user messages, we might want to throw here
                        if (message.role === 'user') {
                            throw new HTTPException(500, {
                                message: 'Failed to save user message',
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Message synchronization failed:', error);
                throw new HTTPException(500, {
                    message: 'Failed to synchronize messages',
                });
            }

            // Generate title if it's the first message
            if (inputMessages.length === 1) {
                try {
                    const title = await generateTitle(
                        titleProvider,
                        DEFAULT_TITLE_MODEL_ID,
                        inputMessages
                    );

                    await db
                        .update(conversationsTable)
                        .set({ title })
                        .where(eq(conversationsTable.id, id));
                } catch (error) {
                    console.error('Failed to generate or save title:', error);
                }
            }

            // Prepare messages for the model
            const coreMessages = inputMessages.map((message) => ({
                role: message.role,
                content: message.content,
            }));

            // Stream the response
            let finalContent = '';

            const result = streamText({
                model: llmProvider(modelId),
                messages: coreMessages,
                experimental_transform: smoothStream({ chunking: 'word' }),
                onFinish: async ({ text, finishReason, usage }) => {
                    console.log('onFinish', text);
                    try {
                        await db.insert(messagesTable).values({
                            conversationId: id,
                            role: 'assistant',
                            content: text,
                        });
                    } catch (error) {
                        console.error(
                            'Failed to save assistant message:',
                            error
                        );
                    }
                },
                onChunk: ({ chunk }) => {
                    if (chunk.type === 'text-delta') {
                        finalContent += chunk.textDelta;
                    }
                },
                onError: (error) => {
                    console.error('Error streaming response:', error);
                },
                abortSignal: c.req.raw.signal,
            });

            c.req.raw.signal.addEventListener('abort', async () => {
                await db.insert(messagesTable).values({
                    conversationId: id,
                    role: 'assistant',
                    content: finalContent,
                });
            });

            return result.toDataStreamResponse();
        }),
});
