export interface SSLResult {
  valid: boolean;
  url: string;
  hostname: string;
  error?: string;
  details: {
    protocol: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    subjectCN: string;
    subjectAltNames: string[];
    fingerprint: string;
    serialNumber: string;
    certTransparency: boolean;
  } | null;
  issues: string[];
  warnings: string[];
}

export function analyzeSSLUrl(url: string): SSLResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      issues.push('URL does not use HTTPS');
      return {
        valid: false,
        url,
        hostname: parsed.hostname,
        details: null,
        issues,
        warnings,
      };
    }

    // Browser-side SSL check: we can verify the connection by attempting to load the page
    // For detailed cert info, we'll make an API call. Here we do a basic check.
    if (!parsed.hostname) {
      return {
        valid: false,
        url,
        hostname: '',
        details: null,
        issues: ['Invalid hostname'],
        warnings,
      };
    }

    // Check for common SSL warning signs
    if (parsed.hostname.startsWith('192.168.') ||
        parsed.hostname.startsWith('10.') ||
        parsed.hostname.startsWith('172.')) {
      warnings.push('Private IP detected - SSL certificate may be self-signed');
    }

    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      warnings.push('Localhost detected - certificate validation limited');
    }

    // We need server-side for actual SSL cert inspection
    // Return partial result, the UI can call the backend for details
    return {
      valid: true,
      url,
      hostname: parsed.hostname,
      details: null, // Will be populated by API
      issues,
      warnings,
    };
  } catch {
    return {
      valid: false,
      url,
      hostname: '',
      details: null,
      issues: ['Invalid URL format'],
      warnings,
    };
  }
}

// Server-side SSL check via API
export async function checkSSL(url: string): Promise<SSLResult> {
  try {
    const res = await fetch('/api/ssl-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  } catch (e) {
    return {
      valid: false,
      url,
      hostname: '',
      error: e instanceof Error ? e.message : 'SSL check failed',
      details: null,
      issues: ['SSL check request failed'],
      warnings: [],
    };
  }
}
