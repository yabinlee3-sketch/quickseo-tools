'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Link2, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Hop { step: number; status: number; url: string; }
interface Result { chain: Hop[]; finalStatus: number; finalUrl: string; hopCount: number; }

function statusColor(code: number) {
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-700';
  if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-700';
  if (code >= 400 && code < 500) return 'bg-amber-100 text-amber-700';
  if (code >= 500) return 'bg-red-100 text-red-700';
  return 'bg-zinc-100 text-zinc-700';
}

export default function UrlRedirectCheckerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function handleCheck() {
    setLoading(true); setError(''); setResult(null);
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    try {
      const res = await fetch('/api/redirect-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError('Check failed. Make sure the URL is accessible.');
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
          <Link2 className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">URL Redirect Checker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            disabled={loading}
            className="flex-1 h-12 text-base"
          />
          <Button onClick={handleCheck} disabled={loading || !url.trim()} size="lg" className="h-12 px-6">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span className="ml-2">Check</span>
          </Button>
        </div>

        {error && <Card className="border-red-200 bg-red-50"><CardContent className="py-4 text-red-700 text-sm">{error}</CardContent></Card>}

        {result && (
          <>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Redirect Chain</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2 w-16 font-medium">Step</th>
                      <th className="py-2 w-28 font-medium">Status Code</th>
                      <th className="py-2 font-medium">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.chain.map((hop, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{hop.step}</td>
                        <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(hop.status)}`}>{hop.status}</span></td>
                        <td className="py-2 break-all font-mono text-xs">{hop.url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
              Final: HTTP {result.finalStatus} → <span className="break-all">{result.finalUrl}</span>
              {result.hopCount > 0 && ` (${result.hopCount} redirect${result.hopCount > 1 ? 's' : ''})`}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
