'use client';

import { apiClient } from '@/lib/client';
import { DEFAULT_LLM_MODEL_ID, type ModelId } from '@/lib/config/models';
import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatGreeting } from './chat-greeting';
import { ChatInput } from './chat-input';
import { ChatLoading } from './chat-loading';
import { Messages } from './messages';

interface ChatProps {
  id: string;
  isDraft: boolean;
}

export function Chat({ id, isDraft }: ChatProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch conversation data with useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const res = await apiClient.chat.getConversation.$get({ id });
      return await res.json();
    },
    enabled: !isDraft,
  });

  useEffect(() => {
    if (error) {
      router.push('/chat/new');
    }
  }, [error, router]);

  const { conversation, messages } = data || {};
  const initialMessages = messages || [];

  const [modelId, setModelId] = useState<ModelId>(DEFAULT_LLM_MODEL_ID);

  useEffect(() => {
    if (conversation?.modelId) {
      setModelId(conversation.modelId as ModelId);
    }
  }, [conversation?.modelId]);

  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    messages: chatMessages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: _handleSubmit,
    reload,
    status,
    stop,
  } = useChat({
    id,
    api: '/api/completions/create',
    initialMessages,
    experimental_throttle: 150,
    experimental_prepareRequestBody: (options) => {
      return {
        ...options,
        attachments,
        modelId,
      };
    },
    onFinish: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },
  });

  const handleSubmit: UseChatHelpers['handleSubmit'] = (
    event,
    chatRequestOptions
  ) => {
    event?.preventDefault?.();

    window.history.replaceState({}, '', `/chat/${id}`);

    _handleSubmit(event, {
      ...chatRequestOptions,
    });
  };

  // Show loading state (but not for 404 errors which indicate new conversation)
  if (isLoading && !error) {
    return <ChatLoading />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-grow flex-col gap-4 overflow-hidden px-10">
      {chatMessages.length === 0 ? (
        <ChatGreeting />
      ) : (
        <Messages
          reload={reload}
          conversationId={id}
          messages={chatMessages}
          status={status}
          setMessages={setMessages}
        />
      )}
      <div className="flex w-full justify-center">
        <ChatInput
          status={status}
          input={input}
          modelId={modelId}
          setInput={setInput}
          setModelId={setModelId}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          stop={stop}
        />
      </div>
    </div>
  );
}
