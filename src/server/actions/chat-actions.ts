import type { db } from '@/lib/db';
import {
    type conversationInsertSchema,
    type conversationUpdateSchema,
    conversationsTable,
    messagesTable,
} from '@/server/db/schema';
import { and, asc, desc, eq, lte, or, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';

type DrizzleDB = typeof db;

export async function createConversation(
    db: DrizzleDB,
    input: z.infer<typeof conversationInsertSchema>
) {
    const [conversation] = await db
        .insert(conversationsTable)
        .values(input)
        .returning();

    return conversation;
}

export async function updateConversation(
    db: DrizzleDB,
    id: string,
    updateData: z.infer<typeof conversationUpdateSchema>
) {
    const [conversation] = await db
        .update(conversationsTable)
        .set(updateData)
        .where(eq(conversationsTable.id, id))
        .returning();

    return conversation;
}

export async function deleteConversation(db: DrizzleDB, id: string) {
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
}

export async function getConversationWithMessages(
    db: DrizzleDB,
    conversationId: string,
    userId: string
) {
    const results = await db
        .select()
        .from(conversationsTable)
        .leftJoin(
            messagesTable,
            eq(conversationsTable.id, messagesTable.conversationId)
        )
        .where(
            and(
                eq(conversationsTable.id, conversationId),
                eq(conversationsTable.userId, userId)
            )
        )
        .orderBy(asc(messagesTable.updatedAt));

    const conversation = results[0]?.conversations;
    const messages = results.map((r) => r.messages).filter((m) => m !== null);

    if (!conversation) {
        throw new HTTPException(404, {
            message: 'Conversation not found',
        });
    }

    return { conversation, messages };
}

export async function getMessages(db: DrizzleDB, conversationId: string) {
    const results = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conversationId));

    return results;
}

export async function getConversations(
    db: DrizzleDB,
    userId: string,
    search?: string
) {
    if (!search || search.trim().length === 0) {
        const results = await db
            .select()
            .from(conversationsTable)
            .where(eq(conversationsTable.userId, userId))
            .orderBy(desc(conversationsTable.updatedAt));

        return results;
    }

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
                eq(conversationsTable.userId, userId),
                sql`(
                    setweight(to_tsvector('simple', ${conversationsTable.title}), 'A') ||
                    setweight(to_tsvector('simple', coalesce(${messagesTable.content}, '')), 'B')
                ) @@ websearch_to_tsquery('simple', ${searchTerm})`
            )
        )
        .orderBy(
            conversationsTable.id,
            sql`ts_rank(
                setweight(to_tsvector('simple', ${conversationsTable.title}), 'A') ||
                setweight(to_tsvector('simple', coalesce(${messagesTable.content}, '')), 'B'),
                websearch_to_tsquery('simple', ${searchTerm})
            ) DESC`
        );

    const conversations = results.map(
        ({ rank, ...conversation }) => conversation
    );

    return conversations;
}

export async function createBranchFromConversation(
    db: DrizzleDB,
    conversationId: string,
    messageId: string,
    userId: string
) {
    const [conversation] = await db
        .select()
        .from(conversationsTable)
        .where(eq(conversationsTable.id, conversationId));

    if (!conversation) {
        throw new HTTPException(404, {
            message: 'Conversation not found',
        });
    }

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

    const chatMessages = await db
        .select()
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.conversationId, conversationId),
                or(
                    lte(messagesTable.updatedAt, targetMessage.updatedAt),
                    eq(messagesTable.id, targetMessage.id)
                )
            )
        )
        .orderBy(messagesTable.updatedAt);

    const [newConversation] = await db
        .insert(conversationsTable)
        .values({
            title: `${conversation.title} (Copy)`,
            userId: userId,
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
                id: undefined,
                conversationId: newConversation.id,
            }))
        );
    }

    return newConversation;
}
