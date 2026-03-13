import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';

function Header() {
  const t = useTranslations('nav');

  return (
    <header className="border-b border-metal-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-steel-600 text-white font-bold text-lg">
            NS
          </div>
          <div>
            <div className="font-bold text-steel-900 text-lg leading-tight">N.S.-LIN</div>
            <div className="text-xs text-metal-500 leading-tight">Tire Valve Manufacturer</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-metal-700">
          <Link href="/products" className="hover:text-steel-600 transition-colors">
            {t('products')}
          </Link>
          <Link href="/guides/valve-standards" className="hover:text-steel-600 transition-colors">
            {t('guides')}
          </Link>
          <Link href="/about" className="hover:text-steel-600 transition-colors">
            {t('about')}
          </Link>
          <Link
            href="/contact"
            className="rounded-lg bg-steel-600 px-4 py-2 text-white hover:bg-steel-700 transition-colors"
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
    <footer className="border-t border-metal-200 bg-metal-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company info */}
          <div>
            <h3 className="font-bold text-steel-900 mb-3">{t('company')}</h3>
            <p className="text-sm text-metal-600 mb-2">{t('address')}</p>
            <p className="text-sm text-metal-600">
              Tel: {t('phone')} | {t('email')}
            </p>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="font-bold text-steel-900 mb-3">{t('iso')}</h3>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-cert-500/10 px-3 py-1 text-xs font-medium text-cert-600">
                ISO 9001:2015
              </span>
              <span className="inline-flex items-center rounded-full bg-cert-500/10 px-3 py-1 text-xs font-medium text-cert-600">
                AFAQ
              </span>
            </div>
          </div>

          {/* Standards */}
          <div>
            <h3 className="font-bold text-steel-900 mb-3">Standards</h3>
            <div className="flex gap-2 flex-wrap">
              {['TRA', 'ETRTO', 'JATMA'].map((std) => (
                <span
                  key={std}
                  className="inline-flex items-center rounded-full bg-steel-100 px-3 py-1 text-xs font-medium text-steel-700"
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-metal-200 pt-6 text-center text-xs text-metal-500">
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
