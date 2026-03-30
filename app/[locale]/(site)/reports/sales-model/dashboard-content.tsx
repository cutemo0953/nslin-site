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
      <div className="mb-6 rounded-lg border border-steel-200 bg-steel-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-steel-800">數據收集進度</span>
          <span className="text-sm text-steel-600">
            {estimation.coverage.collected} / {estimation.coverage.total} 項
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-steel-200">
          <div
            className="h-2 rounded-full bg-brass-500 transition-all"
            style={{ width: `${Math.round((estimation.coverage.collected / Math.max(1, estimation.coverage.total)) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-metal-500">
          {estimation.coverage.collected < 10
            ? '剛開始收集數據。填入更多項目後，推估結果會越來越準確。'
            : estimation.coverage.collected < 30
            ? '已有初步數據，可以看出一些趨勢。繼續收集可提高準確度。'
            : '數據量充足，推估結果具有參考價值。'}
        </p>
      </div>

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
