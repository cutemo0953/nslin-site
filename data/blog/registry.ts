import type { BlogFrontmatter } from '@/lib/blog';

export interface BlogEntry {
  slug: string;
  locales: ('en' | 'zh-TW')[];
  frontmatter: Record<string, BlogFrontmatter>;
}

/**
 * Blog post registry — add new entries here when creating blog posts.
 * This is the single source of truth for blog metadata.
 * MDX content is imported separately in lib/blog.ts via dynamic import map.
 */
export const blogEntries: BlogEntry[] = [
  {
    slug: 'corecap-bbb-valve-innovation',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'CoreCap: The Tubeless Valve That Won an iF Design Award',
        description:
          'How N.S.-LIN built a valve that moves the check-valve into the cap, clears the stem completely, and solves the airflow problem other tubeless valves can\'t.',
        date: '2026-03-13',
        tags: ['tubeless-valve', 'bicycle', 'oem', 'product-innovation'],
        author: 'N.S.-LIN Technical Team',
        draft: false,
      },
      'zh-TW': {
        title: 'CoreCap：獲得 iF 設計獎的無內胎氣嘴閥',
        description:
          '奕道實業如何為 BBB 開發 CoreCap — 將閥門機構整合進氣嘴帽，讓氣嘴桿內部完全淨空，從根本解決無內胎氣嘴的流量瓶頸。',
        date: '2026-03-13',
        tags: ['tubeless-valve', 'bicycle', 'oem', 'product-innovation'],
        author: '奕道實業技術團隊',
        draft: false,
      },
    },
  },
];
