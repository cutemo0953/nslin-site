'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

// Flat product row resolved server-side (locale already applied to `name`).
// The page builds these from getAllProducts() and passes them as props so the
// client island never refetches — it just filters an in-memory list.
export interface ProductRow {
  sku: string;
  family: string;
  name: string; // display name in the active locale
  description: string; // display description in the active locale
  material: string;
  image: string;
  categoryName: string; // display category name in the active locale
  // Pre-normalized haystack: sku + both locale names + category names + material.
  searchText: string;
}

export interface ProductSearchLabels {
  searchPlaceholder: string;
  searchAria: string;
  resultCount: string; // contains {count}
  noResults: string;
  browseCategories: string;
}

// Normalize for matching: lower-case, strip whitespace/dashes/dots so that
// "FVT 40", "fvt-40" and "fvt40" all match the same SKU.
function norm(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.]/g, '');
}

export default function ProductSearch({
  products,
  labels,
}: {
  products: ProductRow[];
  labels: ProductSearchLabels;
}) {
  const [query, setQuery] = useState('');

  // Pre-fill from the hero search (?q=…) after mount. Read via window.location
  // (not useSearchParams) so /products stays statically rendered — the full
  // product list ships in the static HTML for SEO, then the query filters
  // client-side. No Suspense boundary / CSR bailout.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q.trim());
  }, []);

  const filtered = useMemo(() => {
    // Per-term AND match: every whitespace-separated term must be present.
    const terms = query.split(/\s+/).map(norm).filter(Boolean);
    if (terms.length === 0) return products;
    return products.filter((p) => terms.every((t) => p.searchText.includes(t)));
  }, [products, query]);

  return (
    <div>
      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchAria}
          className="w-full max-w-md rounded-lg border border-metal-300 px-4 py-2.5 text-base focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none"
        />
        <p className="mt-2 text-sm text-metal-500">
          {labels.resultCount.replace('{count}', String(filtered.length))}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-steel-50 p-8 text-center">
          <p className="mb-3 text-metal-700">{labels.noResults}</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-steel-600 px-5 py-2.5 font-semibold text-white hover:bg-steel-700 transition-colors"
          >
            {labels.browseCategories}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.sku}
              href={`/products/${p.family}/${p.sku.toLowerCase()}`}
              className="group overflow-hidden rounded-xl border border-metal-200 hover:border-steel-300 hover:shadow-lg transition-all"
            >
              {p.image && (
                <div className="aspect-[4/3] overflow-hidden bg-metal-50">
                  <Image
                    src={p.image}
                    alt={p.sku}
                    width={400}
                    height={300}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-2 text-xs font-mono text-metal-400">{p.sku}</div>
                <h2 className="mb-2 font-semibold text-steel-800 group-hover:text-steel-600">
                  {p.name}
                </h2>
                <p className="text-sm text-metal-600 line-clamp-3">{p.description}</p>
                {p.material && (
                  <div className="mt-3 text-xs text-metal-400">{p.material}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
