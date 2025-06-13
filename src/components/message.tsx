'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { Bot } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';

/* -------------------------------------------------------------------------- */
/*  Hülle (Message)                                                           */
/* -------------------------------------------------------------------------- */

function NonMemoizedMessage({
  setMessages,
  message,
  reload,
}: {
  setMessages: UseChatHelpers['setMessages'];
  message: UIMessage;
  reload: UseChatHelpers['reload'];
}) {
  return message.role === 'user' ? (
    <UserMessage message={message} setMessages={setMessages} />
  ) : (
    <AssistantMessage
      message={message}
      reload={reload}
      setMessages={setMessages}
    />
  );
}

export const Message = memo(
  NonMemoizedMessage,
  (prev, next) =>
    prev.reload === next.reload && equal(prev.message, next.message)
);

/* -------------------------------------------------------------------------- */
/*  UserMessage                                                               */
/* -------------------------------------------------------------------------- */

function NonMemoizedUserMessage({
  message,
  setMessages,
}: { message: UIMessage; setMessages: UseChatHelpers['setMessages'] }) {
  return (
    <div className="flex w-full items-start justify-end">
      <div className="rounded-l-xl rounded-tr-xl rounded-br-sm bg-brand p-3">
        <p className="whitespace-pre-wrap text-brand-100 text-md">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export const UserMessage = memo(
  NonMemoizedUserMessage,
  (prev, next) => prev.message.content === next.message.content
);

/* -------------------------------------------------------------------------- */
/*  AssistantMessage                                                          */
/* -------------------------------------------------------------------------- */

function NonMemoizedAssistantMessage({
  message,
  reload,
  setMessages,
}: {
  message: UIMessage;
  reload: UseChatHelpers['reload'];
  setMessages: UseChatHelpers['setMessages'];
}) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  const handleRegenerate = useCallback(() => {
    // remove all messages after the current message
    // @ts-expect-error todo: support UIMessage in setMessages
    setMessages((messages: UIMessage[]) => {
      const index = messages.findIndex((m) => m.id === message.id);

      if (index !== -1) {
        return messages.slice(0, index + 1);
      }

      return messages;
    });

    reload();
  }, [reload, message.id, setMessages]);

  const handleSplit = useCallback(() => {
    console.log('split');
  }, []);

  const handleDelete = useCallback(() => {
    console.log('delete');
  }, []);

  const createdAt = useMemo(() => {
    return message.createdAt?.toLocaleString() ?? '';
  }, [message.createdAt]);

  return (
    <div className="group flex w-full items-start justify-start gap-3">
      <div className="rounded-full border border-brand-200 bg-brand-100 p-2">
        <Bot className="size-4 text-brand-900" />
      </div>

      <div className="mt-1 flex w-full flex-col gap-4 text-md">
        <Markdown>{message.content}</Markdown>

        <div className="flex items-center justify-between">
          <MessageActions
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onSplit={handleSplit}
            onDelete={handleDelete}
          />

          <p
            className="text-brand-500 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            suppressHydrationWarning
          >
            {createdAt}
          </p>
        </div>
      </div>
    </div>
  );
}

export const AssistantMessage = memo(
  NonMemoizedAssistantMessage,
  (prev, next) =>
    prev.reload === next.reload && prev.message.content === next.message.content
);

/* -------------------------------------------------------------------------- */
/*  ThinkingMessage                                                           */
/* -------------------------------------------------------------------------- */

function NonMemoizedThinkingMessage() {
  return (
    <div className="flex w-full items-center justify-start gap-3">
      <div className="rounded-full border border-brand-200 bg-brand-100 p-2">
        <Bot className="size-4 text-brand-900" />
      </div>
      <div className="flex flex-col gap-4 text-md">
        <div className="size-4 animate-pulse rounded-full bg-brand-800" />
      </div>
    </div>
  );
}

export const ThinkingMessage = memo(NonMemoizedThinkingMessage);
