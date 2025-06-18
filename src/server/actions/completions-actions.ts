import type { ModelId } from '@/lib/config/models';
import type { db } from '@/lib/db';
import { conversationsTable, messagesTable } from '@/server/db/schema';
import type { messageInsertSchema } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';

type DrizzleDB = typeof db;

export async function getOrCreateConversation(
    db: DrizzleDB,
    id: string,
    modelId: ModelId,
    userId: string
) {
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
                    userId,
                })
                .returning();
        } catch (error) {
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

    return conversation;
}

export async function updateConversationModel(
    db: DrizzleDB,
    conversationId: string,
    modelId: ModelId
) {
    try {
        await db
            .update(conversationsTable)
            .set({ modelId })
            .where(eq(conversationsTable.id, conversationId));
    } catch (error) {
        console.error('Failed to update conversation model:', error);
    }
}

export async function updateConversationTitle(
    db: DrizzleDB,
    conversationId: string,
    title: string
) {
    try {
        await db
            .update(conversationsTable)
            .set({ title })
            .where(eq(conversationsTable.id, conversationId));
    } catch (error) {
        console.error('Failed to generate or save title:', error);
    }
}

export async function getExistingMessages(
    db: DrizzleDB,
    conversationId: string
) {
    return await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conversationId));
}

export async function deleteMessage(db: DrizzleDB, messageId: string) {
    try {
        await db.delete(messagesTable).where(eq(messagesTable.id, messageId));
    } catch (error) {
        console.error(`Failed to delete message ${messageId}:`, error);
    }
}

export async function insertMessage(
    db: DrizzleDB,
    message: z.infer<typeof messageInsertSchema>
) {
    try {
        await db.insert(messagesTable).values(message);
    } catch (error) {
        console.error('Failed to insert message:', error);
        if (message.role === 'user') {
            throw new HTTPException(500, {
                message: 'Failed to save user message',
            });
        }
    }
}

export async function syncMessages(
    db: DrizzleDB,
    conversationId: string,
    inputMessages: z.infer<typeof messageInsertSchema>[]
) {
    const existingMessages = await getExistingMessages(db, conversationId);

    // Delete messages that are no longer in the input
    const messagesToDelete = existingMessages.filter(
        (msg) => !inputMessages.find((m) => m.id === msg.id)
    );

    for (const message of messagesToDelete) {
        await deleteMessage(db, message.id);
    }

    // Insert new messages with their original IDs
    const messagesToInsert = inputMessages.filter(
        (msg) => !existingMessages.find((m) => m.id === msg.id)
    );

    for (const message of messagesToInsert) {
        await insertMessage(db, {
            id: message.id,
            conversationId,
            role: message.role,
            content: message.content,
            parts: message.parts,
        });
    }
}
