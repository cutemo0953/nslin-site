import type { Metadata } from 'next';
import { Inter, Noto_Sans_TC } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/lib/seo';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';

  return {
    title: {
      default: isZh
        ? '奕道實業 | N.S.-LIN Tire Valve Manufacturer'
        : 'N.S.-LIN Industrial | Tire Valve Manufacturer Since 1980s',
      template: isZh ? '%s | 奕道實業' : '%s | N.S.-LIN Industrial',
    },
    description: isZh
      ? '奕道實業 — 超過40年氣嘴閥製造專業，ISO 9001:2015認證，產品符合TRA、ETRTO、JATMA國際標準。提供OEM/ODM客製服務。'
      : 'N.S.-LIN Industrial — 40+ years of precision tire valve manufacturing. ISO 9001:2015 certified. TRA, ETRTO, JATMA compliant. OEM/ODM custom valve solutions.',
    keywords: isZh
      ? ['奕道', '氣嘴閥', '輪胎氣嘴', '台灣氣嘴閥工廠', 'OEM氣嘴', '自行車氣嘴', 'TPMS氣嘴閥', 'ISO認證']
      : ['N.S.-LIN', 'tire valve', 'valve manufacturer', 'Taiwan valve factory', 'OEM valve', 'bicycle valve', 'TPMS valve', 'ISO 9001'],
    authors: [{ name: 'N.S.-LIN Industrial Co., Ltd.' }],
    metadataBase: new URL(BASE_URL),
    openGraph: {
      type: 'website',
      siteName: isZh ? '奕道工業' : 'N.S.-LIN Industrial',
      locale: isZh ? 'zh_TW' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Organization JSON-LD with sameAs for entity disambiguation
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'N.S.-LIN Industrial Co., Ltd.',
  alternateName: '奕道工業股份有限公司',
  url: BASE_URL,
  description:
    'Taiwan-based tire valve manufacturer with 40+ years expertise. ISO 9001:2015 certified.',
  email: 'nslin@nslin.com.tw',
  telephone: '+886-6-256-2097',
  faxNumber: '+886-6-256-2075',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'NO.65, Sec.4, Changhe Rd., Annan Dist.',
    addressLocality: 'Tainan City',
    postalCode: '709-47',
    addressCountry: 'TW',
  },
  sameAs: [
    'https://www.nslin.com.tw',
    // TODO: Add LinkedIn, trade directory URLs
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'ISO 9001:2015',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'AFAQ 9001',
    },
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'N.S.-LIN Industrial',
  url: BASE_URL,
  inLanguage: ['en', 'zh-TW'],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansTC.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/banner/logo4.png" />
        <link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt" />
      </head>
      <body className="min-h-screen bg-white font-sans text-metal-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
