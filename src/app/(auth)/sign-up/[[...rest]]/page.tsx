import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/chat/new"
        forceRedirectUrl="/chat/new"
        signInUrl="/sign-in"
      />
    </div>
  );
}
