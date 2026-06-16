'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Script from 'next/script';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { submitInquiry, type InquiryState } from './actions';
import type { RfqItem } from '@/lib/rfq';

const SALES_EMAIL = 'nslin@nslin.com.tw';

const COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'GB', 'US', 'TW', 'JP'] as const;

// Part numbers from our catalog links only; reject anything else from the URL.
const SKU_RE = /^[A-Za-z0-9()\/. -]{1,40}$/;

// Cloudflare Turnstile site key — PUBLIC (rendered in the page as data-sitekey),
// so safe to commit. Durable default; env override allowed for other environments.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAADlkytdAwpUddKaE';

export interface ContactFormLabels {
  company: string;
  name: string;
  email: string;
  country: string;
  inquiryType: string;
  volume: string;
  message: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  errorTitle: string;
  errorBody: string;
  errorMailtoCta: string;
  invalidBody: string;
  rateLimitedBody: string;
  countryOther: string;
  rfq: string;
  sample: string;
  custom: string;
}

const initialState: InquiryState = { status: 'idle' };

const inputClass =
  'w-full rounded-lg border border-metal-300 px-3 py-2 text-base focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none';

export default function ContactForm({
  labels,
  items,
  onSubmitted,
}: {
  labels: ContactFormLabels;
  items?: RfqItem[];
  onSubmitted?: () => void;
}) {
  const locale = useLocale();
  const isZh = locale === 'zh-TW';
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const rawSku = useSearchParams().get('sku') ?? '';
  const urlSku = SKU_RE.test(rawSku) ? rawSku : '';
  const cartItems = items ?? [];
  // single-part prefill (from /contact?sku=) only when NOT in RFQ-cart mode.
  const sku = cartItems.length === 0 ? urlSku : '';
  const [values, setValues] = useState({
    company: '',
    name: '',
    email: '',
    country: '',
    inquiryType: 'rfq',
    volume: '',
    message: sku ? (isZh ? `詢價料號：${sku}\n` : `RFQ for part no.: ${sku}\n`) : '',
  });

  // Clear the RFQ cart (or any parent state) once the inquiry is sent.
  useEffect(() => {
    if (state.status === 'sent') onSubmitted?.();
  }, [state.status, onSubmitted]);

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  if (state.status === 'sent') {
    return (
      <div className="md:col-span-2 rounded-lg border border-cert-500/40 bg-cert-500/10 p-6">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-8 w-8 text-cert-500" aria-hidden="true" />
          <div>
            <div className="font-semibold text-steel-900">{labels.successTitle}</div>
            <p className="text-sm text-metal-700">{labels.successBody}</p>
          </div>
        </div>
      </div>
    );
  }

  const mailtoHref = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(
    `[${values.inquiryType.toUpperCase()}] ${values.company}${cartItems.length ? ` — ${cartItems.length} parts` : ''}`,
  )}&body=${encodeURIComponent(
    [
      `Company: ${values.company}`,
      `Contact: ${values.name}`,
      `Email: ${values.email}`,
      `Country: ${values.country}`,
      `Estimated annual volume: ${values.volume || '-'}`,
      // Keep the cart parts (with quantities) in the manual-email fallback too,
      // else a send failure would lose the user's selected RFQ items.
      ...(cartItems.length
        ? ['', `Quote list (${cartItems.length}): ${cartItems.map((i) => `${i.sku} x${i.qty}`).join(', ')}`]
        : []),
      '',
      values.message,
    ].join('\n'),
  )}`;

  return (
    <form action={formAction} className="md:col-span-2 space-y-4">
      {sku && (
        <div className="inline-flex items-center gap-2 rounded-full bg-steel-50 border border-steel-200 px-4 py-1.5 text-sm">
          <span className="text-metal-600">{isZh ? '詢價產品' : 'Quoting part'}:</span>
          <span className="font-mono font-semibold text-steel-800">{sku}</span>
        </div>
      )}
      {cartItems.length > 0 && (
        <>
          {/* Always-current cart (sku:qty) — the email includes these regardless of the note. */}
          <input
            type="hidden"
            name="skus"
            value={cartItems.map((i) => `${i.sku}:${i.qty}`).join(',')}
          />
          <div className="rounded-lg border border-steel-200 bg-steel-50 px-4 py-3 text-sm">
            <span className="text-metal-600">
              {isZh ? '詢價清單' : 'Quote list'} ({cartItems.length}):
            </span>{' '}
            <span className="font-mono font-semibold text-steel-800">
              {cartItems.map((i) => `${i.sku}×${i.qty}`).join(', ')}
            </span>
          </div>
        </>
      )}
      {state.status === 'error' && (
        <div role="alert" className="rounded-lg border border-brass-400/60 bg-brass-400/10 p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-brass-500" aria-hidden="true" />
            <div className="text-sm text-metal-700">
              <div className="font-semibold text-steel-900">{labels.errorTitle}</div>
              <p>
                {labels.errorBody}{' '}
                <a href={`mailto:${SALES_EMAIL}`} className="text-steel-600 underline">
                  {SALES_EMAIL}
                </a>
              </p>
              <a href={mailtoHref} className="mt-1 inline-block font-medium text-steel-600 underline">
                {labels.errorMailtoCta}
              </a>
            </div>
          </div>
        </div>
      )}
      {state.status === 'invalid' && (
        <div role="alert" className="rounded-lg border border-brass-400/60 bg-brass-400/10 p-4 text-sm text-metal-700">
          {labels.invalidBody}
        </div>
      )}
      {state.status === 'rate_limited' && (
        <div role="alert" className="rounded-lg border border-brass-400/60 bg-brass-400/10 p-4 text-sm text-metal-700">
          {labels.rateLimitedBody}
        </div>
      )}

      {/* Honeypot — hidden from real users, bots fill it and get silently dropped */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-company" className="mb-1 block text-sm font-medium text-metal-700">
            {labels.company} <span className="text-brass-500" aria-hidden="true">*</span>
          </label>
          <input
            id="inq-company"
            type="text"
            name="company"
            required
            maxLength={200}
            aria-required="true"
            value={values.company}
            onChange={set('company')}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="inq-name" className="mb-1 block text-sm font-medium text-metal-700">
            {labels.name} <span className="text-brass-500" aria-hidden="true">*</span>
          </label>
          <input
            id="inq-name"
            type="text"
            name="name"
            required
            maxLength={200}
            aria-required="true"
            value={values.name}
            onChange={set('name')}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-email" className="mb-1 block text-sm font-medium text-metal-700">
            {labels.email} <span className="text-brass-500" aria-hidden="true">*</span>
          </label>
          <input
            id="inq-email"
            type="email"
            name="email"
            required
            maxLength={254}
            aria-required="true"
            value={values.email}
            onChange={set('email')}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="inq-country" className="mb-1 block text-sm font-medium text-metal-700">
            {labels.country} <span className="text-brass-500" aria-hidden="true">*</span>
          </label>
          <select
            id="inq-country"
            name="country"
            required
            aria-required="true"
            value={values.country}
            onChange={set('country')}
            className={inputClass}
          >
            <option value="">--</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {regionNames.of(c) ?? c}
              </option>
            ))}
            <option value="other">{labels.countryOther}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-type" className="mb-1 block text-sm font-medium text-metal-700">
            {labels.inquiryType} <span className="text-brass-500" aria-hidden="true">*</span>
          </label>
          <select
            id="inq-type"
            name="inquiryType"
            required
            aria-required="true"
            value={values.inquiryType}
            onChange={set('inquiryType')}
            className={inputClass}
          >
            <option value="rfq">{labels.rfq}</option>
            <option value="sample">{labels.sample}</option>
            <option value="custom">{labels.custom}</option>
          </select>
        </div>
        <div>
          <label htmlFor="inq-volume" className="mb-1 block text-sm font-medium text-metal-700">
            {labels.volume}
          </label>
          <select
            id="inq-volume"
            name="volume"
            value={values.volume}
            onChange={set('volume')}
            className={inputClass}
          >
            <option value="">--</option>
            <option value="lt1k">&lt; 1,000</option>
            <option value="1k-10k">1,000 - 10,000</option>
            <option value="10k-50k">10,000 - 50,000</option>
            <option value="gt50k">&gt; 50,000</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="inq-message" className="mb-1 block text-sm font-medium text-metal-700">
          {labels.message}
        </label>
        <textarea
          id="inq-message"
          name="message"
          rows={4}
          maxLength={5000}
          value={values.message}
          onChange={set('message')}
          className={inputClass}
        />
      </div>

      {TURNSTILE_SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
            async
            defer
          />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
        </>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-steel-600 px-6 py-3 font-semibold text-white hover:bg-steel-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel-600"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
