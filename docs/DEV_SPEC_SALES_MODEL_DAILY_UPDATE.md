# Sales Model Automated Update Dev Spec

**Project:** nslin-site
**Date:** 2026-04-02
**Status:** Rev 3 FINAL (Gemini + ChatGPT 2-round review, hit rate tested)

## Overview

將 Sales Model Dashboard 從「手動更新 JSON」升級為「按頻率自動收集 + 人工審核」。

**核心原則：錯誤的自動數據比缺失的數據更危險。**（例：Schwalbe 營收曾被錯填 $59M，實際 EUR 335M。）因此採用 **auto-collect + patch + PR review** 模式，跟現有 competitive-intel workflow 一致。

**不是所有 node 都每日更新。** 依 volatility 分層：高波動 daily、中波動 weekly、低波動 monthly、手動 node 永遠不自動碰。

### Hit Rate Test Results (2026-04-02)

用 WebSearch 模擬 Tavily 對 Tier A 節點的實測：

| Target | Result | Verdict |
|--------|--------|---------|
| Amazon BSR rank | BSR 數字不在搜尋 snippet 裡 | **FAIL** — 需 Keepa API 或放棄 |
| Amazon review count | 搜到專業評測，非 Amazon 客評 | **FAIL** — 同上 |
| Bike24 product pages | CoreCap BTI-166 + BTI-165 直接命中 | **PASS** |
| Bike24 Clik tube SKU | Nr.15 + 多尺寸命中 | **PASS** |
| Amazon.de Clik products | 10 筆 Clik 產品 URL | **PARTIAL** — URL 有，但無 BSR/review |
| Stockout status | 產品頁有但 snippet 無庫存狀態 | **PARTIAL** — 需 `include_raw_content` |

**結論：** Tavily 對零售商產品頁（Bike24/Rose/Wiggle）有效，對 Amazon 內部數據（BSR/review）無效。Tier A 重新定義為零售商面向節點。

## Current State

| Component | Status |
|-----------|--------|
| Node 資料 | `data/dashboards/sales-model-nodes.json` — 28/66 nodes 有值，全部手動填入 |
| 更新頻率 | 無自動更新。lastScan = 2026-03-30（手動） |
| Staleness 權重 | < 7d fresh / 7-14d stale (0.75x) / > 14d outdated (0.4x) — 硬編碼在 calculate.ts |
| History | `sales-model-history.json` — 空陣列 |
| Competitive intel | GitHub Actions 週日跑一次，用 Tavily + Claude API，只更新 competitive-intel/ |
| Secrets | `ANTHROPIC_API_KEY`, `TAVILY_API_KEY`, `RESEND_API_KEY` 已設在 GitHub |

## Node Classification

### Observed vs Derived

每個 node 歸類為 **observed**（直接收集）或 **derived**（由其他 node 計算而來）。Collector 只抓 observed nodes；derived nodes 在 apply 階段自動計算。

| Type | Definition | Examples |
|------|-----------|----------|
| **observed** | 有明確外部資料來源，可直接查到一個值 | #27 Retailer Count, #56 Tube SKU, #61 LME Price |
| **derived** | 由一或多個 observed node 的歷史/關係計算 | #42 Review Velocity (= #5 delta), #44 BSR Persistence (= #4 history), #31 Price Dispersion (= #10 std dev) |

**Derived nodes 清單：**

| Derived Node | Depends On | Calculation |
|------|-----------|-------------|
| #31 Price Dispersion | #10 (raw prices) | std dev of price samples |
| #42 Review Velocity | #5 (review count) | this_patch.#5 - previous.#5 |
| #44 BSR Persistence | #4 (daily BSR) | consecutive days in top N (from patch history) |

### Volatility & Collection Schedule

每個 node 有 `volatility` 屬性，決定收集頻率：

| Volatility | Schedule | Cron | Rationale |
|-----------|----------|------|-----------|
| **high** | Daily | `0 21 * * *` | 零售庫存、價格、listing 變化快 |
| **medium** | Every 3 days | `0 21 */3 * *` | OEM spec、二手市場、配件生態 |
| **low** | Weekly | `0 21 * * 0` | 技術文件、CAD 下載、專利、年報 |
| **manual** | Never auto | — | internal / relationship / field / survey / paid |

### Target Nodes (21 automatable observed nodes)

