import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { seoAlternates } from '@/lib/seo';
import { getAllGuides } from '@/lib/guides';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '知識中心' : 'Knowledge Hub',
    description: isZh
      ? '氣嘴閥技術知識指南 — 標準規範、材質科學、無內胎系統等長青參考文章。'
      : 'Tire valve technical knowledge guides — standards, materials science, tubeless systems, and more.',
    alternates: seoAlternates('/guides', locale),
  };
}

export default async function GuidesListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isZh = locale === 'zh-TW';
  const guides = getAllGuides(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-metal-500">
        <Link href="/" className="hover:text-steel-600">
          {isZh ? '首頁' : 'Home'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-metal-700">{isZh ? '知識中心' : 'Knowledge Hub'}</span>
      </nav>

      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-steel-100 px-3 py-1 text-xs text-steel-600">
          <BookOpenIcon className="h-3.5 w-3.5" />
          {isZh ? '長青知識指南' : 'Evergreen Knowledge Guides'}
        </div>
        <h1 className="mb-4 text-3xl font-bold text-steel-900">
          {isZh ? '知識中心' : 'Knowledge Hub'}
        </h1>
        <p className="text-lg text-metal-600 max-w-2xl">
          {isZh
            ? '深入了解氣嘴閥技術 — 從國際標準、材質科學到無內胎系統，每篇指南都是經過驗證的長青參考資料。'
            : 'Deep-dive into tire valve technology — from international standards and material science to tubeless systems. Each guide is a verified, evergreen reference.'}
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => {
          const updatedDate = new Date(guide.frontmatter.lastUpdated).toLocaleDateString(
            isZh ? 'zh-TW' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' },
          );

          return (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-xl border border-metal-200 p-6 hover:border-steel-400 hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {guide.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-metal-100 px-2.5 py-0.5 text-xs text-metal-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-lg font-semibold text-steel-800 group-hover:text-steel-600 transition-colors mb-2">
                {guide.frontmatter.title}
              </h2>

              <p className="text-sm text-metal-600 leading-relaxed mb-4">
                {guide.frontmatter.summary}
              </p>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-metal-400">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {updatedDate}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-steel-600 group-hover:text-steel-800 transition-colors">
                  {isZh ? '閱讀指南' : 'Read guide'}
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
