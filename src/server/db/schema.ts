import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
    boolean,
    index,
    integer,
    json,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from 'drizzle-zod';
import { v4 as uuid } from 'uuid';

export const planEnum = pgEnum('plan', ['free', 'pro']);
export const roleEnum = pgEnum('role', ['user', 'assistant', 'system']);
export const messageStatusEnum = pgEnum('message_status', [
    'pending',
    'streaming',
    'completed',
    'error',
]);
export const contentTypeEnum = pgEnum('content_type', [
    'text',
    'image',
    'file',
    'tool-call',
    'tool-result',
]);

export const usersTable = pgTable('users', {
    id: varchar('id', { length: 191 })
        .primaryKey()
        .$defaultFn(() => uuid()),
    externalId: varchar('external_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    image: varchar('image', { length: 255 }),
    name: varchar('name', { length: 255 }),
    plan: planEnum('plan').default('free').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const quotasTable = pgTable('quotas', {
    id: varchar('id', { length: 191 })
        .primaryKey()
        .$defaultFn(() => uuid()),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    outputTokens: integer('output_tokens').notNull().default(0),
    inputTokens: integer('input_tokens').notNull().default(0),
    userId: varchar('user_id', { length: 191 })
        .references(() => usersTable.id, { onDelete: 'cascade' })
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const conversationsTable = pgTable(
    'conversations',
    {
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => uuid()),
        userId: varchar('user_id', { length: 191 })
            .references(() => usersTable.id, { onDelete: 'cascade' })
            .notNull(),
        title: varchar('title', { length: 255 })
            .default('New Conversation')
            .notNull(),
        modelId: varchar('model_id', { length: 255 }).notNull(),
        isPinned: boolean('is_pinned').default(false).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('conversations_user_id_idx').on(table.userId),
        index('conversations_created_at_idx').on(table.createdAt),
        // Fulltext search index für Titel (sprachunabhängig)
        index('conversations_title_search_idx').using(
            'gin',
            sql`to_tsvector('simple', ${table.title})`
        ),
    ]
);

export const messagesTable = pgTable(
    'messages',
    {
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => uuid()),
        conversationId: varchar('conversation_id', { length: 191 })
            .references(() => conversationsTable.id, { onDelete: 'cascade' })
            .notNull(),
        role: roleEnum('role').notNull(),
        content: text('content').notNull(),
        status: messageStatusEnum('status').default('completed').notNull(),
        metadata: json('metadata').$type<{
            duration?: number;
            model?: string;
            totalTokens?: number;
            promptTokens?: number;
            completionTokens?: number;
            finishReason?: string;
        }>(),
        /*annotations: json('annotations').$type<{
            sources?: {
                type: 'url';
                id: string;
                url: string;
                title?: string;
            }[];
        }>(),*/
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('messages_conversation_id_idx').on(table.conversationId),
        index('messages_created_at_idx').on(table.createdAt),
        // Fulltext search index für Message Content (sprachunabhängig)
        index('messages_content_search_idx').using(
            'gin',
            sql`to_tsvector('simple', ${table.content})`
        ),
    ]
);

export const messagePartsTable = pgTable(
    'message_parts',
    {
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => uuid()),
        messageId: varchar('message_id', { length: 191 })
            .references(() => messagesTable.id, { onDelete: 'cascade' })
            .notNull(),
        type: contentTypeEnum('type').notNull(),
        content: text('content'),
        toolCallId: varchar('tool_call_id', { length: 191 }),
        toolName: varchar('tool_name', { length: 255 }),
        toolArgs: json('tool_args').$type<Record<string, unknown>>(),
        toolResult: json('tool_result').$type<Record<string, unknown>>(),
        order: integer('order').notNull().default(0),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('message_parts_message_id_idx').on(table.messageId)]
);

export const attachmentsTable = pgTable(
    'attachments',
    {
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => uuid()),
        messageId: varchar('message_id', { length: 191 })
            .references(() => messagesTable.id, { onDelete: 'cascade' })
            .notNull(),
        name: varchar('name', { length: 255 }),
        contentType: varchar('content_type', { length: 100 }).notNull(),
        url: text('url').notNull(),
        size: integer('size'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('attachments_message_id_idx').on(table.messageId)]
);

/*export const embeddings = pgTable(
    'embeddings',
    {
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => uuid()),
        conversationId: varchar('conversation_id', { length: 191 }).references(
            () => conversations.id,
            { onDelete: 'cascade' }
        ),
        messageId: varchar('message_id', { length: 191 }).references(
            () => messages.id,
            { onDelete: 'cascade' }
        ),
        content: text('content').notNull(),
        embedding: vector('embedding', { dimensions: 1536 }).notNull(),
        metadata: json('metadata').$type<Record<string, unknown>>(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('embeddings_vector_idx').using(
            'hnsw',
            table.embedding.op('vector_cosine_ops')
        ),
        index('embeddings_conversation_id_idx').on(table.conversationId),
        index('embeddings_message_id_idx').on(table.messageId),
    ]
);*/

// Tool Definitions
export const toolsTable = pgTable('tools', {
    id: varchar('id', { length: 191 })
        .primaryKey()
        .$defaultFn(() => uuid()),
    name: varchar('name', { length: 255 }).notNull().unique(),
    description: text('description'),
    parameters: json('parameters').$type<Record<string, unknown>>().notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tool Executions Log
export const toolExecutionsTable = pgTable(
    'tool_executions',
    {
        id: varchar('id', { length: 191 })
            .primaryKey()
            .$defaultFn(() => uuid()),
        messageId: varchar('message_id', { length: 191 })
            .references(() => messagesTable.id, { onDelete: 'cascade' })
            .notNull(),
        toolId: varchar('tool_id', { length: 191 }).references(
            () => toolsTable.id,
            {
                onDelete: 'set null',
            }
        ),
        toolCallId: varchar('tool_call_id', { length: 191 }).notNull(),
        input: json('input').$type<Record<string, unknown>>().notNull(),
        output: json('output').$type<Record<string, unknown>>(),
        status: varchar('status', { length: 50 }).notNull().default('pending'),
        error: text('error'),
        executionTimeMs: integer('execution_time_ms'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        completedAt: timestamp('completed_at'),
    },
    (table) => [
        index('tool_executions_message_id_idx').on(table.messageId),
        index('tool_executions_tool_call_id_idx').on(table.toolCallId),
    ]
);

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
    conversations: many(conversationsTable),
    quotas: many(quotasTable),
}));

export const quotasRelations = relations(quotasTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [quotasTable.userId],
        references: [usersTable.id],
    }),
}));

