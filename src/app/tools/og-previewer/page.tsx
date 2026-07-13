'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { URLInput } from '@/components/url-input';
import { ResultCard, StatusBadge, IssueList } from '@/components/result-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchHtml, analyzeOgTags, OgPreview } from '@/lib/tools';

const platforms = ['facebook', 'twitter', 'linkedin', 'googleDiscord'] as const;

const platformNames: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  googleDiscord: 'Google / Discord',
};

export default function OgPreviewerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OgPreview | null>(null);
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
      setError(fetchError || 'Failed to fetch page.');
      setLoading(false);
      return;
    }

    const analysis = analyzeOgTags(html);
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
          <Eye className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">OG Previewer</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <URLInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          placeholder="Enter URL to preview social cards..."
        />

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {result && (
          <>
            {result.missingRequired.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                <strong>Missing required OG tags:</strong>{' '}
                {result.missingRequired.join(', ')}
              </div>
            )}

            <Tabs defaultValue="facebook" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                {platforms.map(p => (
                  <TabsTrigger key={p} value={p}>{platformNames[p]}</TabsTrigger>
                ))}
              </TabsList>

              {platforms.map(p => {
                const preview = result.previews[p];
                return (
                  <TabsContent key={p} value={p}>
                    <Card>
                      <CardContent className="py-6">
                        {p === 'twitter' && (
                          <div className="max-w-md mx-auto border rounded-xl overflow-hidden bg-white">
                            {preview.image && (
                              <div className="aspect-[2/1] bg-zinc-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={preview.image}
                                  alt="OG"
                                  className="w-full h-full object-cover"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="p-3 space-y-1">
                              <p className="text-xs text-muted-foreground truncate">
                                {result.type === 'article' ? (result as any).twitterCard === 'summary_large_image' ? 'Summary Large Image' : 'Summary Card' : 'Website Card'}
                              </p>
                              <p className="text-sm font-semibold leading-snug line-clamp-2">
                                {preview.title || '(no title)'}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {preview.description || '(no description)'}
                              </p>
                            </div>
                          </div>
                        )}

                        {p === 'facebook' && (
                          <div className="max-w-md mx-auto border rounded-lg overflow-hidden bg-white">
                            {preview.image && (
                              <div className="aspect-[1.91/1] bg-zinc-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={preview.image}
                                  alt="OG"
                                  className="w-full h-full object-cover"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="p-3 space-y-1 bg-zinc-50">
                              <p className="text-xs text-muted-foreground uppercase truncate">
                                {result.previews.facebook.siteName || 'example.com'}
                              </p>
                              <p className="text-sm font-semibold leading-snug line-clamp-2">
                                {preview.title || '(no title)'}
                              </p>
                              <p className="text-sm text-zinc-600 line-clamp-2">
                                {preview.description || '(no description)'}
                              </p>
                            </div>
                          </div>
                        )}

                        {p === 'linkedin' && (
                          <div className="max-w-md mx-auto border rounded overflow-hidden bg-white">
                            {preview.image && (
                              <div className="aspect-[1.91/1] bg-zinc-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={preview.image}
                                  alt="OG"
                                  className="w-full h-full object-cover"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="p-3 space-y-1">
                              <p className="text-sm font-semibold leading-snug text-zinc-800 line-clamp-2">
                                {preview.title || '(no title)'}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {preview.description || '(no description)'}
                              </p>
                            </div>
                          </div>
                        )}

                        {p === 'googleDiscord' && (
                          <div className="max-w-md mx-auto">
                            <div className="border-l-4 border-blue-600 pl-4 py-2 bg-white rounded-r-lg shadow-sm">
                              <p className="text-sm text-blue-700 font-medium line-clamp-1">
                                {preview.title || '(no title)'}
                              </p>
                              <p className="text-xs text-zinc-600 line-clamp-2 mt-0.5">
                                {preview.description || '(no description)'}
                              </p>
                              {preview.image && (
                                <div className="mt-2 aspect-[1.91/1] rounded overflow-hidden bg-zinc-100 max-w-[200px]">
                                  <img
                                    src={preview.image}
                                    alt="OG"
                                    className="w-full h-full object-cover"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>

            {result.allOg.length > 0 && (
              <ResultCard title="All Open Graph Tags">
                <div className="grid gap-2 text-sm">
                  {result.allOg.map((tag, i) => (
                    <div key={i} className="flex gap-2 py-1 border-b border-zinc-100 last:border-0">
                      <code className="text-blue-600 text-xs font-mono flex-shrink-0 min-w-[140px]">{tag.property}</code>
                      <span className="text-muted-foreground break-all">{tag.content}</span>
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
