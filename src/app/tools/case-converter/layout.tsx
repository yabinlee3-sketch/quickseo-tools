import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Case Converter - UPPER, lower, camelCase, snake_case | QuickSEO Tools',
  description:
    'Free online text case converter. Convert text to UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE instantly.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
