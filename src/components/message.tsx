'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';

import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';

interface MessageProps {
  status: UseChatHelpers['status'];
  conversationId: string;
  setMessages: UseChatHelpers['setMessages'];
  message: UIMessage;
  reload: UseChatHelpers['reload'];
}

function MessageComponent({
  status,
  conversationId,
  setMessages,
  message,
  reload,
}: MessageProps) {
  return message.role === 'user' ? (
    <UserMessage
      conversationId={conversationId}
      message={message}
      setMessages={setMessages}
      reload={reload}
    />
  ) : (
    <AssistantMessage
      status={status}
      conversationId={conversationId}
      message={message}
      reload={reload}
      setMessages={setMessages}
    />
  );
}

export const Message = memo(
  MessageComponent,
  (prev, next) =>
    prev.reload === next.reload && equal(prev.message, next.message)
);
