import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { validateTarget } from '@/lib/ssrf-guard';

interface LinkResult { url: string; status: number | string; ok: boolean; }

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

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

    // Fetch the page HTML
    const pageRes = await fetch(first.url.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'SEO-Toolkit/1.0 (Broken Link Checker)' },
    });
    const html = await pageRes.text();
    const $ = cheerio.load(html);
    const baseUrl = first.url;

    // Extract all absolute/relative links and deduplicate
    const links = new Set<string>();
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
      try {
        const abs = new URL(href, baseUrl);
        if (!['http:', 'https:'].includes(abs.protocol)) return;
        links.add(abs.toString());
      } catch { /* skip malformed */ }
    });

    const allLinks = Array.from(links).slice(0, 50); // cap the count to avoid timeouts

    // Check concurrently (10 per batch)
    const results: LinkResult[] = [];
    for (let i = 0; i < allLinks.length; i += 10) {
      const batch = allLinks.slice(i, i + 10);
      const checked = await Promise.all(batch.map(async (link): Promise<LinkResult> => {
        try {
          // Apply the same SSRF guard to every link
          const guard = await validateTarget(link);
          if (guard.error) return { url: link, status: 'blocked', ok: false };
          const res = await fetch(link, {
            method: 'HEAD',
            redirect: 'follow',
            signal: controller.signal,
            headers: { 'User-Agent': 'SEO-Toolkit/1.0 (Broken Link Checker)' },
          });
          return { url: link, status: res.status, ok: res.status < 400 };
        } catch {
          return { url: link, status: 'error', ok: false };
        }
      }));
      results.push(...checked);
    }

    const broken = results.filter(r => !r.ok);
    const checked = results.length;
    return NextResponse.json({
      url: first.url.toString(),
      totalLinks: links.size,
      checked,
      brokenCount: broken.length,
      broken,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Scan failed', message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