原 26 個扣掉 3 個 derived + 2 個 Amazon-only（hit rate FAIL）= **21 observed nodes**。

#### Tier A — High Volatility, Daily (Retailer-facing)

| Node | Name | Collector | Query Strategy |
|------|------|-----------|---------------|
| 27 | Retailer Listing Count | tavily | `"CoreCap" site:bike24.de`, `site:rosebikes.de`, `site:wiggle.com` per market per product |
| 30 | Stockout Frequency | tavily | `"CoreCap" site:bike24.de` + `include_raw_content:true` 檢查 availability |
| 56 | Tube SKU Ratio | tavily | `"Clik valve tube" site:bike24.de`, `site:schwalbe.com` |
| 10 | Google Shopping Price | tavily | `"CoreCap tubeless valve" price buy` |
| 61 | LME Aluminum | api | `metals-api.com/latest?base=USD&symbols=AL` or Tavily fallback |
| 62 | US Midwest Premium | api | 同 #61 來源 |

**Daily query budget: ~14 queries/day (6 nodes x ~2.3 queries avg)**

#### Tier B — Medium Volatility, Every 3 Days

| Node | Name | Collector | Query Strategy |
|------|------|-----------|---------------|
| 17 | Clik OEM Models | tavily | `"Clik valve" 2026 2027 bike spec sheet` |
| 18 | 3rd Party Clik Accessories | tavily | `"Wolf Tooth Clik" OR "Lezyne Clik" valve` |
| 20 | Second-Hand Listings | tavily | `"CoreCap valve" site:ebay.de`, `site:bikemarkt.mtb-news.de` |
| 36 | Clik Attach Rate | tavily | `"Clik valve" accessories ecosystem` |
| 37 | Replacement Parts | tavily | `"CoreCap replacement" OR "Clik replacement" valve part` |
| 38 | Used Bike Mentions | tavily | `"CoreCap" OR "Clik valve" used bike spec` |
| 41 | OEM Persistence | tavily | `"Clik valve" 2027 model year wheelset` |
| 45 | Wheelset Conversion | tavily | `"Clik valve" DT Swiss OR Mavic spec 2026 2027` |
| 57 | B2B Restock Time | tavily | `"CoreCap" "back in stock" OR "wieder verfugbar" bike24` |

**Every-3-day query budget: ~20 queries/run (9 nodes x ~2.2 queries avg)**

#### Tier C — Low Volatility, Weekly

| Node | Name | Collector | Query Strategy |
|------|------|-----------|---------------|
| 25 | Google Ads CPC | tavily | `"tubeless valve" Google Ads CPC average cost` |
| 26 | E-bike Spec Clik | tavily | `"Clik valve" e-bike 2026 spec` |
| 49 | 99spokes Stats | tavily | `"Clik valve" site:99spokes.com` |
| 50 | Schwalbe Tech Downloads | tavily | `site:schwalbe.com Clik valve installation` |
| 53 | 3D CAD Downloads | tavily | `"Clik valve" 3D model GrabCAD` |
| 11 | Google Trends | tavily | `"CoreCap vs Clik valve" Google Trends 2026` |
| 59 | Icecat Catalog | api | `live.icecat.biz/api/` free tier |

**Weekly query budget: ~16 queries/run (7 nodes x ~2.3 queries avg)**

#### Removed from Automation

| Node | Name | Reason |
|------|------|--------|
| 4 | Amazon BSR | Hit rate FAIL — BSR not in search snippets. Needs Keepa ($19/mo) |
| 5 | Amazon Review Count | Hit rate FAIL — same as #4 |
| 43 | Q&A Growth | Depends on Amazon page access |

### Monthly Query Budget

| Tier | Nodes | Queries/run | Runs/month | Monthly queries |
|------|-------|------------|------------|----------------|
| A (daily) | 6 | ~14 | 30 | ~420 |
| B (every 3d) | 9 | ~20 | 10 | ~200 |
| C (weekly) | 7 | ~16 | 4 | ~64 |
| **Total** | **21** (+1 competitive-intel) | | | **~684 + ~104 = ~788** |

**Fits within Tavily free tier (1,000/month)** under scheduled policy. 留 ~212 queries buffer 給 manual dispatch 和 competitive-intel。

