'use client';

import { useAppState } from '@/states/app-state';

export function SidebarRight() {
  const { isRightSidebarOpen } = useAppState();

  if (!isRightSidebarOpen) {
    return null;
  }

  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-4 border-brand-200 border-l bg-brand-100 p-4">
      <h1>Sidebar Right</h1>
    </div>
  );
}
