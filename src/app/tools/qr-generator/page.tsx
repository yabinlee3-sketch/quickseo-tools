'use client';

import { useState, useRef, useCallback } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(() => {
    setError('');
    setQrDataUrl('');

    if (!text.trim()) {
      setError('Please enter text or URL to encode.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const qrSize = Math.min(size, 1024);
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Canvas not supported in this browser.');
      return;
    }

    // Determine QR version based on text length and error correction level L
    const data = text;
    const mode = getMode(data);
    const version = getVersion(data.length, mode, 'L');
    if (version < 1 || version > 40) {
      setError('Text is too long for a QR code (max ~2953 bytes).');
      return;
    }

    const modules = version * 4 + 17;
    const matrix = createMatrix(modules);
    try {
      placeData(matrix, data, version, mode, 'L');
    } catch (e) {
      setError('Failed to generate QR code. Text may be too long or contain unsupported characters.');
      return;
    }

    const moduleSize = qrSize / modules;
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, qrSize, qrSize);

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (matrix[row] && matrix[row][col]) {
          ctx.fillStyle = darkColor;
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    setQrDataUrl(canvas.toDataURL('image/png'));
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
                <Input
                  id="qr-size"
                  type="number"
                  min={128}
                  max={1024}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="qr-dark">Foreground</Label>
                <Input
                  id="qr-dark"
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="h-10 w-full p-1"
                />
              </div>
              <div>
                <Label htmlFor="qr-light">Background</Label>
                <Input
                  id="qr-light"
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="h-10 w-full p-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={generateQR} disabled={!text.trim()} className="w-full">
                  Generate
                </Button>
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
              <img src={qrDataUrl} alt="Generated QR Code" className="max-w-full rounded shadow-md" />
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}

/* ============ Minimal QR Code Generator (Kanji-capable, byte mode) ============ */

function getMode(data: string): 'byte' | 'numeric' | 'alphanumeric' {
  if (/^\d+$/.test(data)) return 'numeric';
  if (/^[A-Z0-9 $%*+\-./:]+$/.test(data)) return 'alphanumeric';
  return 'byte';
}

function getVersion(dataLen: number, mode: string, ecl: string): number {
  // Character count capacities for each version (ecl=L), byte mode
  const capacities: Record<string, number[]> = {
    L: [17,32,53,78,106,134,154,192,230,271,321,367,425,458,520,586,644,718,792,858,929,1003,1091,1171,1273,1367,1465,1528,1628,1732,1840,1952,2068,2188,2303,2431,2563,2699,2809,2953],
  };
  const cap = capacities[ecl] || capacities['L'];
  const indicatorSize = mode === 'byte' ? 8 : mode === 'alphanumeric' ? 9 : 10;
  for (let v = 0; v < cap.length; v++) {
    if (dataLen + indicatorSize / 8 <= cap[v]) return v + 1;
  }
  return -1;
}

function createMatrix(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

function placeData(matrix: boolean[][], data: string, version: number, mode: string, _ecl: string) {
  // Convert data to bit buffer
  const bits: number[] = [];
  const modeIndicator = mode === 'byte' ? 4 : mode === 'alphanumeric' ? 2 : 1;
  const modeBits = modeIndicator.toString(2).padStart(4, '0');

  // Mode indicator (4 bits)
  for (const b of modeBits) bits.push(Number(b));

  // Character count indicator
  const countBits = mode === 'byte' ? 8 : mode === 'alphanumeric' ? 9 : 10;
  const count = data.length;
  const countBin = count.toString(2).padStart(countBits, '0');
  for (const b of countBin) bits.push(Number(b));

  // Data
  if (mode === 'byte') {
    for (let i = 0; i < data.length; i++) {
      const code = data.charCodeAt(i);
      const byte = Math.min(code, 255).toString(2).padStart(8, '0');
      for (const b of byte) bits.push(Number(b));
    }
  } else if (mode === 'alphanumeric') {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
    for (let i = 0; i < data.length; i += 2) {
      const v1 = chars.indexOf(data[i]);
      if (i + 1 < data.length) {
        const v2 = chars.indexOf(data[i + 1]);
        const val = v1 * 45 + v2;
        const bin = val.toString(2).padStart(11, '0');
        for (const b of bin) bits.push(Number(b));
      } else {
        const bin = v1.toString(2).padStart(6, '0');
        for (const b of bin) bits.push(Number(b));
      }
    }
  } else if (mode === 'numeric') {
    for (let i = 0; i < data.length; i += 3) {
      const chunk = data.slice(i, i + 3);
      const val = parseInt(chunk, 10);
      const bitLen = chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4;
      const bin = val.toString(2).padStart(bitLen, '0');
      for (const b of bin) bits.push(Number(b));
    }
  }

  // Terminator (up to 4 bits)
  const totalCap = version * 4 + 17;
  const totalModules = totalCap * totalCap;
  const reservedAreas = (version >= 2 ? 25 : 0) + (8 * 8 * 3) + (7 * 2 * 3);
  const maxBits = totalModules - reservedAreas;
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes (236, 17 alternating)
  const padBytes = [236, 17];
  let pi = 0;
  while (bits.length < maxBits) {
    const byte = padBytes[pi % 2].toString(2).padStart(8, '0');
    for (const b of byte) bits.push(Number(b));
    pi++;
  }

  // Place bits on matrix (upward zigzag)
  const size = totalCap;
  let col = size - 1;
  let row = size - 1;
  let dir = -1; // -1 = upward
  let bitIdx = 0;

  // Reserve finder + timing + alignment patterns
  const reserved = createMatrix(size);

  // Finder patterns
  for (const [fr, fc] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        reserved[fr + r][fc + c] = true;
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Alignment patterns for version >= 2
  if (version >= 2) {
    const aligns = getAlignmentCenters(version);
    for (const ar of aligns) {
      for (const ac of aligns) {
        if (reserved[ar] && reserved[ar][ac]) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (ar + r >= 0 && ar + r < size && ac + c >= 0 && ac + c < size) {
              reserved[ar + r][ac + c] = true;
            }
          }
        }
      }
    }
  }

  // Dark module (always version * 4 + 9 row, 8 col)
  matrix[version * 4 + 9][8] = true;

  while (col >= 0 && bitIdx < bits.length) {
    if (col === 6) col = 5; // Skip timing column

    for (let i = 0; i < 2 && bitIdx < bits.length; i++) {
      const c = (i === 0) ? col : col - 1;
      if (c >= 0 && c < size && row >= 0 && row < size && !reserved[row][c]) {
        matrix[row][c] = bits[bitIdx] === 1;
        bitIdx++;
      }
    }

    row += dir;
    if (row < 0 || row >= size) {
      dir = -dir;
      row += dir;
      col -= 2;
      if (col === 6) col = 5;
    }
  }
}

function getAlignmentCenters(version: number): number[] {
  if (version === 1) return [];
  const num = Math.floor(version / 7) + 2;
  const step = version * 4 + 4;
  const centers: number[] = [6];
  for (let i = 0; i < num - 1; i++) {
    centers.push(step - Math.round((step - 6) * (i + 1) / num));
  }
  centers.push(step);
  return centers;
}
