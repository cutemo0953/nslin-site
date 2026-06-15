import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const CANONICAL_HOST = 'nslin.com';
// Legacy/alias hosts 301 to the canonical apex.
const REDIRECT_HOSTS = new Set(['www.nslin.com', 'nslin-site.tom-e31.workers.dev']);

// Baseline security headers (Workers path — next.config headers don't apply).
// CSP is shipped report-only first: an observation pass that blocks nothing.
// 'unsafe-inline' covers the site's inline JSON-LD <script> and inline styles,
// so legitimate page rendering produces zero violations; only genuinely
// unexpected sources get reported to /api/csp-report. No analytics on this site.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "frame-src 'self' https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  'report-uri /api/csp-report',
  'report-to csp-endpoint',
].join('; ');

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Report-only observation pass (non-enforcing). Modern delivery via
  // Reporting-Endpoints (report-to) + legacy report-uri for older browsers.
  response.headers.set('Content-Security-Policy-Report-Only', CSP_REPORT_ONLY);
  response.headers.set('Reporting-Endpoints', 'csp-endpoint="/api/csp-report"');
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
