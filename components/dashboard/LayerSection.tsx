'use client';

import { useState } from 'react';
import type { NodeDefinition, NodeValue } from '@/lib/sales-model/types';
import NodeCard from './NodeCard';

interface Props {
  layer: { id: string; name: string; nameZh: string; timing: string };
  nodeDefs: NodeDefinition[];
  nodesData: Record<string, NodeValue>;
  editMode: boolean;
  onChange: (nodeId: string, update: Partial<NodeValue>) => void;
  isZh: boolean;
}

function getFreshnessBadge(
  nodeDefs: NodeDefinition[],
  nodesData: Record<string, NodeValue>,
  isZh: boolean,
): { label: string; color: string } {
  const entries = nodeDefs
    .map((nd) => nodesData[String(nd.id)])
    .filter((n) => n?.updatedAt);

  if (entries.length === 0) {
    return {
      label: isZh ? '無資料' : 'No data',
      color: 'bg-metal-200 text-metal-500',
    };
  }

  const now = Date.now();
  const avgDays =
    entries.reduce((sum, n) => {
      return sum + (now - new Date(n.updatedAt!).getTime()) / 86_400_000;
    }, 0) / entries.length;

  if (avgDays <= 7) {
    return {
      label: isZh ? '新鮮' : 'Fresh',
      color: 'bg-cert-500/20 text-cert-600',
    };
  }
  if (avgDays <= 14) {
    return {
      label: isZh ? '尚可' : 'OK',
      color: 'bg-brass-500/20 text-brass-600',
    };
  }
  return {
    label: isZh ? '過期' : 'Stale',
    color: 'bg-safety-500/20 text-safety-600',
  };
}

export default function LayerSection({
  layer,
  nodeDefs,
  nodesData,
  editMode,
  onChange,
  isZh,
}: Props) {
  const collected = nodeDefs.filter(
    (nd) => nodesData[String(nd.id)]?.raw != null,
  ).length;
  const total = nodeDefs.length;

  // Auto-expand layers that have data, collapse empty ones
  const [open, setOpen] = useState(collected > 0);
  const freshness = getFreshnessBadge(nodeDefs, nodesData, isZh);

  return (
    <section className="mb-4">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-metal-200 bg-white px-4 py-3 text-left shadow-sm hover:border-steel-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`h-4 w-4 text-metal-400 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <span className="font-semibold text-steel-800">
              {layer.nameZh}
            </span>
            <span className="ml-2 text-sm text-metal-400">
              {layer.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-metal-500">
            {collected}/{total} {isZh ? '已收集' : 'collected'}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${freshness.color}`}
          >
            {freshness.label}
          </span>
          <span className="rounded-full bg-steel-100 px-2 py-0.5 text-xs text-steel-600">
            {layer.timing}
          </span>
        </div>
      </button>

      {/* Body */}
      {open && collected === 0 && (
        <p className="mt-2 px-4 py-2 text-sm text-metal-400">尚未收集數據 — 有數據後會自動顯示</p>
      )}
      {open && collected > 0 && (
        <div className="mt-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Show filled nodes first */}
            {nodeDefs
              .filter((nd) => nodesData[String(nd.id)]?.raw != null)
              .map((nd) => (
                <NodeCard
                  key={nd.id}
                  definition={nd}
                  value={nodesData[String(nd.id)] ?? null}
                  editMode={editMode}
                  onChange={(update) => onChange(String(nd.id), update)}
                  isZh={isZh}
                />
              ))}
          </div>
          {total - collected > 0 && (
            <p className="mt-2 px-2 text-xs text-metal-400">
              + {total - collected} 項待收集
            </p>
          )}
        </div>
      )}
    </section>
  );
}
