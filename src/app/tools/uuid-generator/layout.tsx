import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UUID Generator - Generate UUID v4 Online | QuickSEO Tools',
  description:
    'Free online UUID v4 generator. Generate one or multiple UUIDs instantly. Cryptographically random, copy with one click. Pure browser-based, no tracking.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