**Monthly Budget Guardrail:** Collection script 在啟動時計算本月已消耗 queries（讀取 `data/dashboards/patches/` 目錄內本月 patch 的 stats.eligible 總和）。如果 projected burn > 750 (75% of free tier)：
1. 先停 Tier C（省 ~64 queries）
2. 仍超額 → 停 Tier B（再省 ~200 queries）
3. Tier A 永遠不自動停，需手動 `enabled: false`

這確保 budget 管理是自動的，不依賴人工盯。

## Requirements

### R1. Query Registry

新增 `data/dashboards/sales-model-queries.json`，每個 node 一筆：

```json
{
  "nodeId": 27,
  "enabled": true,
  "locked": false,
  "volatility": "high",
  "nodeType": "observed",
  "collector": "tavily",
  "queries": [
    {
      "market": "DE",
      "product": "corecap",
      "q": "BBB CoreCap tubeless valve site:bike24.de",
      "allowedDomains": ["bike24.de", "bike24.com"],
      "requiredKeywords": ["CoreCap"],
      "disallowedKeywords": ["pump", "tool"],
      "evidenceMode": "snippet_only"
    }
  ],
  "extractPrompt": "Count the number of distinct CoreCap product listings. Return the count as an integer.",
  "validator": {
    "type": "integer",
    "min": 0,
    "max": 50,
    "maxDeltaPct": 100,
    "maxDeltaAbs": 10,
    "zeroToNonzeroAllowed": true,
    "dependsOn": []
  },
  "minEvidenceCount": 1
}
```

**Hard constraints:**
- `enabled: false` → skip（不花 query）
- `locked: true` → automation 不可覆寫（manual curated data）
- 每次 run 有 global query cap（預設 30/run）
- 超過 cap 時，按 Tier A > B > C 優先順序執行

### R2. Collection Script

`scripts/update-sales-model-nodes.mjs`

1. 載入 query registry + current nodes.json
2. 篩選：`enabled && !locked && scheduleMatch(volatility, today)`
3. 檢查 global query cap
4. 對每個 eligible node：
   - 執行 Tavily search（或 API call）
   - 過濾結果：`allowedDomains`, `requiredKeywords`, `disallowedKeywords`
   - Claude Haiku tool_use 萃取值
   - 回傳值 + 完整 evidence
5. 輸出 patch file
6. Rate limiting: Tavily max 1 req/sec, Claude Haiku batch 5 concurrent
7. CLI flags: `--dry-run`, `--node 27`, `--tier A`, `--force`（忽略 schedule）

### R3. Claude API Extraction

Tool schema（每個 node 獨立呼叫）：

```json
{
  "name": "submit_node_value",
  "input_schema": {
    "nodeId": "integer",
    "product": "corecap | clik | null",
    "market": "string | null",
    "value": "number | null",
    "confidence": "high | medium | low",
    "sourceUrl": "string (matched result URL)",
    "sourceTitle": "string",
    "evidenceText": "string (relevant snippet, max 500 chars)",
    "extractionRationale": "string (why this number was chosen)",
    "unchanged": "boolean"
  }
}
```

**Budget cap:** 每日 < $0.50 API cost（Haiku ~$0.01/call x 21 nodes = $0.21 max）。

### R4. Patch Schema (Full Provenance)

`data/dashboards/patches/sales-model-patch-YYYY-MM-DD.json`:

```json
{
  "date": "2026-04-02",
  "methodVersion": "1.0.0",
  "extractorVersion": "1.0.0",
  "queryRegistryHash": "sha256:abc123...",
  "stats": {
    "eligible": 6,
    "collected": 5,
    "unchanged": 1,
    "failed": 0,
    "skipped": 0
  },
  "failures": [],
  "nodes": {
    "27": {
      "nodeType": "observed",
      "rawValue": 3,
      "product": "corecap",
      "market": "DE",
      "sourceUrl": "https://www.bike24.de/p1993546.html",
      "sourceTitle": "BBB Cycling CoreCap AL Valve BTI-166...",
      "evidenceText": "BBB Cycling CoreCap AL Valve BTI-166 Tubeless Ventil - schwarz | 40 mm",
      "extractionRationale": "Found 3 distinct CoreCap product pages on bike24.de: BTI-166 40mm, BTI-166 80mm, BTI-165 core set",
      "collector": "tavily",
      "model": "claude-haiku-4-5-20251001",
      "confidence": "medium",
      "previousValue": 3,
      "deltaPct": 0,
      "validatorResults": {
        "range": "pass",
        "delta": "pass",
        "evidence": "pass",
        "crossNode": "pass"
      },
      "requiresReview": false,
      "proposedChangeReason": "no change detected"
    }
  },
  "derived": {
    "31": {
      "nodeType": "derived",
      "derivedFrom": [10],
      "rawValue": 2.45,
      "calculation": "std_dev([14.95, 16.95, 12.99])",
      "confidence": "medium"
    }
  }
}
```

