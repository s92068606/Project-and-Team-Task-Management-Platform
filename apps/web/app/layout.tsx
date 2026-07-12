import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SessionProvider } from '../lib/session';

export const metadata: Metadata = {
  title: 'CyphLab Task Platform',
  description: 'Project and team task management dashboard'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
