// Server-side helpers for the reports PIN gate. NOT a 'use server' module on
// purpose: nothing here may be exposed as a client-callable action — leaking
// getExpectedDigest would let a visitor mint their own auth cookie.

import { cookies } from 'next/headers';

export const REPORTS_COOKIE = 'nslin_reports_auth';

// MUST be called from each report page (not only the layout): App Router
// renders pages in parallel with layouts, so a layout-only gate still ships
// the page's data in the RSC flight payload.
export async function reportsAuthorized(): Promise<boolean> {
  const expected = await getExpectedDigest();
  if (!expected) return false; // fail closed: no PIN configured → locked
  const cookie = (await cookies()).get(REPORTS_COOKIE)?.value;
  return cookie === expected;
}

// REPORTS_PIN is a Worker secret (wrangler secret put REPORTS_PIN);
// process.env covers local dev.
export async function getReportsEnv(): Promise<Record<string, unknown>> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return process.env as Record<string, unknown>;
  }
}

export async function pinDigest(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`nslin-reports:${pin}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getExpectedDigest(): Promise<string | null> {
  const env = await getReportsEnv();
  const pin = env.REPORTS_PIN;
  if (typeof pin !== 'string' || !pin) return null;
  return pinDigest(pin);
}
