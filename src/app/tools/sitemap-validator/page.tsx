'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { URLInput } from '@/components/url-input';
import { ResultCard, StatusBadge, IssueList } from '@/components/result-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { fetchHtml, analyzeSitemap } from '@/lib/tools';

export default function SitemapValidatorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeSitemap> | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    setLoading(true);
    setError('');
    setResult(null);

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      const parsed = new URL(targetUrl);
      const sitemapUrl = `${parsed.protocol}//${parsed.hostname}/sitemap.xml`;

      const { html, status } = await fetchHtml(sitemapUrl);
      const analysis = analyzeSitemap(html || '', status || 0);
      setResult(analysis);
    } catch (e) {
      setError('Failed to parse URL. Check the format.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Globe className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Sitemap Validator</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <URLInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          placeholder="Enter website URL to check sitemap.xml..."
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
              <Globe className={`h-8 w-8 ${result.exists && result.isXml ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-semibold">
                  {result.exists && result.isXml
                    ? 'Sitemap Found & Valid XML'
                    : result.exists
                      ? 'Response Found (Not XML)'
                      : 'Sitemap Not Found'}
                </p>
                <p className="text-sm text-muted-foreground">Status: {result.status}</p>
              </div>
            </div>

            {result.exists && result.isXml && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ResultCard title="URLs" status={result.urlCount > 0 ? 'good' : 'warning'}>
                    <p className="text-2xl font-bold">{result.urlCount}</p>
                  </ResultCard>
                  <ResultCard title="Last Modified" status={result.hasLastmod ? 'good' : 'warning'}>
                    <StatusBadge status={result.hasLastmod ? 'good' : 'warning'} label={result.hasLastmod ? 'Present' : 'Missing'} />
                  </ResultCard>
                  <ResultCard title="Change Frequency" status={result.hasChangefreq ? 'good' : 'info'}>
                    <StatusBadge status={result.hasChangefreq ? 'good' : 'info'} label={result.hasChangefreq ? 'Present' : 'Missing'} />
                  </ResultCard>
                  <ResultCard title="Priority" status={result.hasPriority ? 'good' : 'info'}>
                    <StatusBadge status={result.hasPriority ? 'good' : 'info'} label={result.hasPriority ? 'Present' : 'Missing'} />
                  </ResultCard>
                </div>

                {result.urls.length > 0 && (
                  <ResultCard title={`Sample URLs (${Math.min(result.urls.length, 200)} of ${result.urlCount})`}>
                    <div className="space-y-1 max-h-80 overflow-y-auto">
                      {result.urls.map((u, i) => (
                        <div key={i} className="text-xs font-mono text-muted-foreground py-1 border-b border-zinc-100 last:border-0 truncate">
                          {u}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}
              </>
            )}

            {result.content && (
              <ResultCard title="Raw Response">
                <pre className="text-xs font-mono bg-zinc-50 p-4 rounded-md overflow-auto max-h-64 whitespace-pre-wrap break-all">
                  {result.content.slice(0, 5000)}
                  {result.content.length > 5000 && '\n\n... (truncated)'}
                </pre>
              </ResultCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
