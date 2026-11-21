import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tags, Eye, Shield, FileText, Globe, Code2, Braces, Link2, Binary, QrCode, Palette, CaseSensitive, Fingerprint, Type, Key, Monitor, Route, Unlink, Image as ImageIcon, Languages, Heart } from 'lucide-react';

const tools = [
  { title: 'Meta Tag Checker', description: 'Analyze title, description, OG tags, Twitter cards, headings, and more. Get actionable recommendations.', href: '/tools/meta-checker', icon: Tags, badge: 'Most Popular' },
  { title: 'OG Previewer', description: 'Preview how your page appears on Facebook, Twitter, LinkedIn, and Google/Discord. Check all Open Graph tags.', href: '/tools/og-previewer', icon: Eye },
  { title: 'SSL Checker', description: 'Verify SSL certificate validity, expiration date, issuer, and protocol details.', href: '/tools/ssl-checker', icon: Shield },
  { title: 'Robots.txt Validator', description: 'Validate robots.txt syntax, check sitemap declarations, crawl rules, and indexing directives.', href: '/tools/robots-validator', icon: FileText },
  { title: 'Sitemap Validator', description: 'Validate XML sitemap structure, count URLs, and check for required elements like lastmod and priority.', href: '/tools/sitemap-validator', icon: Globe },
  { title: 'Schema Validator', description: 'Extract and validate JSON-LD & Microdata structured data. Check required properties for Rich Results.', href: '/tools/schema-validator', icon: Code2, badge: 'New' },
  { title: 'JSON Formatter', description: 'Validate, format, and minify JSON. Beautify messy JSON with a single click. Copy formatted output instantly.', href: '/tools/json-formatter', icon: Braces },
  { title: 'URL Encoder/Decoder', description: 'Encode special characters for URLs or decode percent-encoded strings back to plain text.', href: '/tools/url-encoder', icon: Link2 },
  { title: 'Base64 Encoder/Decoder', description: 'Encode text to Base64 or decode Base64 strings. Works with UTF-8 including CJK characters.', href: '/tools/base64-encoder', icon: Binary },
  { title: 'Markdown Previewer', description: 'Live preview of Markdown with split view. Supports headings, lists, links, images, code, and blockquotes.', href: '/tools/markdown-previewer', icon: Eye },
  { title: 'QR Code Generator', description: 'Generate QR codes from any text or URL. Customize colors and size. Download as PNG. Pure client-side, no tracking.', href: '/tools/qr-generator', icon: QrCode, badge: 'New' },
  { title: 'Color Picker & Converter', description: 'Convert between HEX, RGB, and HSL color formats. Live preview with instant copy. Supports all CSS color formats.', href: '/tools/color-converter', icon: Palette, badge: 'New' },
  { title: 'Text Case Converter', description: 'Convert text between UPPER, lower, Title, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE.', href: '/tools/case-converter', icon: CaseSensitive, badge: 'New' },
  { title: 'UUID Generator', description: 'Generate cryptographically random UUIDs v4. Create one or bulk UUIDs with a single click. Copy individually or all at once.', href: '/tools/uuid-generator', icon: Fingerprint, badge: 'New' },
  { title: 'Lorem Ipsum Generator', description: 'Generate Lorem Ipsum placeholder text by paragraphs or words. Customize count and copy instantly. Perfect for mockups.', href: '/tools/lorem-ipsum', icon: Type, badge: 'New' },
  { title: 'Password Generator', description: 'Create cryptographically secure random passwords. Choose length (4-128), uppercase, lowercase, digits, and symbols.', href: '/tools/password-generator', icon: Key, badge: 'New' },
  { title: 'User Agent Parser', description: 'Parse any browser User-Agent string. Extract browser, OS, device type, and engine information. Auto-detects your UA.', href: '/tools/ua-parser', icon: Monitor, badge: 'New' },
  { title: 'URL Redirect Checker', description: 'Track every step of HTTP redirect chains. See each 301/302 status code and final destination. Essential for SEO migrations.', href: '/tools/url-redirect-checker', icon: Route, badge: 'New' },
  { title: 'Broken Link Checker', description: 'Scan any page for broken external links. Find 404 errors, dead links, and server errors. Fix bad links to improve SEO.', href: '/tools/broken-link-checker', icon: Unlink, badge: 'New' },
  { title: 'Favicon Generator', description: 'Upload a PNG or JPG to generate favicons in all standard sizes. Get ready-to-paste HTML code. Pure client-side, no upload.', href: '/tools/favicon-generator', icon: ImageIcon, badge: 'New' },
  { title: 'Hreflang Generator', description: 'Create hreflang annotations for multi-language websites. Avoid international SEO errors with correct language-region tags.', href: '/tools/hreflang-generator', icon: Languages, badge: 'New' },
];

const CHECKOUT_URL = 'https://contentforgeapp.lemonsqueezy.com/checkout/buy/f90ed495-c86c-4918-9e4e-9f1a3d67749f';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Quick<span className="text-blue-600">SEO</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" title="Buy me a coffee - totally optional"
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-rose-600 hover:to-orange-600 transition-colors">
              <Heart className="h-3.5 w-3.5 fill-current" /> Support
            </a>
          </nav>
        </div>
      </header>

      <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Free SEO Tools That <span className="text-blue-600">Actually Work</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          No paywalls. No ads. No sign-up. All tools run in your browser — free, unlimited, forever.
          Built by a solo developer who got tired of fake &quot;free&quot; SEO tools.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary" className="px-3 py-1">Browser-based</Badge>
          <Badge variant="secondary" className="px-3 py-1">Zero server cost</Badge>
          <Badge variant="secondary" className="px-3 py-1">Real-time results</Badge>
          <Badge variant="secondary" className="px-3 py-1">Open source friendly</Badge>
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto px-4 pb-20 flex-1">
        <h2 className="text-2xl font-semibold mb-8">Choose a Tool</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <Link key={tool.href} href={tool.href}>
              <Card className="h-full hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <tool.icon className="h-5 w-5" />
                    </div>
                    {tool.badge && <Badge variant="secondary" className="text-xs">{tool.badge}</Badge>}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{tool.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-blue-600 font-medium">Try it →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground px-4">
        <p>QuickSEO Tools · Free &amp; Open · No tracking, no ads</p>
        <p className="mt-1">Built for developers who want honest tools.</p>
        <p className="mt-2 text-xs">
          Every tool is free with no limits. If this saved you time,{' '}
          <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline">buying me a coffee</a>
          {' '}is always appreciated — but never required.
        </p>
        <div className="mt-3 flex justify-center gap-4">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
