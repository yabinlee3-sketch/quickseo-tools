export interface RobotsResult {
  exists: boolean;
  url: string;
  content: string;
  status: number;
  error?: string;
  sitemaps: string[];
  allowedPaths: { path: string; userAgents: string[] }[];
  disallowedPaths: { path: string; userAgents: string[] }[];
  userAgents: string[];
  hasSitemap: boolean;
  crawlDelay: string | null;
  issues: string[];
  warnings: string[];
}

export function analyzeRobotsTxt(content: string, status: number): RobotsResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (status !== 200) {
    if (status === 404) {
      warnings.push('robots.txt not found (404). Search engines will crawl all pages.');
    } else {
      issues.push(`robots.txt returned status ${status}`);
    }
    return {
      exists: false,
      url: '',
      content,
      status,
      sitemaps: [],
      allowedPaths: [],
      disallowedPaths: [],
      userAgents: [],
      hasSitemap: false,
      crawlDelay: null,
      issues,
      warnings,
    };
  }

  const lines = content.split('\n').map(l => l.trim());
  const sitemaps: string[] = [];
  const userAgents: string[] = [];
  const allowedPaths: { path: string; userAgents: string[] }[] = [];
  const disallowedPaths: { path: string; userAgents: string[] }[] = [];
  let currentAgents: string[] = ['*'];
  let crawlDelay: string | null = null;

  for (const line of lines) {
    const l = line.toLowerCase();
    if (l.startsWith('user-agent:')) {
      const ua = line.substring(11).trim();
      if (ua && !userAgents.includes(ua)) {
        userAgents.push(ua);
      }
      if (ua !== '*') {
        currentAgents = [ua];
      }
    } else if (l.startsWith('disallow:')) {
      const path = line.substring(9).trim();
      if (path) {
        disallowedPaths.push({ path, userAgents: [...currentAgents] });
      }
    } else if (l.startsWith('allow:')) {
      const path = line.substring(6).trim();
      if (path) {
        allowedPaths.push({ path, userAgents: [...currentAgents] });
      }
    } else if (l.startsWith('sitemap:')) {
      const sm = line.substring(8).trim();
      if (sm) sitemaps.push(sm);
    } else if (l.startsWith('crawl-delay:')) {
      crawlDelay = line.substring(12).trim();
    }
  }

  if (userAgents.length === 0) {
    warnings.push('No User-agent directive found');
  }

  if (sitemaps.length === 0) {
    warnings.push('No Sitemap declaration in robots.txt');
  }

  if (disallowedPaths.length === 0) {
    warnings.push('No Disallow rules. All pages are crawlable (default).');
  }

  // Check for common mistakes
  const hasFullDisallow = disallowedPaths.some(d => d.path === '/');
  if (hasFullDisallow) {
    issues.push('robots.txt disallows ALL pages (Disallow: /). Search engines cannot index this site.');
  }

  if (content.trim().length === 0) {
    warnings.push('robots.txt is empty');
  }

  return {
    exists: true,
    url: '',
    content,
    status,
    sitemaps,
    allowedPaths,
    disallowedPaths,
    userAgents,
    hasSitemap: sitemaps.length > 0,
    crawlDelay,
    issues,
    warnings,
  };
}
