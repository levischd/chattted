import { Header } from '@/components/header';
import { SidebarLeft } from '@/components/sidebar-left';
import { SidebarRight } from '@/components/sidebar-right';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type React from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const nextHeaders = await headers();

  const session = await auth.api.getSession({
    headers: nextHeaders,
  });

  if (!session) {
    return redirect('/sign-in');
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Header />
      <div className="flex h-full w-full flex-grow justify-center overflow-hidden">
        <SidebarLeft />
        {children}
        <SidebarRight />
      </div>
    </div>
  );
}
