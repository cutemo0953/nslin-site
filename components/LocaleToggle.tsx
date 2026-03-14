'use client';

import { usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function LocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const next = locale === 'en' ? 'zh-TW' : 'en';

  return (
    <Link
      href={pathname}
      locale={next}
      className="flex items-center gap-1.5 rounded-lg border border-steel-700 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:border-steel-500 transition-colors"
      aria-label="Switch language"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      {locale === 'en' ? '中文' : 'EN'}
    </Link>
  );
}
