import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, type JSX } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import type { BundledLanguage } from 'shiki/bundle/web';
import { codeToHast } from 'shiki/bundle/web';
import { cn } from './utils';

export async function highlight(code: string, lang: BundledLanguage) {
  const out = await codeToHast(code, {
    lang,
    theme: 'github-light',
  });

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs,
    components: {
      pre: (props) => (
        <pre {...props} className={cn(props.className, '!bg-transparent')} />
      ),
      code: (props) => (
        <code {...props} className={cn(props.className, 'bg-transparent')} />
      ),
      span: (props) => (
        <span
          {...props}
          className={cn(props.className, 'text-wrap bg-transparent')}
        />
      ),
    },
  }) as JSX.Element;
}
