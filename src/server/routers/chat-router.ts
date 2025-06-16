import {
    conversationInsertSchema,
    conversationUpdateSchema,
    conversationsTable,
    messagesTable,
} from '@/server/db/schema';
import { and, asc, desc, eq, lte, or, sql } from 'drizzle-orm';
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
                .where(eq(conversationsTable.id, input.id))
                .orderBy(asc(messagesTable.updatedAt));

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

    getConversations: privateProcedure
        .input(
            z
                .object({
                    search: z.string().optional(),
                })
                .optional()
        )
        .query(async ({ ctx, input, c }) => {
            const { db, user } = ctx;
            const search = input?.search;

            if (!search || search.trim().length === 0) {
                // Normale Abfrage ohne Suche
                const results = await db
                    .select()
                    .from(conversationsTable)
                    .where(eq(conversationsTable.userId, user.id))
                    .orderBy(desc(conversationsTable.updatedAt));

                return c.superjson(results);
            }

            // Erweiterte Suche in Titeln und Messages mit Ranking (sprachunabhängig)
            const searchTerm = search.trim();

            const results = await db
                .selectDistinctOn([conversationsTable.id], {
                    id: conversationsTable.id,
                    userId: conversationsTable.userId,
                    title: conversationsTable.title,
                    modelId: conversationsTable.modelId,
                    isPinned: conversationsTable.isPinned,
                    createdAt: conversationsTable.createdAt,
                    updatedAt: conversationsTable.updatedAt,
                    rank: sql<number>`
            ts_rank(
                setweight(to_tsvector('simple', ${conversationsTable.title}), 'A') ||
                setweight(to_tsvector('simple', coalesce(${messagesTable.content}, '')), 'B'),
                websearch_to_tsquery('simple', ${searchTerm})
            )
        `,
                })
                .from(conversationsTable)
                .leftJoin(
                    messagesTable,
                    eq(conversationsTable.id, messagesTable.conversationId)
                )
                .where(
                    and(
                        eq(conversationsTable.userId, user.id),
                        sql`(
                setweight(to_tsvector('simple', ${conversationsTable.title}), 'A') ||
                setweight(to_tsvector('simple', coalesce(${messagesTable.content}, '')), 'B')
            ) @@ websearch_to_tsquery('simple', ${searchTerm})`
                    )
                )
                .orderBy(
                    conversationsTable.id, // Must come first for DISTINCT ON
                    sql`ts_rank(
            setweight(to_tsvector('simple', ${conversationsTable.title}), 'A') ||
            setweight(to_tsvector('simple', coalesce(${messagesTable.content}, '')), 'B'),
            websearch_to_tsquery('simple', ${searchTerm})
        ) DESC`
                );

            // Entferne das rank field aus der Antwort (nur für interne Sortierung verwendet)
            const conversations = results.map(
                ({ rank, ...conversation }) => conversation
            );

            return c.superjson(conversations);
        }),

    createBranch: privateProcedure
        .input(z.object({ conversationId: z.string(), messageId: z.string() }))
        .mutation(async ({ ctx, input, c }) => {
            const { db, user } = ctx;
            const { conversationId, messageId } = input;

            const [conversation] = await db
                .select()
                .from(conversationsTable)
                .where(eq(conversationsTable.id, conversationId));

            if (!conversation) {
                throw new HTTPException(404, {
                    message: 'Conversation not found',
                });
            }

            // Find the target message to get its timestamp
            const [targetMessage] = await db
                .select()
                .from(messagesTable)
                .where(
                    and(
                        eq(messagesTable.conversationId, conversationId),
                        eq(messagesTable.id, messageId)
                    )
                );

            if (!targetMessage) {
                throw new HTTPException(404, {
                    message: 'Message not found',
                });
            }

            // Get all messages up to and including the target message
            const chatMessages = await db
                .select()
                .from(messagesTable)
                .where(
                    and(
                        eq(messagesTable.conversationId, conversationId),
                        or(
                            lte(
                                messagesTable.updatedAt,
                                targetMessage.updatedAt
                            ),
                            eq(messagesTable.id, targetMessage.id)
                        )
                    )
                )
                .orderBy(messagesTable.updatedAt);

            const [newConversation] = await db
                .insert(conversationsTable)
                .values({
                    title: `${conversation.title} (Copy)`,
                    userId: user.id,
                    modelId: conversation.modelId,
                    isPinned: conversation.isPinned,
                })
                .returning();

            if (!newConversation) {
                throw new HTTPException(500, {
                    message: 'Failed to create new conversation',
                });
            }

            if (chatMessages.length > 0) {
                await db.insert(messagesTable).values(
                    chatMessages.map((message) => ({
                        ...message,
                        id: undefined, // Let the database generate new IDs
                        conversationId: newConversation.id,
                    }))
                );
            }

            return c.superjson(newConversation);
        }),
});
