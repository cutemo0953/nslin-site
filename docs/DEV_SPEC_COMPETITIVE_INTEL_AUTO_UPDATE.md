# Dev Spec: 競品情報資料庫自動更新 (v2)

> 狀態：APPROVED v2.1
> 作者：架構師
> 日期：2026-03-14
> 審核：Gemini + ChatGPT 兩輪架構審核已整合（v1 → v2 → v2.1）

---

## 目標

建立競品情報收集與更新系統：AI 自動收集、整理、比對、提出變更；真正發佈必須經過 evidence-aware review。

**不是**「讓 AI 每週自動更新競品報告」。
**而是**「讓 AI 每週自動收集情報並提出結構化變更提案，人工審核後才發佈」。

---

## 架構概觀

```
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│ GitHub Actions    │────▶│ 1. Fetch Sources     │────▶│ 2. Claude API        │
│ Cron (weekly)     │     │ (Tavily / Firecrawl) │     │ (JSON proposals)     │
└──────────────────┘     └─────────────────────┘     └──────────┬───────────┘
                                                                │
┌──────────────────┐     ┌──────────────────────┐               │
│ Human Review      │◀────│ 4. Create PR         │◀───(diff)────┘
│ (Merge to Main)   │     │ + evidence artifacts │    3. Write data/*.json
└─────────┬────────┘     └──────────────────────┘
          │
┌─────────▼──────────────────────────────────────┐
│ 5. Post-merge: gen-report → build → deploy     │
└────────────────────────────────────────────────┘
```

### 核心原則

1. **AI 是提案引擎，不是發佈引擎** — AI 產出 JSON proposals，不直接改寫 markdown
2. **PR-based review** — 所有變更透過 PR，不直接 commit 到 main
3. **資料與呈現分離** — `data/competitive-intel/*.json` 是 evidence layer，`docs/*.md` 是 presentation layer
4. **Evidence-traceable** — 每一筆變更都附 source URL + retrieval timestamp + evidence snippet

---

## Data Schema

### 資料拆分原則（v2.1）

不讓單一 JSON 同時扮演 profile、timeline、editorial 三種角色。拆成五個檔案：

| 檔案 | 職責 | 變動頻率 |
|------|------|---------|
| `competitor-entities.json` | 穩定身份資料（brand, product, tier, official_url, patent_ids） | 極低 |
| `competitor-current-state.json` | 當前接受的事實（specs, awards, verification） | 低～中 |
| `price-snapshots.json` | 價格時間序列 | 每週 |
| `evidence-log.json` | 證據紀錄與變更追蹤 | 每週 |
| `market-signals.json` | Class 4 雜訊（論壇、YouTube、弱來源） | 每週 |

### competitor-entities.json（穩定身份）

```jsonc
{
  "entities": [
    {
      "id": "reserve-fillmore",
      "brand": "Reserve",
      "product": "Fillmore Valve",
      "tier": 1,
      "official_url": "https://reservewheels.com/products/fillmore-tubeless-valves",
      "patent_ids": ["US 10,926,591 B2"]
    }
  ]
}
```

### competitor-current-state.json（當前接受的事實）

```jsonc
{
  "states": [
    {
      "entity_id": "reserve-fillmore",
      "specs": {
        "material": "7000-series aluminum",
        "valve_type": "Presta",
        "airflow_claim": "3x",
        "lengths": ["50mm", "70mm", "90mm"],
        "weight_per_valve_g": null,
        "anti_clog": "poppet design",
        "insert_compatible": true,
        "retrofit": false,
        "integrated_tool": false
      },
      "awards": ["Multiple best-of-year selections"],
      "verification_status": "verified",
      "last_updated": "2026-03-14",
      "field_freshness": {
        "specs": "2026-03-14",
        "awards": "2026-01-15",
        "pricing": "2026-03-14"
      }
    }
  ]
}
```