**Failure taxonomy** (用於 `failures[]`):

| Code | Meaning |
|------|---------|
| `search_failed` | Tavily API error or timeout |
| `no_relevant_result` | 搜尋有結果但不符合 allowedDomains/requiredKeywords |
| `extraction_failed` | Claude 無法從 evidence 萃取數值 |
| `validation_failed` | 值超出 range 或 delta 門檻 |
| `overwrite_blocked` | 現有值的 source precedence 更高 |
| `rate_limited` | 超過 global query cap |
| `locked` | Node 被 manual lock |

### R5. Multi-Layer Validation

每個 patch entry 通過四層驗證：

| Layer | Check | Example |
|-------|-------|---------|
| **1. Type/Range** | 型別正確 + min/max 範圍內 | BSR 1-999999, price > 0 |
| **2. Evidence** | sourceUrl 在 allowedDomains 裡 + evidenceText 包含 requiredKeywords + minEvidenceCount 達標 | 至少 1 筆 bike24.de 結果包含 "CoreCap" |
| **3. Delta** | Hybrid: percentage OR absolute threshold（見下方規則） | retailer count 從 3 變 30 = +900% → flag |

**Hybrid Delta Validation 規則：**
- 若 previousValue >= 10 → 用 `maxDeltaPct`（百分比門檻）
- 若 previousValue > 0 且 < 10 → 用 `maxDeltaAbs`（絕對值門檻），忽略百分比
- 若 previousValue = 0 且 newValue > 0 → 檢查 `zeroToNonzeroAllowed`，若 true 則 pass
- 若 previousValue = null（首次收集）→ delta check 自動 pass

理由：低基數節點（e.g. retailer count = 1 → 3 = +200%）用百分比會過度 flag。
| **4. Cross-Node** | 依賴節點已通過驗證 | #31 Price Dispersion 不可更新 if #10 Price 這次 failed |

**任一層失敗 → `requiresReview: true`，不自動 merge。**

### R6. Source Precedence & Overwrite Protection

每種 entryMethod 有 precedence rank：

| Rank | entryMethod | Source |
|------|-------------|--------|
| 1 (highest) | `direct` | 使用者手動在 dashboard 輸入 |
| 2 | `internal` | ERP / 內部系統 |
| 3 | `relationship` | 經銷商 / 業務關係 |
| 4 | `field` | 展會 / 實地觀察 |
| 5 | `web_search` | Claude 手動 web search（有人類確認） |
| 6 | `auto_api` | 自動 API 呼叫 |
| 7 (lowest) | `auto_tavily` | 自動 Tavily search + Claude 萃取 |

**Rule: 低 rank source 不可覆寫高 rank source，除非：**
1. `locked: false`（node 未被鎖定），且
2. delta > 20%（顯著變化），且
3. 新值 confidence >= 現有值 confidence

否則 → `overwrite_blocked`，寫入 patch 但標記 `requiresReview: true`。

### R7. Merge Rules (Apply Script)

`scripts/apply-sales-model-patch.mjs` 的完整 merge policy：

| Scenario | Action |
|----------|--------|
| `unchanged=true` | Skip |
| `locked=true` | Skip，記錄 `overwrite_blocked` |
| `requiresReview=true` | Skip，留在 patch 等 PR review |
| 新值 = null，現有值 != null | **不覆寫**，除非標記 `confirmed_missing` |
| 新值 source rank < 現有值 rank | 依 R6 precedence rule 決定 |
| 部分 market 更新（e.g. DE pass, UK fail） | 只更新 pass 的 market，保留其他 market 原值 |
| 部分 product 更新（corecap pass, clik fail） | 只更新 pass 的 product |
| All validators pass + delta < threshold | Auto-merge，記錄 previousValue |

**Merge 後：**
- 更新 `lastScan` timestamp
- 計算 derived nodes（#31, #42, #44）— **從 merge 後的完整 canonical observed state 重算，不只用這次 patch 的值**。若部分 observed node stale，derived node 的 confidence 降一級並加註 `"staleComponents": [nodeId]`。
- 每月 1 號 append history snapshot

