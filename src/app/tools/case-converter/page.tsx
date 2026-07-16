'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CaseSensitive, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant';

const CASE_LABELS: Record<CaseType, string> = {
  upper: 'UPPER CASE',
  lower: 'lower case',
  title: 'Title Case',
  sentence: 'Sentence case',
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  constant: 'CONSTANT_CASE',
};

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

function convert(str: string, type: CaseType): string {
  if (!str.trim()) return '';
  switch (type) {
    case 'upper': return str.toUpperCase();
    case 'lower': return str.toLowerCase();
    case 'title': return toTitleCase(str);
    case 'sentence': return toSentenceCase(str);
    case 'camel': return toCamelCase(str);
    case 'pascal': return toPascalCase(str);
    case 'snake': return toSnakeCase(str);
    case 'kebab': return toKebabCase(str);
    case 'constant': return toConstantCase(str);
  }
}

export default function CaseConverterPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<CaseType | ''>('');

  async function copyResult(type: CaseType) {
    const result = convert(input, type);
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  }

  const caseTypes: CaseType[] = ['upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab', 'constant'];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <CaseSensitive className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Text Case Converter</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enter Text</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-32 font-mono text-sm border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type or paste your text here to convert case..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        {input.trim() && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {caseTypes.map((type) => {
              const result = convert(input, type);
              return (
                <Card key={type} className="group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {CASE_LABELS[type]}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyResult(type)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copied === type ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <code className="font-mono text-sm break-all block">{result}</code>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
