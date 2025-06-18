import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useCallback, useMemo } from 'react';

interface UseMessageActionsProps {
  message: UIMessage;
  reload: UseChatHelpers['reload'];
  setMessages: UseChatHelpers['setMessages'];
  createBranch: () => void;
}

export const useMessageActions = ({
  message,
  reload,
  setMessages,
  createBranch,
}: UseMessageActionsProps) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  const handleRegenerate = useCallback(() => {
    // @ts-expect-error ai-sdk type error
    setMessages((messages: UIMessage[]) => {
      const index = messages.findIndex((m) => m.id === message.id);
      return index !== -1 ? messages.slice(0, index + 1) : messages;
    });
    reload();
  }, [reload, message.id, setMessages]);

  const handleSplit = useCallback(() => {
    createBranch();
  }, [createBranch]);

  const handleDelete = useCallback(() => {
    console.log('delete');
  }, []);

  return useMemo(
    () => ({
      handleCopy,
      handleRegenerate,
      handleSplit,
      handleDelete,
    }),
    [handleCopy, handleRegenerate, handleSplit, handleDelete]
  );
};
