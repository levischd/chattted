import { Chat } from '@/components/chat';
import { auth } from '@/lib/auth';
import { DEFAULT_LLM_MODEL_ID } from '@/lib/config/models';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { v4 as uuid } from 'uuid';

export default async function Page() {
  const id = uuid();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect('/sign-in');
  }

  return (
    <Chat id={id} initialMessages={[]} initialModelId={DEFAULT_LLM_MODEL_ID} />
  );
}
