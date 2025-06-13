import Link from 'next/link';

export function SignInGreeting() {
  return (
    <div className="mx-9 flex flex-grow flex-col items-center justify-center">
      <h1 className="font-bold text-2xl text-brand">Chattted.</h1>
      <h1 className="mb-2 font-bold text-4xl text-brand-700">
        Yooo, welcome back!
      </h1>
      <p className="text-brand-700 text-sm">
        First time here?{' '}
        <Link className="text-brand" href="/sign-up">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
