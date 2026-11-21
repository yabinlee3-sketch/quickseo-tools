import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/** 判断是否为私有/保留 IP —— 阻止借本站服务器探测内网(SSRF) */
export function isBlockedIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (v === 6) {
    const s = ip.toLowerCase();
    if (s === '::1' || s === '::') return true;
    if (s.startsWith('fc') || s.startsWith('fd')) return true;
    if (/^fe[89ab]/.test(s)) return true;
    if (s.startsWith('::ffff:')) return isBlockedIp(s.slice(7));
    return false;
  }
  return true;
}

/** 校验协议与目标 IP，返回规范化 URL 或错误 */
export async function validateTarget(rawUrl: string): Promise<{ url?: URL; error?: string }> {
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
