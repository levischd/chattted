import { Button } from '@headlessui/react';
import { Check, Copy, Ellipsis, RefreshCcw, Split } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MessageActionsProps {
  onCopy: () => void;
  onRegenerate: () => void;
  onSplit: () => void;
  onDelete: () => void;
}

export function MessageActions({
  onCopy,
  onRegenerate,
  onSplit,
  onDelete,
}: MessageActionsProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  }, [hasCopied]);

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => {
          onCopy();
          setHasCopied(true);
        }}
        className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
      >
        {hasCopied ? (
          <Check className="size-4 text-brand-800" />
        ) : (
          <Copy className="size-4 text-brand-800" />
        )}
      </Button>

      <Button
        onClick={onRegenerate}
        className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
      >
        <RefreshCcw className="size-4 text-brand-800" />
      </Button>

      <Button
        onClick={onSplit}
        className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
      >
        <Split className="size-4 text-brand-800" />
      </Button>

      <Button
        onClick={onDelete}
        className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
      >
        <Ellipsis className="size-4 text-brand-800" />
      </Button>
    </div>
  );
}
