import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { apiClient } from '@/lib/client';

const QUERY_KEYS = {
  CONVERSATIONS: ['conversations'] as const,
} as const;

export const useCreateBranch = (conversationId: string, messageId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.chat.createBranch.$post({
        conversationId,
        messageId,
      });
      return await response.json();
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
    },
  });
};
