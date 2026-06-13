import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAllProducts } from '@/data/products';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import type { Metadata } from 'next';
import SpecFinder, { type SpecRow } from './SpecFinder';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh
      ? '規格對照查詢 — TR 氣嘴閥對照表'
      : 'Tire Valve Cross-Reference — TR Number & Spec Finder',
    description: isZh
      ? '以 TR 編號、料號或規格（孔徑、長度、氣嘴型式）查詢對應的奕道氣嘴閥。TR413、TR414、TR500、TR618 系列與第二供應來源對照。'
      : 'Find the matching N.S.-LIN valve by TR number, part number, or specs (rim hole, length, valve type). TR413, TR414, TR500, TR618 series — qualify us as your second source.',
    alternates: seoAlternates('/cross-reference', locale),
  };
}

// "TR-413C" → "TR413C": the SKU itself is the industry designation.
function industryRefFromSku(sku: string): string {
  return /^TR[- ]?\d/.test(sku) ? sku.replace(/[\s\-]/g, '').toUpperCase() : '';
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.]/g, '');
}

export default async function CrossReferencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh-TW';

  const rows: SpecRow[] = getAllProducts()
    .filter((p) => p.status === 'active')
    .map((p) => {
      const name = isZh ? p.name['zh-TW'] : p.name.en;
      const industryRef = industryRefFromSku(p.sku);
      const variantPartNos = (p.variants ?? []).map((v) => v.partNo);
      const oe = p.oeCrossReference ?? [];
      return {
        sku: p.sku,
        family: p.family,
        name,
        industryRef,
        oeCrossReference: oe,
        valveType: p.valveType ?? '',
        rimHoleDiameter: p.rimHoleDiameter ?? '',
        effectiveLength: p.effectiveLength ?? '',
        material: p.material,
        installationType: p.installationType ?? '',
        application: p.application,
        searchText: norm(
          [p.sku, p.name.en, p.name['zh-TW'], industryRef, ...oe, ...variantPartNos].join(' '),
        ),
      };
    })
    .sort((a, b) => a.sku.localeCompare(b.sku));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: isZh ? '規格對照查詢' : 'Tire Valve Cross-Reference & Spec Finder',
    url: `${BASE_URL}/${isZh ? 'zh-TW/' : ''}cross-reference`,
    description: isZh
      ? '以 TR 編號或規格查詢對應的奕道氣嘴閥。'
      : 'Find the matching N.S.-LIN tire valve by TR number or specification.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-bold text-steel-900">
          {isZh ? '規格對照查詢' : 'Cross-Reference & Spec Finder'}
        </h1>
        <p className="mb-2 max-w-3xl text-lg text-metal-600">
          {isZh
            ? '正在尋找第二供應來源？輸入 TR 編號（如 TR413）、現有料號或以規格篩選，找到對應的奕道產品。'
            : 'Qualifying a second source? Search by TR number (e.g. TR413), your current part number, or filter by specification to find the matching N.S.-LIN valve.'}
        </p>
        <p className="mb-8 max-w-3xl text-sm text-metal-500">
          {isZh ? (
            <>
              找不到對應？
              <Link href="/contact" className="text-steel-600 underline">
                把您的料號或圖面寄給我們
              </Link>
              ，業務團隊會在 2 個工作天內回覆對應方案。
            </>
          ) : (
            <>
              No match below?{' '}
              <Link href="/contact" className="text-steel-600 underline">
                Send us your part number or drawing
              </Link>{' '}
              — our sales team will identify the equivalent within 2 business days.
            </>
          )}
        </p>

        <SpecFinder
          rows={rows}
          labels={{
            searchPlaceholder: isZh ? '搜尋 TR 編號 / 料號…' : 'Search TR number / part no…',
            application: isZh ? '應用' : 'Application',
            allApplications: isZh ? '所有應用' : 'All applications',
            valveType: isZh ? '氣嘴型式' : 'Valve type',
            allValveTypes: isZh ? '所有型式' : 'All valve types',
            partNo: isZh ? '料號' : 'Part No.',
            industryRef: isZh ? '業界編號 / 對照' : 'Industry Ref / Interchange',
            type: isZh ? '型式' : 'Type',
            rimHole: isZh ? '輪圈孔徑' : 'Rim Hole',
            length: isZh ? '有效長度' : 'Eff. Length',
            material: isZh ? '材質' : 'Material',
            resultCount: isZh ? '{count} 筆結果' : '{count} results',
            noResults: isZh
              ? '目錄中沒有直接對應的項目——但多數規格我們都能生產。'
              : 'No direct match in our catalog — but we can likely still make it.',
            noResultsCta: isZh ? '寄料號給我們對照' : 'Send us the part number',
          }}
        />
      </div>
    </>
  );
}
