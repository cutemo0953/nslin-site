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
  material: string;
  finish: string;
  valveType: string;
  rimHoleDiameter: string;
  effectiveLength: string;
  installationType: string;
  valveCore: string;
  standards: string;
  application: string;
}

export type SpecKey = Exclude<keyof QuoteItem, 'sku' | 'family' | 'name'>;

export interface QuoteListLabels {
  empty: string;
  emptyCta: string;
  count: string; // contains {count}
  clear: string;
  remove: string;
  qty: string;
  formHeading: string;
}

export default function QuoteList({
  catalog,
  specRows,
  labels,
  formLabels,
}: {
  catalog: QuoteItem[];
  specRows: { key: SpecKey; label: string }[];
  labels: QuoteListLabels;
  formLabels: ContactFormLabels;
}) {
  const { items: cart, remove, setQty, clear } = useRfq();

  const bySku = useMemo(() => new Map(catalog.map((c) => [c.sku, c])), [catalog]);
  // Preserve add order; drop any sku no longer in the catalog. Carry the qty.
  const rows = useMemo(
    () =>
      cart
        .map((c) => {
          const product = bySku.get(c.sku);
          return product ? { ...product, qty: c.qty } : null;
        })
        .filter((x): x is QuoteItem & { qty: number } => Boolean(x)),
    [cart, bySku],
  );

  // Only show spec rows that at least one selected item actually has.
  const visibleSpecs = useMemo(
    () => specRows.filter((s) => rows.some((r) => r[s.key])),
    [specRows, rows],
  );

  if (rows.length === 0) {
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

  const qtyInput = (sku: string, qty: number) => (
    <input
      type="number"
      min={1}
      inputMode="numeric"
      value={qty}
      onChange={(e) => setQty(sku, Number(e.target.value))}
      aria-label={`${labels.qty} ${sku}`}
      className="w-24 rounded-md border border-metal-300 px-2 py-1 text-sm focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none"
    />
  );

  const removeBtn = (sku: string) => (
    <button
      type="button"
      onClick={() => remove(sku)}
      aria-label={`${labels.remove} ${sku}`}
      className="rounded-md p-1 text-metal-400 hover:bg-metal-100 hover:text-steel-700"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-metal-600">{labels.count.replace('{count}', String(rows.length))}</p>
        <button type="button" onClick={clear} className="text-sm font-medium text-metal-500 underline hover:text-steel-700">
          {labels.clear}
        </button>
      </div>

      {/* Mobile (<768px): stacked cards with qty */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <div key={r.sku} className="rounded-lg border border-metal-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/products/${r.family}/${r.sku.toLowerCase()}`} className="font-mono font-semibold text-steel-700 hover:underline">
                {r.sku}
              </Link>
              {removeBtn(r.sku)}
            </div>
            <div className="mt-0.5 text-xs text-metal-500">{r.name}</div>
            {visibleSpecs.length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {visibleSpecs.map((s) =>
                  r[s.key] ? (
                    <div key={s.key}>
                      <dt className="text-metal-400">{s.label}</dt>
                      <dd className="text-metal-700">{r[s.key]}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-metal-500">{labels.qty}</span>
              {qtyInput(r.sku, r.qty)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop (≥768px): Apple-style comparison matrix (specs as rows, parts as columns) */}
      <div className="hidden overflow-x-auto rounded-lg border border-metal-200 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-metal-200 bg-steel-50">
              <th className="sticky left-0 z-10 bg-steel-50 px-3 py-2.5" />
              {rows.map((r) => (
                <th key={r.sku} className="min-w-[10rem] px-3 py-2.5 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/products/${r.family}/${r.sku.toLowerCase()}`} className="font-mono font-semibold text-steel-700 hover:underline">
                      {r.sku}
                    </Link>
                    {removeBtn(r.sku)}
                  </div>
                  <div className="mt-0.5 max-w-[12rem] truncate text-xs font-normal text-metal-500">{r.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-metal-100">
            <tr>
              <td className="sticky left-0 z-10 bg-white px-3 py-2.5 text-xs uppercase tracking-wide text-metal-500">
                {labels.qty}
              </td>
              {rows.map((r) => (
                <td key={r.sku} className="px-3 py-2.5">{qtyInput(r.sku, r.qty)}</td>
              ))}
            </tr>
            {visibleSpecs.map((s) => (
              <tr key={s.key}>
                <td className="sticky left-0 z-10 bg-white px-3 py-2.5 text-xs uppercase tracking-wide text-metal-500">
                  {s.label}
                </td>
                {rows.map((r) => (
                  <td key={r.sku} className="px-3 py-2.5 text-metal-700">{r[s.key] || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit — one email with every part + quantity; clears the cart on success.
          Pass the resolved rows (not raw cart) so the email matches what's shown
          and any discontinued/unknown sku is dropped. */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-steel-900">{labels.formHeading}</h2>
        <ContactForm
          labels={formLabels}
          items={rows.map((r) => ({ sku: r.sku, qty: r.qty }))}
          onSubmitted={clear}
        />
      </div>
    </div>
  );
}
