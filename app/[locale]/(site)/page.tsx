import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { seoAlternates } from '@/lib/seo';
import BannerCarousel from '@/components/BannerCarousel';
import {
  ShieldCheckIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';
import type { ComponentType, SVGProps } from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const alternates = seoAlternates('/', locale);
  return { alternates };
}

const featureIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  iso: ShieldCheckIcon,
  standards: GlobeAltIcon,
  oem: WrenchScrewdriverIcon,
  experience: ClockIcon,
};

const categories = [
  {
    key: 'bicycle',
    href: '/products/bicycle-tubeless-valve',
    image: '/images/products/bicycle/FVRa.jpg',
  },
  {
    key: 'tpms',
    href: '/products/tpms-sensor-valve',
    image: '/images/products/categories/tpms_Sensor_valve.jpg',
  },
  {
    key: 'automotive',
    href: '/products/car-light-truck-valve',
    image: '/images/products/categories/automotive_Car_Light_Truck_Valve.jpg',
  },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const nav = await getTranslations('nav');

  return (
    <>
      {/* Hero Banner Carousel */}
      <BannerCarousel>
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brass-300">
          {t('hero.subtitle')}
        </p>
        <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-steel-200">
          {t('hero.description')}
        </p>
        <div className="flex gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-steel-900 hover:bg-steel-50 transition-colors"
          >
            {t('hero.cta_products')}
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border-2 border-brass-400 px-6 py-3 font-semibold text-brass-300 hover:bg-brass-400/10 transition-colors"
          >
            {t('hero.cta_rfq')}
          </Link>
        </div>
      </BannerCarousel>

      {/* Features / Why N.S.-LIN */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-steel-900">
            {t('features.title')}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {(['iso', 'standards', 'oem', 'experience'] as const).map((key) => {
              const Icon = featureIcons[key];
              return (
                <div key={key} className="rounded-xl border border-metal-200 p-6 hover:shadow-md transition-shadow">
                  <Icon className="mb-3 h-8 w-8 text-steel-600" />
                  <h3 className="mb-2 font-semibold text-steel-800">
                    {t(`features.${key}`)}
                  </h3>
                  <p className="text-sm text-metal-600">
                    {t(`features.${key}_desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="bg-metal-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-steel-900">
            {t('categories.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map(({ key, href, image }) => (
              <Link
                key={key}
                href={href}
                className="group overflow-hidden rounded-xl border border-metal-200 bg-white hover:border-steel-300 hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-metal-100">
                  <Image
                    src={image}
                    alt={key}
                    width={400}
                    height={300}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-semibold text-steel-800 group-hover:text-steel-600">
                    {t(`categories.${key}`)}
                  </h3>
                  <p className="text-sm text-metal-600">
                    {t(`categories.${key}_desc`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="text-steel-600 font-medium hover:text-steel-800 transition-colors"
            >
              {t('categories.view_all')} →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-steel-900">
            {locale === 'zh-TW' ? '需要客製化氣嘴閥？' : 'Need Custom Valve Solutions?'}
          </h2>
          <p className="mb-8 text-lg text-metal-600">
            {locale === 'zh-TW'
              ? '我們的研發團隊可依您的規格設計製造，從打樣到量產一站完成。'
              : 'Our R&D team designs and manufactures valves to your exact specifications. From prototype to production.'}
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-steel-600 px-8 py-3 font-semibold text-white hover:bg-steel-700 transition-colors"
          >
            {nav('contact')}
          </Link>
        </div>
      </section>
    </>
  );
}
