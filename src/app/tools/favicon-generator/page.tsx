'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SIZES = [16, 32, 48, 64, 180];

export default function FaviconGeneratorPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function loadFile(file: File) {
    setError('');
    if (!/image\/(png|jpeg)/i.test(file.type)) {
      setError('Please upload a PNG or JPG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { setImage(img); setFileName(file.name); };
      img.onerror = () => setError('Could not read this image.');
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  function makeFavicon(size: number): string {
    if (!image) return '';
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    // center-crop to square, then scale
    const side = Math.min(image.width, image.height);
    const sx = (image.width - side) / 2;
    const sy = (image.height - side) / 2;
    ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL('image/png');
  }

  function download(size: number) {
    const url = makeFavicon(size);
    if (!url) return;
    const base = fileName.replace(/\.[^.]+$/, '') || 'favicon';
    const link = document.createElement('a');
    link.download = `${base}-${size}x${size}.png`;
    link.href = url;
    link.click();
  }
  function downloadAll() {
    SIZES.forEach((s, i) => setTimeout(() => download(s), i * 200));
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ImageIcon className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Favicon Generator</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Upload Image</CardTitle></CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-zinc-300 hover:border-blue-400'}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <ImageIcon className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
              <p className="text-sm text-muted-foreground">Drop a PNG or JPG here, or click to browse</p>
              <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onInputChange} />
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            {fileName && <p className="text-sm text-green-600 mt-3">Loaded: {fileName}</p>}
          </CardContent>
        </Card>

        {image && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Favicons</CardTitle>
                <Button size="sm" onClick={downloadAll}><Download className="h-4 w-4 mr-1" /> Download All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {SIZES.map(s => (
                  <div key={s} className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={makeFavicon(s)} alt={`${s}x${s} favicon`} width={Math.min(s, 64)} height={Math.min(s, 64)} />
                    <span className="text-xs text-muted-foreground">{s}×{s}</span>
                    <Button variant="outline" size="sm" onClick={() => download(s)}>Download</Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Add to &lt;head&gt;: {`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
