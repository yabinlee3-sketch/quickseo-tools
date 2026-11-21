'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Plus, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Variant { id: number; language: string; region: string; url: string; }

export default function HreflangGeneratorPage() {
  const [defaultLang, setDefaultLang] = useState('en');
  const [mainUrl, setMainUrl] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { id: 1, language: 'fr', region: 'FR', url: '' },
  ]);
  const [copied, setCopied] = useState(false);

  function updateVariant(id: number, field: keyof Omit<Variant, 'id'>, value: string) {
    setVariants(vs => vs.map(v => v.id === id ? { ...v, [field]: value } : v));
  }
  function addVariant() {
    setVariants(vs => [...vs, { id: Date.now(), language: '', region: '', url: '' }]);
  }
  function removeVariant(id: number) {
    setVariants(vs => vs.filter(v => v.id !== id));
  }

  const output = (() => {
    const lines: string[] = [];
    if (mainUrl.trim() && defaultLang.trim()) {
      lines.push(`<link rel="alternate" hreflang="${defaultLang.trim()}" href="${mainUrl.trim()}" />`);
    }
    for (const v of variants) {
      if (!v.language.trim() || !v.url.trim()) continue;
      const code = v.region.trim() ? `${v.language.trim()}-${v.region.trim()}` : v.language.trim();
      lines.push(`<link rel="alternate" hreflang="${code}" href="${v.url.trim()}" />`);
    }
    if (mainUrl.trim()) {
      lines.push(`<link rel="alternate" hreflang="x-default" href="${mainUrl.trim()}" />`);
    }
    return lines.join('\n');
  })();

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Globe className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Hreflang Generator</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Default Page</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="default-lang">Default Language</Label>
              <Input id="default-lang" placeholder="en" value={defaultLang} onChange={e => setDefaultLang(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="main-url">Main URL</Label>
              <Input id="main-url" placeholder="https://example.com" value={mainUrl} onChange={e => setMainUrl(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Language / Region Variants</CardTitle>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {variants.map(v => (
              <div key={v.id} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-start">
                <div>
                  <Label className="text-xs">Language</Label>
                  <Input placeholder="fr" value={v.language} onChange={e => updateVariant(v.id, 'language', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Region (optional)</Label>
                  <Input placeholder="FR" value={v.region} onChange={e => updateVariant(v.id, 'region', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input placeholder="https://example.com/fr" value={v.url} onChange={e => updateVariant(v.id, 'url', e.target.value)} />
                </div>
                <Button variant="ghost" size="icon" className="mt-6 text-red-500" onClick={() => removeVariant(v.id)} aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {output && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated hreflang Tags</CardTitle>
                <Button variant="outline" size="sm" onClick={copyOutput}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea readOnly value={output} rows={Math.max(3, output.split('\n').length)} className="font-mono text-sm" />
              <p className="text-xs text-muted-foreground mt-2">Add these tags to the &lt;head&gt; section of every page.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
