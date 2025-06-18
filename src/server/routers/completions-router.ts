import {
    DEFAULT_TITLE_MODEL_ID,
    type ModelId,
    aiProvider,
    models,
} from '@/lib/config/models';
import { generateTitle } from '@/lib/llm/generate-title';
import { appendResponseMessages, smoothStream, streamText } from 'ai';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import * as completionsActions from '../actions/completions-actions';
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
                attachments: z.array(
                    z
                        .file()
                        .max(10_000_000)
                        .mime(['image/png', 'application/pdf', 'image/jpeg'])
                ),
                modelId: z.enum(Object.keys(models) as [ModelId, ...ModelId[]]),
            })
        )
        .mutation(async ({ ctx, input, c }) => {
            const { db, user } = ctx;
            const { id, messages: inputMessages, modelId } = input;

            // Validate model and provider upfront
            const model = models[modelId];
            if (!model || !model.provider) {
                throw new HTTPException(400, {
                    message: 'Invalid model ID',
                });
            }
            const titleProvider = models[DEFAULT_TITLE_MODEL_ID].provider;
            const llmProvider = model.provider;

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

            // Get or create conversation
            const conversation =
                await completionsActions.getOrCreateConversation(
                    db,
                    id,
                    modelId,
                    user.id
                );

            // Update model if changed
            if (conversation.modelId !== modelId) {
                await completionsActions.updateConversationModel(
                    db,
                    id,
                    modelId
                );
            }

            // Sync messages
            try {
                await completionsActions.syncMessages(
                    db,
                    id,
                    inputMessages.map((message) => ({
                        ...message,
                        conversationId: id,
                    }))
                );
            } catch (error) {
                console.error('Message synchronization failed:', error);
                throw new HTTPException(500, {
                    message: 'Failed to synchronize messages',
                });
            }

            // Generate title if it's the first message
            if (inputMessages.length === 1) {
                const title = await generateTitle(
                    aiProvider.languageModel(DEFAULT_TITLE_MODEL_ID),
                    inputMessages
                );
                await completionsActions.updateConversationTitle(db, id, title);
            }

            // Prepare messages for the model
            const coreMessages = inputMessages.map((message) => ({
                id: message.id,
                role: message.role,
                content: message.content,
            }));

            let finalContent = '';
            const result = streamText({
                model: aiProvider.languageModel(modelId),
                messages: coreMessages,
                experimental_transform: smoothStream({ chunking: 'word' }),
                onFinish: async ({ response }) => {
                    const messages = appendResponseMessages({
                        messages: coreMessages.map((message) => ({
                            id: message.id,
                            role: message.role,
                            content: message.content,
                        })),
                        responseMessages: response.messages,
                    });
                    const assistantMessage = messages.at(-1);
                    if (!assistantMessage) {
                        return;
                    }
                    await completionsActions.insertMessage(db, {
                        conversationId: id,
                        role: 'assistant',
                        content: assistantMessage.content,
                        parts: assistantMessage.parts,
                    });
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
                await completionsActions.insertMessage(db, {
                    conversationId: id,
                    role: 'assistant',
                    content: finalContent,
                });
            });

            result.consumeStream();

            return result.toDataStreamResponse({
                sendReasoning: true,
                sendUsage: true,
                sendSources: true,
                getErrorMessage: () => {
                    return 'An error occurred, please try again!';
                },
            });
        }),
});
