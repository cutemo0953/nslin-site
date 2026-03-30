'use client';

import { useState } from 'react';
import type { NodeDefinition, NodeValue } from '@/lib/sales-model/types';

interface Props {
  definition: NodeDefinition;
  value: NodeValue | null;
  editMode: boolean;
  onChange: (update: Partial<NodeValue>) => void;
  isZh: boolean;
}

type FreshnessStatus = 'fresh' | 'stale' | 'outdated' | 'not_collected';

function getStatus(value: NodeValue | null): FreshnessStatus {
  if (!value || value.updatedAt == null) return 'not_collected';
  const days = (Date.now() - new Date(value.updatedAt).getTime()) / 86_400_000;
  if (days <= 7) return 'fresh';
  if (days <= 14) return 'stale';
  return 'outdated';
}

function StatusIcon({ status }: { status: FreshnessStatus }) {
  switch (status) {
    case 'fresh':
      return <span className="text-cert-500" title="Fresh (<7d)">&#x2705;</span>;
    case 'stale':
      return <span className="text-safety-500" title="Stale (7-14d)">&#x26A0;&#xFE0F;</span>;
    case 'outdated':
      return <span className="text-red-500" title="Outdated (>14d)">&#x1F534;</span>;
    case 'not_collected':
    default:
      return <span className="text-metal-300" title="Not collected">&#x2B1C;</span>;
  }
}

function formatDate(dateStr: string | null, isZh: boolean): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatValue(val: number | string | boolean | null | undefined): string {
  if (val == null) return '--';
  if (typeof val === 'number') {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return String(val);
  }
  return String(val);
}

