'use client';

import { useState } from 'react';
import type { CalibrationData } from '@/lib/sales-model/types';

interface Props {
  calibration: CalibrationData;
  onChange: (cal: CalibrationData) => void;
  isZh: boolean;
}

const SCOPE_OPTIONS: Array<{ value: CalibrationData['anchorScope']; label: string; labelEn: string }> = [
  { value: 'shipment', label: '出貨量', labelEn: 'Shipment' },
  { value: 'sell_in', label: 'Sell-In', labelEn: 'Sell-In' },
  { value: 'sell_through', label: 'Sell-Through', labelEn: 'Sell-Through' },
];

const GEO_OPTIONS: Array<{ value: CalibrationData['anchorGeography']; label: string }> = [
  { value: 'global', label: 'Global' },
  { value: 'DACH', label: 'DACH' },
  { value: 'Benelux', label: 'Benelux' },
  { value: 'UK', label: 'UK' },
  { value: 'US', label: 'US' },
  { value: 'JP', label: 'JP' },
  { value: 'TW', label: 'TW' },
];

export default function CalibrationPanel({ calibration, onChange, isZh }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CalibrationData>(calibration);

  const handleSave = () => {
    const updated: CalibrationData = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    onChange(updated);
    setOpen(false);
  };

  const updateField = <K extends keyof CalibrationData>(
    key: K,
    value: CalibrationData[K],
  ) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-fill OEM % when aftermarket % changes
      if (key === 'aftermarketPct' && typeof value === 'number') {
        next.oemPct = Math.max(0, 100 - value);
      }
      // Auto-fill aftermarket % when OEM % changes
      if (key === 'oemPct' && typeof value === 'number') {
        next.aftermarketPct = Math.max(0, 100 - value);
      }
      return next;
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-steel-200 bg-steel-50">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-steel-800">
            {isZh ? '校準設定' : 'Calibration Settings'}
          </span>
          {calibration.monthlyShipment ? (
            <span className="rounded-full bg-cert-500/20 px-2.5 py-0.5 text-xs font-medium text-cert-600">
              {isZh ? '已校準' : 'Calibrated'}
            </span>
          ) : (
            <span className="rounded-full bg-safety-500/20 px-2.5 py-0.5 text-xs font-medium text-safety-600">
              {isZh ? '未校準' : 'Not calibrated'}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-steel-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel body */}
      {open && (
        <div className="border-t border-steel-200 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Monthly shipment */}
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">
                {isZh ? '月出貨量' : 'Monthly Shipment'}
              </label>
              <input
                type="number"
                min={0}
                value={draft.monthlyShipment ?? ''}
                onChange={(e) =>
                  updateField('monthlyShipment', e.target.value ? Number(e.target.value) : 0)
                }
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
                placeholder="e.g. 16700"
              />
            </div>

            {/* Aftermarket % */}
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">
                Aftermarket %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.aftermarketPct ?? ''}
                onChange={(e) =>
                  updateField('aftermarketPct', e.target.value ? Number(e.target.value) : 0)
                }
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
                placeholder="0-100"
              />
            </div>

            {/* OEM % */}
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">
                OEM %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.oemPct ?? ''}
                onChange={(e) =>
                  updateField('oemPct', e.target.value ? Number(e.target.value) : 0)
                }
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
                placeholder="0-100"
              />
            </div>

            {/* Period */}
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">
                {isZh ? '期間' : 'Period'}
              </label>
              <input
                type="month"
                value={draft.period ?? ''}
                onChange={(e) => updateField('period', e.target.value)}
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
              />
            </div>

            {/* Anchor scope */}
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">
                Anchor Scope
              </label>
              <select
                value={draft.anchorScope}
                onChange={(e) =>
                  updateField('anchorScope', e.target.value as CalibrationData['anchorScope'])
                }
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
              >
                {SCOPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isZh ? opt.label : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Anchor geography */}
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">
                Anchor Geography
              </label>
              <select
                value={draft.anchorGeography}
                onChange={(e) =>
                  updateField(
                    'anchorGeography',
                    e.target.value as CalibrationData['anchorGeography'],
                  )
                }
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
              >
                {GEO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-steel-700">
                {isZh ? '備註' : 'Notes'}
              </label>
              <textarea
                value={draft.notes ?? ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-500 focus:outline-none focus:ring-1 focus:ring-steel-500"
                placeholder={isZh ? '補充說明...' : 'Additional notes...'}
              />
            </div>
          </div>

          {/* Save button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-lg bg-brass-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brass-600 transition-colors"
            >
              {isZh ? '儲存校準' : 'Save Calibration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
