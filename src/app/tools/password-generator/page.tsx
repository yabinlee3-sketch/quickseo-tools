'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Key, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useDigits: boolean, useSymbols: boolean): string {
  let charset = '';
  if (useUpper) charset += UPPER;
  if (useLower) charset += LOWER;
  if (useDigits) charset += DIGITS;
  if (useSymbols) charset += SYMBOLS;
  if (!charset) charset = LOWER;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }

  // Ensure at least one of each selected type
  const selected: { char: string; pool: string }[] = [];
  if (useUpper) selected.push({ char: '', pool: UPPER });
  if (useLower) selected.push({ char: '', pool: LOWER });
  if (useDigits) selected.push({ char: '', pool: DIGITS });
  if (useSymbols) selected.push({ char: '', pool: SYMBOLS });

  if (selected.length > 0 && length >= selected.length) {
    const arr = result.split('');
    const positions = new Set<number>();
    while (positions.size < selected.length) {
      positions.add(Math.floor(Math.random() * length));
    }
    const posArr = [...positions];
    for (let i = 0; i < selected.length; i++) {
      const idx = array[posArr[i]] % selected[i].pool.length;
      arr[posArr[i]] = selected[i].pool[idx];
    }
    result = arr.join('');
  }

  return result;
}

function estimateStrength(password: string): { label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score <= 4) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
  if (score <= 5) return { label: 'Strong', color: 'bg-green-500', width: '75%' };
  return { label: 'Very Strong', color: 'bg-green-600', width: '100%' };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword(
      Math.min(Math.max(length, 4), 128),
      useUpper,
      useLower,
      useDigits,
      useSymbols
    );
    setPassword(pwd);
  }, [length, useUpper, useLower, useDigits, useSymbols]);

  async function copyPassword() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const strength = password ? estimateStrength(password) : null;

  const toggle = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center h-16 px-4 gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Key className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Password Generator</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Password Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="pwd-length">Password Length (4-128): {length}</Label>
              <input
                id="pwd-length"
                type="range"
                min={4}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
              />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {toggle('Uppercase (A-Z)', useUpper, setUseUpper)}
              {toggle('Lowercase (a-z)', useLower, setUseLower)}
              {toggle('Digits (0-9)', useDigits, setUseDigits)}
              {toggle('Symbols (!@#$...)', useSymbols, setUseSymbols)}
            </div>

            <Button onClick={handleGenerate} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Generate Password
            </Button>
          </CardContent>
        </Card>

        {password && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Password</CardTitle>
                <Button variant="outline" size="sm" onClick={copyPassword}>
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
            <CardContent className="space-y-3">
              <div className="bg-zinc-900 text-green-400 font-mono text-lg p-4 rounded-lg break-all text-center tracking-wider">
                {password}
              </div>
              {strength && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Strength</span>
                    <span className="font-medium">{strength.label}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: strength.width }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
