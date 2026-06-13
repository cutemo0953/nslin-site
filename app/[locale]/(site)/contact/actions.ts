'use server';

import { headers } from 'next/headers';

export interface InquiryState {
  status: 'idle' | 'sent' | 'invalid' | 'rate_limited' | 'error';
}

const SALES_EMAIL = 'nslin@nslin.com.tw';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INQUIRY_TYPES = ['rfq', 'sample', 'custom'];
const COUNTRY_CODES = ['DE', 'FR', 'IT', 'ES', 'NL', 'GB', 'US', 'TW', 'JP', 'other'];
const VOLUMES = ['', 'lt1k', '1k-10k', '10k-50k', 'gt50k'];
const MAX_LEN = { company: 200, name: 200, email: 254, message: 5000 } as const;
// RFQ cart items "sku:qty,sku:qty" (own catalog only); cap to bound the email.
const SKU_RE = /^[A-Za-z0-9()/. -]{1,40}$/;
const MAX_SKUS = 40;
const MAX_QTY = 9_999_999;

function parseQuoteItems(raw: string): Array<{ sku: string; qty: number }> {
  const out: Array<{ sku: string; qty: number }> = [];
  for (const part of raw.split(',')) {
    const [skuRaw, qtyRaw] = part.split(':');
    const sku = (skuRaw ?? '').trim();
    if (!SKU_RE.test(sku) || out.some((x) => x.sku === sku)) continue;
    let qty = Math.floor(Number(qtyRaw));
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    out.push({ sku, qty: Math.min(qty, MAX_QTY) });
    if (out.length >= MAX_SKUS) break;
  }
  return out;
}

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

// RESEND_API_KEY is a Worker secret (wrangler secret put RESEND_API_KEY);
// INQUIRY_BCC and the rate limiter come from wrangler.jsonc. process.env
// covers local dev.
async function getEnv(): Promise<Record<string, unknown>> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    // Not running on Cloudflare (local next dev/build).
    return process.env as Record<string, unknown>;
  }
}

function isControlChar(code: number): boolean {
  return code < 32 || code === 127;
}

// Single-line, subject-bearing fields: control chars (incl. CR/LF) become spaces.
function cleanLine(value: string): string {
  let out = '';
  for (const ch of value) {
    out += isControlChar(ch.charCodeAt(0)) ? ' ' : ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

// Multi-line field: keep tab (9) and newline (10), drop other control chars.
function cleanMultiline(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code === 9 || code === 10 || !isControlChar(code)) out += ch;
  }
  return out.trim();
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get('website')) return { status: 'sent' };

  const field = (name: string) => String(formData.get(name) ?? '');
  const company = cleanLine(field('company'));
  const name = cleanLine(field('name'));
  const email = cleanLine(field('email'));
  const country = field('country');
  const inquiryType = field('inquiryType');
  const volume = field('volume');
  const message = cleanMultiline(field('message'));
  const quoteItems = parseQuoteItems(field('skus'));

  if (
    !company ||
    !name ||
    company.length > MAX_LEN.company ||
    name.length > MAX_LEN.name ||
    email.length > MAX_LEN.email ||
    message.length > MAX_LEN.message ||
    !EMAIL_RE.test(email) ||
    !INQUIRY_TYPES.includes(inquiryType) ||
    !COUNTRY_CODES.includes(country) ||
    !VOLUMES.includes(volume)
  ) {
    return { status: 'invalid' };
  }

  const env = await getEnv();

  // Per-IP rate limit (Cloudflare ratelimit binding); honeypot alone is not
  // abuse control. Skipped gracefully when the binding is absent (local dev).
  const limiter = env.INQUIRY_RATE_LIMITER as RateLimiter | undefined;
  if (limiter && typeof limiter.limit === 'function') {
    try {
      const ip = (await headers()).get('cf-connecting-ip') ?? 'unknown';
      const { success } = await limiter.limit({ key: ip });
      if (!success) return { status: 'rate_limited' };
    } catch (e) {
      console.error('submitInquiry: rate limiter failed', e);
    }
  }

  const apiKey = env.RESEND_API_KEY;
  if (typeof apiKey !== 'string' || !apiKey) {
    console.error('submitInquiry: RESEND_API_KEY not configured');
    return { status: 'error' };
  }
  const bcc =
    typeof env.INQUIRY_BCC === 'string' && env.INQUIRY_BCC ? [env.INQUIRY_BCC] : undefined;

  const body = [
    `Company: ${company}`,
    `Contact: ${name}`,
    `Email: ${email}`,
    `Country: ${country}`,
    `Inquiry type: ${inquiryType}`,
    `Estimated annual volume: ${volume || '-'}`,
    ...(quoteItems.length > 0
      ? ['', `Quote list (${quoteItems.length}):`, ...quoteItems.map((i) => `  - ${i.sku} x ${i.qty}`)]
      : []),
    '',
    message || '(no message)',
  ].join('\n');

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'N.S.-LIN Website <notifications@denovortho.com>',
        to: [SALES_EMAIL],
        ...(bcc && { bcc }),
        reply_to: email,
        subject: `[${inquiryType.toUpperCase()}] ${company} (${country})${quoteItems.length > 0 ? ` — ${quoteItems.length} parts` : ''}`,
        text: body,
      }),
    });
    if (!resp.ok) {
      console.error('submitInquiry: Resend failed', resp.status, await resp.text());
      return { status: 'error' };
    }
    return { status: 'sent' };
  } catch (e) {
    console.error('submitInquiry: Resend failed', e);
    return { status: 'error' };
  }
}