### R8. PR Creation Rules (Deterministic)

| Condition | Action |
|-----------|--------|
| All unchanged | **No PR, no email** |
| Only low-confidence auto updates, all delta < 5% | **No PR**, email summary only |
| Any Tier A node delta > 10% | **Create PR** |
| Coverage % changed (new node collected or node went stale) | **Create PR** |
| Collector failure rate > 30% | **Create PR** + alert in email |
| Any `requiresReview: true` entries | **Create PR** |
| Any `overwrite_blocked` entries | **Create PR** |

**PR body 包含 markdown diff preview：**
```
| Node | Old | New | Delta | Confidence | Source | Requires Review |
|------|-----|-----|-------|------------|--------|:---:|
| #27 Retailer (CoreCap DE) | 3 | 4 | +33% | medium | bike24.de | |
| #30 Stockout | 8% | null | — | — | search_failed | * |
```

Email digest 只在 PR 建立時寄送。無 PR 時仍保留 run artifact（見 R13）。

### R9. Staleness by Node Class

不同 volatility 有不同 freshness 門檻：

| Volatility | Fresh | Stale | Outdated |
|-----------|-------|-------|----------|
| high | < 3 days | 3-7 days | > 7 days |
| medium | < 7 days | 7-14 days | > 14 days |
| low | < 14 days | 14-30 days | > 30 days |
| manual | < 30 days | 30-90 days | > 90 days |

`calculate.ts` 讀取 node 的 volatility 再套用對應門檻。

### R10. Monthly History Snapshot

每月 1 號的 run 額外產生 snapshot：

```json
{
  "month": "2026-04",
  "snapshotAt": "2026-04-01T21:30:00Z",
  "methodVersion": "1.0.0",
  "extractorVersion": "1.0.0",
  "queryRegistryVersion": "sha256:abc123...",
  "coverage": { "total": 66, "collected": 34, "stale": 5 },
  "estimation": { "corecapTotal": null, "clikTotal": null },
  "nodes": { "27": { "corecap": 4, "clik": 8 } }
}
```

`methodVersion` + `extractorVersion` + `queryRegistryVersion` 確保前後時間序列可比。Version bump 規則：

| 變更類型 | Bump |
|---------|------|
| extractPrompt 文字修改 | `extractorVersion` minor (1.0.x) |
| query 字串修改 | `methodVersion` minor (1.0.x) |
| 新增/移除 node | `methodVersion` major (1.x.0) |
| validator 邏輯改變 | `methodVersion` major (1.x.0) |
| Haiku → Sonnet model 切換 | `extractorVersion` major (1.x.0) |

歷史資料可用 version 欄位標記不同 methodology epoch，判斷前後是否可比。

### R11. GitHub Actions Workflow

`.github/workflows/sales-model-update.yml`:

```yaml
on:
  schedule:
    - cron: '0 21 * * *'     # Daily 05:00 TWN — runs Tier A
    - cron: '0 21 */3 * *'   # Every 3 days — also runs Tier B
    - cron: '0 21 * * 0'     # Sunday — also runs Tier C
  workflow_dispatch:
    inputs:
      tier:
        description: 'Override tier (A/B/C/all)'
        default: 'A'
```

**Flow:**
```
checkout → npm ci → collect (by tier schedule)
  → validate (4-layer)
  → generate patch + markdown summary
  → apply to temp copy of nodes.json
  → diff check
  → create PR (if threshold met)
  → email digest (if PR created)
```

注意：apply 是寫到 temp copy，PR review 通過 merge 後才真正更新 canonical nodes.json。

### R13. Run Artifact Retention

每次 run（無論是否建立 PR）都產生一份 machine-readable run summary：

`data/dashboards/patches/run-summary-YYYY-MM-DD.json`:

```json
{
  "date": "2026-04-02",
  "tier": "A",
  "queriesUsed": 14,
  "monthlyBurn": 234,
  "monthlyBudget": 1000,
  "nodes": {
    "eligible": 6,
    "collected": 5,
    "unchanged": 1,
    "failed": 0,
    "overwriteBlocked": 0
  },
  "prCreated": false,
  "reason": "all_unchanged",
  "failedNodes": [],
  "duration_ms": 45000
}
```

