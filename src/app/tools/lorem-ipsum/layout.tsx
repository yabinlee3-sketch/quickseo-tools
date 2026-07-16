import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Placeholder Text Online | QuickSEO Tools',
  description:
    'Free Lorem Ipsum generator. Create placeholder text by paragraphs or words. Customizable count and length. Copy generated text instantly. No ads, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