`field_freshness` 欄位級新鮮度 — 同一個 competitor 的不同面向，驗證時間不同。比整份報告一個 timestamp 更真實。

### evidence-log.json

```jsonc
{
  "evidence": [
    {
      "id": "ev-2026-03-14-001",
      "entity_id": "reserve-fillmore",
      "change_type": "price_update",
      "old_value": "$49.99",
      "new_value": "$44.99",
      "field": "pricing.usd_per_pair",
      "source": {
        "type": "official_site",
        "url": "https://reservewheels.com/products/fillmore-tubeless-valves",
        "retrieved_at": "2026-03-14T08:00:00Z",
        "snippet": "Price: $44.99 per pair"
      },
      "confidence": 0.95,
      "change_class": 2,
      "requires_review": true,
      "status": "pending"  // pending → accepted / rejected
    }
  ]
}
```

**歸檔策略**：主檔只保留最近 6 個月紀錄。超過 6 個月的 evidence 由腳本自動移至 `evidence-log-YYYY-QN.json`（如 `evidence-log-2026-Q1.json`）。避免長期膨脹導致 PR diff 難以閱讀。

### price-snapshots.json

```jsonc
{
  "snapshots": [
    {
      "entity_id": "reserve-fillmore",
      "date": "2026-03-14",
      "price": 49.99,
      "currency": "USD",
      "price_type": "MSRP",       // MSRP | street | sale
      "seller": "official_site",   // official_site | amazon | bike24 | ...
      "pack_quantity": 2,          // 通常以「對」為單位
      "tax_included": false,
      "shipping_included": false,
      "in_stock": true,
      "raw_price_text": "$49.99 per pair",
      "normalized_per_unit": 25.00, // 單支換算
      "notes": null
    }
  ]
}
```

**同樣適用歸檔策略**：主檔保留最近 6 個月，舊資料歸檔。

---

## Source Trust Policy

### 來源可靠度階層

| 等級 | 來源類型 | 可更新的欄位 | 用字規範 |
|------|---------|------------|---------|
| S | 官方產品頁 | specs, official pricing, lengths, colors | "confirmed" |
| A | 官方新聞稿 / press release | awards, launch info, specs | "confirmed" |
| A | 已核准專利 | patent_ids, mechanism details | "patented" |
| B | 大型媒體評測 (Bikerumor, Pinkbike, BikeRadar) | reviews, measured performance, pricing | "reported by [source]" |
| B | 零售平台 (Amazon, Bike24) | street pricing, ratings, review count | "listed at" |
| C | 論壇 (MTBR, Weight Weenies) | rider sentiment only | "community reports suggest" |
| C | YouTube 評測 | media coverage mentions only | "featured in" |
| D | 單一弱來源 / 推測 | **不可覆寫 canonical facts** | 只進 market_signals |

### 規則

- S/A 級來源可直接更新 competitors.json 欄位
- B 級來源可更新 pricing (標記 `source: "retail"`)、新增 review mentions
- C/D 級來源只能寫入 `market_signals` 區塊，不能修改主資料
- 價格必須標明 MSRP vs street / 地區 / 幣別 / 是否折扣

---

## Change Classification & Merge Policy

| Class | 類型 | 範例 | 合併策略 |
|-------|------|------|---------|
| **1** | 低風險機械變更 | timestamp、link 更新、新來源附加、broken link 修補 | **Auto-accept**（PR 內自動標記） |
| **2** | 結構化事實變更 | 新產品上市、spec 改變、停產、價格變動 | **PR review required** |
| **3** | 詮釋型變更 | 品牌定位改變、獎項重要性評估、市場敘事 | **PR review required + 標記 [INTERPRETIVE]** |
| **4** | 低可信雜訊 | 論壇說法、單一評論、YouTube 主觀評測 | **不進主報告**，只 append 到 market_signals |

---

## Phase 1: 頁面顯示更新時間（小事，直接做）

