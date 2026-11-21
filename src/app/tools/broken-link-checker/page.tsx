'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Unlink, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LinkResult { url: string; status: number | string; ok: boolean; }
interface Result { url: string; totalLinks: number; checked: number; brokenCount: number; broken: LinkResult[]; results: LinkResult[]; }

export default function BrokenLinkCheckerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  async function handleScan() {
    setLoading(true); setError(''); setResult(null);
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    try {
      const res = await fetch('/api/broken-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError('Scan failed. Make sure the URL is accessible.');
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
          <Unlink className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Broken Link Checker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            disabled={loading}
            className="flex-1 h-12 text-base"
          />
          <Button onClick={handleScan} disabled={loading || !url.trim()} size="lg" className="h-12 px-6">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span className="ml-2">Scan</span>
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Scanning links, this may take a moment...</p>}
        {error && <Card className="border-red-200 bg-red-50"><CardContent className="py-4 text-red-700 text-sm">{error}</CardContent></Card>}

        {result && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="py-4 text-center"><div className="text-2xl font-bold">{result.totalLinks}</div><div className="text-xs text-muted-foreground">Links Found</div></CardContent></Card>
              <Card><CardContent className="py-4 text-center"><div className="text-2xl font-bold">{result.checked}</div><div className="text-xs text-muted-foreground">Checked</div></CardContent></Card>
              <Card><CardContent className="py-4 text-center"><div className={`text-2xl font-bold ${result.brokenCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{result.brokenCount}</div><div className="text-xs text-muted-foreground">Broken</div></CardContent></Card>
            </div>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Broken Links</CardTitle></CardHeader>
              <CardContent>
                {result.broken.length === 0 ? (
                  <p className="text-sm text-green-700">No broken links found. All checked links responded OK.</p>
                ) : (
                  <ul className="space-y-2">
                    {result.broken.map((link, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-red-50">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 whitespace-nowrap">{link.status}</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="break-all text-blue-700 hover:underline">{link.url}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
