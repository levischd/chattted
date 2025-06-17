'use client';

import { handleError } from '@/lib/error/handle';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';

// 12 Stunden in Millisekunden
const TWELVE_HOURS_IN_MS = 1000 * 60 * 60 * 12;

export const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            handleError('Error', err);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: TWELVE_HOURS_IN_MS,
            gcTime: TWELVE_HOURS_IN_MS,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
