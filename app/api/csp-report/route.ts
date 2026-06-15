import { NextResponse } from 'next/server';

// CSP violation report sink (report-only observation pass).
// Browsers POST reports as application/csp-report (report-uri) or
// application/reports+json (report-to) — shapes differ, so we read raw text
// and never assume JSON. Reports land in Workers/Vercel logs via console.warn.
// No auth: this only ingests browser-generated violation reports.
export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.warn('[CSP-REPORT]', body.slice(0, 4000));
  } catch (err) {
    console.warn('[CSP-REPORT] failed to read report body', err);
  }
  return new NextResponse(null, { status: 204 });
}
