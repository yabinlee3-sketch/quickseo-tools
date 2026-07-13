import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SEO-Toolkit/1.0 (SEO Analysis Bot)',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const html = await response.text();
    return NextResponse.json({
      html,
      status: response.status,
      url: response.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Fetch failed', message }, { status: 500 });
  }
}
