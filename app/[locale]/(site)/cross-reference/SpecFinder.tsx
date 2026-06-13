'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';

export interface SpecRow {
  sku: string;
  family: string;
  name: string;
  industryRef: string; // TR-style designation when the SKU itself is one, else ''
  oeCrossReference: string[];
  valveType: string;
  rimHoleDiameter: string;
  effectiveLength: string;
  material: string;
  installationType: string;
  application: string;
  searchText: string; // pre-normalized haystack (sku + name + refs + variants)
}

export interface SpecFinderLabels {
  searchPlaceholder: string;
  application: string;
  allApplications: string;
  valveType: string;
  allValveTypes: string;
  partNo: string;
  industryRef: string;
  type: string;
  rimHole: string;
  length: string;
  material: string;
  resultCount: string; // contains {count}
  noResults: string;
  noResultsCta: string;
}

// Normalize for part-number matching: "tr 413c" / "TR-413C" / "tr413c" all equal.
function norm(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.]/g, '');
}

export default function SpecFinder({
  rows,
  labels,
}: {
  rows: SpecRow[];
  labels: SpecFinderLabels;
}) {
  const [query, setQuery] = useState('');
  const [application, setApplication] = useState('');
  const [valveType, setValveType] = useState('');

  const applications = useMemo(
    () => [...new Set(rows.map((r) => r.application).filter(Boolean))].sort(),
    [rows],
  );
  const valveTypes = useMemo(
    () => [...new Set(rows.map((r) => r.valveType).filter(Boolean))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = norm(query);
    return rows.filter((r) => {
      if (application && r.application !== application) return false;
      if (valveType && r.valveType !== valveType) return false;
      if (q && !r.searchText.includes(q)) return false;
      return true;
    });
  }, [rows, query, application, valveType]);

  const inputClass =
    'rounded-lg border border-metal-300 px-3 py-2 text-base focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none';

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          className={`${inputClass} sm:col-span-1`}
        />
        <select
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          aria-label={labels.application}
          className={inputClass}
        >
          <option value="">{labels.allApplications}</option>
          {applications.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={valveType}
          onChange={(e) => setValveType(e.target.value)}
          aria-label={labels.valveType}
          className={inputClass}
        >
          <option value="">{labels.allValveTypes}</option>
          {valveTypes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-metal-600">
        {labels.resultCount.replace('{count}', String(filtered.length))}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-steel-50 p-8 text-center">
          <p className="mb-3 text-metal-700">{labels.noResults}</p>
          <Link
            href={query ? `/contact?sku=${encodeURIComponent(query.slice(0, 40))}` : '/contact'}
            className="inline-block rounded-lg bg-steel-600 px-5 py-2.5 font-semibold text-white hover:bg-steel-700 transition-colors"
          >
            {labels.noResultsCta}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-metal-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-steel-50 text-xs uppercase tracking-wide text-metal-600">
              <tr>
                <th className="px-3 py-2.5">{labels.partNo}</th>
                <th className="px-3 py-2.5">{labels.industryRef}</th>
                <th className="px-3 py-2.5">{labels.type}</th>
                <th className="px-3 py-2.5">{labels.rimHole}</th>
                <th className="px-3 py-2.5">{labels.length}</th>
                <th className="px-3 py-2.5">{labels.material}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metal-100">
              {filtered.map((r) => (
                <tr key={r.sku} className="hover:bg-steel-50/60">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/products/${r.family}/${r.sku.toLowerCase()}`}
                      className="font-mono font-semibold text-steel-700 hover:underline"
                    >
                      {r.sku}
                    </Link>
                    <div className="mt-0.5 max-w-[260px] truncate text-xs text-metal-500">{r.name}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-steel-800">
                    {r.industryRef || (r.oeCrossReference.length > 0 ? r.oeCrossReference.join(', ') : '—')}
                  </td>
                  <td className="px-3 py-2.5">{r.valveType || '—'}</td>
                  <td className="px-3 py-2.5">{r.rimHoleDiameter || '—'}</td>
                  <td className="px-3 py-2.5">{r.effectiveLength || '—'}</td>
                  <td className="px-3 py-2.5">{r.material || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
