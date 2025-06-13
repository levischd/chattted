import { useCallback, useEffect, useRef, useState } from 'react';

type ScrollFlag = ScrollBehavior | false;

export const useScrollToBottom = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const [scrollBehavior, setScrollBehavior] = useState<ScrollFlag>(false);

  useEffect(() => {
    if (scrollBehavior) {
      endRef.current?.scrollIntoView({ behavior: scrollBehavior });
      setScrollBehavior(false);
    }
  }, [scrollBehavior]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    setScrollBehavior(behavior);
  }, []);

  const onViewportEnter = () => {
    setIsAtBottom(true);
  };

  const onViewportLeave = () => {
    setIsAtBottom(false);
  };

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  };
};
