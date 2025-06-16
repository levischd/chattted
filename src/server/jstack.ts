import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { type InferMiddlewareOutput, jstack } from 'jstack';
import { usersTable } from './db/schema';

interface Env {
    Bindings: {
        DATABASE_URL: string;
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;
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

const authProviderMiddleware = j.middleware(async ({ next }) => {
    return await next({ auth });
});

type AuthProviderMiddlewareOutput = InferMiddlewareOutput<
    typeof authProviderMiddleware
>;

const authMiddleware = j.middleware(async ({ c, ctx, next }) => {
    const { auth, db } = ctx as AuthProviderMiddlewareOutput &
        DatabaseProviderMiddlewareOutput;

    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, session.user.id));

    if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    return await next({ user });
});

export const publicProcedure = j.procedure
    .use(databaseProviderMiddleware)
    .use(authProviderMiddleware);

export const privateProcedure = j.procedure
    .use(databaseProviderMiddleware)
    .use(authProviderMiddleware)
    .use(authMiddleware);
