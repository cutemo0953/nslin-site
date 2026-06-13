'use client';

import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRfq } from '@/lib/rfq';

export default function AddToQuoteButton({
  sku,
  labels,
  variant = 'solid',
}: {
  sku: string;
  labels: { add: string; added: string };
  variant?: 'solid' | 'compact';
}) {
  const { has, add, remove } = useRfq();
  const inCart = has(sku);

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => (inCart ? remove(sku) : add(sku))}
        aria-pressed={inCart}
        title={inCart ? labels.added : labels.add}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
          inCart
            ? 'border-cert-500/40 bg-cert-500/10 text-cert-600'
            : 'border-metal-300 text-steel-700 hover:border-steel-400 hover:bg-steel-50'
        }`}
      >
        {inCart ? <CheckIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
        {inCart ? labels.added : labels.add}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (inCart ? remove(sku) : add(sku))}
      aria-pressed={inCart}
      className={`inline-flex items-center gap-2 rounded-lg border px-5 py-3 font-semibold transition-colors ${
        inCart
          ? 'border-cert-500/40 bg-cert-500/10 text-cert-600'
          : 'border-steel-300 text-steel-700 hover:border-steel-400 hover:bg-steel-50'
      }`}
    >
      {inCart ? <CheckIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
      {inCart ? labels.added : labels.add}
    </button>
  );
}
