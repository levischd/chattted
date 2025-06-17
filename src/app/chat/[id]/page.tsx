import { Chat } from '@/components/chat';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: ChatPageProps) {
  const { id } = await params;

  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return <Chat id={id} isDraft={false} />;
}
