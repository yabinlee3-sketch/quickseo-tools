import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Agent Parser - Parse Browser UA Strings | QuickSEO Tools',
  description:
    'Free online User Agent parser. Parse any browser User-Agent string to extract browser, OS, device type, and engine info. Auto-detects your current UA. No tracking.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