export const conversationsRelations = relations(
    conversationsTable,
    ({ one, many }) => ({
        user: one(usersTable, {
            fields: [conversationsTable.userId],
            references: [usersTable.id],
        }),
        messages: many(messagesTable),
        //embeddings: many(embeddings),
    })
);

export const messagesRelations = relations(messagesTable, ({ one, many }) => ({
    conversation: one(conversationsTable, {
        fields: [messagesTable.conversationId],
        references: [conversationsTable.id],
    }),
    messageParts: many(messagePartsTable),
    attachments: many(attachmentsTable),
    //embeddings: many(embeddings),
    toolExecutions: many(toolExecutionsTable),
}));

export const messagePartsRelations = relations(
    messagePartsTable,
    ({ one }) => ({
        message: one(messagesTable, {
            fields: [messagePartsTable.messageId],
            references: [messagesTable.id],
        }),
    })
);

export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
    message: one(messagesTable, {
        fields: [attachmentsTable.messageId],
        references: [messagesTable.id],
    }),
}));

/*export const embeddingsRelations = relations(embeddings, ({ one }) => ({
    conversation: one(conversations, {
        fields: [embeddings.conversationId],
        references: [conversations.id],
    }),
    message: one(messages, {
        fields: [embeddings.messageId],
        references: [messages.id],
    }),
}));*/

export const toolsRelations = relations(toolsTable, ({ many }) => ({
    executions: many(toolExecutionsTable),
}));

export const toolExecutionsRelations = relations(
    toolExecutionsTable,
    ({ one }) => ({
        message: one(messagesTable, {
            fields: [toolExecutionsTable.messageId],
            references: [messagesTable.id],
        }),
        tool: one(toolsTable, {
            fields: [toolExecutionsTable.toolId],
            references: [toolsTable.id],
        }),
    })
);

export const userSelectSchema = createSelectSchema(usersTable);
export const userUpdateSchema = createUpdateSchema(usersTable);
export const userInsertSchema = createInsertSchema(usersTable);

export const conversationSelectSchema = createSelectSchema(conversationsTable);
export const conversationUpdateSchema = createUpdateSchema(conversationsTable);
export const conversationInsertSchema = createInsertSchema(conversationsTable);

export const messageSelectSchema = createSelectSchema(messagesTable);
export const messageUpdateSchema = createUpdateSchema(messagesTable);
export const messageInsertSchema = createInsertSchema(messagesTable);

export const messagePartSelectSchema = createSelectSchema(messagePartsTable);
export const messagePartUpdateSchema = createUpdateSchema(messagePartsTable);
export const messagePartInsertSchema = createInsertSchema(messagePartsTable);

export const attachmentSelectSchema = createSelectSchema(attachmentsTable);
export const attachmentUpdateSchema = createUpdateSchema(attachmentsTable);
export const attachmentInsertSchema = createInsertSchema(attachmentsTable);

export const toolSelectSchema = createSelectSchema(toolsTable);
export const toolUpdateSchema = createUpdateSchema(toolsTable);
export const toolInsertSchema = createInsertSchema(toolsTable);

export const toolExecutionSelectSchema =
    createSelectSchema(toolExecutionsTable);
export const toolExecutionUpdateSchema =
    createUpdateSchema(toolExecutionsTable);
export const toolExecutionInsertSchema =
    createInsertSchema(toolExecutionsTable);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Conversation = typeof conversationsTable.$inferSelect;
export type NewConversation = typeof conversationsTable.$inferInsert;
export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
export type MessagePart = typeof messagePartsTable.$inferSelect;
export type NewMessagePart = typeof messagePartsTable.$inferInsert;
export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;
//export type Embedding = typeof embeddings.$inferSelect;
//export type NewEmbedding = typeof embeddings.$inferInsert;
export type Tool = typeof toolsTable.$inferSelect;
export type NewTool = typeof toolsTable.$inferInsert;
export type ToolExecution = typeof toolExecutionsTable.$inferSelect;
export type NewToolExecution = typeof toolExecutionsTable.$inferInsert;
