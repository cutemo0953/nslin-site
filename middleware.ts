import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const CANONICAL_HOST = 'nslin.com';
// Legacy/alias hosts 301 to the canonical apex.
const REDIRECT_HOSTS = new Set(['www.nslin.com', 'nslin-site.tom-e31.workers.dev']);

// Baseline security headers (Workers path — next.config headers don't apply).
// Full CSP deliberately deferred pending a report-only observation pass.
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  if (host && REDIRECT_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }
  return withSecurityHeaders(intlMiddleware(request));
}

export const config = {
  matcher: [
    '/',
    '/(en|zh-TW)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/feed.xml',
  ],
};
