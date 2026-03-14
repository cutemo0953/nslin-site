import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { getGuide, getAllGuideSlugs, getAvailableLocales } from '@/lib/guides';
import { getAllPosts } from '@/lib/blog';
import { categories } from '@/data/products/categories';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

/* ── Static params ── */

export async function generateStaticParams() {
  return getAllGuideSlugs().map(({ slug, locale }) => ({ slug, locale }));
}

/* ── Metadata ── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug, locale);
  if (!guide || guide.frontmatter.draft) return {};

  const { frontmatter } = guide;
  const availableLocales = getAvailableLocales(slug);

  const enUrl = `${BASE_URL}/guides/${slug}`;
  const zhUrl = `${BASE_URL}/zh-TW/guides/${slug}`;
  const alternates: Record<string, string> = {};
  if (availableLocales.includes('en')) alternates['en'] = enUrl;
  if (availableLocales.includes('zh-TW')) alternates['zh-TW'] = zhUrl;
  if (availableLocales.includes('en')) alternates['x-default'] = enUrl;

  return {
    title: frontmatter.seoTitle || frontmatter.title,
    description: frontmatter.seoDescription || frontmatter.description,
    openGraph: {
      title: frontmatter.seoTitle || frontmatter.title,
      description: frontmatter.seoDescription || frontmatter.description,
      url: locale === 'en' ? enUrl : zhUrl,
      type: 'article',
      modifiedTime: frontmatter.lastUpdated,
      tags: frontmatter.tags,
    },
    alternates: {
      canonical: locale === 'en' ? enUrl : zhUrl,
      languages: alternates,
    },
  };
}

/* ── Page ── */

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = getGuide(slug, locale);
  if (!guide || guide.frontmatter.draft) notFound();

  const { frontmatter, htmlContent } = guide;
  const isZh = locale === 'zh-TW';

  // FAQ JSON-LD
  const faqJsonLd =
    frontmatter.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: frontmatter.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        }
      : null;

  // Related blog posts (by tag, max 3, same locale, non-draft)
  const allPosts = getAllPosts(locale);
  const tagSet = new Set(frontmatter.tags);
  const relatedPosts = allPosts
    .filter((p) => p.frontmatter.tags.some((t) => tagSet.has(t)))
    .slice(0, 3);

  // Related products (by relatedProductSlugs, max 3)
  const relatedProducts = (frontmatter.relatedProductSlugs || [])
    .map((catSlug) => categories.find((c) => c.slug === catSlug))
    .filter(Boolean)
    .slice(0, 3);

  const lastUpdatedFormatted = new Date(frontmatter.lastUpdated).toLocaleDateString(
    isZh ? 'zh-TW' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <div>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Hero — gradient mode */}
      <section className="bg-gradient-to-br from-steel-800 to-steel-600">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              {isZh ? '首頁' : 'Home'}
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/guides" className="hover:text-white transition-colors">
              {isZh ? '知識中心' : 'Guides'}
            </Link>
          </nav>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            <BookOpenIcon className="h-3.5 w-3.5" />
            {isZh ? '知識指南' : 'Knowledge Guide'}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {frontmatter.title}
          </h1>
          <p className="text-base md:text-lg text-white/80 leading-relaxed">
            {frontmatter.description}
          </p>
        </div>
      </section>

      {/* Meta */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-metal-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDaysIcon className="h-4 w-4" />
            {isZh ? '最後更新：' : 'Last updated: '}
            <time dateTime={frontmatter.lastUpdated}>{lastUpdatedFormatted}</time>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-metal-100 px-2.5 py-1 text-xs text-metal-600"
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Direct Answer Block */}
      <div className="mx-auto max-w-3xl px-4 mt-8">
        <div className="rounded-xl bg-steel-50 p-6">
          <h2 className="text-lg font-semibold text-steel-800 mb-3">
            {isZh ? '快速摘要' : 'Quick Summary'}
          </h2>
          <p className="text-metal-700 leading-relaxed">
            {frontmatter.directAnswer}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-10 lg:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* FAQ Section */}
          {frontmatter.faq.length > 0 && (
            <div className="mt-12 border-t border-metal-200 pt-8">
              <h2 className="text-xl font-bold text-steel-900 mb-6">
                {isZh ? '常見問題' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-6">
                {frontmatter.faq.map((item, i) => (
                  <div key={i}>
                    <h3 className="text-base font-semibold text-steel-800 mb-2">
                      {item.q}
                    </h3>
                    <p className="text-sm text-metal-600 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 rounded-xl border border-metal-200 p-6">
              <h3 className="text-lg font-semibold text-steel-800 mb-4">
                {isZh ? '相關產品' : 'Related Products'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((cat) => (
                  <Link
                    key={cat!.slug}
                    href={`/products/${cat!.slug}`}
                    className="group rounded-lg border border-metal-100 p-4 hover:border-steel-300 transition-colors"
                  >
                    <p className="text-sm font-medium text-steel-600 group-hover:text-steel-800 transition-colors">
                      {isZh ? cat!.name['zh-TW'] : cat!.name.en}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Blog Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-8 rounded-xl border border-metal-200 p-6">
              <h3 className="text-lg font-semibold text-steel-800 mb-4">
                {isZh ? '相關文章' : 'Related Articles'}
              </h3>
              <div className="space-y-3">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block text-sm text-steel-600 hover:text-steel-800 transition-colors"
                  >
                    {post.frontmatter.title} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 rounded-xl border border-brass-200 bg-brass-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-steel-900">
              {isZh ? '需要符合標準的氣嘴閥？' : 'Need standards-compliant valves?'}
            </h3>
            <p className="mb-4 text-sm text-metal-600">
              {isZh
                ? '聯繫我們的團隊，取得符合 TRA/ETRTO/JATMA 規範的產品。'
                : 'Contact our team for products meeting TRA/ETRTO/JATMA specifications.'}
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-steel-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-steel-700 transition-colors"
            >
              {isZh ? '聯繫我們' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
