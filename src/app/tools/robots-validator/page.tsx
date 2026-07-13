'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { URLInput } from '@/components/url-input';
import { ResultCard, StatusBadge, IssueList } from '@/components/result-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { fetchHtml, analyzeRobotsTxt } from '@/lib/tools';

export default function RobotsValidatorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeRobotsTxt> | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    setLoading(true);
    setError('');
    setResult(null);

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    // Construct robots.txt URL
    const parsed = new URL(targetUrl);
    const robotsUrl = `${parsed.protocol}//${parsed.hostname}/robots.txt`;

    const { html, status } = await fetchHtml(robotsUrl);
    const analysis = analyzeRobotsTxt(html || '', status || 0);
    setResult(analysis);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <FileText className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Robots.txt Validator</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <URLInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          placeholder="Enter website URL to check robots.txt..."
        />

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {result && (
          <>
            <IssueList issues={result.issues} warnings={result.warnings} />

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-white">
              <FileText className={`h-8 w-8 ${result.exists ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <p className="font-semibold">
                  {result.exists ? 'robots.txt Found' : 'robots.txt Not Found (404)'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {result.status}
                  {result.crawlDelay && ` · Crawl-delay: ${result.crawlDelay}`}
                </p>
              </div>
            </div>

            {result.exists && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <ResultCard title="User Agents" status={result.userAgents.length > 0 ? 'good' : 'warning'}>
                    <p className="text-2xl font-bold">{result.userAgents.length}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.userAgents.slice(0, 5).map((ua, i) => (
                        <StatusBadge key={i} status="info" label={ua} />
                      ))}
                      {result.userAgents.length > 5 && (
                        <StatusBadge status="info" label={`+${result.userAgents.length - 5} more`} />
                      )}
                    </div>
                  </ResultCard>

                  <ResultCard title="Disallowed Paths" status={result.disallowedPaths.length > 0 ? 'info' : 'info'}>
                    <p className="text-2xl font-bold">{result.disallowedPaths.length}</p>
                  </ResultCard>

                  <ResultCard title="Sitemaps" status={result.hasSitemap ? 'good' : 'warning'}>
                    <p className="text-2xl font-bold">{result.sitemaps.length}</p>
                  </ResultCard>
                </div>

                {result.sitemaps.length > 0 && (
                  <ResultCard title="Sitemap URLs">
                    <ul className="space-y-1 text-sm">
                      {result.sitemaps.map((sm, i) => (
                        <li key={i} className="text-blue-600 break-all font-mono text-xs">{sm}</li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {result.disallowedPaths.length > 0 && (
                  <ResultCard title="Disallow Rules">
                    <div className="space-y-2 text-sm">
                      {result.disallowedPaths.map((d, i) => (
                        <div key={i} className="flex gap-2 py-1 border-b border-zinc-100 last:border-0">
                          <code className="text-red-600 font-mono text-xs flex-shrink-0">{d.path}</code>
                          <span className="text-muted-foreground text-xs">
                            for: {d.userAgents.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                <ResultCard title="Raw robots.txt">
                  <pre className="text-xs font-mono bg-zinc-50 p-4 rounded-md overflow-auto max-h-64 whitespace-pre-wrap break-all">
                    {result.content}
                  </pre>
                </ResultCard>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