### 做法
- `scripts/gen-report-content.mjs` 生成時寫入 `lastUpdated` 和 `evidenceLastCollected` 時間戳
- `page.tsx` footer 顯示更新資訊

### 改動
1. `data/reports/content.generated.ts` — 新增 exports：
   - `reportLastUpdated: Record<string, string>` (report 更新時間)
   - `reportEvidenceCollected: Record<string, string>` (情報收集時間)
2. `page.tsx` footer：
   - 「報告最後更新：YYYY-MM-DD」
   - 「情報最後收集：YYYY-MM-DD」
   - 距上次更新 > 14 天 → 顯示「資料可能已過時」警告

---

## Phase 2: 手動觸發情報收集 + AI 提案（中事）

### 流程

```
node scripts/collect-competitive-intel.mjs
  │
  ├─ 1. Fetch sources (Tavily API / Firecrawl / RSS)
  ├─ 2. Normalize extracted facts
  ├─ 3. Claude API → JSON change proposals
  ├─ 4. Validate schema + source trust + confidence
  ├─ 5. Write to data/competitive-intel/proposals-YYYY-MM-DD.json
  └─ 6. Generate human-readable diff (terminal output)
```

**不直接覆寫 docs/*.md。** 人工審核 proposals JSON 後，執行：
```
node scripts/apply-competitive-intel.mjs
  │
  ├─ 1. Read accepted proposals
  ├─ 2. Update competitors.json + evidence-log.json
  ├─ 3. Regenerate docs/*.md from structured data
  └─ 4. Update lastUpdated timestamps
```

### 資料來源

| 優先級 | 來源 | 頻率 | 抓取方法 | Trust Level |
|--------|------|------|---------|-------------|
| P0 | 各品牌官網（價格、規格） | 每週 | Firecrawl / Jina Reader | S |
| P1 | Bikerumor、Pinkbike、BikeRadar RSS | 每週 | RSS feed parse | B |
| P1 | Google Patents | 每月 | Patents API | A |
| P2 | Amazon（價格、評分） | 每週 | Tavily search | B |
| P2 | MTBR、Weight Weenies 論壇 | 每月 | Tavily search | C |
| P3 | YouTube | 每月 | YouTube Data API | C |

### 來源抓取 Adapter Layer（v2.1）

設計 adapter 介面，隔離 provider-specific 實作，未來換工具不用整體重寫：

```typescript
interface SourceAdapter {
  fetchOfficialPage(url: string): Promise<SourceResult>;
  fetchRSSFeed(feedUrl: string): Promise<SourceResult[]>;
  fetchPatentRecord(patentId: string): Promise<SourceResult>;
  fetchRetailListing(query: string): Promise<SourceResult[]>;
}

// 初期實作
class TavilyAdapter implements SourceAdapter { ... }
class FirecrawlAdapter implements SourceAdapter { ... }
```

### 為什麼不用 fetch + cheerio

1. B2C 網站 DOM 結構頻繁變動，CSS selector 維護成本高
2. GitHub Actions IP 在多數 WAF 黑名單中
3. Tavily / Firecrawl 專為 LLM 設計，回傳乾淨 Markdown，繞過基本反爬蟲

### Claude API 呼叫策略（v2.1）

#### Schema 強制約制

**不只靠 prompt。** 使用 Claude API **Tool Use (Function Calling)** 功能，強制 AI 透過 `submit_proposals` tool 回傳結構化物件。搭配 Zod 在 write time 驗證：

```typescript
import { z } from 'zod';

const ProposalSchema = z.object({
  entity_id: z.string(),
  change_type: z.enum(['price_update', 'spec_update', 'new_product', 'discontinued', 'award', 'patent', 'source_append']),
  field: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string(),
  evidence: z.object({
    source_url: z.string().url(),
    source_type: z.enum(['official_site', 'press_release', 'patent', 'media_review', 'retail', 'forum', 'youtube']),
    retrieved_at: z.string().datetime(),
    snippet: z.string().max(500),
  }),
  confidence: z.number().min(0).max(1),
  change_class: z.number().int().min(1).max(4),
});

const ProposalsArraySchema = z.array(ProposalSchema);
```

**每輪每欄位只允許一筆 proposal**（去重）。Zod parse 失敗 → 不寫入，log 錯誤。

#### Context Window 批次處理

**一個競品實體呼叫一次 Claude API**。不把所有 20+ 競品的資料和新證據一次丟進去。

```
for (const entity of entities) {
  const evidence = newEvidence.filter(e => e.entity_id === entity.id);
  if (evidence.length === 0) continue;
  const proposals = await callClaude(entity, evidence); // 單一 entity focus
  allProposals.push(...proposals);
}
```

好處：避免 Lost in the middle 問題、可平行化、token 用量精確可控。

#### Prompt 架構

```
System: You are a competitive intelligence analyst for tubeless bicycle valves.
You receive:
1. Current state of ONE competitor (JSON)
2. Newly collected evidence for this competitor

Your job:
- Compare new evidence against existing data
- Call the submit_proposals tool with your findings
- Each proposal must include: entity_id, change_type, field, old_value, new_value, evidence, confidence, change_class
- Do NOT invent information. If evidence is ambiguous, set confidence < 0.5 and change_class = 4
- If no changes detected, call submit_proposals with an empty array
```

#### 成本估算

| 項目 | 單次成本 |
|------|---------|
| Tavily API (~20 queries) | ~$0.20 |
| Claude API (~18 entities × ~8K tokens) | ~$0.40 |
| Total per run | ~$0.60 |
| Monthly (4x) | ~$2.40 |

---

## Phase 3: GitHub Actions 自動排程 + PR（中事）

### Workflow: `.github/workflows/competitive-intel.yml`

```yaml
name: Competitive Intel Collection
on:
  schedule:
    - cron: '0 8 * * 1'  # 每週一 08:00 UTC
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci

      - name: Collect intelligence & generate proposals
        run: node scripts/collect-competitive-intel.mjs
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          TAVILY_API_KEY: ${{ secrets.TAVILY_API_KEY }}

      - name: Check for non-empty proposals
        id: check
        run: |
          # 防空 PR：確認有 proposals 檔案 AND 內容 length > 0
          FILE=$(ls data/competitive-intel/proposals-*.json 2>/dev/null | head -1)
          if [ -n "$FILE" ] && node -e "const p=require('./$FILE'); process.exit(p.length > 0 ? 0 : 1)"; then
            echo "has_proposals=true" >> $GITHUB_OUTPUT
          else
            echo "has_proposals=false" >> $GITHUB_OUTPUT
          fi

      - name: Generate reviewer artifacts
        if: steps.check.outputs.has_proposals == 'true'
        run: node scripts/generate-proposal-summary.mjs

      - name: Create PR with proposals
        if: steps.check.outputs.has_proposals == 'true'
        run: |
          BRANCH="intel-update-$(date +%Y-%m-%d)"
          git checkout -b "$BRANCH"
          git add data/competitive-intel/
          git commit -m "chore: competitive intel proposals $(date +%Y-%m-%d)"
          git push -u origin "$BRANCH"
          # PR body 包含 proposal-summary.md 內容（reviewer artifact）
          gh pr create \
            --title "Competitive Intel Update $(date +%Y-%m-%d)" \
            --body-file data/competitive-intel/proposal-summary.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 關鍵設計：不自動 deploy

- CI 只收集情報 + 開 PR
- PR 附 evidence artifacts (proposals JSON) + reviewer summary
- 人工 review → merge → 手動 apply + deploy
- 未來穩定後，可加 post-merge hook 自動 apply + deploy（但 merge 本身永遠需要人工）

### Reviewer Artifacts（v2.1）

`scripts/generate-proposal-summary.mjs` 自動生成 `data/competitive-intel/proposal-summary.md`，包含：

1. **Summary table** — 依 class / competitor / field 分組的變更摘要
2. **Source links** — 每筆 proposal 直接連結到 source URL
3. **Before/After** — 每筆 factual (Class 2) 變更的新舊值對照
4. **Confidence-sorted queue** — confidence 低的排最上面，方便 reviewer 優先檢視可疑項目
5. **Review checklist**：
   - [ ] Check Class 2 proposals (factual changes) for accuracy
   - [ ] Check Class 3 proposals (interpretive) for editorial quality
   - [ ] Verify price changes against source URLs
   - [ ] Confirm no Class 4 (noisy) items leaked into main data

PR body 直接用 `--body-file` 載入此檔，reviewer 不需要翻 raw JSON。

### 需要的 Secrets

| Secret | 用途 |
|--------|------|
| `ANTHROPIC_API_KEY` | Claude API |
| `TAVILY_API_KEY` | 情報搜尋 |
| `GITHUB_TOKEN` | 開 PR（內建） |

注意：不需要 `CLOUDFLARE_*` secrets — CI 不負責 deploy。

---

## Phase 4: 頁面狀態提示（小事）

頁面 footer 顯示：
- 「報告最後更新：2026-03-14」
- 「情報最後收集：2026-03-14」
- 「下次自動收集：每週一」
- 距上次更新 > 14 天 → 顯示「資料可能已過時」警告
- Verification badge：`verified` / `pending review` / `partially verified`

### Verification Badge 語義定義（v2.1）

| Badge | 定義 | 觸發條件 |
|-------|------|---------|
| `verified` | 所有影響當前顯示內容的 Class 2 變更都已人工審核 | 無 pending proposals 且最近一輪 PR 已 merge |
| `pending review` | 至少一筆未處理 proposal 影響可見內容 | 有 open PR 含 Class 2/3 proposals |
| `partially verified` | 頁面中同時存在已驗證內容與未重新驗證的舊資料 | 部分欄位 `field_freshness` 超過 30 天 |

---

## Failure Behavior

| 情境 | 行為 |
|------|------|
| Scrape 失敗（某來源 timeout/403） | 跳過該來源，log 警告，繼續其他來源 |
| Claude API 回傳無效 JSON | 不寫入 proposals，log 錯誤 |
| Claude confidence < 0.5 | 標記 `change_class: 4`，不進主資料 |
| 所有來源都失敗 | 不開 PR，只 log |
| 無任何變更 | 不開 PR |
| **絕對不可**：清空欄位、靜默降低 confidence、覆寫 verified 內容 |

---

## Auditability

每一條對外可見的報告敘述都必須能追溯到 evidence-log.json 中的 evidence item。

追溯路徑：
```
page.tsx 顯示的文字
  └─ docs/*.md 的對應段落
      └─ competitors.json 的對應欄位
          └─ evidence-log.json 的 evidence item
              └─ source URL + retrieval timestamp + snippet
```

---

## 風險與限制

| 風險 | 嚴重度 | 緩解措施 |
|------|--------|---------|
| AI 幻覺（錯誤更新） | 高 | JSON proposals + PR review + evidence tracing |
| 爬取失敗（WAF/改版） | 中 | Tavily/Firecrawl 取代 raw scrape；失敗不中斷 |
| 價格解讀錯誤 | 中 | Price normalization（MSRP/street/region/currency 分開）|
| Interpretation drift | 中 | Class 3 變更永遠 PR-only + [INTERPRETIVE] 標記 |
| 來源結構改版 | 低 | AI search API 抽象化了 DOM 依賴 |
| 費用 | 低 | ~$2/月，可接受 |

---

## 實作順序

1. **Phase 1**（頁面顯示更新時間）→ 直接做
2. **Phase 2**（手動情報收集 + AI proposals）→ 寫完後 demo 一次，手動跑幾週驗證品質
3. **Phase 3**（GitHub Actions 排程 + PR）→ Phase 2 穩定後才開
4. **Phase 4**（頁面狀態提示 + verification badge）→ 跟 Phase 3 一起

### 初期自動化範圍（收窄）

Phase 2 第一版只處理：
- last updated timestamp
- 新來源連結附加
- S/A 級來源的價格快照更新
- 新專利 / 新評測條目 append

**不自動化** narrative comparison sections（定位分析、趨勢判斷）。

### Narrative 層所有權規則（v2.1）

| 內容類型 | 誰擁有 | AI 可以做什麼 |
|---------|--------|-------------|
| Structured facts（specs, pricing, awards） | 系統（可自動再生成） | 直接更新 current-state.json |
| Interpretive narrative（定位分析、趨勢判斷） | **Editor-owned** | 只能在 sidecar file 或 PR comment 草擬，**不可直接覆寫** |
| 表格（競品比較表） | 系統 | 從 structured data 自動生成 |

`apply-competitive-intel.mjs` 的 apply 規則：
- 只有 accepted 的 **Class 1/2** 可修改 canonical state
- **Class 3** 只能進 `interpretive_notes_draft.json`（reviewer 手動決定是否採納到 docs/*.md）
- **Class 4** 一律 append 到 `market-signals.json`

---

## 變更摘要

### v1 → v2

| v1 問題 | v2 修正 |
|---------|---------|
| AI 直接改寫 markdown → deploy | AI 輸出 JSON proposals → PR review → 人工 merge |
| fetch + cheerio 爬蟲 | Tavily / Firecrawl AI search API |
| Markdown 同時是資料庫 + 呈現 | JSON evidence layer + Markdown presentation layer 分離 |
| 無 evidence model | 每筆變更附 source URL + timestamp + snippet + confidence |
| 無 change classification | 四級分類（mechanical / factual / interpretive / noisy） |
| 無 source trust policy | S/A/B/C/D 五級，明確定義可更新欄位與用字規範 |
| 直接 commit to main | PR-based review，CI 不負責 deploy |
| 無 failure behavior | 明確定義各失敗情境的處理方式 |
| 無 auditability | 完整追溯路徑：page → markdown → JSON → evidence → source |

### v2 → v2.1（Gemini + ChatGPT Round 2）

| v2 缺口 | v2.1 修正 |
|---------|----------|
| JSON 輸出只靠 prompt，偶爾格式壞掉 | Tool Use + Zod schema 強制驗證 |
| 單一 competitors.json 混合太多角色 | 拆五檔：entities / current-state / price-snapshots / evidence-log / market-signals |
| 所有競品一次塞進 context → Lost in the middle | 一個 entity 呼叫一次 Claude API |
| evidence-log 長期膨脹 | 6 個月歸檔策略 |
| 空 proposals 仍開 PR | proposals.length 檢查 |
| Reviewer 看 raw JSON | 自動生成 proposal-summary.md（分組、排序、before/after） |
| Narrative 誰可改沒定義 | 明確三層所有權 + apply 規則 |
| Verification badge 語義模糊 | 精確定義 verified / pending review / partially verified |
| 價格快照太薄 | 加 seller / pack_qty / tax / shipping / in_stock / raw_text / normalized |
| 來源抓取直接綁 Tavily | Adapter layer 隔離 provider 實作 |
| 報告只有一個全域 timestamp | Field-level freshness per entity |

---

## 與 denovortho-site knowledge base 的差異

| | denovortho-site | nslin-site |
|---|---|---|
| 更新對象 | blog SEO metadata | 競品情報（structured data + narrative） |
| 資料來源 | Lighthouse + SEO checks | 競品官網 + 媒體 + 論壇 + 專利 |
| AI 角色 | 無 | 收集 + 比對 + 提出 JSON proposals |
| 資料層 | JSON report（一次性） | evidence-log + competitors.json（持久） |
| 發佈方式 | 自動 | PR review → 人工 merge → deploy |
| 審計性 | N/A | 每筆敘述可追溯到 evidence item |
