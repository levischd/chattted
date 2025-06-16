'use client';

import { Bot } from 'lucide-react';
import { memo } from 'react';

function ThinkingMessageComponent() {
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

export const ThinkingMessage = memo(ThinkingMessageComponent);
