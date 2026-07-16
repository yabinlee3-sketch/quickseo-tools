import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Picker & Converter - HEX, RGB, HSL | QuickSEO Tools',
  description:
    'Free online color converter. Convert between HEX, RGB, and HSL color formats instantly. Live color preview, copy any format. No ads, browser-based.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
