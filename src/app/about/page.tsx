import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const toolList = [
  ['Meta Tag Checker', 'Analyze title, description, OG tags, Twitter cards, and headings.'],
  ['OG Previewer', 'Preview how your page appears on social networks.'],
  ['SSL Checker', 'Verify SSL certificate validity and expiration.'],
  ['Robots.txt Validator', 'Validate robots.txt syntax and directives.'],
  ['Sitemap Validator', 'Validate XML sitemap structure and URLs.'],
  ['Schema Validator', 'Extract and validate JSON-LD & Microdata.'],
  ['JSON Formatter', 'Format, validate, and minify JSON.'],
  ['URL Encoder/Decoder', 'Encode and decode URL strings.'],
  ['Base64 Encoder/Decoder', 'Base64 encode/decode with UTF-8 support.'],
  ['Markdown Previewer', 'Live Markdown preview.'],
  ['QR Code Generator', 'Generate customizable QR codes.'],
  ['Color Picker & Converter', 'Convert HEX, RGB, and HSL.'],
  ['Text Case Converter', 'Convert between naming conventions.'],
  ['UUID Generator', 'Generate random UUID v4 values.'],
  ['Lorem Ipsum Generator', 'Generate placeholder text.'],
  ['Password Generator', 'Create secure random passwords.'],
  ['User Agent Parser', 'Parse browser user-agent strings.'],
  ['URL Redirect Checker', 'Trace HTTP redirect chains.'],
  ['Broken Link Checker', 'Find broken links on a page.'],
  ['Favicon Generator', 'Create favicons in all standard sizes.'],
  ['Hreflang Generator', 'Generate multi-language SEO tags.'],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="font-bold text-xl tracking-tight">Quick<span className="text-blue-600">SEO</span></Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">About QuickSEO Tools</h1>
          <p className="text-muted-foreground">A collection of free, browser-based utilities for SEO professionals and developers.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Our Story</h2>
          <p className="text-sm leading-relaxed">QuickSEO Tools was born out of frustration. As a developer, I found myself constantly searching for simple online utilities — a JSON formatter, a Base64 encoder, a meta tag checker — only to land on websites plastered with intrusive ads, paywalls, and dark patterns designed to trick you into clicking.</p>
          <p className="text-sm leading-relaxed">Most &quot;free&quot; SEO tools out there are anything but free. They limit how many times you can use them, force you to create an account, or bombard you with so many ads that the tool becomes unusable.</p>
          <p className="text-sm leading-relaxed">I built QuickSEO Tools to be the opposite of all that. Every tool runs entirely in your browser using client-side JavaScript. Your data never leaves your device. No paywalls, no forced sign-ups, no limits on usage. Just honest tools that work.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What We Offer</h2>
          <p className="text-sm text-muted-foreground">QuickSEO Tools currently offers {toolList.length} free tools across SEO analysis and general developer utilities. Here is the complete list:</p>
          <Card>
            <CardContent className="divide-y">
              {toolList.map(([name, desc]) => (
                <div key={name} className="py-3">
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
