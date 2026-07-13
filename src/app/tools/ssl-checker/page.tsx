'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { URLInput } from '@/components/url-input';
import { ResultCard, StatusBadge, IssueList } from '@/components/result-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { SSLResult } from '@/lib/tools';

export default function SslCheckerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSLResult | null>(null);
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
      const res = await fetch('/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data: SSLResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SSL check failed. Make sure the site is accessible.');
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
          <Shield className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">SSL Checker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <URLInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          placeholder="Enter URL to check SSL certificate..."
        />

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {result && (
          <>
            {result.issues.length > 0 || result.warnings.length > 0 ? (
              <IssueList issues={result.issues} warnings={result.warnings} />
            ) : null}

            {result.error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4 text-red-700 text-sm">{result.error}</CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-white">
              <Shield className={`h-8 w-8 ${result.valid ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-semibold">
                  {result.valid ? 'SSL Certificate Valid' : 'SSL Certificate Invalid'}
                </p>
                <p className="text-sm text-muted-foreground">{result.hostname}</p>
              </div>
            </div>

            {result.details && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ResultCard title="Issuer">
                    <p className="text-sm break-words">{result.details.issuer}</p>
                  </ResultCard>
                  <ResultCard title="Subject">
                    <p className="text-sm break-words">{result.details.subjectCN}</p>
                  </ResultCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <ResultCard title="Protocol">
                    <p className="text-sm font-mono">{result.details.protocol}</p>
                  </ResultCard>
                  <ResultCard title="Valid From">
                    <p className="text-sm">{result.details.validFrom}</p>
                  </ResultCard>
                  <ResultCard
                    title="Expires"
                    status={result.details.daysRemaining < 30 ? 'warning' : result.details.daysRemaining < 0 ? 'bad' : 'good'}
                  >
                    <p className="text-sm">{result.details.validTo}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.details.daysRemaining > 0
                        ? `${result.details.daysRemaining} days remaining`
                        : 'EXPIRED'}
                    </p>
                  </ResultCard>
                </div>

                <ResultCard title="Additional Details">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-muted-foreground">Fingerprint</span>
                      <code className="text-xs font-mono">{result.details.fingerprint}</code>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-muted-foreground">Serial Number</span>
                      <code className="text-xs font-mono">{result.details.serialNumber}</code>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Certificate Transparency</span>
                      <StatusBadge status={result.details.certTransparency ? 'good' : 'warning'} label={result.details.certTransparency ? 'Enabled' : 'Not detected'} />
                    </div>
                  </div>
                </ResultCard>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
