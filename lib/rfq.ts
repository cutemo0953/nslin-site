'use client';

// RFQ "cart": collect part numbers + quantities to quote, submit one email.
// Client-only, persisted to localStorage, synced across components/tabs via a
// window event. Uses useSyncExternalStore (the idiomatic external-store API).
import { useCallback, useSyncExternalStore } from 'react';

export interface RfqItem {
  sku: string;
  qty: number;
}

const KEY = 'nslin_rfq';
const EVENT = 'nslin-rfq-change';
const MAX_ITEMS = 40;
const MAX_QTY = 9_999_999;
// Part numbers from our own catalog only; reject anything else from storage.
const SKU_RE = /^[A-Za-z0-9()/. -]{1,40}$/;

const EMPTY: RfqItem[] = [];

function clampQty(n: unknown): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(q, MAX_QTY);
}

function read(): RfqItem[] {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return EMPTY;
    const out: RfqItem[] = [];
    for (const el of raw) {
      // Accept both the legacy string[] shape and the {sku, qty} shape.
      const sku = typeof el === 'string' ? el : el?.sku;
      if (typeof sku !== 'string' || !SKU_RE.test(sku)) continue;
      if (out.some((x) => x.sku === sku)) continue;
      out.push({ sku, qty: typeof el === 'string' ? 1 : clampQty(el?.qty) });
      if (out.length >= MAX_ITEMS) break;
    }
    return out;
  } catch {
    return EMPTY;
  }
}

function write(items: RfqItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
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

// getSnapshot must return a STABLE reference when unchanged, or useSyncExternalStore
// loops. Cache against the raw stored string.
let cachedRaw = '';
let cachedItems: RfqItem[] = EMPTY;
function getSnapshot(): RfqItem[] {
  const raw = typeof window === 'undefined' ? '[]' : localStorage.getItem(KEY) || '[]';
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = read();
  }
  return cachedItems;
}

function getServerSnapshot(): RfqItem[] {
  return EMPTY;
}

export function useRfq() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((sku: string) => {
    if (!SKU_RE.test(sku)) return;
    const cur = read();
    if (cur.some((x) => x.sku === sku) || cur.length >= MAX_ITEMS) return;
    write([...cur, { sku, qty: 1 }]);
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    const cur = read();
    if (!cur.some((x) => x.sku === sku)) return;
    write(cur.map((x) => (x.sku === sku ? { ...x, qty: clampQty(qty) } : x)));
  }, []);

  const remove = useCallback((sku: string) => write(read().filter((x) => x.sku !== sku)), []);
  const clear = useCallback(() => write([]), []);

  return {
    items,
    count: items.length,
    has: (s: string) => items.some((x) => x.sku === s),
    add,
    setQty,
    remove,
    clear,
  };
}
