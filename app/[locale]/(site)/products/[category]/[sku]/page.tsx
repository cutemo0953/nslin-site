import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { getProductBySku, getAllProductSlugs, getProductsByCategory } from '@/data/products';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';

export function generateStaticParams() {
  const slugs = getAllProductSlugs();
  const params: Array<{ locale: string; category: string; sku: string }> = [];
  for (const locale of routing.locales) {
    for (const { category, sku } of slugs) {
      params.push({ locale, category, sku });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; sku: string }>;
}): Promise<Metadata> {
  const { locale, category, sku } = await params;
  const product = getProductBySku(sku);
  if (!product) return {};
  const isZh = locale === 'zh-TW';

  return {
    title: `${product.sku} — ${isZh ? product.name['zh-TW'] : product.name.en}`,
    description: isZh ? product.description['zh-TW'] : product.description.en,
    alternates: seoAlternates(`/products/${category}/${sku}`, locale),
  };
}

function buildProductJsonLd(product: ReturnType<typeof getProductBySku>, locale: string) {
  if (!product) return null;
  const isZh = locale === 'zh-TW';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: isZh ? product.name['zh-TW'] : product.name.en,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'N.S.-LIN' },
    manufacturer: {
      '@type': 'Organization',
      name: 'N.S.-LIN Industrial Co., Ltd.',
      url: BASE_URL,
    },
    description: isZh ? product.description['zh-TW'] : product.description.en,
    material: product.material,
    category: product.family,
    url: `${BASE_URL}${isZh ? '/zh-TW' : ''}/products/${product.family}/${product.sku.toLowerCase()}`,
    additionalProperty: [
      product.rimHoleDiameter && {
        '@type': 'PropertyValue',
        name: 'Rim Hole Diameter',
        value: product.rimHoleDiameter,
      },
      product.effectiveLength && {
        '@type': 'PropertyValue',
        name: 'Effective Length',
        value: product.effectiveLength,
      },
      product.installationType && {
        '@type': 'PropertyValue',
        name: 'Installation Type',
        value: product.installationType,
      },
      product.valveCore && {
        '@type': 'PropertyValue',
        name: 'Valve Core',
        value: product.valveCore,
      },
      product.valveType && {
        '@type': 'PropertyValue',
        name: 'Valve Type',
        value: product.valveType,
      },
      ...(product.standards || []).map((std) => ({
        '@type': 'PropertyValue',
        name: 'Standard',
        value: std,
      })),
    ].filter(Boolean),
    isRelatedTo: (product.relatedProducts || []).map((sku) => ({
      '@type': 'Product',
      name: sku,
      url: `${BASE_URL}/products/${product.family}/${sku.toLowerCase()}`,
    })),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; sku: string }>;
}) {
  const { locale, category, sku } = await params;
  setRequestLocale(locale);

  const product = getProductBySku(sku);
  if (!product) notFound();

  const isZh = locale === 'zh-TW';
  const jsonLd = buildProductJsonLd(product, locale);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-metal-500">
          <Link href="/" className="hover:text-steel-600">{isZh ? '首頁' : 'Home'}</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-steel-600">{isZh ? '產品' : 'Products'}</Link>
          <span className="mx-2">/</span>
          <Link href={`/products/${category}`} className="hover:text-steel-600">
            {isZh ? '自行車氣嘴閥' : 'Bicycle Valves'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-metal-700">{product.sku}</span>
        </nav>

        {/* Product Header */}
        <div className="mb-8">
          <div className="mb-2 inline-block rounded-full bg-steel-100 px-3 py-1 text-xs font-mono text-steel-700">
            {product.sku}
          </div>
          <h1 className="mb-4 text-3xl font-bold text-steel-900">
            {isZh ? product.name['zh-TW'] : product.name.en}
          </h1>
          <p className="text-lg text-metal-600">
            {isZh ? product.description['zh-TW'] : product.description.en}
          </p>
        </div>

        {/* Specifications Table */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-steel-800">
            {isZh ? '規格' : 'Specifications'}
          </h2>
          <div className="overflow-hidden rounded-lg border border-metal-200">
            <table className="w-full text-sm">
              <tbody>
                {product.valveType && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700 w-1/3">
                      {isZh ? '氣嘴類型' : 'Valve Type'}
                    </td>
                    <td className="px-4 py-3 text-metal-800 capitalize">{product.valveType}</td>
                  </tr>
                )}
                {product.material && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '材質' : 'Material'}
                    </td>
                    <td className="px-4 py-3 text-metal-800">{product.material}</td>
                  </tr>
                )}
                {product.rimHoleDiameter && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '輪圈孔徑' : 'Rim Hole Diameter'}
                    </td>
                    <td className="px-4 py-3 text-metal-800">{product.rimHoleDiameter}</td>
                  </tr>
                )}
                {product.effectiveLength && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '有效長度' : 'Effective Length'}
                    </td>
                    <td className="px-4 py-3 text-metal-800">{product.effectiveLength}</td>
                  </tr>
                )}
                {product.finish && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '表面處理' : 'Finish'}
                    </td>
                    <td className="px-4 py-3 text-metal-800">{product.finish}</td>
                  </tr>
                )}
                {product.installationType && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '安裝方式' : 'Installation'}
                    </td>
                    <td className="px-4 py-3 text-metal-800 capitalize">{product.installationType}</td>
                  </tr>
                )}
                {product.valveCore && (
                  <tr className="border-b border-metal-100">
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '氣嘴芯' : 'Valve Core'}
                    </td>
                    <td className="px-4 py-3 text-metal-800 capitalize">{product.valveCore}</td>
                  </tr>
                )}
                {product.standards && product.standards.length > 0 && (
                  <tr>
                    <td className="bg-metal-50 px-4 py-3 font-medium text-metal-700">
                      {isZh ? '適用標準' : 'Standards'}
                    </td>
                    <td className="px-4 py-3 text-metal-800">{product.standards.join(', ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Technical Description */}
        {product.technicalDescription && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-steel-800">
              {isZh ? '技術說明' : 'Technical Details'}
            </h2>
            <p className="text-metal-700 leading-relaxed">
              {isZh
                ? product.technicalDescription['zh-TW']
                : product.technicalDescription.en}
            </p>
          </section>
        )}

        {/* FAQ */}
        {product.faq && product.faq.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-steel-800">FAQ</h2>
            <div className="space-y-4">
              {product.faq.map((item, i) => (
                <div key={i} className="rounded-lg border border-metal-200 p-4">
                  <h3 className="font-semibold text-steel-800 mb-2">
                    {isZh ? item.q['zh-TW'] : item.q.en}
                  </h3>
                  <p className="text-sm text-metal-600">
                    {isZh ? item.a['zh-TW'] : item.a.en}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-xl bg-steel-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-steel-800 mb-2">
            {isZh ? '對此產品有興趣？' : 'Interested in this product?'}
          </h3>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-steel-600 px-6 py-3 font-semibold text-white hover:bg-steel-700 transition-colors"
          >
            {isZh ? '索取報價' : 'Request a Quote'}
          </Link>
        </div>
      </div>
    </>
  );
}
