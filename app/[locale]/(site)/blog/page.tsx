import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { seoAlternates } from '@/lib/seo';
import { getAllPosts, getAllTags } from '@/lib/blog';
import BlogPostGrid from '@/components/BlogPostGrid';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '技術文章' : 'Blog',
    description: isZh
      ? '奕道實業技術團隊分享氣嘴閥產業知識、OEM 設計案例與產品技術解析。'
      : 'N.S.-LIN technical team shares tire valve industry knowledge, OEM design case studies, and product insights.',
    alternates: seoAlternates('/blog', locale),
  };
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isZh = locale === 'zh-TW';
  const allPosts = getAllPosts(locale);
  const allTags = getAllTags(locale);

  // Serialize posts for client component (no functions/classes)
  const postsData = allPosts.map((p) => ({
    slug: p.slug,
    frontmatter: p.frontmatter,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-metal-500">
        <Link href="/" className="hover:text-steel-600">
          {isZh ? '首頁' : 'Home'}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-metal-700">{isZh ? '技術文章' : 'Blog'}</span>
      </nav>

      <h1 className="mb-4 text-3xl font-bold text-steel-900">
        {isZh ? '技術文章' : 'Blog'}
      </h1>
      <p className="mb-8 text-lg text-metal-600">
        {isZh
          ? '氣嘴閥產業知識、OEM 設計案例與產品技術解析。'
          : 'Tire valve industry knowledge, OEM design case studies, and product insights.'}
      </p>

      <BlogPostGrid posts={postsData} tags={allTags} locale={locale} />
    </div>
  );
}
