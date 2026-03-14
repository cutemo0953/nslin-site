export interface GuideFrontmatter {
  title: string;
  seoTitle?: string;
  description: string;
  seoDescription?: string;
  lastUpdated: string;
  tags: string[];
  author: string;
  draft: boolean;
  summary: string;
  directAnswer: string;
  relatedProductSlugs?: string[];
  faq: { q: string; a: string }[];
}

export interface GuideEntry {
  slug: string;
  locales: ('en' | 'zh-TW')[];
  frontmatter: {
    en?: GuideFrontmatter;
    'zh-TW'?: GuideFrontmatter;
  };
}

/**
 * Guide registry — add new entries here when creating guides.
 * Runtime source of truth for guide metadata.
 * gen-guide-content.mjs cross-validates against MDX frontmatter.
 */
export const guideEntries: GuideEntry[] = [
  {
    slug: 'valve-standards',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'Tire Valve Standards Guide: TRA vs ETRTO vs JATMA',
        description:
          'Complete guide to the three major global tire valve standards: TRA (US), ETRTO (EU), and JATMA (Japan) — differences, specifications, and applications.',
        lastUpdated: '2026-03-14',
        tags: ['valve-standards', 'tire-valve', 'oem'],
        author: 'N.S.-LIN Technical Team',
        draft: false,
        summary:
          'A comprehensive comparison of TRA, ETRTO, and JATMA tire valve standards — the three systems that govern global valve manufacturing.',
        directAnswer:
          'The three major global tire valve standards are TRA (Tire and Rim Association, North America), ETRTO (European Tyre and Rim Technical Organisation, Europe), and JATMA (Japan Automobile Tyre Manufacturers Association, Japan). While they share compatible valve dimensions, they differ in test methods, marking requirements, and certification processes. Most manufacturers like N.S.-LIN design valves that comply with all three simultaneously.',
        relatedProductSlugs: ['car-light-truck-valve', 'motorcycle-valve', 'truck-bus-valve'],
        faq: [
          {
            q: 'What is the difference between TRA, ETRTO, and JATMA tire valve standards?',
            a: 'TRA (Tire and Rim Association) sets US standards, ETRTO (European Tyre and Rim Technical Organisation) covers EU specifications, and JATMA (Japan Automobile Tyre Manufacturers Association) defines Japanese standards. While they share similar valve dimensions, they differ in test methods, marking requirements, and regional certifications.',
          },
          {
            q: 'Can one tire valve meet all three standards (TRA, ETRTO, JATMA)?',
            a: 'Yes, many manufacturers like N.S.-LIN design valves that simultaneously comply with TRA, ETRTO, and JATMA specifications, ensuring global market compatibility with a single product line.',
          },
        ],
      },
      'zh-TW': {
        title: '氣嘴閥標準指南：TRA vs ETRTO vs JATMA',
        description:
          '完整解析全球三大氣嘴閥標準體系：TRA（美國）、ETRTO（歐洲）、JATMA（日本）的差異與適用範圍。',
        lastUpdated: '2026-03-14',
        tags: ['valve-standards', 'tire-valve', 'oem'],
        author: '奕道實業技術團隊',
        draft: false,
        summary:
          '全面比較 TRA、ETRTO、JATMA 三大氣嘴閥標準體系 — 全球氣嘴閥製造的三套規範。',
        directAnswer:
          '全球氣嘴閥主要遵循三大標準體系：TRA（美國輪胎與輪圈協會）定義北美規範、ETRTO（歐洲輪胎與輪圈技術組織）定義歐洲規範、JATMA（日本汽車輪胎製造商協會）定義日本規範。三者在氣嘴閥尺寸上大致相容，但在測試方法、標記要求和認證流程上有所不同。奕道實業等製造商設計的產品同時符合三大標準。',
        relatedProductSlugs: ['car-light-truck-valve', 'motorcycle-valve', 'truck-bus-valve'],
        faq: [
          {
            q: 'TRA、ETRTO、JATMA 三大氣嘴閥標準有什麼差異？',
            a: 'TRA（美國輪胎與輪圈協會）制定北美標準、ETRTO（歐洲輪胎與輪圈技術組織）制定歐洲規範、JATMA（日本汽車輪胎製造商協會）定義日本標準。三者在氣嘴閥尺寸上大致相容，但測試方法、標記要求和區域認證有所不同。',
          },
          {
            q: '一款氣嘴閥能同時符合 TRA、ETRTO、JATMA 三大標準嗎？',
            a: '可以。奕道實業等製造商設計的氣嘴閥同時符合 TRA、ETRTO 與 JATMA 規範，確保產品在全球市場的相容性。',
          },
        ],
      },
    },
  },
];
