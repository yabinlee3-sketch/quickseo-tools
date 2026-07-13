export interface MetaResult {
  title: { content: string; length: number; status: 'good' | 'warning' | 'bad' };
  description: { content: string; length: number; status: 'good' | 'warning' | 'bad' };
  keywords: { content: string; present: boolean };
  robots: { content: string; present: boolean };
  canonical: { content: string; present: boolean };
  viewport: { content: string; present: boolean };
  charset: { content: string; present: boolean };
  ogTags: { property: string; content: string }[];
  twitterTags: { name: string; content: string }[];
  h1Count: number;
  h2Count: number;
  h1Texts: string[];
  issues: string[];
  warnings: string[];
}

function evaluateTitle(content: string): MetaResult['title'] {
  const length = content.length;
  const status = length < 30 ? 'warning' : length > 60 ? 'warning' : 'good';
  return { content, length, status };
}

function evaluateDescription(content: string): MetaResult['description'] {
  const length = content.length;
  const status = length < 70 ? 'warning' : length > 160 ? 'warning' : 'good';
  return { content, length, status };
}

export function analyzeMetaTags(html: string): MetaResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleContent = titleMatch ? titleMatch[1].trim() : '';
  const title = evaluateTitle(titleContent);
  if (!titleContent) issues.push('Missing <title> tag');
  else if (title.status === 'warning') {
    warnings.push(`Title length is ${title.length} chars (recommended: 30-60)`);
  }

  // Meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const descContent = descMatch ? descMatch[1].trim() : '';
  const description = evaluateDescription(descContent);
  if (!descContent) issues.push('Missing meta description');
  else if (description.status === 'warning') {
    warnings.push(`Description length is ${description.length} chars (recommended: 70-160)`);
  }

  // Keywords
  const kwMatch = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']keywords["']/i);
  const keywords = { content: kwMatch ? kwMatch[1].trim() : '', present: !!kwMatch };

  // Robots
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i);
  const robots = { content: robotsMatch ? robotsMatch[1].trim() : '', present: !!robotsMatch };

  // Canonical
  const canMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const canonical = { content: canMatch ? canMatch[1].trim() : '', present: !!canMatch };
  if (!canMatch) warnings.push('Missing canonical URL');

  // Viewport
  const vpMatch = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']viewport["']/i);
  const viewport = { content: vpMatch ? vpMatch[1].trim() : '', present: !!vpMatch };
  if (!vpMatch) issues.push('Missing viewport meta tag (responsive design)');

  // Charset
  const charsetMatch = html.match(/<meta[^>]+charset=["']([^"']*)["']/i);
  const charset = { content: charsetMatch ? charsetMatch[1].trim() : '', present: !!charsetMatch };
  if (!charsetMatch) issues.push('Missing charset declaration');

  // OG tags
  const ogRegex = /<meta[^>]+property=["']og:(\w+)["'][^>]+content=["']([^"']*)["']/gi;
  const ogTags: { property: string; content: string }[] = [];
  let ogMatch;
  while ((ogMatch = ogRegex.exec(html)) !== null) {
    ogTags.push({ property: `og:${ogMatch[1]}`, content: ogMatch[2] });
  }
  const requiredOg = ['og:title', 'og:description', 'og:image', 'og:url'];
  for (const prop of requiredOg) {
    if (!ogTags.find(t => t.property === prop)) {
      warnings.push(`Missing ${prop} Open Graph tag`);
    }
  }

  // Twitter cards
  const twRegex = /<meta[^>]+name=["']twitter:(\w+)["'][^>]+content=["']([^"']*)["']/gi;
  const twitterTags: { name: string; content: string }[] = [];
  let twMatch;
  while ((twMatch = twRegex.exec(html)) !== null) {
    twitterTags.push({ name: `twitter:${twMatch[1]}`, content: twMatch[2] });
  }
  if (!twitterTags.find(t => t.name === 'twitter:card')) {
    warnings.push('Missing Twitter Card tag');
  }

  // Headings
  const h1Regex = /<h1[^>]*>([^<]*)<\/h1>/gi;
  const h1Texts: string[] = [];
  let h1m;
  while ((h1m = h1Regex.exec(html)) !== null) {
    h1Texts.push(h1m[1].trim());
  }
  const h1Count = h1Texts.length;
  if (h1Count === 0) issues.push('Missing H1 heading');
  else if (h1Count > 1) warnings.push(`Multiple H1 tags found (${h1Count}). Use only one.`);

  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;

  return {
    title,
    description,
    keywords,
    robots,
    canonical,
    viewport,
    charset,
    ogTags,
    twitterTags,
    h1Count,
    h2Count,
    h1Texts,
    issues,
    warnings,
  };
}
