# Valve Intel Bot Dev Spec

**Project:** nslin-site (N.S.-LIN)
**Date:** 2026-03-30
**Status:** Draft

## Overview

為 N.S.-LIN 團隊建立一個對話式市場情報 bot，讓你弟可以用自然語言問問題，bot 自動從多個數據源整理答案。

靈感來自 Ramp 的「Voice of the Customer」agent — 8 天的研究變成 8 分鐘。

**核心差異：** 我們的數據源不是 Gong/Salesforce，而是零售網站、論壇、dashboard nodes、內部出貨紀錄。

## 使用情境

你弟打開 LINE 或 Slack，問：
- 「CoreCap 在 Bike24 有缺貨嗎？」
- 「Clik 最近論壇上有什麼新討論？」
- 「這個月的出貨量跟上個月比？」
- 「競品有新產品上市嗎？」
- 「幫我更新 dashboard 的零售商數據」

Bot 回答 + 附上數據來源連結。

## Architecture

```
User (LINE / Slack / Claude Code)
  ↓
Valve Intel Bot (Cloudflare Worker)
  ├─ /api/intel/ask (POST) — 自然語言問答
  ├─ /api/intel/scan (POST) — 執行指定掃描任務
  └─ /api/intel/status (GET) — dashboard 覆蓋率
  ↓
Data Sources:
  ├─ sales-model-nodes.json (dashboard 數據)
  ├─ WebFetch → Bike24 / Amazon / R2-Bike (零售掃描)
  ├─ WebSearch → forum threads / news (輿情)
  ├─ Internal → N.S.-LIN 出貨 (手動輸入 or API)
  └─ Competitive Intel → docs/*.md (KB)
```

**Phase 1 做法（最簡）：** 不建新 Worker。做成 Claude Code Skill (`/valve-intel ask`)，用現有的 WebSearch + WebFetch + JSON 讀寫。你弟透過你來問，或直接在 dashboard edit mode 操作。

**Phase 2 做法：** LINE Bot（Messaging API）或 Slack Bot → Cloudflare Worker → AI 回答。你弟直接在手機上問。

## Requirements

### Phase 1: Claude Code Skill Enhancement

1. 擴充 `/valve-intel` skill，增加 `ask` 子命令
2. `ask` 接受自然語言問題，自動判斷：
   - 需要掃描零售網站 → WebFetch Bike24/Amazon
   - 需要查論壇 → WebSearch forum threads
   - 需要查 dashboard 數據 → 讀 sales-model-nodes.json
   - 需要查 KB → 讀 COMPETITIVE_LANDSCAPE*.md
3. 回答格式：摘要 + 數據 + 來源連結 + 建議動作
4. 自動更新 nodes.json（如果掃描到新數據）

### Phase 2: LINE Bot

5. Cloudflare Worker 接收 LINE Messaging API webhook
6. 用 Claude API 處理自然語言 → 判斷意圖 → 執行查詢
7. 回覆到 LINE（text + flex message for rich format）
8. 定時推播：每週一早上自動推送「上週市場摘要」

## Data Sources

| Source | Type | 頻率 | 方法 |
|--------|------|------|------|
| Bike24 product pages | 零售 | 每次詢問 | WebFetch |
| Amazon product pages | 零售 | 需 Helium10 or manual | blocked by bot |
| R2-Bike / Alltricks | 零售 | 每次詢問 | WebFetch |
| Weight Weenies / MTBR / Singletrack | 論壇 | 每次詢問 | WebSearch |
| Google Trends | 搜尋量 | 手動 CSV | manual |
| sales-model-nodes.json | Dashboard | 即時 | file read |
| COMPETITIVE_LANDSCAPE*.md | KB | 即時 | file read |
| N.S.-LIN 出貨紀錄 | 內部 | 手動輸入 | user input |

## Implementation — Phase 1

更新 `/valve-intel` skill：

```markdown
### `ask <question>` — 自然語言問答

1. 解析問題意圖
2. 判斷需要哪些數據源
3. 執行查詢（WebSearch / WebFetch / file read）
4. 整理回答 + 來源連結
5. 如果收集到新數據，自動更新 nodes.json
```

## Files Affected

| File | Change | Description |
|------|--------|-------------|
| `~/.claude/commands/valve-intel.md` | edit | 增加 `ask` 子命令 |
| `data/dashboards/sales-model-nodes.json` | edit | 自動更新新數據 |

## Test Plan

1. `/valve-intel ask CoreCap 在 Bike24 有缺貨嗎` → 回答 + 更新 #30
2. `/valve-intel ask Clik 最近有什麼新聞` → WebSearch + 摘要
3. `/valve-intel ask dashboard 覆蓋率多少` → 讀 nodes.json + 回報

## Risks & Open Questions

1. **Phase 2 LINE Bot 需要 Claude API key** — 月費？建議用 Haiku 降低成本
2. **Amazon 封鎖** — bot 也一樣被擋，需要 Helium10 或手動
3. **即時性 vs 快取** — 每次問都重新掃描太慢，要有快取策略
4. **你弟的 AI 熟練度** — Phase 1 透過你操作，Phase 2 才讓他直接用
