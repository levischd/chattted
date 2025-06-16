'use client';

import { useCreateBranch } from '@/hooks/use-create-branch';
import { useMessageActions } from '@/hooks/use-message-actions';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { memo } from 'react';
import { MessageActions } from './message-actions';

interface UserMessageProps {
  conversationId: string;
  message: UIMessage;
  reload: UseChatHelpers['reload'];
  setMessages: UseChatHelpers['setMessages'];
}

function UserMessageComponent({
  conversationId,
  message,
  reload,
  setMessages,
}: UserMessageProps) {
  const { mutate: createBranch } = useCreateBranch(conversationId, message.id);
  const { handleCopy, handleRegenerate, handleSplit, handleDelete } =
    useMessageActions({
      message,
      reload,
      setMessages,
      createBranch,
    });
  return (
    <div className="flex w-full items-start justify-end">
      <div className="flex max-w-3/4 flex-col items-end gap-4">
        <div className="w-fit rounded-l-xl rounded-tr-xl rounded-br-sm bg-brand px-3 py-2">
          <p className="whitespace-pre-wrap text-nowrap text-brand-100 text-md">
            {message.content}
          </p>
        </div>
        <MessageActions
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
          onSplit={handleSplit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export const UserMessage = memo(
  UserMessageComponent,
  (prev, next) =>
    prev.conversationId === next.conversationId &&
    prev.reload === next.reload &&
    prev.message.content === next.message.content
);
