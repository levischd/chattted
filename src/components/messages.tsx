import { useMessages } from '@/hooks/use-messages';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Button } from '@headlessui/react';
import type { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { memo } from 'react';
import { Message } from './message';
import { ThinkingMessage } from './thinking-message';

function NonMemoizedMessages({
  conversationId,
  reload,
  messages,
  status,
  setMessages,
}: {
  status: UseChatHelpers['status'];
  conversationId: string;
  reload: UseChatHelpers['reload'];
  messages: UIMessage[];
  setMessages: UseChatHelpers['setMessages'];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useMessages({
    conversationId,
    status,
  });

  return (
    <div className="relative flex w-full flex-grow flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex w-full flex-grow flex-col overflow-hidden overflow-y-scroll py-4"
      >
        <div className="flex flex-col gap-6">
          {messages.map((message) => (
            <Message
              key={message.id}
              conversationId={conversationId}
              message={message}
              reload={reload}
              setMessages={setMessages}
            />
          ))}
          {status === 'submitted' &&
            messages.length > 0 &&
            messages.at(-1)?.role === 'user' && <ThinkingMessage />}
        </div>

        <motion.div
          ref={endRef}
          className="h-0 w-full"
          onViewportLeave={onViewportLeave}
          onViewportEnter={onViewportEnter}
        />
      </div>

      {/* Button außerhalb des scrollbaren Bereichs */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="-translate-x-1/2 absolute bottom-4 left-1/2 z-50"
          >
            <Button
              className="cursor-pointer rounded-full border border-brand-800 bg-brand-800 p-2 shadow-lg transition-colors duration-200 hover:bg-brand-700"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown className="size-4 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const Messages = memo(NonMemoizedMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.reload !== nextProps.reload) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }

  return true;
});
