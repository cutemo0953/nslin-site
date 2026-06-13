'use client';

import { useMemo } from 'react';
import { XMarkIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { Link } from '@/i18n/navigation';
import { useRfq } from '@/lib/rfq';
import ContactForm, { type ContactFormLabels } from '@/app/[locale]/(site)/contact/ContactForm';

export interface QuoteItem {
  sku: string;
  family: string;
  name: string;
  valveType: string;
  rimHoleDiameter: string;
  effectiveLength: string;
  material: string;
}

export interface QuoteListLabels {
  empty: string;
  emptyCta: string;
  count: string; // contains {count}
  clear: string;
  remove: string;
  formHeading: string;
}

export default function QuoteList({
  catalog,
  labels,
  formLabels,
}: {
  catalog: QuoteItem[];
  labels: QuoteListLabels;
  formLabels: ContactFormLabels;
}) {
  const { skus, remove, clear } = useRfq();

  const bySku = useMemo(() => new Map(catalog.map((c) => [c.sku, c])), [catalog]);
  // Preserve the order items were added; skip any sku no longer in the catalog.
  const items = useMemo(
    () => skus.map((s) => bySku.get(s)).filter((x): x is QuoteItem => Boolean(x)),
    [skus, bySku],
  );

  if (skus.length === 0) {
    return (
      <div className="rounded-xl border border-metal-200 bg-steel-50 p-10 text-center">
        <ClipboardDocumentListIcon className="mx-auto mb-3 h-10 w-10 text-metal-400" aria-hidden="true" />
        <p className="mb-4 text-metal-700">{labels.empty}</p>
        <Link
          href="/cross-reference"
          className="inline-block rounded-lg bg-steel-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-steel-700"
        >
          {labels.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Selected items */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-metal-600">{labels.count.replace('{count}', String(items.length))}</p>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-metal-500 underline hover:text-steel-700"
          >
            {labels.clear}
          </button>
        </div>
        <ul className="divide-y divide-metal-100 overflow-hidden rounded-lg border border-metal-200">
          {items.map((it) => {
            const specs = [it.valveType, it.rimHoleDiameter, it.effectiveLength, it.material].filter(Boolean);
            return (
              <li key={it.sku} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${it.family}/${it.sku.toLowerCase()}`}
                    className="font-mono font-semibold text-steel-700 hover:underline"
                  >
                    {it.sku}
                  </Link>
                  <div className="truncate text-sm text-metal-600">{it.name}</div>
                  {specs.length > 0 && (
                    <div className="mt-1 text-xs text-metal-500">{specs.join(' · ')}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.sku)}
                  aria-label={`${labels.remove} ${it.sku}`}
                  className="shrink-0 rounded-md p-1.5 text-metal-400 hover:bg-metal-100 hover:text-steel-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Inquiry form — submits all part numbers in one email; clears cart on success */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-steel-900">{labels.formHeading}</h2>
        <div className="grid gap-8 md:grid-cols-1">
          <ContactForm labels={formLabels} skus={skus} onSubmitted={clear} />
        </div>
      </div>
    </div>
  );
}
