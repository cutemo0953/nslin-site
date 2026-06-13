import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClockIcon } from '@heroicons/react/24/outline';
import { seoAlternates } from '@/lib/seo';
import ContactForm from './ContactForm';
import {
  DocumentTextIcon,
  CubeIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';
import type { ComponentType, SVGProps } from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '聯繫 / 詢價' : 'Contact / RFQ',
    description: isZh
      ? '聯繫奕道實業索取報價、申請樣品或提交客製化設計需求。'
      : 'Contact N.S.-LIN for quotes, sample requests, or custom design inquiries.',
    alternates: seoAlternates('/contact', locale),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const isZh = locale === 'zh-TW';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-steel-900">{t('title')}</h1>
      <p className="mb-4 text-lg text-metal-600">
        {isZh
          ? '請填寫以下表單，我們的業務團隊會盡速回覆。'
          : 'Fill out the form below and our sales team will respond promptly.'}
      </p>
      <p className="mb-8 inline-flex items-center gap-2 rounded-full bg-cert-500/10 border border-cert-500/30 px-4 py-1.5 text-sm font-medium text-cert-600">
        <ClockIcon className="h-4 w-4" aria-hidden="true" />
        {isZh
          ? '所有詢問將於 2 個工作天內回覆'
          : 'Every inquiry answered within 2 business days'}
      </p>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Inquiry Type Cards */}
        <div className="md:col-span-1 space-y-4">
          {([
            { key: 'rfq', Icon: DocumentTextIcon },
            { key: 'sample', Icon: CubeIcon },
            { key: 'custom', Icon: CogIcon },
          ] as { key: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[]).map(({ key, Icon }) => (
            <div key={key} className="rounded-lg border border-metal-200 p-4">
              <Icon className="h-7 w-7 text-steel-600 mb-2" />
              <div className="font-semibold text-steel-800">
                {t(key as 'rfq' | 'sample' | 'custom')}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form — Suspense required: useSearchParams (sku prefill) in a static page */}
        <Suspense>
        <ContactForm
          labels={{
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

      {/* Direct Contact */}
      <div className="mt-12 rounded-xl bg-metal-50 p-8">
        <h2 className="mb-4 text-xl font-bold text-steel-800">
          {isZh ? '直接聯繫' : 'Direct Contact'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm text-metal-700">
          <div>
            <div className="font-medium text-steel-800">Email</div>
            <a href="mailto:nslin@nslin.com.tw" className="text-steel-600 hover:underline">nslin@nslin.com.tw</a>
          </div>
          <div>
            <div className="font-medium text-steel-800">{isZh ? '電話' : 'Phone'}</div>
            <span>+886-6-256-2097</span>
          </div>
          <div>
            <div className="font-medium text-steel-800">{isZh ? '傳真' : 'Fax'}</div>
            <span>+886-6-256-2075</span>
          </div>
        </div>
      </div>
    </div>
  );
}
