'use client';

import { apiClient } from '@/lib/client';
import type { Conversation } from '@/server/db/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppState } from '../states/app-state';
import { ChatHistory } from './chat-history';
import { UserButton } from './user-button';

export function SidebarLeft() {
  const { isLeftSidebarOpen } = useAppState();

  const { data: conversations } = useQuery<Conversation[]>({
    initialData: [],
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.chat.getConversations.$get();
      return await res.json();
    },
  });

  const queryClient = useQueryClient();

  const { mutate: deleteConversation } = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.chat.deleteConversation.$post({
        id: conversationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
  };

  if (!isLeftSidebarOpen) {
    return null;
  }

  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-4 overflow-hidden border-brand-200 border-r bg-brand-100 p-4">
      <input
        type="text"
        placeholder="Search"
        className="w-full resize-none rounded-md border border-brand-200 bg-brand-50 p-2 text-sm outline-none placeholder:text-brand-500"
      />
      <div className="flex flex-col gap-1 overflow-y-auto">
        <ChatHistory
          conversations={conversations}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <div className="mt-auto">
        <UserButton />
      </div>
    </div>
  );
}
