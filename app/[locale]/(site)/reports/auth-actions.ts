'use server';

import { cookies, headers } from 'next/headers';
import { REPORTS_COOKIE, pinDigest, getExpectedDigest, getReportsEnv, timingSafeEqual } from './auth';

export interface ReportsAuthState {
  status: 'idle' | 'ok' | 'wrong' | 'unconfigured' | 'rate_limited';
}

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export async function verifyReportsPin(
  _prev: ReportsAuthState,
  formData: FormData,
): Promise<ReportsAuthState> {
  const expected = await getExpectedDigest();
  if (!expected) return { status: 'unconfigured' };

  // Same per-IP limiter as the contact form, separate key bucket — 5 PIN
  // attempts per minute kills brute force. Skipped when binding absent (dev).
  const env = await getReportsEnv();
  const limiter = env.INQUIRY_RATE_LIMITER as RateLimiter | undefined;
  if (limiter && typeof limiter.limit === 'function') {
    try {
      const ip = (await headers()).get('cf-connecting-ip') ?? 'unknown';
      const { success } = await limiter.limit({ key: `reports-pin:${ip}` });
      if (!success) return { status: 'rate_limited' };
    } catch (e) {
      // Fail CLOSED: an auth rate limiter that errors must reject the attempt,
      // not fall through to PIN verification (else forcing the limiter to throw
      // grants unlimited brute-force tries). Low-stakes outage = re-try later.
      console.error('verifyReportsPin: rate limiter failed', e);
      return { status: 'rate_limited' };
    }
  }

  const pin = String(formData.get('pin') ?? '');
  if (!pin || pin.length > 100) return { status: 'wrong' };

  if (!timingSafeEqual(await pinDigest(pin), expected)) return { status: 'wrong' };

  (await cookies()).set(REPORTS_COOKIE, expected, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return { status: 'ok' };
}
