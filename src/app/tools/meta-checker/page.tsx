'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tags } from 'lucide-react';
import { URLInput } from '@/components/url-input';
import { ResultCard, StatusBadge, IssueList } from '@/components/result-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { fetchHtml, analyzeMetaTags, MetaResult } from '@/lib/tools';

export default function MetaCheckerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetaResult | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    setLoading(true);
    setError('');
    setResult(null);

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const { html, error: fetchError } = await fetchHtml(targetUrl);
    if (fetchError || !html) {
      setError(fetchError || 'Failed to fetch page. Check the URL and try again.');
      setLoading(false);
      return;
    }

    const analysis = analyzeMetaTags(html);
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
          <Tags className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Meta Tag Checker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <URLInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          placeholder="Enter URL to check meta tags..."
        />

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {result && (
          <>
            <IssueList issues={result.issues} warnings={result.warnings} />

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard title="Title Tag" status={result.title.status}>
                <p className="text-sm break-words">{result.title.content || '(empty)'}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.title.length} characters</p>
              </ResultCard>

              <ResultCard title="Meta Description" status={result.description.status}>
                <p className="text-sm break-words">{result.description.content || '(empty)'}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.description.length} characters</p>
              </ResultCard>
            </div>

            <ResultCard title="Headings">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">H1:</span>{' '}
                  <strong>{result.h1Count}</strong>
                  {result.h1Texts.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {result.h1Texts.map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground truncate">&ldquo;{t}&rdquo;</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">H2:</span> <strong>{result.h2Count}</strong>
                </div>
              </div>
            </ResultCard>

            <ResultCard title="Technical Meta Tags">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Keywords</span>
                  <StatusBadge status={result.keywords.present ? 'good' : 'info'} label={result.keywords.present ? 'Present' : 'Not Set'} />
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Robots</span>
                  <StatusBadge status={result.robots.present ? 'good' : 'info'} label={result.robots.content || 'Not Set'} />
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Canonical</span>
                  <StatusBadge status={result.canonical.present ? 'good' : 'warning'} label={result.canonical.present ? 'Set' : 'Missing'} />
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Viewport</span>
                  <StatusBadge status={result.viewport.present ? 'good' : 'bad'} label={result.viewport.present ? 'Set' : 'Missing'} />
                </div>
              </div>
            </ResultCard>

            {result.ogTags.length > 0 && (
              <ResultCard title="Open Graph Tags">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {result.ogTags.map((tag, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-blue-600 font-mono text-xs flex-shrink-0">{tag.property}</span>
                      <span className="text-muted-foreground truncate">{tag.content}</span>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {result.twitterTags.length > 0 && (
              <ResultCard title="Twitter Card Tags">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {result.twitterTags.map((tag, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-sky-600 font-mono text-xs flex-shrink-0">{tag.name}</span>
                      <span className="text-muted-foreground truncate">{tag.content}</span>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
