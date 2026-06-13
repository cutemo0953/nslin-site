'use client';

import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { Link } from '@/i18n/navigation';
import { useRfq } from '@/lib/rfq';

// Floating RFQ-list shortcut. Hidden when the cart is empty.
export default function QuoteBadge({ label }: { label: string }) {
  const { count } = useRfq();
  if (count === 0) return null;

  return (
    <Link
      href="/quote"
      aria-label={`${label} (${count})`}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-steel-700 px-4 py-2.5 font-semibold text-white shadow-lg transition-colors hover:bg-steel-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-400"
    >
      <ClipboardDocumentListIcon className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brass-400 px-1.5 text-xs font-bold text-steel-900">
        {count}
      </span>
    </Link>
  );
}
