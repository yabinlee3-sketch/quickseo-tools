export interface OgPreview {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  type: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  allOg: { property: string; content: string }[];
  allTwitter: { name: string; content: string }[];
  previews: {
    facebook: { title: string; description: string; image: string; url: string; siteName: string };
    twitter: { title: string; description: string; image: string; card: string };
    linkedin: { title: string; description: string; image: string };
    googleDiscord: { title: string; description: string; image: string };
  };
  missingRequired: string[];
}

function getMeta(html: string, attr: string, value: string): string {
  const regex1 = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']*)["']`,
    'i'
  );
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${value}["']`,
    'i'
  );
  const m = html.match(regex1) || html.match(regex2);
  return m ? m[1].trim() : '';
}

export function analyzeOgTags(html: string): OgPreview {
  const title = getMeta(html, 'property', 'og:title') || getMeta(html, 'name', 'og:title');
  const description = getMeta(html, 'property', 'og:description') || getMeta(html, 'name', 'og:description');
  const image = getMeta(html, 'property', 'og:image') || getMeta(html, 'name', 'og:image');
  const url = getMeta(html, 'property', 'og:url');
  const siteName = getMeta(html, 'property', 'og:site_name');
  const type = getMeta(html, 'property', 'og:type');

  const twitterCard = getMeta(html, 'name', 'twitter:card');
  const twitterTitle = getMeta(html, 'name', 'twitter:title');
  const twitterDescription = getMeta(html, 'name', 'twitter:description');
  const twitterImage = getMeta(html, 'name', 'twitter:image');

  const missingRequired: string[] = [];
  if (!title) missingRequired.push('og:title');
  if (!description) missingRequired.push('og:description');
  if (!image) missingRequired.push('og:image');
  if (!url) missingRequired.push('og:url');

  // Collect all OG tags
  const ogRegex = /<meta[^>]+property=["'](og:\w+)["'][^>]+content=["']([^"']*)["']/gi;
  const allOg: { property: string; content: string }[] = [];
  let m;
  while ((m = ogRegex.exec(html)) !== null) {
    allOg.push({ property: m[1], content: m[2] });
  }

  const twRegex = /<meta[^>]+name=["'](twitter:\w+)["'][^>]+content=["']([^"']*)["']/gi;
  const allTwitter: { name: string; content: string }[] = [];
  let tm;
  while ((tm = twRegex.exec(html)) !== null) {
    allTwitter.push({ name: tm[1], content: tm[2] });
  }

  return {
    title,
    description,
    image,
    url,
    siteName,
    type,
    twitterCard,
    twitterTitle: twitterTitle || title,
    twitterDescription: twitterDescription || description,
    twitterImage: twitterImage || image,
    allOg,
    allTwitter,
    missingRequired,
    previews: {
      facebook: { title, description, image, url, siteName },
      twitter: {
        title: twitterTitle || title,
        description: twitterDescription || description,
        image: twitterImage || image,
        card: twitterCard || 'summary',
      },
      linkedin: { title, description, image },
      googleDiscord: { title, description, image },
    },
  };
}
