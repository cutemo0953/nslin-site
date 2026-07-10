import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { categories } from '@/data/products/categories';
import { getAllProducts } from '@/data/products';
import ProductSearch, { type ProductRow } from '@/components/products/ProductSearch';
import { FadeInSection } from '@/components/FadeInSection';
import type { Metadata } from 'next';

// Normalize for matching: lower-case, strip whitespace/dashes/dots.
function norm(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.]/g, '');
}

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

  // Category-slug → localized category name, so search can match by category.
  const categoryNameBySlug = new Map(
    categories.map((c) => [c.slug, isZh ? c.name['zh-TW'] : c.name.en] as const),
  );

  // Flatten the catalog once, server-side, into plain rows the client island
  // filters in memory (no refetch). Both locale names + category go into the
  // haystack so SKU / zh / en / category search all work case-insensitively.
  const productRows: ProductRow[] = getAllProducts()
    .filter((p) => p.status === 'active')
    .map((p) => {
      const categoryName = categoryNameBySlug.get(p.family) ?? '';
      return {
        sku: p.sku,
        family: p.family,
        name: isZh ? p.name['zh-TW'] : p.name.en,
        description: isZh ? p.description['zh-TW'] : p.description.en,
        material: p.material,
        image: p.images?.[0] ?? '',
        categoryName,
        searchText: norm(
          [
            p.sku,
            ...(p.variants ?? []).map((v) => v.partNo),
            p.name.en,
            p.name['zh-TW'],
            p.family,
            categoryNameBySlug.get(p.family) ?? '',
            categories.find((c) => c.slug === p.family)?.name.en ?? '',
            p.material,
          ].join(' '),
        ),
      };
    })
    .sort((a, b) => a.sku.localeCompare(b.sku));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: isZh ? '產品目錄' : 'Product Catalog',
          url: `${BASE_URL}/${isZh ? 'zh-TW/' : ''}products`,
          description: isZh
            ? `涵蓋 ${categories.length} 大產品類別，共 ${productRows.length} 種型號。符合 TRA、ETRTO、JATMA 國際標準。`
            : `${categories.length} product categories, ${productRows.length} SKUs. TRA, ETRTO, JATMA compliant.`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: categories.length,
          },
        }) }}
      />
    <div className="mx-auto max-w-6xl px-4 py-12">
      <FadeInSection delay={0}>
        <h1 className="mb-8 text-3xl font-bold text-steel-900">{t('title')}</h1>
      </FadeInSection>
      <FadeInSection delay={100}>
        <p className="mb-8 text-lg text-metal-600">
          {isZh
            ? `涵蓋 ${categories.length} 大產品類別，共 ${productRows.length} 種型號。符合 TRA、ETRTO、JATMA 國際標準。`
            : `${categories.length} product categories, ${productRows.length} models. Compliant with TRA, ETRTO, and JATMA international standards.`}
        </p>
      </FadeInSection>

      {/* Live search across all SKUs (by part number, name, or category) */}
      <FadeInSection delay={200}>
        <ProductSearch
          products={productRows}
          labels={{
            searchPlaceholder: t('search_placeholder'),
            searchAria: t('search_aria'),
            resultCount: t('result_count'),
            noResults: t('no_results'),
            browseCategories: t('browse_categories'),
          }}
        />
      </FadeInSection>

      <FadeInSection delay={0}>
        <h2 className="mb-6 mt-16 text-2xl font-bold text-steel-900">
          {isZh ? '依類別瀏覽' : 'Browse by Category'}
        </h2>
      </FadeInSection>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, index) => (
          <FadeInSection key={cat.slug} delay={(index % 3) * 100} className="grid">
          <Link
            href={`/products/${cat.slug}`}
            className="group overflow-hidden rounded-xl border border-metal-200 hover:border-steel-300 hover:shadow-lg transition-all"
          >
            {cat.image && (
              <div className="aspect-[4/3] overflow-hidden bg-metal-100">
                <Image
                  src={cat.image}
                  alt={isZh ? cat.name['zh-TW'] : cat.name.en}
                  width={400}
                  height={300}
                  // First row is the LCP candidate — load eagerly.
                  priority={index < 3}
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
          </FadeInSection>
        ))}
      </div>
    </div>
    </>
  );
}
