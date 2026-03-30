'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  SalesModelConfig,
  SalesModelNodes,
  CalibrationData,
  EstimationResult,
  NodeValue,
} from '@/lib/sales-model/types';
import { calculateEstimation, exportToCSV } from '@/lib/sales-model/calculate';
import CalibrationPanel from '@/components/dashboard/CalibrationPanel';
import SummaryCard from '@/components/dashboard/SummaryCard';
import LayerSection from '@/components/dashboard/LayerSection';
import FrictionSection from '@/components/dashboard/FrictionSection';
import RegionalPanel from '@/components/dashboard/RegionalPanel';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';

const CALIBRATION_KEY = 'nslin-calibration';

interface Props {
  config: SalesModelConfig;
  initialNodes: SalesModelNodes;
  locale: string;
}

export default function DashboardContent({ config, initialNodes, locale }: Props) {
  const isZh = locale === 'zh-TW';

  // ── State ──
  const [calibration, setCalibration] = useState<CalibrationData>(
    initialNodes.calibration,
  );
  const [nodesState, setNodesState] = useState<SalesModelNodes>(initialNodes);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load calibration from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(CALIBRATION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CalibrationData;
        setCalibration(parsed);
      }
    } catch {
      // ignore parse errors
    }
    // Check URL for edit mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === '1') {
      setEditMode(true);
    }
  }, []);

  // Save calibration to localStorage on change
  const handleCalibrationChange = useCallback((cal: CalibrationData) => {
    setCalibration(cal);
    try {
      localStorage.setItem(CALIBRATION_KEY, JSON.stringify(cal));
    } catch {
      // storage full or unavailable
    }
  }, []);

  // ── Calculation ──
  const estimation: EstimationResult = useMemo(() => {
    return calculateEstimation(config, nodesState, calibration);
  }, [config, nodesState, calibration]);

  // ── Node update handler ──
  const handleNodeChange = useCallback(
    (nodeId: string, update: Partial<NodeValue>) => {
      setNodesState((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [nodeId]: {
            ...prev.nodes[nodeId],
            ...update,
            updatedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [],
  );

  // ── Export CSV ──
  const handleExportCSV = useCallback(() => {
    const csv = exportToCSV(config, nodesState);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-model-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config, nodesState]);

  // ── Import JSON ──
  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as SalesModelNodes;
          if (data.nodes) {
            setNodesState(data);
          }
        } catch {
          alert('JSON 解析失敗');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ── Recalculate (force re-render) ──
  const handleRefresh = useCallback(() => {
    setNodesState((prev) => ({ ...prev }));
  }, []);

  // Format last scan date
  const lastScan = nodesState.lastScan
    ? new Date(nodesState.lastScan).toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  // Separate layers (exclude friction/regional which have their own sections)
  const causalLayers = config.layers.filter(
    (l) => l.id !== 'friction' && l.id !== 'regional',
  );

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-metal-400">
        {isZh ? '載入中...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900 sm:text-3xl">
            {isZh ? '銷量推估模型' : 'Sales Estimation Model'}
          </h1>
          <p className="mt-1 text-sm text-metal-500">
            {isZh ? '最後掃描：' : 'Last scan: '}
            {lastScan}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className="rounded-lg border border-steel-300 bg-white px-3 py-1.5 text-sm font-medium text-steel-700 hover:bg-steel-50 transition-colors"
          >
            {isZh ? '重新計算' : 'Refresh'}
          </button>
          <button
            onClick={handleExportCSV}
            className="rounded-lg border border-steel-300 bg-white px-3 py-1.5 text-sm font-medium text-steel-700 hover:bg-steel-50 transition-colors"
          >
            {isZh ? '匯出 CSV' : 'Export CSV'}
          </button>
          <button
            onClick={handleImportJSON}
            className="rounded-lg border border-steel-300 bg-white px-3 py-1.5 text-sm font-medium text-steel-700 hover:bg-steel-50 transition-colors"
          >
            {isZh ? '匯入 JSON' : 'Import JSON'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              editMode
                ? 'bg-safety-500 text-white hover:bg-safety-600'
                : 'border border-metal-300 bg-white text-metal-600 hover:bg-metal-50'
            }`}
          >
            {editMode
              ? isZh
                ? '退出編輯'
                : 'Exit Edit'
              : isZh
                ? '編輯模式'
                : 'Edit Mode'}
          </button>
        </div>
      </header>

      {/* ── Calibration Panel ── */}
      <CalibrationPanel
        calibration={calibration}
        onChange={handleCalibrationChange}
        isZh={isZh}
      />

      {/* ── Data Collection Progress ── */}
      {isZh && (
        <div className="bg-steel-50 border border-steel-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-steel-800 font-medium">數據收集進度</span>
            <span className="text-steel-600 text-sm">{estimation.coverage.collected} / {estimation.coverage.total} 項</span>
          </div>
          <div className="w-full bg-steel-200 rounded-full h-2">
            <div className="bg-brass-500 rounded-full h-2 transition-all" style={{ width: `${Math.round(estimation.coverage.collected / estimation.coverage.total * 100)}%` }} />
          </div>
          <p className="text-metal-500 text-xs mt-2">
            持續收集更多數據可以提高推估準確度。目前已有的數據足以看出初步趨勢。
          </p>
        </div>
      )}

      {/* ── Data Collection Progress ── */}
      {(() => {
        const totalNodes = config.nodes.length + config.frictionNodes.length;
        const withValue = Object.values(nodesState.nodes).filter((n: any) => n?.raw != null).length;
        const investigated = Object.values(nodesState.nodes).filter((n: any) => n?.note && n.note.length > 0).length;
        const notTouched = totalNodes - investigated;
        const valuePct = Math.round((withValue / Math.max(1, totalNodes)) * 100);
        const investigatedPct = Math.round((investigated / Math.max(1, totalNodes)) * 100);
        return (
          <div className="mb-6 rounded-lg border border-steel-200 bg-steel-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-steel-800">數據收集進度</span>
              <span className="text-sm text-steel-600">
                {withValue} 項有數值 / {investigated} 項已調查 / {totalNodes} 項總計
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-steel-200">
              <div
                className="h-2 bg-brass-500 transition-all"
                style={{ width: `${valuePct}%` }}
                title={`${withValue} 項有可計算的數值`}
              />
              <div
                className="h-2 bg-steel-400 transition-all"
                style={{ width: `${investigatedPct - valuePct}%` }}
                title={`${investigated - withValue} 項已調查但缺數值`}
              />
            </div>
            <div className="mt-1.5 flex gap-4 text-xs text-metal-500">
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-brass-500" /> 有數值 ({withValue})</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-steel-400" /> 已調查 ({investigated - withValue})</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-steel-200" /> 未觸及 ({notTouched})</span>
            </div>
            <p className="mt-2 text-xs text-metal-500">
              {withValue < 10
                ? '持續收集中。有 7 項需要公司內部數據，5 項需要付費工具。'
                : withValue < 30
                ? '已有初步數據。繼續填入內部數據可大幅提高準確度。'
                : '數據量充足，推估結果具有參考價值。'}
            </p>
          </div>
        );
      })()}

      {/* ── Strategic Insights ── */}
      {(() => {
        const n = nodesState.nodes;
        type Insight = { icon: string; title: string; detail: string; sentiment: 'positive' | 'negative' | 'neutral' | 'warning'; refs: string[] };
        const insights: Insight[] = [];

        // Patent moat
        if (n['19']?.raw) {
          insights.push({ icon: '🛡', title: 'CoreCap 有專利護城河', detail: 'N.S.-LIN 持有氣嘴底部六角孔專利，Lezyne 被迫改用星星孔來迴避。這是防禦性壁壘。', sentiment: 'positive', refs: ['#19'] });
        }

        // Tube interface rollout
        if (n['56']?.raw && Number(n['56'].raw) > 0) {
          insights.push({ icon: '⚠', title: 'Schwalbe 已推 ' + n['56'].raw + ' 款 Clik 內胎', detail: '全球每年賣出 6-7.8 億條自行車內胎。Schwalbe 正在逐步將內胎切換為 Clik 介面。CoreCap 完全沒有內胎產品線 — 這是最大的戰略缺口。', sentiment: 'warning', refs: ['#56', '#51'] });
        }

        // Wheelset OEM window
        if (n['45']?.raw === 0) {
          insights.push({ icon: '🔓', title: '輪組 OEM 窗口仍未開啟', detail: 'DT Swiss 和 Mavic 2026 年式仍使用標準 Presta，未轉向 Clik 或任何替代方案。這是 CoreCap 爭取 OEM 的機會。', sentiment: 'positive', refs: ['#45'] });
        }

        // Adapter truth
        if (n['46']?.note?.includes('預裝轉接頭')) {
          insights.push({ icon: '💡', title: 'Clik 的「原生支援」其實是預裝轉接頭', detail: 'Lezyne 的 Clik 打氣筒只是把轉接頭預先鎖在充氣頭上，不是重新設計。CoreCap 使用 Schrader 通用介面，真正不需要任何轉接頭。', sentiment: 'positive', refs: ['#46', '#f3'] });
        }

        // Revenue gap
        if (n['7']?.raw && n['8']?.raw) {
          const ratio = Math.round(Number(n['7'].raw) / Math.max(1, Number(n['8'].raw)));
          insights.push({ icon: '📊', title: 'Schwalbe 營收是 BBB 的 ' + ratio + ' 倍', detail: 'Schwalbe EUR 335M vs BBB $8M。資源差距懸殊。但 CoreCap 半年出貨 >10 萬支，證明小公司也能打出量。', sentiment: 'neutral', refs: ['#7', '#8', '#1'] });
        }

        // North America gap
        if (n['27']?.note?.includes('NOT') || n['27']?.note?.includes('North America')) {
          insights.push({ icon: '🌎', title: 'CoreCap 尚未進入北美市場', detail: '美國是全球最大自行車配件市場之一。CoreCap 目前僅在歐洲（DE/UK/NL）+ 少量灰色市場。Clik 已在 Amazon.com 銷售。', sentiment: 'negative', refs: ['#27'] });
        }

        // Stockout signal
        if (n['30']?.corecap && Number(n['30'].corecap) > 0) {
          insights.push({ icon: '🔥', title: 'CoreCap 特定色系缺貨', detail: 'Bike24 上 CoreCap RED 缺貨，其他顏色有貨。缺貨 = 需求 > 供給的訊號。', sentiment: 'positive', refs: ['#30'] });
        }

        // Clik pump wear
        if (n['f2']?.raw && Number(n['f2'].raw) > 0) {
          insights.push({ icon: '🔧', title: 'Clik 打氣頭約 8 個月磨損', detail: '論壇用戶回報 Clik pump head converter 使用約 8 個月後連接不穩，需更換。這是 Clik 的結構性弱點。', sentiment: 'positive', refs: ['#f2'] });
        }

        // Fillmore incumbent
        if (n['41']?.raw === 100) {
          insights.push({ icon: '🏔', title: 'Reserve Fillmore 仍是在位者', detail: 'Fillmore 未停產，Santa Cruz 整車仍標配。在 MTB 高端市場，CoreCap 和 Clik 都還沒取代 Fillmore。', sentiment: 'neutral', refs: ['#41'] });
        }

        // No OEM adoption
        if (n['17']?.raw === 0) {
          insights.push({ icon: '🏭', title: '完整車 OEM 預裝 = 0', detail: '2026 年沒有任何整車品牌確認預裝 CoreCap 或 Clik。替代閥門仍在 aftermarket 階段。Schwalbe 計劃 2026 高端、3-5 年中端。', sentiment: 'neutral', refs: ['#17', '#26'] });
        }

        const sentimentColors = { positive: 'border-cert-500 bg-cert-50', negative: 'border-red-400 bg-red-50', warning: 'border-safety-500 bg-safety-50', neutral: 'border-steel-300 bg-steel-50' };

        return insights.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-steel-800">戰略發現</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {insights.map((ins, i) => (
                <div key={i} className={`rounded-lg border-l-4 p-3 ${sentimentColors[ins.sentiment]}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{ins.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-steel-800 text-sm">{ins.title}</p>
                      <p className="mt-1 text-xs text-metal-600">{ins.detail}</p>
                      <p className="mt-1.5 text-xs text-metal-400">
                        數據來源：{ins.refs.map((r, j) => (
                          <span key={j} className="inline-block rounded bg-steel-100 px-1.5 py-0.5 mr-1 font-mono text-steel-600">{r}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* ── Summary Card ── */}
      <SummaryCard
        estimation={estimation}
        config={config}
        nodesState={nodesState}
        isZh={isZh}
      />

      {/* ── Causal Layers ── */}
      {causalLayers.map((layer) => {
        const layerNodeDefs = config.nodes.filter((n) => n.layer === layer.id);
        return (
          <LayerSection
            key={layer.id}
            layer={layer}
            nodeDefs={layerNodeDefs}
            nodesData={nodesState.nodes}
            editMode={editMode}
            onChange={handleNodeChange}
            isZh={isZh}
          />
        );
      })}

      {/* ── Friction Section ── */}
      <FrictionSection
        frictionNodes={config.frictionNodes}
        nodesData={nodesState.nodes}
        editMode={editMode}
        onChange={handleNodeChange}
        isZh={isZh}
      />

      {/* ── Regional Panel ── */}
      <RegionalPanel
        regions={config.regions}
        nodesData={nodesState.nodes}
        nodeDefs={config.nodes}
        isZh={isZh}
      />

      {/* ── Time Series Chart ── */}
      <TimeSeriesChart estimation={estimation} isZh={isZh} />

      {/* ── Footer ── */}
      <footer className="mt-8 border-t border-metal-200 pt-4 text-center text-xs text-metal-400">
        {isZh ? '內部工具 -- 僅供 N.S.-LIN 團隊使用' : 'Internal tool -- N.S.-LIN team only'}
      </footer>
    </div>
  );
}
