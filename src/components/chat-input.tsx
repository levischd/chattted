import { type ModelId, models } from '@/lib/config/models';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Textarea } from '@headlessui/react';
import { Ellipsis, Globe, Lightbulb, Paperclip } from 'lucide-react';
import type React from 'react';
import { ModelSelect } from './model-select';
import { SubmitButton } from './submit-button';

interface ChatInputProps {
  input: UseChatHelpers['input'];
  modelId: ModelId;
  setModelId: (modelId: ModelId) => void;
  handleInputChange: UseChatHelpers['handleInputChange'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: UseChatHelpers['stop'];
}

export function ChatInput({
  input,
  modelId,
  setModelId,
  handleInputChange,
  handleSubmit,
  setInput,
  status,
  stop,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim().length > 0) {
        handleSubmit();
      }
    }
  };

  const model = models[modelId];

  return (
    <div className="mb-4 w-full rounded-2xl border border-brand-300 bg-brand-50 p-4">
      <Textarea
        name="message"
        id="message"
        placeholder="Enter your message here..."
        className="h-10 w-full resize-none border-none text-sm outline-none placeholder:text-brand-500"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="cursor-not-allowed rounded-full border border-brand-200 p-2 transition-colors hover:bg-brand-100">
            <Paperclip className="size-4 text-brand-800" />
          </div>
          <div className="cursor-not-allowed rounded-full border border-brand-200 p-2 transition-colors hover:bg-brand-100">
            <Globe className="size-4 text-brand-800" />
          </div>
          <div className="cursor-not-allowed rounded-full border border-brand-200 p-2 transition-colors hover:bg-brand-100">
            <Lightbulb className="size-4 text-brand-800" />
          </div>
          <div className="cursor-not-allowed rounded-full border border-brand-200 p-2 transition-colors hover:bg-brand-100">
            <Ellipsis className="size-4 text-brand-800" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelect modelId={modelId} setModelId={setModelId} />
          <SubmitButton
            handleSubmit={handleSubmit}
            handleStop={stop}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
