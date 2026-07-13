export interface SitemapResult {
  exists: boolean;
  url: string;
  content: string;
  status: number;
  error?: string;
  isXml: boolean;
  urlCount: number;
  urls: string[];
  hasLastmod: boolean;
  hasChangefreq: boolean;
  hasPriority: boolean;
  issues: string[];
  warnings: string[];
}

export function analyzeSitemap(content: string, status: number): SitemapResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (status !== 200) {
    issues.push(`Sitemap returned status ${status}`);
    return {
      exists: false,
      url: '',
      content,
      status,
      isXml: false,
      urlCount: 0,
      urls: [],
      hasLastmod: false,
      hasChangefreq: false,
      hasPriority: false,
      issues,
      warnings,
    };
  }

  const isXml = content.trim().startsWith('<?xml') || content.trim().startsWith('<urlset') ||
    content.trim().startsWith('<sitemapindex');

  if (!isXml) {
    issues.push('Response is not valid XML. Sitemap should be XML format.');
    return {
      exists: true,
      url: '',
      content,
      status,
      isXml: false,
      urlCount: 0,
      urls: [],
      hasLastmod: false,
      hasChangefreq: false,
      hasPriority: false,
      issues,
      warnings,
    };
  }

  // Extract URLs
  const urlRegex = /<loc>([^<]+)<\/loc>/gi;
  const urls: string[] = [];
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    urls.push(m[1].trim());
  }

  const hasLastmod = /<lastmod>/i.test(content);
  const hasChangefreq = /<changefreq>/i.test(content);
  const hasPriority = /<priority>/i.test(content);

  if (urls.length === 0) {
    warnings.push('Sitemap contains no URLs');
  }

  if (!hasLastmod) {
    warnings.push('Missing <lastmod> tags. Helps search engines know when pages were updated.');
  }

  if (!hasChangefreq) {
    warnings.push('Missing <changefreq> tags. Helps indicate update frequency to crawlers.');
  }

  if (!hasPriority) {
    warnings.push('Missing <priority> tags. Helps indicate relative importance of pages.');
  }

  if (urls.length > 50000) {
    issues.push(`Sitemap exceeds 50,000 URL limit (${urls.length} URLs). Split into multiple sitemaps.`);
  }

  if (content.length > 50 * 1024 * 1024) {
    issues.push('Sitemap exceeds 50MB size limit (uncompressed).');
  }

  // Check if it's a sitemap index
  if (content.includes('<sitemapindex')) {
    warnings.push('This is a Sitemap Index file. It references other sitemaps.');
  }

  return {
    exists: true,
    url: '',
    content,
    status,
    isXml,
    urlCount: urls.length,
    urls: urls.slice(0, 200), // Cap display
    hasLastmod,
    hasChangefreq,
    hasPriority,
    issues,
    warnings,
  };
}
