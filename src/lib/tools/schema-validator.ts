export interface SchemaBlock {
  format: 'json-ld' | 'microdata';
  type: string;
  data: Record<string, unknown>;
  raw: string;
  errors: string[];
  warnings: string[];
}

export interface SchemaResult {
  blocks: SchemaBlock[];
  totalCount: number;
  types: string[];
  hasJsonLd: boolean;
  hasMicrodata: boolean;
  issues: string[];
  warnings: string[];
}

// Required properties for common Schema types (simplified)
const requiredProps: Record<string, string[]> = {
  Article: ['headline', 'datePublished'],
  NewsArticle: ['headline', 'datePublished'],
  BlogPosting: ['headline', 'datePublished'],
  Product: ['name'],
  Organization: ['name'],
  LocalBusiness: ['name', 'address'],
  Restaurant: ['name', 'address'],
  Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
  Event: ['name', 'startDate'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  BreadcrumbList: ['itemListElement'],
  WebSite: ['name', 'url'],
  Person: ['name'],
  Review: ['author', 'reviewRating'],
  AggregateRating: ['ratingValue', 'reviewCount'],
  VideoObject: ['name', 'thumbnailUrl', 'uploadDate'],
  ImageObject: ['contentUrl'],
};

function validateRequired(type: string, data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const required = requiredProps[type];
  if (!required) return errors;

  for (const prop of required) {
    if (!(prop in data) || data[prop] === undefined || data[prop] === null || data[prop] === '') {
      errors.push(`Missing required property: ${prop}`);
    }
  }
  return errors;
}

function extractJsonLd(html: string): SchemaBlock[] {
  const blocks: SchemaBlock[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        const type = item['@type'] || 'Thing';
        const typeErrors = validateRequired(type, item);

        if (!item['@context'] || !String(item['@context']).includes('schema.org')) {
          warnings.push('Missing or non-standard @context');
        }

        blocks.push({
          format: 'json-ld',
          type: Array.isArray(type) ? type.join(', ') : type,
          data: item,
          raw,
          errors: [...typeErrors, ...errors],
          warnings,
        });
      }
    } catch {
      errors.push('Invalid JSON-LD: failed to parse');
      blocks.push({
        format: 'json-ld',
        type: 'Unknown',
        data: {},
        raw,
        errors,
        warnings,
      });
    }
  }

  return blocks;
}

function extractMicrodata(html: string): SchemaBlock[] {
  const blocks: SchemaBlock[] = [];

  // 匹配带 itemscope 且 itemtype 指向 schema.org 的起始标签。
  // 属性顺序无关（itemtype 可在 itemscope 前），单/双引号皆可。
  const containerRegex = /<(\w+)\b(?=[^>]*\bitemscope(?:\s|=|>))(?=[^>]*\bitemtype\s*=\s*["']https?:\/\/schema\.org\/(\w+)["'])[^>]*>/gi;
  const containers = Array.from(html.matchAll(containerRegex));

  for (const container of containers) {
    const tagName = container[1].toLowerCase();
    const type = container[2];
    const startPos = container.index!;
    const contentStart = startPos + container[0].length;

    // 尽力找到配对的结束标签，限定本 scope 的搜索范围，避免吞掉后续 block 的属性
    let contentEnd = html.length;
    const closeRe = new RegExp(`</${tagName}\\s*>`, 'gi');
    closeRe.lastIndex = contentStart;
    const close = closeRe.exec(html);
    if (close) contentEnd = close.index;

    // void 元素（如 <meta itemscope>）没有结束标签，限制在合理长度内
    const scope = html.slice(contentStart, Math.min(contentEnd, contentStart + 20000));
    const props: Record<string, string> = {};

    // itemprop + content 属性（如 <meta itemprop="name" content="X">）
    const propContentRe = /\bitemprop\s*=\s*["']([\w:.-]+)["'][^>]*?\bcontent\s*=\s*["']([^"']*)["']/gi;
    let pm: RegExpExecArray | null;
    while ((pm = propContentRe.exec(scope)) !== null) props[pm[1]] = pm[2];

    // itemprop + 标签内文本（如 <span itemprop="name">Widget</span>）
    const propTextRe = /\bitemprop\s*=\s*["']([\w:.-]+)["'][^>]*>([^<]*)</gi;
    while ((pm = propTextRe.exec(scope)) !== null) {
      const val = pm[2].trim();
      if (val && !(pm[1] in props)) props[pm[1]] = val;
    }

    blocks.push({
      format: 'microdata',
      type,
      data: { '@type': type, ...props } as Record<string, unknown>,
      raw: html.slice(startPos, Math.min(contentEnd, startPos + 500)),
      errors: [],
      warnings: [],
    });

    if (blocks.filter(b => b.format === 'microdata').length >= 5) break;
  }

  return blocks;
}

export function analyzeSchema(html: string): SchemaResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Extract JSON-LD
  const jsonLdBlocks = extractJsonLd(html);

  // Extract Microdata
  const microdataBlocks = extractMicrodata(html);

  const allBlocks = [...jsonLdBlocks, ...microdataBlocks];

  if (allBlocks.length === 0) {
    issues.push('No structured data found. Add JSON-LD or Microdata to help search engines understand your content.');
  }

  const types = [...new Set(allBlocks.map(b => b.type))];

  // Check for high-value missing types
  if (types.length > 0) {
    if (!types.some(t => t === 'BreadcrumbList')) {
      warnings.push('Consider adding BreadcrumbList schema for breadcrumb navigation');
    }
  }

  return {
    blocks: allBlocks,
    totalCount: allBlocks.length,
    types,
    hasJsonLd: jsonLdBlocks.length > 0,
    hasMicrodata: microdataBlocks.length > 0,
    issues,
    warnings,
  };
}
