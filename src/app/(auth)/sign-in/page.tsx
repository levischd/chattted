'use client';

import { authClient } from '@/lib/client';
import { Button, Field, Input, Label } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await authClient.signIn.email(
      { email, password, callbackURL: '/chat/new' },
      {
        onSuccess: () => {
          router.push('/chat/new');
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Failed to sign in');
        },
      }
    );

    setIsLoading(false);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4">
      <div className="flex w-sm flex-col gap-8">
        <h1 className="font-bold text-2xl text-brand-700">Sign in</h1>

        {error && (
          <p className="rounded border border-red-300 bg-red-50 p-2 text-red-500 text-sm">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field className="flex flex-col">
            <Label
              htmlFor="email"
              className="mb-1 font-medium text-brand-700 text-sm"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="mail@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="h-10 w-full rounded-md border border-brand-300 bg-brand-50 px-2 text-sm outline-none placeholder:text-brand-500"
            />
          </Field>

          <Field className="flex flex-col">
            <Label
              htmlFor="password"
              className="mb-1 font-medium text-brand-700 text-sm"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="h-10 w-full rounded-md border border-brand-300 bg-brand-50 px-2 text-sm outline-none placeholder:text-brand-500"
            />
          </Field>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full rounded-md bg-brand font-medium text-brand-50 text-sm transition-colors hover:bg-brand/90 disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-brand-700 text-sm">
          Don’t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-brand">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
