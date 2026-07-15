'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Braces, Copy, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function formatJson() {
    setError('');
    setOutput('');
    if (!input.trim()) {
      setError('Please enter JSON to format.');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Invalid JSON: ${msg}`);
    }
  }

  function minifyJson() {
    setError('');
    setOutput('');
    if (!input.trim()) {
      setError('Please enter JSON to minify.');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Invalid JSON: ${msg}`);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Braces className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">JSON Formatter & Validator</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Input JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-48 font-mono text-sm border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder='Paste your JSON here... {"key": "value"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={formatJson} disabled={!input.trim()} size="sm">
                Format / Beautify
              </Button>
              <Button onClick={minifyJson} disabled={!input.trim()} variant="outline" size="sm">
                Minify
              </Button>
              <Button onClick={clearAll} variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {output && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Output</CardTitle>
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
              <pre className="bg-zinc-900 text-green-400 font-mono text-sm p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap break-words">
                {output}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
