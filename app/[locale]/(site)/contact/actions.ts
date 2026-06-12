'use server';

export interface InquiryState {
  status: 'idle' | 'sent' | 'invalid' | 'error';
}

const SALES_EMAIL = 'nslin@nslin.com.tw';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RESEND_API_KEY is a Worker secret (wrangler secret put RESEND_API_KEY).
// On Cloudflare it lives on the request env; process.env covers local dev.
async function getResendKey(): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    const key = (env as Record<string, unknown>).RESEND_API_KEY;
    if (typeof key === 'string' && key) return key;
  } catch {
    // Not running on Cloudflare (local next dev/build) — fall through.
  }
  return process.env.RESEND_API_KEY;
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get('website')) return { status: 'sent' };

  const field = (name: string) => String(formData.get(name) ?? '').trim();
  const company = field('company');
  const name = field('name');
  const email = field('email');
  const country = field('country');
  const inquiryType = field('inquiryType');
  const volume = field('volume');
  const message = field('message');

  if (!company || !name || !country || !inquiryType || !EMAIL_RE.test(email)) {
    return { status: 'invalid' };
  }

  const apiKey = await getResendKey();
  if (!apiKey) {
    console.error('submitInquiry: RESEND_API_KEY not configured');
    return { status: 'error' };
  }

  const body = [
    `Company: ${company}`,
    `Contact: ${name}`,
    `Email: ${email}`,
    `Country: ${country}`,
    `Inquiry type: ${inquiryType}`,
    `Estimated annual volume: ${volume || '-'}`,
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
        bcc: ['tom@denovortho.com'],
        reply_to: email,
        subject: `[${inquiryType.toUpperCase()}] ${company} (${country})`,
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
