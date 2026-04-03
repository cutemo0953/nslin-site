'use client';

import { useState } from 'react';
import type { NodeDefinition, NodeValue, SalesModelConfig } from '@/lib/sales-model/types';
import { getNodeStatus } from '@/lib/sales-model/calculate';

interface Props {
  definition: NodeDefinition;
  value: NodeValue | null;
  editMode: boolean;
  onChange: (update: Partial<NodeValue>) => void;
  isZh: boolean;
  config?: SalesModelConfig;
  locked?: boolean;
  onLockToggle?: (nodeId: number, locked: boolean) => void;
}

type FreshnessStatus = 'fresh' | 'stale' | 'outdated' | 'not_collected';

function StatusIcon({ status }: { status: FreshnessStatus }) {
  switch (status) {
    case 'fresh':
      return <span className="text-cert-500" title="最新">&#x2705;</span>;
    case 'stale':
      return <span className="text-safety-500" title="可能需要更新">&#x26A0;&#xFE0F;</span>;
    case 'outdated':
      return <span className="text-red-500" title="已過期，請更新">&#x1F534;</span>;
    case 'not_collected':
    default:
      return <span className="text-metal-300" title="待收集">&#x2B1C;</span>;
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
  config,
  locked = false,
  onLockToggle,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // Use config-aware staleness if available, else fallback
  const status: FreshnessStatus = (() => {
    if (!value || value.updatedAt == null) return 'not_collected';
    const days = (Date.now() - new Date(value.updatedAt).getTime()) / 86_400_000;
    if (config) {
      return getNodeStatus(days, config, definition.id, definition.sourceType);
    }
    if (days <= 7) return 'fresh';
    if (days <= 14) return 'stale';
    return 'outdated';
  })();

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
          {locked && (
            <span title={isZh ? '已鎖定 (自動化不可覆寫)' : 'Locked (automation cannot overwrite)'}>
              <svg className="h-3.5 w-3.5 text-metal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </span>
          )}
          {(value?.entryMethod === 'auto_tavily' || value?.entryMethod === 'auto_api') && (
            <span className="rounded bg-steel-100 px-1 py-0.5 text-[10px] font-mono text-steel-500">auto</span>
          )}
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="rounded bg-brass-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brass-600 transition-colors"
            >
              {isZh ? '儲存' : 'Save'}
            </button>
            {onLockToggle && (
              <button
                onClick={() => onLockToggle(definition.id, !locked)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  locked
                    ? 'bg-metal-200 text-metal-600 hover:bg-metal-300'
                    : 'bg-white border border-metal-300 text-metal-500 hover:bg-metal-50'
                }`}
                title={locked
                  ? (isZh ? '解鎖：允許自動化覆寫' : 'Unlock: allow automation to overwrite')
                  : (isZh ? '鎖定：防止自動化覆寫' : 'Lock: prevent automation from overwriting')}
              >
                {locked
                  ? (isZh ? '解鎖' : 'Unlock')
                  : (isZh ? '鎖定' : 'Lock')}
              </button>
            )}
          </div>
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
              {isZh ? '來源' : 'Source'}: {value?.entryMethod === 'auto_tavily' ? '自動搜尋' : value?.entryMethod === 'auto_api' ? '自動 API' : value?.entryMethod === 'derived' ? '推算' : value?.source === 'internal' ? '公司內部' : value?.source === 'manual' ? '手動輸入' : value?.source === 'scraper' ? '自動抓取' : value?.source === 'survey' ? '問卷調查' : value?.source === 'estimate' ? '推算' : value?.source ?? '待收集'}
            </span>
            <span>
              {isZh ? '可信度' : 'Conf.'}: {value?.confidence === 'high' ? '高' : value?.confidence === 'medium' ? '中' : value?.confidence === 'low' ? '低' : value?.confidence === 'estimate' ? '推估' : '待評估'}
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
