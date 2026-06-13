import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import salesModelConfig from '@/data/dashboards/sales-model-config.json';
import salesModelNodes from '@/data/dashboards/sales-model-nodes.json';
import DashboardContent from './dashboard-content';
import type { SalesModelConfig, SalesModelNodes } from '@/lib/sales-model/types';
import { reportsAuthorized } from '../auth';
import ReportsPinForm from '../ReportsPinForm';

// Generic metadata only — do NOT leak the report topic in <title>/metadata to
// unauthenticated visitors (body is gated, but metadata renders pre-auth).
// generateStaticParams removed: reportsAuthorized() reads cookies() → dynamic.
export const metadata: Metadata = {
  title: '內部報告 · Internal Reports',
  robots: { index: false, follow: false },
};

export default async function SalesModelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await reportsAuthorized())) return <ReportsPinForm isZh={locale === 'zh-TW'} />;

  return (
    <DashboardContent
      config={salesModelConfig as unknown as SalesModelConfig}
      initialNodes={salesModelNodes as unknown as SalesModelNodes}
      locale={locale}
    />
  );
}
