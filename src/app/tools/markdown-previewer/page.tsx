'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Copy, Check, Columns2, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function renderMarkdown(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold / Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-600 underline">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-zinc-300" />')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 text-muted-foreground italic my-2">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2">$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="my-2">');
  
  html = '<p class="my-2">' + html + '</p>';
  // Fix bad nesting
  html = html.replace(/<p class="my-2"><\/p>/g, '');
  
  return html;
}

export default function MarkdownPreviewerPage() {
  const [input, setInput] = useState('');
  const [splitView, setSplitView] = useState(true);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const MARKDOWN_SAMPLE = `# Markdown Preview

## Features

- **Bold** and *italic* and ***bold italic***
- \`inline code\`
- [Links](https://example.com)
- Images: ![Alt](https://placehold.co/200x100/blue/white?text=Demo)

## Code Block

\`\`\`
function hello() {
  console.log("Hello World!");
}
\`\`\`

## Blockquote

> The quick brown fox jumps over the lazy dog.

---

Made with QuickSEO Tools`;

  function loadSample() {
    setInput(MARKDOWN_SAMPLE);
  }

  async function copyHtml() {
    if (!previewRef.current) return;
    await navigator.clipboard.writeText(previewRef.current.innerHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const previewHtml = renderMarkdown(input);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Eye className="h-5 w-5 text-blue-600" />
            <h1 className="font-semibold text-lg">Markdown Previewer</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSplitView(!splitView)}>
              {splitView ? <Columns className="h-4 w-4" /> : <Columns2 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={loadSample}>
              Load Sample
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className={`grid gap-4 ${splitView ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <Card className={splitView ? '' : 'max-w-3xl mx-auto w-full'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Markdown Input</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-[60vh] font-mono text-sm border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type or paste Markdown here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live Preview</CardTitle>
                <Button variant="outline" size="sm" onClick={copyHtml}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied HTML
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy HTML
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {input ? (
                <div
                  ref={previewRef}
                  className="prose prose-sm max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="text-muted-foreground text-sm py-12 text-center">
                  Start typing Markdown on the left to see the preview.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
