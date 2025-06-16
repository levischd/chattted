import { Chat } from '@/components/chat';
import { DEFAULT_LLM_MODEL_ID } from '@/lib/config/models';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { v4 as uuid } from 'uuid';

export default async function Page() {
  const id = uuid();

  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <Chat id={id} initialMessages={[]} initialModelId={DEFAULT_LLM_MODEL_ID} />
  );
}
