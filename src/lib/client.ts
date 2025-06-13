import type { AppRouter } from '@/server';
import { createAuthClient } from 'better-auth/client';
import { nextCookies } from 'better-auth/next-js';
import { createClient } from 'jstack';

export const apiClient = createClient<AppRouter>({
  baseUrl: 'http://localhost:3000/api',
});

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [nextCookies()],
});
