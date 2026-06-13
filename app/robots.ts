import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_vercel/', '/reports/', '/zh-TW/reports/'],
      },
      // AI crawlers — explicitly allow (except internal /reports/)
      { userAgent: 'GPTBot', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'Amazonbot', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'Meta-ExternalAgent', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
      { userAgent: 'Bytespider', allow: '/', disallow: ['/reports/', '/zh-TW/reports/'] },
    ],
    sitemap: 'https://nslin.com/sitemap.xml',
  };
}
