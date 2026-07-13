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
  const regex = /<[^>]+itemscope[^>]*itemtype=["']https?:\/\/schema\.org\/(\w+)["'][^>]*>([\s\S]*?)<\/\1>/gi;
  // Simpler approach: find itemscope containers
  const containerRegex = /<(\w+)[^>]*\sitemscope[^>]*\sitemtype=["']https?:\/\/schema\.org\/(\w+)["'][^>]*>/gi;
  let match;

  while ((match = containerRegex.exec(html)) !== null) {
    const tagName = match[1];
    const type = match[2];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Find matching closing tag
    const startPos = match.index;
    const fullMatch = match[0];
    const afterTagStart = startPos + fullMatch.length;

    // Find itemprop attributes within this scope (naive but functional)
    const props: Record<string, string> = {};
    const propRegex = /itemprop=["'](\w+)["'][^>]*content=["']([^"']*)["']/gi;
    const propRegex2 = /itemprop=["'](\w+)["'][^>]*>([^<]*)</gi;

    // Extract properties with content attribute
    let pm;
    while ((pm = propRegex.exec(html)) !== null) {
      if (pm.index > startPos) {
        props[pm[1]] = pm[2];
      }
    }

    // Extract properties with inner text
    while ((pm = propRegex2.exec(html)) !== null) {
      if (pm.index > startPos) {
        props[pm[1]] = pm[2].trim();
      }
    }

    blocks.push({
      format: 'microdata',
      type,
      data: { '@type': type, ...props } as Record<string, unknown>,
      raw: html.slice(startPos, startPos + 500),
      errors,
      warnings,
    });

    // Only capture first few microdata blocks to avoid overload
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
