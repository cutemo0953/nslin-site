import { getTranslations, setRequestLocale } from 'next-intl/server';
import { seoAlternates } from '@/lib/seo';
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
      <p className="mb-8 text-lg text-metal-600">
        {isZh
          ? '請填寫以下表單，我們的業務團隊會盡速回覆。'
          : 'Fill out the form below and our sales team will respond promptly.'}
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

        {/* Contact Form */}
        <form className="md:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.company')}</label>
              <input type="text" name="company" required className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.name')}</label>
              <input type="text" name="name" required className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.email')}</label>
              <input type="email" name="email" required className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.country')}</label>
              <select name="country" required className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none">
                <option value="">--</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="TW">Taiwan</option>
                <option value="JP">Japan</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.inquiry_type')}</label>
              <select name="inquiryType" required className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none">
                <option value="rfq">{t('rfq')}</option>
                <option value="sample">{t('sample')}</option>
                <option value="custom">{t('custom')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.volume')}</label>
              <select name="volume" className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none">
                <option value="">--</option>
                <option value="lt1k">&lt; 1,000</option>
                <option value="1k-10k">1,000 - 10,000</option>
                <option value="10k-50k">10,000 - 50,000</option>
                <option value="gt50k">&gt; 50,000</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-metal-700">{t('form.message')}</label>
            <textarea name="message" rows={4} className="w-full rounded-lg border border-metal-300 px-3 py-2 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none" />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-steel-600 px-6 py-3 font-semibold text-white hover:bg-steel-700 transition-colors"
          >
            {t('form.submit')}
          </button>
        </form>
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
