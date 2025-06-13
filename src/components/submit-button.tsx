import { ArrowUp } from 'lucide-react';
import type React from 'react';

export function SubmitButton({
  onClick,
  disabled,
}: {
  onClick: (e: React.FormEvent<HTMLButtonElement>) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-full border border-brand-800 bg-brand-800 p-2 transition-colors hover:border-brand-700 hover:bg-brand-700"
    >
      <ArrowUp className="size-4 text-brand-100" />
    </button>
  );
}
