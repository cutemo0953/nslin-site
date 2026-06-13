import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { reportsAuthorized } from './auth';
import ReportsPinForm from './ReportsPinForm';

// Internal market-intel dashboards: PIN-gated, never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// MUST stay dynamic: the gate reads cookies() per request. Without this, at
// build time REPORTS_PIN is unset → reportsAuthorized() returns false BEFORE
// reaching cookies() → Next prerenders a static locked shell → at runtime the
// cookie check never re-runs → valid PIN holders are permanently locked out.
export const dynamic = 'force-dynamic';

export default async function ReportsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh-TW';

  // Defense-in-depth layer (pages also gate themselves). Single source of the
  // cookie/PIN check; fail-closed when REPORTS_PIN is unset, timing-safe compare.
  if (!(await reportsAuthorized())) {
    return <ReportsPinForm isZh={isZh} />;
  }

  return <>{children}</>;
}
