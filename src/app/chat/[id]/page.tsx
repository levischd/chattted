import { Chat } from '@/components/chat';
import { apiClient } from '@/lib/client';
import type { ModelId } from '@/lib/config/models';
import { tryCatch } from '@/lib/error/try-catch';
import { HTTPException } from 'hono/http-exception';
import { notFound, redirect } from 'next/navigation';

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: ChatPageProps) {
  const { id } = await params;

  const [result, err] = await tryCatch(async () => {
    const res = await apiClient.chat.getConversation.$get({
      id,
    });
    return await res.json();
  });

  if (err) {
    if (err instanceof HTTPException) {
      if (err.status === 404) {
        return notFound();
      }
      if (err.status === 401) {
        return redirect('/sign-in');
      }
      if (err.status === 403) {
        return redirect('/chat/new');
      }
      if (err.status === 400) {
        return redirect('/chat/new');
      }
    }
    return notFound();
  }

  const { conversation, messages } = result;

  return (
    <Chat
      id={id}
      initialMessages={messages}
      initialModelId={conversation.modelId as ModelId}
    />
  );
}
