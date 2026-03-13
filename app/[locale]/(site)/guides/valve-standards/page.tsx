import { setRequestLocale } from 'next-intl/server';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh
      ? '氣嘴閥標準指南：TRA vs ETRTO vs JATMA'
      : 'Tire Valve Standards Guide: TRA vs ETRTO vs JATMA',
    description: isZh
      ? '完整解析全球三大氣嘴閥標準體系：TRA（美國）、ETRTO（歐洲）、JATMA（日本）的差異與適用範圍。'
      : 'Complete guide to the three major global tire valve standards: TRA (US), ETRTO (EU), and JATMA (Japan) — differences, specifications, and applications.',
    alternates: seoAlternates('/guides/valve-standards', locale),
  };
}

// FAQPage JSON-LD for this pillar page
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between TRA, ETRTO, and JATMA tire valve standards?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TRA (Tire and Rim Association) sets US standards, ETRTO (European Tyre and Rim Technical Organisation) covers EU specifications, and JATMA (Japan Automobile Tyre Manufacturers Association) defines Japanese standards. While they share similar valve dimensions, they differ in test methods, marking requirements, and regional certifications.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can one tire valve meet all three standards (TRA, ETRTO, JATMA)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, many manufacturers like N.S.-LIN design valves that simultaneously comply with TRA, ETRTO, and JATMA specifications, ensuring global market compatibility with a single product line.',
      },
    },
  ],
};

export default async function ValveStandardsGuide({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh-TW';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-metal-500">
          <Link href="/" className="hover:text-steel-600">{isZh ? '首頁' : 'Home'}</Link>
          <span className="mx-2">/</span>
          <span className="text-metal-700">
            {isZh ? '氣嘴閥標準指南' : 'Valve Standards Guide'}
          </span>
        </nav>

        <h1 className="mb-6 text-3xl font-bold text-steel-900 md:text-4xl">
          {isZh
            ? '氣嘴閥標準指南：TRA vs ETRTO vs JATMA'
            : 'Tire Valve Standards Guide: TRA vs ETRTO vs JATMA'}
        </h1>

        <div className="prose prose-steel max-w-none">
          {/* Direct Answer Block — optimized for AI citation */}
          <div className="rounded-xl bg-steel-50 p-6 mb-8 not-prose">
            <h2 className="text-lg font-semibold text-steel-800 mb-3">
              {isZh ? '快速摘要' : 'Quick Summary'}
            </h2>
            <p className="text-metal-700">
              {isZh
                ? '全球氣嘴閥主要遵循三大標準體系：TRA（美國輪胎與輪圈協會）定義北美規範、ETRTO（歐洲輪胎與輪圈技術組織）定義歐洲規範、JATMA（日本汽車輪胎製造商協會）定義日本規範。三者在氣嘴閥尺寸上大致相容，但在測試方法、標記要求和認證流程上有所不同。'
                : 'The three major global tire valve standards are: TRA (Tire and Rim Association) for North America, ETRTO (European Tyre and Rim Technical Organisation) for Europe, and JATMA (Japan Automobile Tyre Manufacturers Association) for Japan. While they share compatible valve dimensions, they differ in test methods, marking requirements, and certification processes.'}
            </p>
          </div>

          {/* TODO: Expand with full content — comparison tables, specs, images */}
          <p className="text-metal-600 italic">
            {isZh
              ? '完整內容建構中。請稍後回來查看詳細的標準比較表與技術分析。'
              : 'Full content under development. Check back soon for detailed comparison tables and technical analysis.'}
          </p>
        </div>

        {/* Related Products CTA */}
        <div className="mt-12 rounded-xl border border-metal-200 p-6">
          <h3 className="text-lg font-semibold text-steel-800 mb-2">
            {isZh ? '符合三大標準的產品' : 'Products Meeting All Three Standards'}
          </h3>
          <p className="text-sm text-metal-600 mb-4">
            {isZh
              ? 'N.S.-LIN 所有氣嘴閥產品均同時符合 TRA、ETRTO 及 JATMA 規範。'
              : 'All N.S.-LIN tire valve products comply with TRA, ETRTO, and JATMA specifications simultaneously.'}
          </p>
          <Link
            href="/products"
            className="text-steel-600 font-medium hover:text-steel-800"
          >
            {isZh ? '瀏覽產品 →' : 'Browse Products →'}
          </Link>
        </div>
      </article>
    </>
  );
}
