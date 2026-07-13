import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tags, Eye, Shield, FileText, Globe, Code2, ArrowRight } from 'lucide-react';

const tools = [
  {
    title: 'Meta Tag Checker',
    description: 'Analyze title, description, OG tags, Twitter cards, headings, and more. Get actionable recommendations.',
    href: '/tools/meta-checker',
    icon: Tags,
    badge: 'Most Popular',
  },
  {
    title: 'OG Previewer',
    description: 'Preview how your page appears on Facebook, Twitter, LinkedIn, and Google/Discord. Check all Open Graph tags.',
    href: '/tools/og-previewer',
    icon: Eye,
  },
  {
    title: 'SSL Checker',
    description: 'Verify SSL certificate validity, expiration date, issuer, and protocol details.',
    href: '/tools/ssl-checker',
    icon: Shield,
  },
  {
    title: 'Robots.txt Validator',
    description: 'Validate robots.txt syntax, check sitemap declarations, crawl rules, and indexing directives.',
    href: '/tools/robots-validator',
    icon: FileText,
  },
  {
    title: 'Sitemap Validator',
    description: 'Validate XML sitemap structure, count URLs, and check for required elements like lastmod and priority.',
    href: '/tools/sitemap-validator',
    icon: Globe,
  },
  {
    title: 'Schema Validator',
    description: 'Extract and validate JSON-LD & Microdata structured data. Check required properties for Rich Results.',
    href: '/tools/schema-validator',
    icon: Code2,
    badge: 'New',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Quick<span className="text-blue-600">SEO</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="px-3 py-1.5 rounded-md bg-green-50 text-green-700 font-medium text-xs">
              100% Free · No Ads
            </span>
          </nav>
        </div>
      </header>

      <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Free SEO Tools That <span className="text-blue-600">Actually Work</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          No paywalls. No ads. No sign-up. All tools run in your browser.
          Built by a solo developer who got tired of fake &quot;free&quot; SEO tools.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary" className="px-3 py-1">Browser-based</Badge>
          <Badge variant="secondary" className="px-3 py-1">Zero server cost</Badge>
          <Badge variant="secondary" className="px-3 py-1">Real-time results</Badge>
          <Badge variant="secondary" className="px-3 py-1">Open source friendly</Badge>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20 flex-1">
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
                    {tool.badge && (
                      <Badge variant="secondary" className="text-xs">{tool.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Try it <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground px-4">
        <p>QuickSEO Tools · Free &amp; Open · No tracking, no ads</p>
        <p className="mt-1">Built for developers who want honest tools.</p>
      </footer>
    </div>
  );
}
