import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { getPost, getAllSlugs, getAdjacentPosts, getAvailableLocales } from '@/lib/blog';
import {
  CalendarDaysIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

/* ── Static params ── */

export async function generateStaticParams() {
  return getAllSlugs().map(({ slug, locale }) => ({ slug, locale }));
}

/* ── Metadata ── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);
  if (!post) return {};

  const { frontmatter } = post;
  const availableLocales = getAvailableLocales(slug);

  const enUrl = `${BASE_URL}/blog/${slug}`;
  const zhUrl = `${BASE_URL}/zh-TW/blog/${slug}`;
  const alternates: Record<string, string> = {};
  if (availableLocales.includes('en')) alternates['en'] = enUrl;
  if (availableLocales.includes('zh-TW')) alternates['zh-TW'] = zhUrl;
  if (availableLocales.includes('en')) alternates['x-default'] = enUrl;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updatedAt || frontmatter.date,
      tags: frontmatter.tags,
      ...(frontmatter.coverImage && { images: [{ url: frontmatter.coverImage }] }),
    },
    alternates: {
      canonical: locale === 'en' ? enUrl : zhUrl,
      languages: alternates,
    },
  };
}

/* ── Page ── */

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(slug, locale);
  if (!post) notFound();

  const { frontmatter, htmlContent } = post;
  const { prev, next } = getAdjacentPosts(slug, locale);
  const isZh = locale === 'zh-TW';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.updatedAt || frontmatter.date,
    author: {
      '@type': 'Organization',
      name: frontmatter.author || 'N.S.-LIN Technical Team',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'N.S.-LIN Industrial Co., Ltd.',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}${locale === 'zh-TW' ? '/zh-TW' : ''}/blog/${slug}`,
    },
    ...(frontmatter.coverImage && {
      image: `${BASE_URL}${frontmatter.coverImage}`,
    }),
    keywords: frontmatter.tags.join(', '),
    inLanguage: locale === 'zh-TW' ? 'zh-Hant-TW' : 'en',
  };

  const dateFormatted = new Date(frontmatter.date).toLocaleDateString(
    locale === 'zh-TW' ? 'zh-TW' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      {frontmatter.coverImage ? (
        <section className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frontmatter.coverImage}
            alt={frontmatter.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="mx-auto max-w-3xl w-full px-4 pb-8 md:pb-12">
              <nav className="mb-3 flex items-center gap-2 text-sm text-white/70">
                <Link href="/" className="hover:text-white transition-colors">
                  {isZh ? '首頁' : 'Home'}
                </Link>
                <span className="text-white/40">/</span>
                <Link href="/blog" className="hover:text-white transition-colors">
                  {isZh ? '技術文章' : 'Blog'}
                </Link>
              </nav>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                {frontmatter.title}
              </h1>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-br from-steel-800 to-steel-600">
          <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
            <nav className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white transition-colors">
                {isZh ? '首頁' : 'Home'}
              </Link>
              <span className="text-white/30">/</span>
              <Link href="/blog" className="hover:text-white transition-colors">
                {isZh ? '技術文章' : 'Blog'}
              </Link>
            </nav>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {frontmatter.title}
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              {frontmatter.description}
            </p>
          </div>
        </section>
      )}

      {/* Meta + Tags */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-metal-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDaysIcon className="h-4 w-4" />
            <time dateTime={frontmatter.date}>{dateFormatted}</time>
          </span>
          {frontmatter.author && (
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="h-4 w-4" />
              {frontmatter.author}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="inline-flex items-center gap-1 rounded-full bg-metal-100 px-2.5 py-1 text-xs text-metal-600 hover:bg-metal-200 transition-colors"
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Article Content */}
      <article className="py-10 lg:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* RFQ CTA */}
          <div className="mt-12 rounded-xl border border-brass-200 bg-brass-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-steel-900">
              {isZh ? '對此產品有興趣？' : 'Interested in this product?'}
            </h3>
            <p className="mb-4 text-sm text-metal-600">
              {isZh
                ? '聯繫我們的團隊，取得樣品或報價。'
                : 'Contact our team for samples or a quote.'}
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-steel-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-steel-700 transition-colors"
            >
              {isZh ? '聯繫我們' : 'Contact Us'}
            </Link>
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <nav className="mt-10 grid grid-cols-2 gap-6 border-t border-metal-200 pt-8">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="group text-left">
                  <span className="inline-flex items-center gap-1 text-xs text-metal-400 uppercase tracking-wider">
                    <ChevronLeftIcon className="h-3 w-3" />
                    {isZh ? '上一篇' : 'Previous'}
                  </span>
                  <p className="mt-1 text-sm font-medium text-steel-600 group-hover:text-steel-800 transition-colors line-clamp-2">
                    {prev.frontmatter.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link href={`/blog/${next.slug}`} className="group text-right">
                  <span className="inline-flex items-center gap-1 text-xs text-metal-400 uppercase tracking-wider justify-end">
                    {isZh ? '下一篇' : 'Next'}
                    <ChevronRightIcon className="h-3 w-3" />
                  </span>
                  <p className="mt-1 text-sm font-medium text-steel-600 group-hover:text-steel-800 transition-colors line-clamp-2">
                    {next.frontmatter.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}
        </div>
      </article>
    </div>
  );
}
