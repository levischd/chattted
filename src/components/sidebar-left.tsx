'use client';

import { apiClient } from '@/lib/client';
import type { Conversation } from '@/server/db/schema';
import { Input } from '@headlessui/react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useAppState } from '../states/app-state';
import { ChatHistory } from './chat-history';
import { UserMenu } from './user-menu';

export function SidebarLeft() {
  const { isLeftSidebarOpen } = useAppState();
  const [query, setQuery] = useState('');
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['conversations', query],
    queryFn: async () => {
      const res = await apiClient.chat.getConversations.$get({
        search: query,
      });
      return await res.json();
    },
    placeholderData: keepPreviousData,
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
      <Input
        type="text"
        placeholder="Search"
        className="w-full resize-none rounded-md border border-brand-200 bg-brand-50 p-2 text-sm outline-none placeholder:text-brand-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex flex-col gap-1 overflow-y-auto">
        <ChatHistory
          conversations={conversations ?? []}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <div className="mt-auto">
        <UserMenu />
      </div>
    </div>
  );
}
