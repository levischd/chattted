import {
    conversationInsertSchema,
    conversationUpdateSchema,
    conversationsTable,
    messagesTable,
} from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { j, privateProcedure } from '../jstack';

export const chatRouter = j.router({
    createConversation: privateProcedure
        .input(conversationInsertSchema)
        .mutation(async ({ ctx, input, c }) => {
            const { db } = ctx;
            const [conversation] = await db
                .insert(conversationsTable)
                .values(input)
                .returning();

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
            const { db } = ctx;

            const { id, conversation: updateData } = input;

            const [conversation] = await db
                .update(conversationsTable)
                .set(updateData)
                .where(eq(conversationsTable.id, id))
                .returning();

            return c.superjson(conversation);
        }),

    deleteConversation: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input, c }) => {
            const { db } = ctx;

            await db
                .delete(conversationsTable)
                .where(eq(conversationsTable.id, input.id));

            return c.superjson(input);
        }),

    getConversation: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input, c }) => {
            const { db } = ctx;

            const results = await db
                .select()
                .from(conversationsTable)
                .leftJoin(
                    messagesTable,
                    eq(conversationsTable.id, messagesTable.conversationId)
                )
                .where(eq(conversationsTable.id, input.id));

            const conversation = results[0]?.conversations;
            const messages = results
                .map((r) => r.messages)
                .filter((m) => m !== null);

            if (!conversation) {
                throw new HTTPException(404, {
                    message: 'Conversation not found',
                });
            }

            return c.superjson({ conversation, messages });
        }),

    getMessages: privateProcedure
        .input(z.object({ conversationId: z.string() }))
        .query(async ({ ctx, input, c }) => {
            const { db } = ctx;

            const results = await db
                .select()
                .from(messagesTable)
                .where(eq(messagesTable.conversationId, input.conversationId));

            return c.superjson(results);
        }),

    getConversations: privateProcedure.query(async ({ ctx, c }) => {
        const { db, user } = ctx;

        const results = await db
            .select()
            .from(conversationsTable)
            .where(eq(conversationsTable.userId, user.id));

        return c.superjson(results);
    }),
});
