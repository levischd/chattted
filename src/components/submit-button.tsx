import type { UseChatHelpers } from '@ai-sdk/react';
import { Button } from '@headlessui/react';
import { ArrowUp, Square } from 'lucide-react';

export function SubmitButton({
  handleSubmit,
  handleStop,
  status,
}: {
  handleSubmit: UseChatHelpers['handleSubmit'];
  handleStop: UseChatHelpers['stop'];
  status: UseChatHelpers['status'];
}) {
  return (
    <Button
      type="submit"
      onClick={
        status === 'ready' || status === 'error' ? handleSubmit : handleStop
      }
      disabled={status === 'submitted'}
      className="cursor-pointer rounded-full border border-brand-800 bg-brand-800 p-2 transition-colors hover:border-brand-700 hover:bg-brand-700"
    >
      {status === 'ready' || status === 'error' ? (
        <ArrowUp className="size-4 text-brand-100" />
      ) : (
        <Square className="size-4 text-brand-100" />
      )}
    </Button>
  );
}
