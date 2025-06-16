'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { Bot } from 'lucide-react';
import React, { memo, useMemo } from 'react';

import { useCreateBranch } from '@/hooks/use-create-branch';
import { useMessageActions } from '@/hooks/use-message-actions';
import { MessageActions } from './message-actions';
import { ReasoningMessagePart } from './reasoning-message-part';
import { TextMessagePart } from './text-message-part';

interface AssistantMessageProps {
  status: UseChatHelpers['status'];
  conversationId: string;
  message: UIMessage;
  reload: UseChatHelpers['reload'];
  setMessages: UseChatHelpers['setMessages'];
}

function AssistantMessageComponent({
  status,
  conversationId,
  message,
  reload,
  setMessages,
}: AssistantMessageProps) {
  const { mutate: createBranch } = useCreateBranch(conversationId, message.id);
  const { handleCopy, handleRegenerate, handleSplit, handleDelete } =
    useMessageActions({
      message,
      reload,
      setMessages,
      createBranch,
    });

  const createdAt = useMemo(() => {
    return message.createdAt?.toLocaleString() ?? '';
  }, [message.createdAt]);

  return (
    <div className="group flex w-full items-start justify-start gap-3">
      <div className="rounded-full border border-brand-200 bg-brand-100 p-2">
        <Bot className="size-4 text-brand-900" />
      </div>

      <div className="flex flex-col gap-2">
        {message.parts
          .sort((a, b) => {
            if (a.type === 'reasoning') {
              return -1;
            }
            return 1;
          })
          .map((part, index) => (
            <React.Fragment key={index}>
              {(() => {
                switch (part.type) {
                  case 'text':
                    return <TextMessagePart part={part} />;
                  case 'reasoning':
                    return <ReasoningMessagePart status={status} part={part} />;
                  default:
                    return null;
                }
              })()}
            </React.Fragment>
          ))}
        <div className="flex items-center justify-between">
          <MessageActions
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onSplit={handleSplit}
            onDelete={handleDelete}
          />
          <span
            className="text-brand-500 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            suppressHydrationWarning
          >
            {createdAt}
          </span>
        </div>
      </div>
    </div>
  );
}

export const AssistantMessage = memo(
  AssistantMessageComponent,
  (prev, next) =>
    prev.conversationId === next.conversationId &&
    prev.reload === next.reload &&
    prev.message.id === next.message.id &&
    prev.message.role === next.message.role &&
    prev.message.content === next.message.content
);
