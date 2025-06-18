'use client';
import { highlight } from '@/lib/shiki';
import { Check, Copy } from 'lucide-react';
import type React from 'react';
import {
  type JSX,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import type { BundledLanguage } from 'shiki/bundle/web';

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

/* -------------------------------------------------- */
/* Helper: Copy button                                */
/* -------------------------------------------------- */
interface CopyButtonProps {
  onCopy: () => void;
  copied: boolean;
}

const CopyButton = memo<CopyButtonProps>(
  ({ onCopy, copied }) => (
    <button
      type="button"
      onClick={onCopy}
      className="flex items-center gap-1 text-brand-700 text-xs transition-colors hover:text-brand-900"
    >
      {copied ? (
        <>
          <Check className="size-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  ),
  (prev, next) => prev.copied === next.copied
);

/* -------------------------------------------------- */
/* Main component                                     */
/* -------------------------------------------------- */
interface CodeBlockProps {
  node?: { lang?: string; meta?: string };
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  initial?: JSX.Element;
}

function CodeBlockBase({
  inline,
  className = '',
  children,
  initial,
  ...rest
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<JSX.Element | null>(
    initial || null
  );

  const language = useMemo(() => {
    const m = LANGUAGE_REGEX.exec(className);
    return m?.[1] ?? '';
  }, [className]);

  const codeString = useMemo(
    () => String(children).replace(TRAILING_NEWLINE_REGEX, ''),
    [children]
  );

  useLayoutEffect(() => {
    if (!inline && language) {
      highlight(codeString, language as BundledLanguage).then(
        setHighlightedCode
      );
    }
  }, [codeString, language, inline]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codeString]);

  if (inline || (!language && !className)) {
    return (
      <code
        className={`${className} inline rounded-md border border-brand-200 bg-brand-100 px-1 py-0.5 text-sm`}
        {...rest}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="not-prose my-2 flex w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between overflow-hidden rounded-t-xl border border-brand-200 bg-brand-100 px-4 py-2">
        <span className="font-medium text-brand-600 text-xs">
          {language || 'text'}
        </span>
        <CopyButton onCopy={handleCopy} copied={copied} />
      </div>

      {/* Highlighted code using shiki */}
      <div className="w-full overflow-hidden rounded-b-xl border border-brand-200 border-t-0 bg-brand-50 text-xs">
        <div className="m-0 bg-transparent p-4 text-sm">
          {highlightedCode ?? (
            <pre className="m-0 bg-transparent">
              <code>{codeString}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Export (memo-ised)                                 */
/* -------------------------------------------------- */
export const CodeBlock = memo(CodeBlockBase, (prev, next) => {
  return (
    prev.inline === next.inline &&
    prev.className === next.className &&
    prev.children === next.children &&
    prev.node?.lang === next.node?.lang &&
    prev.node?.meta === next.node?.meta &&
    prev.initial === next.initial
  );
});
