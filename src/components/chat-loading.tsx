import { Loader2 } from 'lucide-react';

export function ChatLoading() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <Loader2 className="animate-spin text-brand-700" />
    </div>
  );
}
