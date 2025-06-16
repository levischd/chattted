import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import type React from 'react';
import { Toaster } from 'sonner';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'chattted',
  description: 'chattted.ai',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${spaceGrotesk.variable} relative h-screen w-screen overflow-hidden bg-brand-50 font-space-grotesk text-brand-800 antialiased`}
        >
          <Providers>
            {children}
            <Toaster
              toastOptions={{
                classNames: {
                  toast:
                    '!bg-brand-50 !border-brand-200 !border !shadow-none !rounded-lg !font-space-grotesk',
                  title:
                    '!text-md !font-space-grotesk !text-brand-800 !font-medium',
                  description:
                    '!text-md !font-space-grotesk !text-brand-800 !font-medium',
                },
                style: undefined,
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
