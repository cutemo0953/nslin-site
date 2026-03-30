'use client';

import type {
  EstimationResult,
  SalesModelConfig,
  SalesModelNodes,
} from '@/lib/sales-model/types';

interface Props {
  estimation: EstimationResult;
  config: SalesModelConfig;
  nodesState: SalesModelNodes;
  isZh: boolean;
}

function formatK(val: number | null): string {
  if (val == null) return '--';
  if (val >= 1_000_000) return `${(val / 1000).toFixed(0)}K`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return String(Math.round(val));
}

function CoverageBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-steel-200">{label}</span>
        <span className="text-xs font-bold text-brass-300">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-steel-700">
        <div
          className="h-full rounded-full bg-brass-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FreshnessBadge({ nodesState, isZh }: { nodesState: SalesModelNodes; isZh: boolean }) {
  // Calculate weighted average freshness
  const entries = Object.values(nodesState.nodes).filter((n) => n?.updatedAt);
  if (entries.length === 0) {
    return (
      <span className="rounded-full bg-metal-600 px-2.5 py-0.5 text-xs font-medium text-metal-300">
        {isZh ? '新鮮度：無資料' : 'Freshness: No data'}
      </span>
    );
  }

  const now = Date.now();
  const avgDays =
    entries.reduce((sum, n) => {
      const days = (now - new Date(n.updatedAt!).getTime()) / 86_400_000;
      return sum + days;
    }, 0) / entries.length;

  let level: string;
  let color: string;
  if (avgDays <= 7) {
    level = isZh ? '高' : 'High';
    color = 'bg-cert-500/20 text-cert-500';
  } else if (avgDays <= 14) {
    level = isZh ? '中' : 'Medium';
    color = 'bg-brass-500/20 text-brass-400';
  } else {
    level = isZh ? '低' : 'Low';
    color = 'bg-safety-500/20 text-safety-500';
  }

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {isZh ? `新鮮度：${level}` : `Freshness: ${level}`}
    </span>
  );
}

export default function SummaryCard({ estimation, config, nodesState, isZh }: Props) {
  const { corecap, clik, estimatorScores, coverage } = estimation;

  const hasCorecap = corecap.total != null;
  const hasClik = clik.total != null;

  // Estimator bar widths (score 0-1 → percentage)
  const aftermarketPct = Math.round(estimatorScores.aftermarket * 100);
  const oemPct = Math.round(estimatorScores.oem * 100);
  const ecosystemPct = Math.round(estimatorScores.ecosystem * 100);

  return (
    <div className="mb-6 rounded-xl bg-steel-800 p-5 text-white shadow-lg">
      {/* ── Headline numbers ── */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {/* CoreCap */}
        <div className="rounded-lg bg-steel-900/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-steel-300">CoreCap</p>
          <p className="mt-1 text-2xl font-bold text-brass-300">
            {hasCorecap ? `~${formatK(corecap.total)}/yr` : '--'}
          </p>
          {hasCorecap && (
            <p className="mt-0.5 text-xs text-steel-400">
              AM {formatK(corecap.aftermarket)} | OEM {formatK(corecap.oem)}
            </p>
          )}
        </div>

        {/* Clik */}
        <div className="rounded-lg bg-steel-900/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-steel-300">Clik</p>
          <p className="mt-1 text-2xl font-bold text-brass-300">
            {hasClik ? `~${formatK(clik.total)}/yr` : isZh ? '資料不足' : 'Insufficient data'}
          </p>
          {hasClik && (
            <p className="mt-0.5 text-xs text-steel-400">
              AM {formatK(clik.aftermarket)} | OEM {formatK(clik.oem)}
            </p>
          )}
        </div>
      </div>

      {/* ── Trust Indicators ── */}
      <div className="mb-4 flex flex-wrap gap-3">
        <CoverageBar
          value={coverage.collected}
          max={coverage.total}
          label={isZh ? '覆蓋率' : 'Coverage'}
        />
        <div className="flex items-end">
          <FreshnessBadge nodesState={nodesState} isZh={isZh} />
        </div>
        <div className="flex items-end">
          <span className="rounded-full bg-metal-600 px-2.5 py-0.5 text-xs font-medium text-metal-300">
            {isZh ? '穩定度：--' : 'Stability: --'}
          </span>
        </div>
      </div>

      {/* ── Estimator Breakdown Bars ── */}
      <div className="space-y-2">
        <EstimatorBar
          label={isZh ? '零售端' : 'Aftermarket'}
          pct={aftermarketPct}
          color="bg-steel-400"
        />
        <EstimatorBar label="OEM" pct={oemPct} color="bg-safety-500" />
        <EstimatorBar
          label={isZh ? '生態系' : 'Ecosystem'}
          pct={ecosystemPct}
          color="bg-cert-500"
        />
      </div>

      {/* ── Metadata line ── */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-steel-400">
        <span>
          {isZh ? '生態系乘數' : 'Eco. multiplier'}: {estimation.ecosystemMultiplier.toFixed(2)}x
        </span>
        <span>
          {isZh ? '摩擦力乘數' : 'Friction multiplier'}: {estimation.frictionMultiplier.toFixed(2)}x
        </span>
        <span>
          {isZh ? '已收集' : 'Collected'}: {coverage.collected}/{coverage.total}
          {coverage.stale > 0 && (
            <span className="text-safety-500"> ({coverage.stale} {isZh ? '過期' : 'stale'})</span>
          )}
        </span>
      </div>
    </div>
  );
}

function EstimatorBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right text-xs font-medium text-steel-300">{label}</span>
      <div className="flex-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-steel-700">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
      <span className="w-10 text-right text-xs font-bold text-brass-300">{pct}%</span>
    </div>
  );
}