用途：
- Debug 連續 search failure（grep `failedNodes` across run summaries）
- 監控 monthlyBurn 趨勢（是否逼近 budget guardrail）
- 發現 coverage 逐步下降（stale nodes 累積）

保留 90 天。不寄 email、不建 PR，但人可以隨時查。

### R12. Manual Lock

Dashboard edit mode 新增 lock toggle per node：

- `locked: true` → node 旁顯示鎖頭 icon
- automation 不可覆寫 locked node
- 用途：保護 relationship/field/curated 數據不被自動化降級
- Lock 狀態存在 `sales-model-queries.json` 的 `locked` 欄位

## Implementation Steps

### Step 1: Query Registry + Node Classification

1. 新增 `data/dashboards/sales-model-queries.json`
2. 21 observed nodes 各一筆 config（含 volatility, enabled, locked, allowedDomains, validator）
3. 3 derived nodes 各一筆 config（含 `derivedFrom`, calculation rule）
4. `sales-model-config.json` 加 `staleness` per volatility class

### Step 2: Collection Script

1. 新增 `scripts/update-sales-model-nodes.mjs`
2. 實作 TavilyCollector + ApiCollector + SkipCollector
3. 實作 schedule matching（volatility → today's eligible tier）
4. 實作 global query cap + priority ordering
5. 實作 Claude Haiku extraction with full evidence return

### Step 3: Validation Engine

1. 新增 `lib/sales-model/validate.ts`（或 .mjs for scripts）
2. 實作 4-layer validation: range → evidence → delta → cross-node
3. 每個 entry 產生 `validatorResults` object

### Step 4: Apply Script

1. 新增 `scripts/apply-sales-model-patch.mjs`
2. 實作 source precedence check
3. 實作 partial market/product merge
4. 實作 null-protection (never overwrite non-null with null)
5. 實作 derived node calculation post-merge
6. 實作 monthly snapshot logic
7. 產生 markdown diff preview for PR body

### Step 5: GitHub Actions Workflow

1. 新增 `.github/workflows/sales-model-update.yml`
2. Multi-cron schedule (daily/3-day/weekly)
3. PR creation with deterministic threshold rules
4. Email via Resend (only when PR created)

### Step 6: Dashboard Updates

1. `calculate.ts` — staleness 改讀 volatility-based config
2. `dashboard-content.tsx` — 顯示 last auto-scan + freshness warning
3. NodeCard — lock toggle in edit mode

## Files Affected

| File | Change | Description |
|------|--------|-------------|
| `data/dashboards/sales-model-queries.json` | **new** | 21 observed + 3 derived node configs |
| `data/dashboards/patches/` | **new dir** | Daily patch files |
| `scripts/update-sales-model-nodes.mjs` | **new** | Collection script |
| `scripts/apply-sales-model-patch.mjs` | **new** | Patch merge + derived calc + PR summary |
| `lib/sales-model/validate.ts` | **new** | 4-layer validation engine |
| `.github/workflows/sales-model-update.yml` | **new** | Multi-cron workflow |
| `data/dashboards/sales-model-config.json` | edit | 加 staleness per volatility |
| `lib/sales-model/calculate.ts` | edit | Staleness 改讀 volatility config |
| `app/[locale]/(site)/reports/sales-model/dashboard-content.tsx` | edit | auto-scan display + lock toggle |
| `components/dashboard/NodeCard.tsx` | edit | Lock icon + indicator |
| `data/dashboards/sales-model-nodes.json` | (auto via PR) | 被 apply 更新 |
| `data/dashboards/sales-model-history.json` | (auto via PR) | 月初 snapshot |

## Data Model Changes

**No DB migration.** 全 JSON。

`sales-model-nodes.json` node 結構新增：
- `entryMethod: "auto_tavily" | "auto_api"` — 自動採集標記

`sales-model-queries.json` — 全新檔案（見 R1）

`sales-model-config.json` 新增：
```json
"staleness": {
  "high":   { "freshDays": 3,  "staleDays": 7 },
  "medium": { "freshDays": 7,  "staleDays": 14 },
  "low":    { "freshDays": 14, "staleDays": 30 },
  "manual": { "freshDays": 30, "staleDays": 90 }
}
```

Patch files（見 R4）存在 `data/dashboards/patches/` 目錄，保留 30 天後可清理。

History snapshot（見 R10）加 `methodVersion` + `extractorVersion` + `queryRegistryVersion`。

