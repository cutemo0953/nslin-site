import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllProducts } from '@/data/products';
import { seoAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import QuoteList, { type QuoteItem } from '@/components/rfq/QuoteList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '詢價清單' : 'Quote List (RFQ)',
    description: isZh
      ? '檢視已選的詢價品項，一次送出含所有料號的報價請求。'
      : 'Review your selected parts and send one request-for-quote with all part numbers.',
    alternates: seoAlternates('/quote', locale),
    robots: { index: false, follow: false }, // session-specific cart page
  };
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh-TW';
  const t = await getTranslations('contact');

  const catalog: QuoteItem[] = getAllProducts()
    .filter((p) => p.status === 'active')
    .map((p) => ({
      sku: p.sku,
      family: p.family,
      name: isZh ? p.name['zh-TW'] : p.name.en,
      valveType: p.valveType ?? '',
      rimHoleDiameter: p.rimHoleDiameter ?? '',
      effectiveLength: p.effectiveLength ?? '',
      material: p.material,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-steel-900">{isZh ? '詢價清單' : 'Quote List'}</h1>
      <p className="mb-8 text-lg text-metal-600">
        {isZh
          ? '以下是您加入的詢價品項。填寫聯絡資訊，一次把所有料號送出報價請求。'
          : 'The parts you added are listed below. Fill in your details to send one request-for-quote covering all of them.'}
      </p>

      <Suspense>
        <QuoteList
          catalog={catalog}
          labels={{
            empty: isZh ? '詢價清單是空的。' : 'Your quote list is empty.',
            emptyCta: isZh ? '瀏覽規格對照表' : 'Browse the spec finder',
            count: isZh ? '共 {count} 項' : '{count} parts',
            clear: isZh ? '清空' : 'Clear all',
            remove: isZh ? '移除' : 'Remove',
            formHeading: isZh ? '送出詢價' : 'Submit your RFQ',
          }}
          formLabels={{
            company: t('form.company'),
            name: t('form.name'),
            email: t('form.email'),
            country: t('form.country'),
            inquiryType: t('form.inquiry_type'),
            volume: t('form.volume'),
            message: t('form.message'),
            submit: t('form.submit'),
            sending: t('form.sending'),
            successTitle: t('form.success_title'),
            successBody: t('form.success_body'),
            errorTitle: t('form.error_title'),
            errorBody: t('form.error_body'),
            errorMailtoCta: t('form.error_mailto_cta'),
            invalidBody: t('form.invalid_body'),
            rateLimitedBody: t('form.rate_limited_body'),
            countryOther: t('form.country_other'),
            rfq: t('rfq'),
            sample: t('sample'),
            custom: t('custom'),
          }}
        />
      </Suspense>
    </div>
  );
}
