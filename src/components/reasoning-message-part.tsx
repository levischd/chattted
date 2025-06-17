import type { UseChatHelpers } from '@ai-sdk/react';
import type { ReasoningUIPart } from '@ai-sdk/ui-utils';
import { Button } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Markdown } from './markdown';

export function ReasoningMessagePart({
  part,
  status,
}: {
  part: ReasoningUIPart;
  status: UseChatHelpers['status'];
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (status === 'error' || status === 'ready') {
      setIsExpanded(false);
    }
  }, [status]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70"
      >
        <span className="font-medium text-brand-800">Reasoning</span>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronRight className="size-3" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="overflow-hidden border-gray-200 border-l px-4 text-brand-600 text-sm">
              <Markdown>{part.reasoning}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
