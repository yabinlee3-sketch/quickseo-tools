import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickSEO Tools - Free SEO, JSON, QR, Markdown & Developer Utilities",
  description:
    "100% free online tools for SEO and developers. Meta tag checker, OG previewer, SSL checker, JSON formatter, URL encoder, Base64 encoder, Markdown previewer, QR code generator, robots.txt validator, sitemap validator, schema validator, and more. No paywalls, no ads, browser-based.",
  keywords: [
    "free seo tools",
    "meta tag checker",
    "og previewer",
    "ssl checker",
    "json formatter",
    "url encoder",
    "base64 encoder",
    "markdown previewer",
    "qr code generator",
    "robots.txt validator",
    "sitemap validator",
    "schema validator",
    "online developer tools",
    "free online tools",
  ],
  openGraph: {
    title: "QuickSEO Tools - Free SEO & Developer Utilities",
    description:
      "Browser-based tools for SEO and developers. Meta checker, JSON formatter, QR generator, Markdown previewer, and more. No ads, no sign-up.",
    url: "https://quickseotools.com",
    siteName: "QuickSEO Tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickSEO Tools - Free SEO & Developer Utilities",
    description:
      "Browser-based tools for SEO and developers. Meta checker, JSON formatter, QR generator, Markdown previewer, and more. No ads, no sign-up.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
