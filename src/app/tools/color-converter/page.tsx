'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  let h = match[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function parseRgb(str: string): { r: number; g: number; b: number } | null {
  const match = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return null;
  return { r: +match[1], g: +match[2], b: +match[3] };
}

function parseHsl(str: string): { h: number; s: number; l: number } | null {
  const match = str.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i);
  if (!match) return null;
  return { h: +match[1], s: +match[2], l: +match[3] };
}

function computeFrom(input: string): ColorValues | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // HEX
  const hexResult = hexToRgb(trimmed);
  if (hexResult && (trimmed.startsWith('#') || /^[0-9a-f]{3,6}$/i.test(trimmed))) {
    const { r, g, b } = hexResult;
    const hsl = rgbToHsl(r, g, b);
    return {
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    };
  }

  // RGB
  const rgbResult = parseRgb(trimmed);
  if (rgbResult) {
    const { r, g, b } = rgbResult;
    if (r > 255 || g > 255 || b > 255) return null;
    const hsl = rgbToHsl(r, g, b);
    return {
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    };
  }

  // HSL
  const hslResult = parseHsl(trimmed);
  if (hslResult) {
    const { h, s, l } = hslResult;
    if (h > 360 || s > 100 || l > 100) return null;
    const rgb = hslToRgb(h, s, l);
    return {
      hex: `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
    };
  }

  return null;
}

export default function ColorConverterPage() {
  const [input, setInput] = useState('#3b82f6');
  const [color, setColor] = useState<ColorValues | null>(() => computeFrom('#3b82f6'));
  const [copiedField, setCopiedField] = useState('');

  const handleInput = useCallback((val: string) => {
    setInput(val);
    const result = computeFrom(val);
    setColor(result);
  }, []);

  async function copyValue(value: string, field: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Palette className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Color Picker & Converter</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enter a Color Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="color-input" className="sr-only">Color Value</Label>
                <Input
                  id="color-input"
                  placeholder="e.g. #3b82f6, rgb(59,130,246), hsl(217,91%,60%)"
                  value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Supported: HEX (#fff, #3b82f6), RGB (rgb(59,130,246)), HSL (hsl(217,91%,60%))
                </p>
              </div>
              {color && (
                <div
                  className="w-16 h-16 rounded-lg border shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {color && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'HEX', value: color.hex },
              { label: 'RGB', value: color.rgb },
              { label: 'HSL', value: color.hsl },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-sm break-all">{item.value}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyValue(item.value, item.label)}
                      className="flex-shrink-0"
                    >
                      {copiedField === item.label ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {input.trim() && !color && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="py-4 text-yellow-700 text-sm">
              Unable to parse this color. Please use HEX, RGB, or HSL format.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
