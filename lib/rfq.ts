'use client';

// RFQ "cart": collect part numbers to quote, submit one email. Client-only,
// persisted to localStorage, synced across components/tabs via a window event.
// Uses useSyncExternalStore (the idiomatic React API for an external store).
import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'nslin_rfq';
const EVENT = 'nslin-rfq-change';
const MAX = 40;
// Part numbers from our own catalog only; reject anything else from storage.
const SKU_RE = /^[A-Za-z0-9()/. -]{1,40}$/;

const EMPTY: string[] = [];

function read(): string[] {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return EMPTY;
    return raw.filter((s) => typeof s === 'string' && SKU_RE.test(s)).slice(0, MAX);
  } catch {
    return EMPTY;
  }
}

function write(skus: string[]) {
  localStorage.setItem(KEY, JSON.stringify(skus));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb); // sync across tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

// getSnapshot must return a STABLE reference when the data is unchanged, or
// useSyncExternalStore loops. Cache against the raw stored string.
let cachedRaw = '';
let cachedSkus: string[] = EMPTY;
function getSnapshot(): string[] {
  const raw = typeof window === 'undefined' ? '[]' : localStorage.getItem(KEY) || '[]';
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSkus = read();
  }
  return cachedSkus;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useRfq() {
  const skus = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((sku: string) => {
    if (!SKU_RE.test(sku)) return;
    const cur = read();
    if (cur.includes(sku) || cur.length >= MAX) return;
    write([...cur, sku]);
  }, []);

  const remove = useCallback((sku: string) => write(read().filter((s) => s !== sku)), []);
  const clear = useCallback(() => write([]), []);

  return {
    skus,
    count: skus.length,
    has: (s: string) => skus.includes(s),
    add,
    remove,
    clear,
  };
}
