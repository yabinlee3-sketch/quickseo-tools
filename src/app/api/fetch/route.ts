import { NextRequest, NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 3_000_000;
const MAX_REDIRECTS = 5;

/** 判断是否为私有/保留 IP —— 阻止借本站服务器探测内网(SSRF) */
function isBlockedIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // 链路本地,云元数据 169.254.169.254
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // 组播/保留
    return false;
  }
  if (v === 6) {
    const s = ip.toLowerCase();
    if (s === '::1' || s === '::') return true;
    if (s.startsWith('fc') || s.startsWith('fd')) return true; // 唯一本地
    if (/^fe[89ab]/.test(s)) return true; // 链路本地
    if (s.startsWith('::ffff:')) return isBlockedIp(s.slice(7)); // IPv4 映射
    return false;
  }
  return true; // 无法识别一律拒绝
}

/** 校验协议与目标 IP,返回规范化 URL 或错误 */
async function validateTarget(rawUrl: string): Promise<{ url?: URL; error?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { error: 'Invalid URL' };
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { error: 'Only HTTP/HTTPS URLs allowed' };
  }
  const host = parsed.hostname;
  if (isIP(host)) {
    if (isBlockedIp(host)) return { error: 'URL target not allowed' };
  } else {
    let records: { address: string }[];
    try {
      records = await lookup(host, { all: true });
    } catch {
      return { error: 'Could not resolve hostname' };
    }
    if (records.length === 0 || records.some((r) => isBlockedIp(r.address))) {
      return { error: 'URL target not allowed' };
    }
  }
  return { url: parsed };
}

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const first = await validateTarget(url);
    if (first.error || !first.url) {
      return NextResponse.json({ error: first.error || 'Invalid URL' }, { status: 400 });
    }

    // 手动跟随跳转,每一跳都重新校验,防止经 302 跳到内网
    let current = first.url.toString();
    let response!: Response;
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      response = await fetch(current, {
        signal: controller.signal,
        headers: { 'User-Agent': 'SEO-Toolkit/1.0 (SEO Analysis Bot)' },
        redirect: 'manual',
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        const next = await validateTarget(new URL(location, current).toString());
        if (next.error || !next.url) {
          return NextResponse.json({ error: 'Redirect target not allowed' }, { status: 400 });
        }
        current = next.url.toString();
        continue;
      }
      break;
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Page too large (max 3MB)' }, { status: 413 });
    }
    const html = (await response.text()).slice(0, MAX_BYTES);
    return NextResponse.json({ html, status: response.status, url: current });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Fetch failed', message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