export default function NodeCard({
  definition,
  value,
  editMode,
  onChange,
  isZh,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatus(value);

  // Edit state
  const [editCorecap, setEditCorecap] = useState<string>(
    value?.corecap != null ? String(value.corecap) : '',
  );
  const [editClik, setEditClik] = useState<string>(
    value?.clik != null ? String(value.clik) : '',
  );
  const [editNote, setEditNote] = useState<string>(value?.note ?? '');
  const [editConfidence, setEditConfidence] = useState<string>(
    value?.confidence ?? 'medium',
  );

  const handleSave = () => {
    const corecapVal = editCorecap !== '' ? Number(editCorecap) : null;
    const clikVal = editClik !== '' ? Number(editClik) : null;
    const raw = corecapVal ?? clikVal ?? null;
    onChange({
      raw,
      corecap: corecapVal,
      clik: clikVal,
      note: editNote || undefined,
      confidence: editConfidence as NodeValue['confidence'],
      source: 'manual',
      enteredBy: 'user',
      entryMethod: 'dashboard_edit',
      previousValue: typeof value?.raw === 'boolean' ? String(value.raw) : (value?.raw ?? null),
      changeReason: 'dashboard edit',
    });
  };

  return (
    <div className="rounded-lg border border-metal-200 bg-metal-50 p-3 hover:border-brass-400 transition-colors">
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-mono text-metal-400">#{definition.id}</span>{' '}
          <span className="text-sm font-medium text-steel-700">
            {definition.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <StatusIcon status={status} />
          <span className="text-xs text-metal-400">
            {formatDate(value?.updatedAt ?? null, isZh)}
          </span>
        </div>
      </div>

      {/* ── Values ── */}
      {editMode ? (
        <div className="mt-2 space-y-2">
          {definition.products.includes('corecap') && (
            <div className="flex items-center gap-2">
              <label className="w-16 text-xs font-medium text-steel-600">CoreCap</label>
              <input
                type="number"
                value={editCorecap}
                onChange={(e) => setEditCorecap(e.target.value)}
                className="flex-1 rounded border border-metal-300 bg-white px-2 py-1 text-sm text-steel-800 focus:border-steel-500 focus:outline-none"
                placeholder="--"
              />
            </div>
          )}
          {definition.products.includes('clik') && (
            <div className="flex items-center gap-2">
              <label className="w-16 text-xs font-medium text-steel-600">Clik</label>
              <input
                type="number"
                value={editClik}
                onChange={(e) => setEditClik(e.target.value)}
                className="flex-1 rounded border border-metal-300 bg-white px-2 py-1 text-sm text-steel-800 focus:border-steel-500 focus:outline-none"
                placeholder="--"
              />
            </div>
          )}
          {definition.products.includes('all') && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs font-medium text-steel-600">CoreCap</label>
                <input
                  type="number"
                  value={editCorecap}
                  onChange={(e) => setEditCorecap(e.target.value)}
                  className="flex-1 rounded border border-metal-300 bg-white px-2 py-1 text-sm text-steel-800 focus:border-steel-500 focus:outline-none"
                  placeholder="--"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs font-medium text-steel-600">Clik</label>
                <input
                  type="number"
                  value={editClik}
                  onChange={(e) => setEditClik(e.target.value)}
                  className="flex-1 rounded border border-metal-300 bg-white px-2 py-1 text-sm text-steel-800 focus:border-steel-500 focus:outline-none"
                  placeholder="--"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <label className="w-16 text-xs font-medium text-steel-600">
              {isZh ? '信心' : 'Conf.'}
            </label>
            <select
              value={editConfidence}
              onChange={(e) => setEditConfidence(e.target.value)}
              className="flex-1 rounded border border-metal-300 bg-white px-2 py-1 text-sm text-steel-800 focus:border-steel-500 focus:outline-none"
            >
              <option value="high">{isZh ? '高' : 'High'}</option>
              <option value="medium">{isZh ? '中' : 'Medium'}</option>
              <option value="low">{isZh ? '低' : 'Low'}</option>
              <option value="estimate">{isZh ? '推估' : 'Estimate'}</option>
            </select>
          </div>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows={2}
            className="w-full rounded border border-metal-300 bg-white px-2 py-1 text-xs text-steel-700 focus:border-steel-500 focus:outline-none"
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
        <>
          <div className="mt-2 text-xs text-steel-600">
            {(definition.products.includes('corecap') || definition.products.includes('all')) && (
              <div>
                <span className="font-medium">CoreCap:</span>{' '}
                {formatValue(value?.corecap)}
              </div>
            )}
            {(definition.products.includes('clik') || definition.products.includes('all')) && (
              <div>
                <span className="font-medium">Clik:</span>{' '}
                {formatValue(value?.clik)}
              </div>
            )}
          </div>

          {/* ── Metadata line ── */}
          <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-metal-400">
            <span>
              {isZh ? '來源' : 'Source'}: {value?.source ?? '--'}
            </span>
            <span>
              {isZh ? '信心' : 'Conf.'}: {value?.confidence ?? '--'}
            </span>
          </div>

          {/* ── Expand toggle ── */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 text-xs font-medium text-steel-500 hover:text-steel-700"
          >
            {expanded
              ? isZh
                ? '收起 ▲'
                : 'Collapse ▲'
              : isZh
                ? '展開 ▼'
                : 'Expand ▼'}
          </button>

          {/* ── Expanded details ── */}
          {expanded && value && (
            <div className="mt-2 space-y-1 rounded-md bg-white p-2 text-xs text-metal-500">
              {value.note && (
                <p>
                  <span className="font-medium text-steel-600">Note:</span> {value.note}
                </p>
              )}
              {value.enteredBy && (
                <p>
                  <span className="font-medium text-steel-600">By:</span> {value.enteredBy}
                  {value.entryMethod && ` | Method: ${value.entryMethod}`}
                </p>
              )}
              {value.sourceRef && (
                <p>
                  <span className="font-medium text-steel-600">Ref:</span>{' '}
                  <span className="break-all">{value.sourceRef}</span>
                </p>
              )}
              <p>
                <span className="font-medium text-steel-600">
                  {isZh ? '前值' : 'Previous'}:
                </span>{' '}
                {value.previousValue != null ? String(value.previousValue) : 'null'}
                {value.changeReason && ` | ${value.changeReason}`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
