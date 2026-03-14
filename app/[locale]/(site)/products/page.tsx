import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { seoAlternates } from '@/lib/seo';
import { categories } from '@/data/products/categories';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '產品' : 'Products',
    description: isZh
      ? 'N.S.-LIN 全系列輪胎氣嘴閥產品，涵蓋自行車、機車、汽車、卡車、TPMS等13大類。'
      : 'N.S.-LIN complete tire valve product catalog — 13 categories including bicycle, motorcycle, car, truck, and TPMS valves.',
    alternates: seoAlternates('/products', locale),
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('products');
  const isZh = locale === 'zh-TW';

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-steel-900">{t('title')}</h1>
      <p className="mb-12 text-lg text-metal-600">
        {isZh
          ? '涵蓋 13 大產品類別，超過 70 種型號。符合 TRA、ETRTO、JATMA 國際標準。'
          : '13 product categories, 70+ models. Compliant with TRA, ETRTO, and JATMA international standards.'}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products/${cat.slug}`}
            className="group overflow-hidden rounded-xl border border-metal-200 hover:border-steel-300 hover:shadow-lg transition-all"
          >
            {cat.image && (
              <div className="aspect-[4/3] overflow-hidden bg-metal-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={isZh ? cat.name['zh-TW'] : cat.name.en}
                  className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="mb-2 text-lg font-semibold text-steel-800 group-hover:text-steel-600">
                {isZh ? cat.name['zh-TW'] : cat.name.en}
              </h2>
              <p className="mb-4 text-sm text-metal-600">
                {isZh ? cat.description['zh-TW'] : cat.description.en}
              </p>
              <span className="text-xs text-metal-400">
                {cat.productCount} {isZh ? '款產品' : 'products'} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
