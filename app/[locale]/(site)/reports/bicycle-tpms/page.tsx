import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import {
  reportHtmlContent,
  reportLastUpdated,
  reportEvidenceCollected,
} from '@/data/reports/content.generated';

export async function generateStaticParams() {
  return [{ locale: 'zh-TW' }, { locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh
      ? '自行車 TPMS 市場研究'
      : 'Bicycle TPMS Market Research',
    robots: { index: false, follow: false },
  };
}

function ReportFooter({ slug, locale }: { slug: string; locale: string }) {
  const isZh = locale === 'zh-TW';
  const lastUpdated = reportLastUpdated[slug];
  const evidenceCollected = reportEvidenceCollected[slug];

  const daysSinceUpdate = lastUpdated
    ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86_400_000)
    : null;
  const isStale = daysSinceUpdate !== null && daysSinceUpdate > 14;

  return (
    <footer className="mt-12 border-t border-metal-200 pt-6 text-sm text-metal-400 space-y-1">
      {isStale && (
        <p className="text-safety-600 font-medium">
          {isZh
            ? `距上次更新已超過 ${daysSinceUpdate} 天，資料可能已過時。`
            : `Last updated ${daysSinceUpdate} days ago. Data may be outdated.`}
        </p>
      )}
      <p>
        {isZh ? '報告最後更新：' : 'Report last updated: '}
        {lastUpdated ?? 'N/A'}
      </p>
      <p>
        {isZh ? '情報最後收集：' : 'Evidence last collected: '}
        {evidenceCollected ?? 'N/A'}
      </p>
      <p className="mt-2 text-metal-300">
        {isZh ? '內部文件，僅供參考。' : 'Internal document.'}
      </p>
    </footer>
  );
}

export default async function BicycleTpmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const html = reportHtmlContent['bicycle-tpms'];
  if (!html) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-metal-500">
        Report not available. Run prebuild first.
      </div>
    );
  }

  return (
    <article className="py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div
          className="article-content report-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <ReportFooter slug="bicycle-tpms" locale={locale} />
      </div>
    </article>
  );
}
