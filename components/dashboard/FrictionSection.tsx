'use client';

import { useState } from 'react';
import type { FrictionNode, NodeValue } from '@/lib/sales-model/types';

interface Props {
  frictionNodes: FrictionNode[];
  nodesData: Record<string, NodeValue>;
  editMode: boolean;
  onChange: (nodeId: string, update: Partial<NodeValue>) => void;
  isZh: boolean;
}

function formatValue(val: number | string | boolean | null | undefined): string {
  if (val == null) return '--';
  return String(val);
}

export default function FrictionSection({
  frictionNodes,
  nodesData,
  editMode,
  onChange,
  isZh,
}: Props) {
  const [open, setOpen] = useState(false);

  const collected = frictionNodes.filter(
    (fn) => nodesData[fn.id]?.raw != null,
  ).length;

  return (
    <section className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-safety-200 bg-safety-500/5 px-4 py-3 text-left shadow-sm hover:border-safety-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`h-4 w-4 text-safety-500 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-safety-700">
            {isZh ? '摩擦力 / 負面因子' : 'Friction / Negative Factors'}
          </span>
        </div>
        <span className="text-xs font-medium text-metal-500">
          {collected}/{frictionNodes.length} {isZh ? '已收集' : 'collected'}
        </span>
      </button>

      {open && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {frictionNodes.map((fn) => {
            const val = nodesData[fn.id] ?? null;
            return (
              <FrictionCard
                key={fn.id}
                friction={fn}
                value={val}
                editMode={editMode}
                onChange={(update) => onChange(fn.id, update)}
                isZh={isZh}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function FrictionCard({
  friction,
  value,
  editMode,
  onChange,
  isZh,
}: {
  friction: FrictionNode;
  value: NodeValue | null;
  editMode: boolean;
  onChange: (update: Partial<NodeValue>) => void;
  isZh: boolean;
}) {
  const [editRaw, setEditRaw] = useState<string>(
    value?.raw != null ? String(value.raw) : '',
  );
  const [editNote, setEditNote] = useState<string>(value?.note ?? '');

  const handleSave = () => {
    const rawVal = editRaw !== '' ? Number(editRaw) : null;
    onChange({
      raw: rawVal,
      corecap: friction.products.includes('corecap') ? rawVal : 0,
      clik: friction.products.includes('clik') ? rawVal : 0,
      note: editNote || undefined,
      source: 'manual',
      confidence: 'medium',
      enteredBy: 'user',
      entryMethod: 'dashboard_edit',
    });
  };

  // Penalty range display
  const penaltyLabel = `${(friction.range[0] * 100).toFixed(0)}% ~ ${(friction.range[1] * 100).toFixed(0)}%`;

  return (
    <div className="rounded-lg border border-safety-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-mono text-metal-400">{friction.id}</span>{' '}
          <span className="text-sm font-medium text-safety-700">{friction.nameZh}</span>
        </div>
        <span className="shrink-0 rounded-full bg-safety-500/10 px-2 py-0.5 text-xs font-medium text-safety-600">
          {penaltyLabel}
        </span>
      </div>

      <div className="mt-1 text-xs text-metal-400">
        {isZh ? '影響' : 'Effect'}: {friction.effect} |{' '}
        {isZh ? '產品' : 'Products'}: {friction.products.join(', ')}
      </div>

      {editMode ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <label className="w-20 text-xs font-medium text-steel-600">
              {isZh ? '嚴重度 (0-100)' : 'Severity (0-100)'}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={editRaw}
              onChange={(e) => setEditRaw(e.target.value)}
              className="flex-1 rounded border border-metal-300 bg-white px-2 py-1 text-sm focus:border-steel-500 focus:outline-none"
              placeholder="0-100"
            />
          </div>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows={1}
            className="w-full rounded border border-metal-300 bg-white px-2 py-1 text-xs focus:border-steel-500 focus:outline-none"
            placeholder={isZh ? '備註...' : 'Note...'}
          />
          <button
            onClick={handleSave}
            className="rounded bg-brass-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brass-600 transition-colors"
          >
            {isZh ? '儲存' : 'Save'}
          </button>
        </div>
      ) : (
        <div className="mt-2 text-xs text-steel-600">
          <span className="font-medium">{isZh ? '值' : 'Value'}:</span>{' '}
          {formatValue(value?.raw)}
          {value?.note && (
            <p className="mt-1 text-metal-400">{value.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
