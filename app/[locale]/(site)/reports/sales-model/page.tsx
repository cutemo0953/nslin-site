import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import salesModelConfig from '@/data/dashboards/sales-model-config.json';
import salesModelNodes from '@/data/dashboards/sales-model-nodes.json';
import DashboardContent from './dashboard-content';
import type { SalesModelConfig, SalesModelNodes } from '@/lib/sales-model/types';

export async function generateStaticParams() {
  return [{ locale: 'zh-TW' }, { locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '銷量推估模型' : 'Sales Estimation Model',
    robots: { index: false, follow: false },
  };
}

export default async function SalesModelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DashboardContent
      config={salesModelConfig as unknown as SalesModelConfig}
      initialNodes={salesModelNodes as unknown as SalesModelNodes}
      locale={locale}
    />
  );
}
