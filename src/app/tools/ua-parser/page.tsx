'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  engine: string;
  engineVersion: string;
}

function parseUA(ua: string): ParsedUA {
  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';
  let device = 'Desktop';
  let engine = 'Unknown';
  let engineVersion = '';

  // Engine
  const blinkMatch = ua.match(/Chrome\/([\d.]+)/);
  const geckoMatch = ua.match(/Gecko\/([\d.]+)/);
  const webkitMatch = ua.match(/AppleWebKit\/([\d.]+)/);
  if (blinkMatch) {
    engine = 'Blink';
    engineVersion = blinkMatch[1];
  } else if (geckoMatch) {
    engine = 'Gecko';
    engineVersion = geckoMatch[1];
  } else if (webkitMatch) {
    engine = 'WebKit';
    engineVersion = webkitMatch[1];
  }

  // Browser
  if (ua.includes('Edg/')) {
    browser = 'Microsoft Edge';
    const m = ua.match(/Edg\/([\d.]+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browser = 'Opera';
    const m = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    const m = ua.match(/Firefox\/([\d.]+)/);
    if (m) browserVersion = m[1];
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    if (blinkMatch) browserVersion = blinkMatch[1];
  } else if (ua.includes('Safari/') && ua.includes('Version/')) {
    browser = 'Safari';
    const m = ua.match(/Version\/([\d.]+)/);
    if (m) browserVersion = m[1];
  }

  // OS & Device
  if (ua.includes('Windows NT 11.0') || ua.includes('Windows NT 10.0')) {
    os = 'Windows';
    osVersion = ua.includes('Windows NT 11.0') ? '11' : '10';
  } else if (ua.includes('Windows NT 6.3')) { os = 'Windows'; osVersion = '8.1'; }
  else if (ua.includes('Windows NT 6.2')) { os = 'Windows'; osVersion = '8'; }
  else if (ua.includes('Windows NT 6.1')) { os = 'Windows'; osVersion = '7'; }

  if (ua.includes('Mac OS X')) {
    os = 'macOS';
    const m = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (m) osVersion = m[1].replace(/_/g, '.');
  }

  if (ua.includes('Android')) {
    os = 'Android';
    device = 'Mobile';
    const m = ua.match(/Android ([\d.]+)/);
    if (m) osVersion = m[1];
  }

  if (ua.includes('iPhone')) { os = 'iOS'; device = 'Mobile'; }
  else if (ua.includes('iPad')) { os = 'iOS'; device = 'Tablet'; }
  if (ua.includes('iPhone OS') || ua.includes('CPU OS')) {
    const m = ua.match(/(?:iPhone OS|CPU OS) ([\d_]+)/);
    if (m) osVersion = m[1].replace(/_/g, '.');
  }

  if (ua.includes('Linux') && !ua.includes('Android')) {
    os = 'Linux';
    device = 'Desktop';
  }

  if (ua.includes('Mobile')) device = 'Mobile';
  if (ua.includes('Tablet')) device = 'Tablet';

  return { browser, browserVersion, os, osVersion, device, engine, engineVersion };
}

export default function UAParserPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParsedUA | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInput(navigator.userAgent);
      setResult(parseUA(navigator.userAgent));
    }
  }, []);

  function handleParse() {
    if (!input.trim()) return;
    setResult(parseUA(input.trim()));
  }

  async function copyResult() {
    if (!result) return;
    const text = [
      `Browser: ${result.browser} ${result.browserVersion}`,
      `OS: ${result.os} ${result.osVersion}`,
      `Device: ${result.device}`,
      `Engine: ${result.engine} ${result.engineVersion}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
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
          <Monitor className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">User Agent Parser</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">User Agent String</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-28 font-mono text-xs border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste a User Agent string here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={handleParse} disabled={!input.trim()} size="sm">
                Parse
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Parse Result</CardTitle>
                <Button variant="outline" size="sm" onClick={copyResult}>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="text-xs text-muted-foreground mb-1">Browser</div>
                  <div className="font-semibold text-sm">{result.browser}</div>
                  {result.browserVersion && (
                    <Badge variant="secondary" className="mt-1 text-xs">{result.browserVersion}</Badge>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="text-xs text-muted-foreground mb-1">OS</div>
                  <div className="font-semibold text-sm">{result.os}</div>
                  {result.osVersion && (
                    <Badge variant="secondary" className="mt-1 text-xs">{result.osVersion}</Badge>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-purple-50">
                  <div className="text-xs text-muted-foreground mb-1">Device</div>
                  <div className="font-semibold text-sm">{result.device}</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50">
                  <div className="text-xs text-muted-foreground mb-1">Engine</div>
                  <div className="font-semibold text-sm">{result.engine}</div>
                  {result.engineVersion && (
                    <Badge variant="secondary" className="mt-1 text-xs">{result.engineVersion}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
