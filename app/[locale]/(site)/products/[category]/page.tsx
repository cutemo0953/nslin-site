import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { categories } from '@/data/products/categories';
import { getProductsByCategory } from '@/data/products';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  const isZh = locale === 'zh-TW';
  const name = isZh ? cat.name['zh-TW'] : cat.name.en;

  return {
    title: name,
    description: isZh ? cat.description['zh-TW'] : cat.description.en,
    alternates: seoAlternates(`/products/${category}`, locale),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const isZh = locale === 'zh-TW';
  const products = getProductsByCategory(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-metal-500">
        <Link href="/" className="hover:text-steel-600">{isZh ? '首頁' : 'Home'}</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-steel-600">{isZh ? '產品' : 'Products'}</Link>
        <span className="mx-2">/</span>
        <span className="text-metal-700">{isZh ? cat.name['zh-TW'] : cat.name.en}</span>
      </nav>

      <h1 className="mb-4 text-3xl font-bold text-steel-900">
        {isZh ? cat.name['zh-TW'] : cat.name.en}
      </h1>
      <p className="mb-8 text-lg text-metal-600">
        {isZh ? cat.description['zh-TW'] : cat.description.en}
      </p>

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.sku}
              href={`/products/${category}/${product.sku.toLowerCase()}`}
              className="group overflow-hidden rounded-xl border border-metal-200 hover:border-steel-300 hover:shadow-lg transition-all"
            >
              {product.images?.[0] && (
                <div className="aspect-[4/3] overflow-hidden bg-metal-50">
                  <Image
                    src={product.images[0]}
                    alt={product.sku}
                    width={400}
                    height={300}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-2 text-xs font-mono text-metal-400">{product.sku}</div>
                <h2 className="mb-2 font-semibold text-steel-800 group-hover:text-steel-600">
                  {isZh ? product.name['zh-TW'] : product.name.en}
                </h2>
                <p className="text-sm text-metal-600 line-clamp-3">
                  {isZh ? product.description['zh-TW'] : product.description.en}
                </p>
                {product.material && (
                  <div className="mt-3 text-xs text-metal-400">
                    {product.material}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-metal-500 italic">
          {isZh ? '產品資料建構中，敬請期待。' : 'Product data coming soon.'}
        </p>
      )}

      {/* Pillar page link */}
      {cat.pillarPageLink && (
        <div className="mt-12 rounded-xl bg-steel-50 p-6">
          <h3 className="font-semibold text-steel-800 mb-2">
            {isZh ? '延伸閱讀' : 'Learn More'}
          </h3>
          <Link href={cat.pillarPageLink} className="text-steel-600 hover:text-steel-800">
            {isZh ? '前往知識中心了解更多 →' : 'Visit our Knowledge Hub →'}
          </Link>
        </div>
      )}
    </div>
  );
}
