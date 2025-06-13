import { Button } from '@headlessui/react';
import equal from 'fast-deep-equal';
import { Check, Copy } from 'lucide-react';
import { memo, useState } from 'react';
import type React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

interface CodeBlockProps {
  node: {
    lang: string;
    meta: string;
  };
  inline: boolean;
  className: string;
  children: React.ReactNode;
}

function NonMemoizedCodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = LANGUAGE_REGEX.exec(className || '');
  const language = match ? match[1] : '';
  const isInline = inline || (!match && !className);

  const handleCopy = async () => {
    const text = String(children).replace(TRAILING_NEWLINE_REGEX, '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return (
      <code
        className={`${className} inline rounded-md border border-brand-200 bg-brand-100 px-1 py-0.5 text-sm`}
        {...props}
      >
        {children}
      </code>
    );
  }
  const codeString = String(children).replace(TRAILING_NEWLINE_REGEX, '');

  return (
    <div className="not-prose my-2 flex w-full flex-col overflow-hidden">
      <div className="flex w-full items-center justify-between overflow-hidden rounded-t-xl border border-brand-200 bg-brand-100 px-4 py-2">
        <span className="font-medium text-brand-600 text-xs">
          {language || 'text'}
        </span>
        <Button
          onClick={handleCopy}
          className="flex items-center gap-1 text-brand-700 text-xs transition-colors hover:text-brand-900"
        >
          {copied ? (
            <div className="flex items-center gap-1">
              <Check className="size-3" />
              Copied
            </div>
          ) : (
            <div className="flex cursor-pointer items-center gap-1">
              <Copy className="size-3" />
              Copy
            </div>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={atomOneLight}
        customStyle={{
          display: 'flex',
          flexDirection: 'column',
          margin: 0,
          fontSize: '14px',
          padding: '1rem',
          backgroundColor: 'transparent',
          background: 'transparent',
          width: '100%',
        }}
        wrapLongLines
        className="w-full overflow-hidden rounded-b-xl border border-brand-200 border-t-0 bg-brand-50 text-xs"
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

export const CodeBlock = memo(NonMemoizedCodeBlock, (prevProps, nextProps) => {
  if (prevProps.inline !== nextProps.inline) {
    return false;
  }
  if (prevProps.className !== nextProps.className) {
    return false;
  }
  if (prevProps.children !== nextProps.children) {
    return false;
  }
  if (!equal(prevProps.node, nextProps.node)) {
    return false;
  }

  return true;
});
