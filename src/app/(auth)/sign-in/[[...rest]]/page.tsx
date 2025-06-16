import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <SignIn
        forceRedirectUrl="/chat/new"
        fallbackRedirectUrl="/chat/new"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
