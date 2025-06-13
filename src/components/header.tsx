'use client';

import { useAppState } from '@/states/app-state';
import { Button } from '@headlessui/react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share,
  SquarePen,
} from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const {
    isLeftSidebarOpen,
    isRightSidebarOpen,
    setIsLeftSidebarOpen,
    setIsRightSidebarOpen,
  } = useAppState();

  return (
    <div className="flex w-full shrink-0 select-none items-center justify-between border border-brand-200 bg-brand-100 px-3 py-2">
      <div className="flex w-full items-center justify-start gap-2">
        <h1 className="font-bold text-brand-700 text-lg">chattted.</h1>
        <Button
          className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="size-5 text-brand-700" />
          ) : (
            <PanelLeftOpen className="size-5 text-brand-700" />
          )}
        </Button>
      </div>
      <div className="flex w-full items-center justify-end gap-2">
        <Link
          href="/chat/new"
          className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
        >
          <SquarePen className="size-5 text-brand-700" />
        </Link>

        <Button className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200">
          <Share className="size-5 text-brand-700" />
        </Button>

        <Button
          className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-brand-200"
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        >
          {isRightSidebarOpen ? (
            <PanelRightClose className="size-5 text-brand-700" />
          ) : (
            <PanelRightOpen className="size-5 text-brand-700" />
          )}
        </Button>
      </div>
    </div>
  );
}
