import { Chat } from '@/components/chat';
import { apiClient } from '@/lib/client';
import type { ModelId } from '@/lib/config/models';
import { tryCatch } from '@/lib/error/try-catch';
import { redirect } from 'next/navigation';

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
    console.error(err);
    return redirect('/chat/new');
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
