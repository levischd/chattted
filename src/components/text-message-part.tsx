import type { TextUIPart } from '@ai-sdk/ui-utils';
import { Markdown } from './markdown';

export function TextMessagePart({ part }: { part: TextUIPart }) {
  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden text-md">
      <Markdown>{part.text}</Markdown>
    </div>
  );
}
