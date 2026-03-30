# Sales Model Dashboard Dev Spec

**Project:** nslin-site
**Date:** 2026-03-30
**Status:** Draft

## Overview

在 nslin-site 建立互動式銷量推估儀表板，讓 N.S.-LIN 團隊可以：
1. 看到 60+ 個數據節點的即時狀態，按 5 個因果層級（L1-L5）分層展示
2. 每個節點顯示 CoreCap vs Clik 並排比較 + 數據更新時間戳 + 狀態燈號
3. 輸入公司出貨數據進行校準
4. 看到三個平行估計器（Aftermarket / OEM / Ecosystem）的推算結果
5. 按區域查看擴散面板（DACH / Benelux / UK / US / JP / TW）

**不是 Blog。** 是互動式報表頁面，數據存在 JSON 檔中（follow 現有 `data/competitive-intel/` pattern），校準數據存 localStorage。

## Current State

| Component | Status |
|-----------|--------|
| Reports 架構 | `/reports/bicycle-tpms` + `/reports/competitive-landscape` — 靜態 HTML（prebuild from markdown） |
| 數據儲存 | `data/competitive-intel/*.json` — 靜態 JSON，no D1 |
| Client components | BannerCarousel, BlogPostGrid, LocaleToggle — React hooks, `use client` |
| Styling | Tailwind v4 + 自訂色 (steel/metal/brass/safety/cert) |
| 圖表 | 無（需新增 recharts 或 lightweight chart lib） |
| Estimation model spec | `docs/DEV_SPEC_SALES_ESTIMATION_MODEL.md` Rev 3 — 60+ nodes, 5 layers, 3 estimators |
| i18n | next-intl, en + zh-TW |

## Requirements

### R1. Dashboard Page

1. 新頁面 `/reports/sales-model`（noindex，內部報表）
2. Server component (page.tsx) + Client component (dashboard-content.tsx)
3. 頁面結構：

```
[Header] 標題 + 最後掃描時間 + [Run Scan] + [Export CSV]
[校準面板] 月出貨量 / Aftermarket% / OEM% / 儲存
[總估算卡片] CoreCap ~XXK/yr | Clik ~???K/yr | Confidence bar
[L1: Supply Availability] 6 nodes, expandable
[L2: Channel Placement] 9 nodes, expandable
[L3: Sell-Through Velocity] 12 nodes, expandable
[L4: Installed Base] 9 nodes, expandable
[L5: Future Signal] 8 nodes, expandable
[Friction / Negative] 4 nodes, expandable
[Regional Diffusion] 6 regions, each expandable
[Time Series Chart] 月度趨勢圖
```

### R2. Node Display

每個節點顯示：

```
┌──────────────────────────────────────────────────┐
│ #27 Retailer 上架數                    ✅ 03-29  │
│ CoreCap: DE 42 | UK 28 | US 15                  │
│ Clik:    DE 87 | UK 51 | US 23                  │
│ ──────────────────────────────                   │
│ Source: manual scan | Confidence: Medium         │
└──────────────────────────────────────────────────┘
```

- 狀態燈號：✅ Fresh (<7d) / ⚠️ Stale (7-14d) / 🔴 Outdated (>14d) / ⬜ Not collected
- CoreCap vs Clik 並排（如果該節點有兩方數據）
- 點擊可展開詳細資料 + 歷史值
- Source 標示（manual / scraper / API / estimate）
- Confidence 等級（High / Medium / Low / Estimate）

### R3. Calibration Panel

- 輸入欄位：月出貨量、Aftermarket%、OEM%、期間（YYYY-MM）
- 儲存到 localStorage（不需後端 — N.S.-LIN 自己的數據不上傳）
- 校準歷史列表（最近 12 個月）
- 校準後自動重算三個 estimator

### R4. Three Estimators

根據 DEV_SPEC_SALES_ESTIMATION_MODEL.md Rev 3：

