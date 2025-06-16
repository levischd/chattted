import type { AppRouter } from '@/server';
import { createClient } from 'jstack';

export const apiClient = createClient<AppRouter>({
    baseUrl: 'http://localhost:3000/api',
});