Run summary（見 R13）存在 `data/dashboards/patches/run-summary-*.json`，保留 90 天。

## Cost Estimate

| Resource | Daily | Monthly |
|----------|-------|---------|
| Tavily API (Tier A daily) | ~14 queries x $0.002 = $0.03 | ~$0.84 |
| Tavily API (Tier B 10x/mo) | | ~$0.40 |
| Tavily API (Tier C 4x/mo) | | ~$0.13 |
| Claude Haiku (extraction) | ~6 calls/day avg | ~$0.20 |
| GitHub Actions | ~3 min/run | free tier |
| Resend email | ~10/month | free tier |
| **Total** | | **~$1.57/month** |

Tavily 總量 ~788 queries/month，在 free tier 1,000 以內。

## Test Plan

1. **Dry run:** `node scripts/update-sales-model-nodes.mjs --dry-run` — mock evidence，確認 patch 格式 + validator 邏輯
2. **Single node:** `--node 27` — 跑 Bike24 retailer count，驗證 Tavily → filter → Haiku → patch 全流程
3. **Validation test:** 手造一份 patch，BSR = -1 → range fail, delta = +900% → delta fail, sourceUrl = reddit.com → evidence fail
4. **Precedence test:** 手動修改一個 node 為 `entryMethod: "direct"` confidence `"high"`，跑 auto patch 確認 `overwrite_blocked`
5. **Lock test:** 設 `locked: true`，確認 collector skip + patch 記錄 `locked`
6. **Partial merge:** Patch 裡 corecap pass + clik fail，確認只更新 corecap
7. **Derived node:** #10 price 更新後，確認 #31 price dispersion 自動計算
8. **History:** 設日期為月初，確認 snapshot append + methodVersion 正確
9. **PR threshold:** 全 unchanged → no PR; Tier A delta > 10% → PR created
10. **GitHub Actions:** `workflow_dispatch` tier=A，確認 PR + email

## Risks & Open Questions

1. **Amazon BSR/Review 仍是盲區。** 如果未來需要 BSR 數據，需 Keepa API ($19/mo)。目前先放棄這兩個 node，不影響三大估計器核心邏輯（BSR 在 aftermarket estimator 權重 0.25，可暫用 Bike24 listing 作為 proxy）。

2. **Tavily snippet 品質波動。** 同一 query 不同天可能回傳不同品質的 snippet。4-layer validation 是護欄，但 extraction prompt 的品質決定上限。建議初期所有 auto 值預設 confidence = `"medium"`。

3. **methodology version 何時 bump？** 見 R10 的 version bump 規則表。記在 CHANGELOG 裡。

4. **Patch 檔案累積。** 30 天後的 patch 可 auto-delete（GitHub Actions step）。保留近 30 天供 debug。

5. **PR 仍需人工 merge。** 這是設計。如果未來確認 Tier A auto-collect 品質穩定 > 3 個月，可討論 auto-merge for Tier A unchanged/low-delta updates。

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| 放棄 Amazon BSR/Review automation | Hit rate test 證實 Tavily 抓不到 snippet 裡的 BSR |
| 不是所有 node 每日更新 | Gemini + ChatGPT review 一致指出 volatility 分層是必要的 |
| observed vs derived 分離 | Review velocity / BSR persistence / price dispersion 是計算值，不該獨立抓 |
| Source precedence 硬規則 | 防止自動化降級手動 curated 數據 |
| 4-layer validation | Range-only 不夠，需 evidence + delta + cross-node |
| Patch 保留完整 evidence | 否則 PR review 變猜測 |
| PR threshold 確定性規則 | 避免 PR 疲勞或漏報 |
| Apply 到 temp copy | PR merge 才寫入 canonical file，不是 apply 直接改 |
| Tavily free tier 足夠 (scheduled policy) | ~788/month < 1,000 limit + auto-throttle guardrail |
| Hybrid delta validation | 低基數 node 用 absolute threshold，避免 false flag |
| Derived recompute from canonical state | 不只用當次 patch，用 merge 後完整 observed state |
| extractorVersion 獨立追蹤 | prompt 改變影響萃取品質，需獨立於 methodVersion |
| Run artifact 永遠保留 | 無 PR 也留 summary，確保 observability |
| Monthly budget auto-throttle | 超 75% → 停 C → 停 B → A 永不自動停 |
