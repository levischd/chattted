import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { type InferMiddlewareOutput, jstack } from 'jstack';
import { usersTable } from './db/schema';

interface Env {
    Bindings: {
        DATABASE_URL: string;
        CLERK_SECRET_KEY: string;
        UPSTASH_REDIS_REST_URL: string;
        UPSTASH_REDIS_REST_TOKEN: string;
        GOOGLE_GENERATIVE_AI_API_KEY: string;
        GROQ_API_KEY: string;
        ANTHROPIC_API_KEY: string;
        OPENAI_API_KEY: string;
        QSTASH_URL: string;
        QSTASH_TOKEN: string;
    };
}

export const j = jstack.init<Env>();

const databaseProviderMiddleware = j.middleware(async ({ next }) => {
    return await next({ db });
});

type DatabaseProviderMiddlewareOutput = InferMiddlewareOutput<
    typeof databaseProviderMiddleware
>;

const authMiddleware = j.middleware(async ({ next }) => {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    let [dbUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.externalId, clerkUser.id));

    if (!dbUser) {
        const [newDbUser] = await db
            .insert(usersTable)
            .values({
                externalId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                name: clerkUser.fullName || clerkUser.firstName || '',
            })
            .returning();

        if (!newDbUser) {
            throw new HTTPException(500, { message: 'Failed to create user' });
        }

        dbUser = newDbUser;
    }

    return await next({ user: dbUser });
});

export const publicProcedure = j.procedure.use(databaseProviderMiddleware);

export const privateProcedure = j.procedure
    .use(databaseProviderMiddleware)
    .use(authMiddleware);
