import { getSortedPostsData } from '@/lib/posts';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

// RSS lenta build paytida bir marta yasaladi
export const dynamic = 'force-static';

const XML_ENTITIES: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (char) => XML_ENTITIES[char]);
}

export function GET() {
  const items = getSortedPostsData().map((post) => {
    const url = `${SITE_URL}/posts/${post.slug}`;
    const categories = post.tags.map((tag) => `\n      <category>${escapeXml(tag.name)}</category>`).join('');

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>${categories}
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>uz</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${items.join('')}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
