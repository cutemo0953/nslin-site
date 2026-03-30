'use client';

import { useMemo } from 'react';
import type { EstimationResult } from '@/lib/sales-model/types';

// Dynamic import recharts to avoid SSR issues
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Props {
  estimation: EstimationResult;
  isZh: boolean;
  history?: Array<{
    month: string;
    corecapTotal?: number | null;
    clikTotal?: number | null;
    anchor?: number | null;
  }>;
}

export default function TimeSeriesChart({ estimation, isZh, history }: Props) {
  const hasHistory = history && history.length > 0;

  // If we have history data, use it; otherwise create single-point from current estimation
  const chartData = useMemo(() => {
    if (hasHistory) return history;

    // Phase 1: no history yet, show placeholder with current data point
    if (estimation.corecap.total == null && estimation.clik.total == null) {
      return [];
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return [
      {
        month,
        corecapTotal: estimation.corecap.total,
        clikTotal: estimation.clik.total,
        anchor: estimation.corecap.total,
      },
    ];
  }, [estimation, history, hasHistory]);

  // Brand colors from globals.css
  const steelColor = '#2d5a8e'; // steel-600
  const safetyColor = '#f97316'; // safety-500
  const brassColor = '#c7ab57'; // brass-400

  if (chartData.length === 0) {
    return (
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-steel-800">
          {isZh ? '時間序列' : 'Time Series'}
        </h2>
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-metal-300 bg-metal-50 text-sm text-metal-400">
          {isZh ? '月度數據將在此累積' : 'Monthly data will accumulate here'}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold text-steel-800">
        {isZh ? '時間序列' : 'Time Series'}
      </h2>
      <div className="rounded-xl border border-metal-200 bg-white p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5d9de" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6d7887' }}
              stroke="#b3bac3"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6d7887' }}
              stroke="#b3bac3"
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#233e60',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => {
                const v = Number(value);
                return [v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="corecapTotal"
              name="CoreCap"
              stroke={steelColor}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="clikTotal"
              name="Clik"
              stroke={safetyColor}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="anchor"
              name={isZh ? 'Anchor (校準)' : 'Anchor (Calibration)'}
              stroke={brassColor}
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
