'use client';

import { authClient } from '@/lib/client';
import { Button, Field, Input, Label } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: '/chat/new',
      },
      {
        onSuccess: () => {
          router.push('/chat/new');
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Failed to create account');
        },
      }
    );

    setIsLoading(false);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4">
      <div className="flex w-sm flex-col gap-8">
        <h1 className="font-bold text-2xl text-brand-700">Create account</h1>

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
              htmlFor="name"
              className="mb-1 font-medium text-brand-700 text-sm"
            >
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="h-10 w-full rounded-md border border-brand-300 bg-brand-50 px-2 text-sm outline-none placeholder:text-brand-500"
            />
          </Field>

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

          <Field className="flex flex-col">
            <Label
              htmlFor="confirmPassword"
              className="mb-1 font-medium text-brand-700 text-sm"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              className="h-10 w-full rounded-md border border-brand-300 bg-brand-50 px-2 text-sm outline-none placeholder:text-brand-500"
            />
          </Field>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full rounded-md bg-brand font-medium text-brand-50 text-sm transition-colors hover:bg-brand/90 disabled:opacity-50"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-brand-700 text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
