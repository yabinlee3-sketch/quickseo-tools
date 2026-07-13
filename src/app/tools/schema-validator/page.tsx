'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { URLInput } from '@/components/url-input';
import { ResultCard, StatusBadge, IssueList } from '@/components/result-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { fetchHtml, analyzeSchema, SchemaResult } from '@/lib/tools';

export default function SchemaValidatorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemaResult | null>(null);
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

    const analysis = analyzeSchema(html);
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
          <Code2 className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Schema Validator</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <URLInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          placeholder="Enter URL to check structured data..."
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
          </div>
        )}

        {result && (
          <>
            <IssueList issues={result.issues} warnings={result.warnings} />

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-white">
              <Code2 className={`h-8 w-8 ${result.totalCount > 0 ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <p className="font-semibold">
                  {result.totalCount > 0
                    ? `${result.totalCount} structured data block${result.totalCount > 1 ? 's' : ''} found`
                    : 'No structured data found'}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {result.hasJsonLd && <StatusBadge status="good" label="JSON-LD" />}
                  {result.hasMicrodata && <StatusBadge status="info" label="Microdata" />}
                  {result.types.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {result.blocks.length > 0 && (
              <Accordion multiple className="space-y-3">
                {result.blocks.map((block, i) => (
                  <AccordionItem key={i} value={`block-${i}`} className="border rounded-lg bg-white px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-1.5 rounded ${block.errors.length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                          {block.errors.length > 0
                            ? <AlertTriangle className="h-4 w-4 text-red-600" />
                            : <CheckCircle2 className="h-4 w-4 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {block.type}
                            <Badge variant="secondary" className="ml-2 text-[10px]">{block.format}</Badge>
                          </p>
                          {block.errors.length > 0 && (
                            <p className="text-xs text-red-600">{block.errors.length} issue{block.errors.length > 1 ? 's' : ''}</p>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-3">
                      {block.errors.length > 0 && (
                        <div className="space-y-1">
                          {block.errors.map((e, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded p-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {e}
                            </div>
                          ))}
                        </div>
                      )}

                      {block.warnings.length > 0 && (
                        <div className="space-y-1">
                          {block.warnings.map((w, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 rounded p-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {w}
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Structured Data</p>
                        <pre className="text-xs font-mono bg-zinc-50 p-4 rounded-md overflow-auto max-h-64 whitespace-pre-wrap break-all">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </main>
    </div>
  );
}
