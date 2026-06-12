import { BASE_URL } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrl(locale: string, path: string): string {
  return locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  const siteTitle =
    locale === 'zh-TW' ? '奕道實業 N.S.-LIN' : 'N.S.-LIN Industrial';
  const siteDescription =
    locale === 'zh-TW'
      ? '氣嘴閥製造專業知識與產業趨勢'
      : 'Tire valve manufacturing expertise and industry insights';

  const channelLink = buildUrl(locale, '/blog');
  const feedLink = buildUrl(locale, '/feed.xml');

  const posts = getAllPosts(locale);
  const items = posts
    .map((post) => {
      const link = buildUrl(locale, `/blog/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.frontmatter.description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>${locale}</language>
    <atom:link href="${feedLink}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