| Estimator | Input | Output |
|-----------|-------|--------|
| A: Aftermarket | Amazon BSR, review velocity, retailer count, stockout, LBS survey, promo | CoreCap aftermarket units/yr, Clik aftermarket units/yr |
| B: OEM/Spec-In | Wheelset conversion, model-year spec, OEM persistence, tube rollout, brand volume | CoreCap OEM units/yr, Clik OEM units/yr |
| C: Ecosystem | Pump support, accessory attach, replacement parts, tech downloads, tutorials | Adoption velocity multiplier |

**Total = (A + B) × C_multiplier**

每個 estimator 顯示：
- 輸入節點 + 權重
- 計算過程（展開可見）
- 輸出數字 + 信賴區間

### R5. Regional Diffusion Panel

6 個區域卡片，每個顯示：
- 該區域的 key signals（retailer in-stock、Amazon BSR、dealer count）
- 上次更新時間
- CoreCap vs Clik 在該區域的相對強弱

### R6. Time Series Chart

- X 軸：月份（12 個月）
- Y 軸：units
- 線條：CoreCap total / Clik total estimate / CoreCap calibration anchor
- 使用 recharts（lightweight, React-native）

### R7. Data Architecture

**不用 D1。** Follow 現有 `data/competitive-intel/` pattern：

```
data/dashboards/
├── sales-model-nodes.json      ← 所有節點的當前值
├── sales-model-history.json    ← 月度歷史快照
└── sales-model-config.json     ← 節點定義、權重、layer mapping
```

`sales-model-nodes.json` 結構：
```json
{
  "lastScan": "2026-03-30T14:32:00Z",
  "nodes": {
    "27": {
      "id": 27,
      "name": "Retailer 上架數",
      "layer": "L2",
      "timing": "coincident",
      "values": {
        "corecap": { "DE": 42, "UK": 28, "US": 15 },
        "clik": { "DE": 87, "UK": 51, "US": 23 }
      },
      "source": "manual",
      "confidence": "medium",
      "updatedAt": "2026-03-29T08:00:00Z"
    }
  }
}
```

`sales-model-config.json` 結構：
```json
{
  "layers": ["L1", "L2", "L3", "L4", "L5", "friction", "regional"],
  "estimators": {
    "aftermarket": {
      "nodes": [4, 42, 27, 30, 39, 32],
      "weights": [0.25, 0.15, 0.20, 0.15, 0.15, 0.10]
    },
    "oem": { ... },
    "ecosystem": { ... }
  },
  "correlationPenalties": [
    { "pair": [44, 42], "penalty": 0.30 },
    { "pair": [30, 34], "penalty": 0.30 }
  ],
  "regions": ["DACH", "Benelux", "UK", "US", "JP", "TW"]
}
```

### R8. Data Collection（Phase 2，本 spec 不做爬蟲）

本 spec 只建 dashboard UI + 手動輸入。爬蟲（Bike24 SKU、Amazon BSR、99spokes）是 Phase 2。

Phase 1：手動在 JSON 裡填數據 + dashboard 顯示
Phase 2：爬蟲自動收集 → 寫入 JSON → dashboard 讀取

### R9. Export

- Export CSV 按鈕：將所有節點 + 值 + 時間戳匯出
- 供在 Excel 或 Google Sheet 中進一步分析

## Implementation Steps

### Step 1: Data Schema

建立 `data/dashboards/` 目錄 + 3 個 JSON 檔案：
- `sales-model-config.json` — 節點定義、權重（從 Rev 3 spec 搬過來）
- `sales-model-nodes.json` — 初始值（目前已知的數據填入，其餘 null）
- `sales-model-history.json` — 空陣列（月度快照用）

### Step 2: Dashboard Page

- `app/[locale]/(site)/reports/sales-model/page.tsx` — Server component, metadata, noindex
- `app/[locale]/(site)/reports/sales-model/dashboard-content.tsx` — `use client`, 主要互動 UI

### Step 3: Node Components

- `components/dashboard/NodeCard.tsx` — 單一節點卡片（狀態燈、值、時間戳、展開）
- `components/dashboard/LayerSection.tsx` — 一個因果層級（collapsible，含所有 nodes）
- `components/dashboard/EstimatorCard.tsx` — 一個 estimator 的結果面板
- `components/dashboard/CalibrationPanel.tsx` — 校準輸入面板（localStorage）
- `components/dashboard/RegionCard.tsx` — 區域卡片
- `components/dashboard/TimeSeriesChart.tsx` — recharts 折線圖

