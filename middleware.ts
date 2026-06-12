import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const CANONICAL_HOST = 'nslin.com';
// Legacy/alias hosts 301 to the canonical apex.
const REDIRECT_HOSTS = new Set(['www.nslin.com', 'nslin-site.tom-e31.workers.dev']);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  if (host && REDIRECT_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|zh-TW)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/feed.xml',
  ],
};
