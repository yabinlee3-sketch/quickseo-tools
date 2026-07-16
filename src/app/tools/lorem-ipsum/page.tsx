'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Type, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'praesent', 'sapien', 'massa', 'convallis', 'a', 'pellentesque',
  'nec', 'egestas', 'non', 'nisi', 'cras', 'ultricies', 'ligula', 'sed', 'magna',
  'dictum', 'porta', 'vivamus', 'magna', 'justo', 'lacinia', 'eget', 'consectetur',
  'sed', 'convallis', 'at', 'tellus', 'nulla', 'porttitor', 'accumsan', 'tincidunt',
  'vestibulum', 'ante', 'ipsum', 'primis', 'in', 'faucibus', 'orci', 'luctus',
  'et', 'ultrices', 'posuere', 'cubilia', 'curae', 'donec', 'velit', 'neque',
  'auctor', 'sit', 'amet', 'aliquam', 'vel', 'ullamcorper', 'sit', 'amet', 'ligula',
];

function generateParagraph(wordCount: number): string {
  const words: string[] = [];
  const uniqueWords = [...WORDS];
  // shuffle
  for (let i = uniqueWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniqueWords[i], uniqueWords[j]] = [uniqueWords[j], uniqueWords[i]];
  }
  for (let i = 0; i < wordCount; i++) {
    words.push(uniqueWords[i % uniqueWords.length]);
  }
  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
}

function generateLorem(type: 'paragraphs' | 'words', count: number, wordsPerParagraph: number): string {
  if (type === 'words') {
    const result = generateParagraph(count);
    return result;
  }
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(generateParagraph(wordsPerParagraph));
  }
  return paragraphs.join('\n\n');
}

export default function LoremIpsumPage() {
  const [type, setType] = useState<'paragraphs' | 'words'>('paragraphs');
  const [paragraphCount, setParagraphCount] = useState(3);
  const [wordCount, setWordCount] = useState(50);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(40);
  const [output, setOutput] = useState(() =>
    generateLorem('paragraphs', 3, 40)
  );
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    if (type === 'words') {
      setOutput(generateLorem('words', Math.min(Math.max(wordCount, 1), 500), 0));
    } else {
      setOutput(
        generateLorem(
          'paragraphs',
          Math.min(Math.max(paragraphCount, 1), 20),
          Math.min(Math.max(wordsPerParagraph, 5), 200)
        )
      );
    }
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
          <Type className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Lorem Ipsum Generator</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={type} onValueChange={(v) => setType(v as 'paragraphs' | 'words')}>
              <TabsList className="mb-4">
                <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
                <TabsTrigger value="words">Words</TabsTrigger>
              </TabsList>

              <TabsContent value="paragraphs" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="para-count">Number of Paragraphs (1-20)</Label>
                    <Input
                      id="para-count"
                      type="number"
                      min={1}
                      max={20}
                      value={paragraphCount}
                      onChange={(e) => setParagraphCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wpp">Words per Paragraph (5-200)</Label>
                    <Input
                      id="wpp"
                      type="number"
                      min={5}
                      max={200}
                      value={wordsPerParagraph}
                      onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="words">
                <div>
                  <Label htmlFor="word-count">Number of Words (1-500)</Label>
                  <Input
                    id="word-count"
                    type="number"
                    min={1}
                    max={500}
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleGenerate} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" /> Generate
            </Button>
          </CardContent>
        </Card>

        {output && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Text</CardTitle>
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
              <div className="bg-zinc-100 text-sm p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                {output}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
