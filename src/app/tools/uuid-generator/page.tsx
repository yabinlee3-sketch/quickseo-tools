'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Fingerprint, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function generateUuidV4(): string {
  return crypto.randomUUID();
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([generateUuidV4()]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function regenerate() {
    const n = Math.min(Math.max(count, 1), 50);
    const newUuids: string[] = [];
    for (let i = 0; i < n; i++) {
      newUuids.push(generateUuidV4());
    }
    setUuids(newUuids);
  }

  async function copyOne(uuid: string, index: number) {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Fingerprint className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">UUID Generator</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generate UUID v4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="w-32">
                <Label htmlFor="uuid-count">Count (1-50)</Label>
                <Input
                  id="uuid-count"
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </div>
              <Button onClick={regenerate}>
                <RefreshCw className="h-4 w-4 mr-2" /> Generate
              </Button>
              {uuids.length > 1 && (
                <Button variant="outline" onClick={copyAll}>
                  {copiedAll ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied All
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy All
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Generated UUID{uuids.length > 1 ? 's' : ''}
              <span className="text-muted-foreground font-normal text-sm ml-2">({uuids.length} total)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors group"
              >
                <code className="font-mono text-sm break-all">{uuid}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyOne(uuid, i)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === i ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
