import { NextRequest, NextResponse } from 'next/server';
import { validateTarget } from '@/lib/ssrf-guard';

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

    const first = await validateTarget(target);
    if (first.error || !first.url) {
      return NextResponse.json({ error: first.error || 'Invalid URL' }, { status: 400 });
    }

    const chain: { step: number; status: number; url: string }[] = [];
    let current = first.url.toString();
    const maxHops = 10;

    for (let i = 0; i < maxHops; i++) {
      const check = await validateTarget(current);
      if (check.error) {
        return NextResponse.json({ error: 'Redirect target not allowed', chain }, { status: 400 });
      }
      const response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'SEO-Toolkit/1.0 (Redirect Checker)' },
      });
      chain.push({ step: i + 1, status: response.status, url: current });

      const location = response.headers.get('location');
      if (response.status >= 300 && response.status < 400 && location) {
        current = new URL(location, current).toString();
        continue;
      }
      break;
    }

    return NextResponse.json({
      chain,
      finalStatus: chain.length ? chain[chain.length - 1].status : 0,
      finalUrl: current,
      hopCount: Math.max(0, chain.length - 1),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Check failed', message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
