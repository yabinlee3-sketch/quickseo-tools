import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Password Generator - Strong Random Passwords | QuickSEO Tools',
  description:
    'Free online password generator. Create strong random passwords with uppercase, lowercase, digits, and symbols. Cryptographically secure, adjustable length 4-128. No tracking.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
