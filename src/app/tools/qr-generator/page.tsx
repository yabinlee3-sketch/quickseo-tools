'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function QrGeneratorPage() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');

  const generateQR = useCallback(async () => {
    setError('');
    setQrDataUrl('');
    if (!text.trim()) {
      setError('Please enter text or URL to encode.');
      return;
    }
    const qrSize = Math.min(Math.max(size, 128), 1024);
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(text, {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: darkColor, light: lightColor },
      });
      setQrDataUrl(dataUrl);
    } catch {
      setError('Failed to generate QR code. Text may be too long.');
    }
  }, [text, size, darkColor, lightColor]);

  function downloadQR() {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <QrCode className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">QR Code Generator</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generate QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="qr-text">Text or URL</Label>
              <Input
                id="qr-text"
                placeholder="Enter text, URL, or any data to encode..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateQR()}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="qr-size">Size (px)</Label>
                <Input id="qr-size" type="number" min={128} max={1024} step={32}
                  value={size} onChange={(e) => setSize(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="qr-dark">Foreground</Label>
                <Input id="qr-dark" type="color" value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)} className="h-10 w-full p-1" />
              </div>
              <div>
                <Label htmlFor="qr-light">Background</Label>
                <Input id="qr-light" type="color" value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)} className="h-10 w-full p-1" />
              </div>
              <div className="flex items-end">
                <Button onClick={generateQR} disabled={!text.trim()} className="w-full">Generate</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700 text-sm">{error}</CardContent>
          </Card>
        )}

        {qrDataUrl && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">QR Code Preview</CardTitle>
                <Button variant="outline" size="sm" onClick={downloadQR}>
                  <Download className="h-4 w-4 mr-1" /> Download PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center p-6 bg-zinc-100 rounded-b-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Generated QR Code" className="max-w-full rounded shadow-md" />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