### Step 4: Calculation Engine

- `lib/sales-model/calculate.ts` — 三個 estimator 的計算邏輯
  - 讀取 config (weights, penalties)
  - 讀取 nodes (values)
  - 讀取 calibration (localStorage)
  - 輸出：aftermarket / OEM / ecosystem multiplier / total
  - 包含 correlation penalty 計算

### Step 5: Prebuild Integration

- 在 `scripts/gen-report-content.mjs` 中不需要改（dashboard 是 client-side render，不是 prebuild HTML）
- 但需要確保 `data/dashboards/*.json` 被 include 在 build output

### Step 6: Install recharts

`npm install recharts`

## Files Affected

| File | Change | Description |
|------|--------|-------------|
| `data/dashboards/sales-model-config.json` | new | 60 node definitions + weights + layers |
| `data/dashboards/sales-model-nodes.json` | new | Current node values (manual + scraper) |
| `data/dashboards/sales-model-history.json` | new | Monthly snapshots array |
| `app/[locale]/(site)/reports/sales-model/page.tsx` | new | Server component + metadata |
| `app/[locale]/(site)/reports/sales-model/dashboard-content.tsx` | new | Main interactive dashboard |
| `components/dashboard/NodeCard.tsx` | new | Single node display card |
| `components/dashboard/LayerSection.tsx` | new | Causal layer collapsible section |
| `components/dashboard/EstimatorCard.tsx` | new | Estimator result panel |
| `components/dashboard/CalibrationPanel.tsx` | new | Calibration input (localStorage) |
| `components/dashboard/RegionCard.tsx` | new | Regional diffusion card |
| `components/dashboard/TimeSeriesChart.tsx` | new | Recharts time series |
| `lib/sales-model/calculate.ts` | new | Estimation calculation engine |
| `package.json` | edit | Add recharts dependency |

## Data Model Changes

**No database.** All data in static JSON files + localStorage for calibration.

| Storage | Location | Content |
|---------|----------|---------|
| Node definitions | `data/dashboards/sales-model-config.json` | 60 nodes, 3 estimators, penalties, regions |
| Node values | `data/dashboards/sales-model-nodes.json` | Current values, timestamps, sources |
| History | `data/dashboards/sales-model-history.json` | Monthly snapshots |
| Calibration | `localStorage: nslin-calibration` | User-entered shipment data |

## Test Plan

1. 頁面載入 → 看到 5 個 layer section + 總估算卡片
2. 展開 L1 → 看到 6 個 node cards，有值的顯示 ✅，null 的顯示 ⬜
3. 輸入校準：35,000 / 30% / 70% / 2026-03 → 儲存 → estimator 重算
4. 展開 Estimator A → 看到計算過程（nodes × weights）
5. Regional panel → 6 個區域卡片各自顯示
6. Time series chart → 月度折線圖渲染
7. Export CSV → 下載 CSV 檔案含所有節點
8. 重新整理頁面 → 校準數據從 localStorage 恢復
9. Node 時間超過 14 天 → 顯示 🔴 Outdated

## Risks & Open Questions

1. **recharts bundle size** — recharts ~200KB gzipped。如果太重，可改用 lightweight chart（Chart.css 或 inline SVG）
2. **JSON 檔案更新流程** — Phase 1 手動編輯 JSON，Phase 2 才有爬蟲。手動更新是否太麻煩？考慮加個 admin 模式讓使用者在 dashboard 上直接編輯節點值
3. **Cloudflare Workers 靜態 JSON** — `data/dashboards/*.json` 需要確認能被 client-side fetch 到（可能需要放 `public/` 或用 API route）
4. **多人校準** — localStorage 是 per-device。如果多人看同一個 dashboard，校準不會同步。Phase 2 可以用 KV 或 D1。
5. **節點數量太多？** — 60 個 node cards 一次全開可能很長。用 collapsible sections + 只展開有數據的 layer。
6. **i18n** — 節點名稱要雙語嗎？建議 zh-TW 為主（你弟看中文），英文放 tooltip。
