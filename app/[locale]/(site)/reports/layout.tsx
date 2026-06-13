import { cookies } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { REPORTS_COOKIE, getExpectedDigest } from './auth';
import ReportsPinForm from './ReportsPinForm';

// Internal market-intel dashboards: PIN-gated, never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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

  // Fail closed: no REPORTS_PIN configured → gate stays locked.
  const expected = await getExpectedDigest();
  const cookie = (await cookies()).get(REPORTS_COOKIE)?.value;
  const authorized = Boolean(expected) && cookie === expected;

  if (!authorized) {
    return <ReportsPinForm isZh={isZh} />;
  }

  return <>{children}</>;
}
