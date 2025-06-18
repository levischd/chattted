import {
    conversationInsertSchema,
    conversationUpdateSchema,
} from '@/server/db/schema';
import { z } from 'zod';
import * as chatActions from '../actions/chat-actions';
import { j, privateProcedure } from '../jstack';

export const chatRouter = j.router({
    createConversation: privateProcedure
        .input(conversationInsertSchema)
        .mutation(async ({ ctx, input, c }) => {
            const conversation = await chatActions.createConversation(
                ctx.db,
                input
            );
            return c.superjson(conversation);
        }),

    updateConversation: privateProcedure
        .input(
            z.object({
                id: z.string(),
                conversation: conversationUpdateSchema,
            })
        )
        .mutation(async ({ ctx, input, c }) => {
            const conversation = await chatActions.updateConversation(
                ctx.db,
                input.id,
                input.conversation
            );
            return c.superjson(conversation);
        }),

    deleteConversation: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input, c }) => {
            await chatActions.deleteConversation(ctx.db, input.id);
            return c.superjson(input);
        }),

    getConversation: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input, c }) => {
            const result = await chatActions.getConversationWithMessages(
                ctx.db,
                input.id,
                ctx.user.id
            );
            return c.superjson(result);
        }),

    getMessages: privateProcedure
        .input(z.object({ conversationId: z.string() }))
        .query(async ({ ctx, input, c }) => {
            const messages = await chatActions.getMessages(
                ctx.db,
                input.conversationId
            );
            return c.superjson(messages);
        }),

    getConversations: privateProcedure
        .input(
            z
                .object({
                    search: z.string().optional(),
                })
                .optional()
        )
        .query(async ({ ctx, input, c }) => {
            const conversations = await chatActions.getConversations(
                ctx.db,
                ctx.user.id,
                input?.search
            );
            return c.superjson(conversations);
        }),

    createBranch: privateProcedure
        .input(z.object({ conversationId: z.string(), messageId: z.string() }))
        .mutation(async ({ ctx, input, c }) => {
            const newConversation =
                await chatActions.createBranchFromConversation(
                    ctx.db,
                    input.conversationId,
                    input.messageId,
                    ctx.user.id
                );
            return c.superjson(newConversation);
        }),
});
