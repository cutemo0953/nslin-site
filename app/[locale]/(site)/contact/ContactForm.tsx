'use client';

import { useActionState, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { submitInquiry, type InquiryState } from './actions';

const SALES_EMAIL = 'nslin@nslin.com.tw';

const COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'GB', 'US', 'TW', 'JP'] as const;
const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  GB: 'United Kingdom',
  US: 'United States',
  TW: 'Taiwan',
  JP: 'Japan',
};

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
  rfq: string;
  sample: string;
  custom: string;
}

const initialState: InquiryState = { status: 'idle' };

const inputClass =
  'w-full rounded-lg border border-metal-300 px-3 py-2 text-base focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none';

export default function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const [values, setValues] = useState({
    company: '',
    name: '',
    email: '',
    country: '',
    inquiryType: 'rfq',
    volume: '',
    message: '',
  });

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
    `[${values.inquiryType.toUpperCase()}] ${values.company}`,
  )}&body=${encodeURIComponent(
    [
      `Company: ${values.company}`,
      `Contact: ${values.name}`,
      `Email: ${values.email}`,
      `Country: ${values.country}`,
      `Estimated annual volume: ${values.volume || '-'}`,
      '',
      values.message,
    ].join('\n'),
  )}`;

  return (
    <form action={formAction} className="md:col-span-2 space-y-4">
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
                {COUNTRY_NAMES[c]}
              </option>
            ))}
            <option value="other">Other</option>
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
          value={values.message}
          onChange={set('message')}
          className={inputClass}
        />
      </div>

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
