import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    // OpenNext on Cloudflare Workers doesn't emit /_next/image handler by default.
    // Raw images in /public are already reasonably sized (~100KB each).
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
