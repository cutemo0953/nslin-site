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
        coverImage: '/images/blog/corecap-bbb-valve-innovation/cover.jpg',
        draft: false,
      },
      'zh-TW': {
        title: 'CoreCap：獲得 iF 設計獎的無內胎氣嘴閥',
        description:
          '奕道實業如何為 BBB 開發 CoreCap — 將閥門機構整合進氣嘴帽，讓氣嘴桿內部完全淨空，從根本解決無內胎氣嘴的流量瓶頸。',
        date: '2026-03-13',
        tags: ['tubeless-valve', 'bicycle', 'oem', 'product-innovation'],
        author: '奕道實業技術團隊',
        coverImage: '/images/blog/corecap-bbb-valve-innovation/cover.jpg',
        draft: false,
      },
    },
  },
  {
    slug: 'bike-cafe-tubeless-valve-review',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'French Media Review: CoreCap Wins the High-Flow Tubeless Valve Showdown',
        description:
          'Bike Cafe, a leading French cycling publication, tested three next-gen tubeless valves head-to-head. BBB CoreCap came out on top — here\'s what their review reveals about valve design trade-offs.',
        date: '2026-03-14',
        tags: ['tubeless-valve', 'bicycle', 'media-review', 'competitive-landscape'],
        author: 'N.S.-LIN Technical Team',
        coverImage: '/images/blog/bike-cafe-tubeless-valve-review/cover.jpg',
        draft: false,
      },
      'zh-TW': {
        title: '法國媒體實測：CoreCap 在高流量氣嘴對決中勝出',
        description:
          '法國自行車媒體 Bike Cafe 實測三款新世代無內胎氣嘴 — BBB CoreCap、Schwalbe CLIK VALVE、Muc-Off Big Bore — CoreCap 以更大的內徑和更簡潔的設計贏得首選推薦。',
        date: '2026-03-14',
        tags: ['tubeless-valve', 'bicycle', 'media-review', 'competitive-landscape'],
        author: '奕道實業技術團隊',
        coverImage: '/images/blog/bike-cafe-tubeless-valve-review/cover.jpg',
        draft: false,
      },
    },
  },
];
