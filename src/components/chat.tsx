'use client';

import type { ModelId } from '@/lib/config/models';
import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from 'ai';
import { useState } from 'react';
import { ChatGreeting } from './chat-greeting';
import { ChatInput } from './chat-input';
import { Messages } from './messages';

interface ChatProps {
  id: string;
  initialMessages: Message[];
  initialModelId: ModelId;
}

export function Chat({ id, initialMessages, initialModelId }: ChatProps) {
  const [modelId, setModelId] = useState<ModelId>(initialModelId);

  const queryClient = useQueryClient();

  const {
    messages,
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
    experimental_prepareRequestBody: (options) => {
      return {
        ...options,
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-grow flex-col gap-4 overflow-hidden px-10">
      {messages.length === 0 ? (
        <ChatGreeting />
      ) : (
        <Messages
          reload={reload}
          conversationId={id}
          messages={messages}
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
