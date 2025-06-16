import { j, privateProcedure } from '../jstack';

export const authRouter = j.router({
    getUser: privateProcedure.query(({ c, ctx }) => {
        const { user } = ctx;

        return c.superjson({ ...user });
    }),
});
