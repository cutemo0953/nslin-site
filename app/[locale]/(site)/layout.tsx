import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import LocaleToggle from '@/components/LocaleToggle';

function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const isZh = locale === 'zh-TW';

  return (
    <header className="sticky top-0 z-50 bg-steel-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/banner/logo4.png"
            alt="N.S.-LIN"
            className="h-9 w-auto"
          />
          <div>
            <div className="font-bold text-white text-lg leading-tight">
              {isZh ? '奕道實業' : 'N.S.-LIN'}
            </div>
            <div className="text-xs text-steel-300 leading-tight">
              {isZh ? 'N.S.-LIN Industrial' : 'Tire Valve Manufacturer'}
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/90">
          <Link href="/products" className="hover:text-white transition-colors">
            {t('products')}
          </Link>
          <Link href="/guides" className="hover:text-white transition-colors">
            {t('guides')}
          </Link>
          <Link href="/blog" className="hover:text-white transition-colors">
            {isZh ? '技術文章' : 'Blog'}
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            {t('about')}
          </Link>
          <LocaleToggle />
          <Link
            href="/contact"
            className="rounded-lg bg-brass-400 px-4 py-2 text-steel-900 font-semibold hover:bg-brass-300 transition-colors"
          >
            {t('contact')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-steel-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company info */}
          <div>
            <h3 className="font-bold text-white mb-3">{t('company')}</h3>
            <p className="text-sm text-steel-300 mb-2">{t('address')}</p>
            <p className="text-sm text-steel-300">
              Tel: {t('phone')} | {t('email')}
            </p>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="font-bold text-white mb-3">{t('iso')}</h3>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-cert-500/20 px-3 py-1 text-xs font-medium text-cert-400">
                ISO 9001:2015
              </span>
              <span className="inline-flex items-center rounded-full bg-cert-500/20 px-3 py-1 text-xs font-medium text-cert-400">
                AFAQ
              </span>
            </div>
          </div>

          {/* Standards */}
          <div>
            <h3 className="font-bold text-white mb-3">Standards</h3>
            <div className="flex gap-2 flex-wrap">
              {['TRA', 'ETRTO', 'JATMA'].map((std) => (
                <span
                  key={std}
                  className="inline-flex items-center rounded-full bg-steel-800 px-3 py-1 text-xs font-medium text-steel-300"
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-steel-800 pt-6 text-center text-xs text-steel-400">
          &copy; {new Date().getFullYear()} N.S.-LIN Industrial Co., Ltd. {t('copyright')}
        </div>
      </div>
    </footer>
  );
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
