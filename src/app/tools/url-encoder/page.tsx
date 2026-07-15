'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Link2, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UrlEncoderPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tab, setTab] = useState('encode');
  const [copied, setCopied] = useState(false);

  function handleEncode() {
    if (!input.trim()) return;
    setOutput(encodeURIComponent(input));
  }

  function handleDecode() {
    if (!input.trim()) return;
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setOutput('Error: Invalid URL-encoded string.');
    }
  }

  function handleGo() {
    if (tab === 'encode') handleEncode();
    else handleDecode();
  }

  function swap() {
    setInput(output);
    setOutput('');
    setTab(tab === 'encode' ? 'decode' : 'encode');
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link2 className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">URL Encoder / Decoder</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {tab === 'encode' ? 'Text to URL Encode' : 'URL-encoded Text to Decode'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-36 font-mono text-sm border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={tab === 'encode' ? 'Enter text to URL encode...' : 'Paste URL-encoded text to decode...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex gap-2 mt-3">
                <Button onClick={handleGo} disabled={!input.trim()} size="sm">
                  {tab === 'encode' ? 'Encode' : 'Decode'}
                </Button>
                {output && (
                  <Button onClick={swap} variant="outline" size="sm">
                    <ArrowRightLeft className="h-4 w-4 mr-1" /> Swap
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs>

        {output && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Result</CardTitle>
                <Button variant="outline" size="sm" onClick={copyOutput}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-100 font-mono text-sm p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap break-all">
                {output}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
