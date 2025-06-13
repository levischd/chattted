import type { UseChatHelpers } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { useScrollToBottom } from './use-scroll-to-bottom';

export function useMessages({
  conversationId,
  status,
}: {
  conversationId: string;
  status: UseChatHelpers['status'];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (conversationId) {
      scrollToBottom('auto');
      setHasSentMessage(false);
    }
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    if (status === 'submitted') {
      setHasSentMessage(true);
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
    onViewportEnter,
    onViewportLeave,
  };
}
