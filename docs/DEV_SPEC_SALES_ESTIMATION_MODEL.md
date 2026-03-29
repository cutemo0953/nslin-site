# Bicycle Valve Market Sales Estimation Model Dev Spec

**Project:** nslin-site (N.S.-LIN competitive intelligence)
**Date:** 2026-03-30
**Status:** Rev 2 — ChatGPT + Gemini reviewed, nodes expanded from 26 to 50+

## Overview

建立一套可重複執行的銷售量推估模型，用於估算：
1. **BBB CoreCap** 的全球終端銷售量（我方有出貨數據作為校準基準）
2. **Schwalbe Clik Valve** 的全球終端銷售量（最大競品，無直接數據）
3. **替代閥門整體市場**（Reserve Fillmore、Muc-Off、Legion、Topeak 等）

**校準基準：** N.S.-LIN 半年出貨 BBB CoreCap 超過 10 萬支。這是 hard data，所有推估模型必須與此對齊。

## Critical Framework Correction (Review Consensus)

**原始 spec 的盲點：過度偏向零售端 (Aftermarket)。** 氣嘴跟著「輪組」走，不是跟著「整車」走。100K/半年的 BBB 出貨量很可能不是 aftermarket 滲透率，而是 OEM 量體直接轉移。

**必須拆分：**
- **Aftermarket TAM** — 消費者主動改裝（Amazon、LBS、官網）
- **OEM TAM** — 輪組廠/整車廠標配（DT Swiss、Mavic、Trek、Giant...）

**推估模型不該只問「消費者去哪買」，更要問「品牌商與供應鏈的決策節點在哪」。**

## 已識別的數據節點

### Tier 1 — Hard Data（精確，可直接使用）

| # | 節點 | 數據類型 | 取得方式 | 精確度 |
|---|------|---------|---------|--------|
| 1 | **N.S.-LIN → BBB 出貨量** | 月/季度出貨數 | 內部 ERP / 出貨紀錄 | 精確 |
| 2 | **N.S.-LIN 生產排程** | 產能利用率、交期 | 內部 | 精確 |
| 3 | **BBB 下單紀錄** | PO 金額、數量、頻率 | 內部業務系統 | 精確 |

### Tier 2 — Structured External Data（中高精確度，需付費或申請）

| # | 節點 | 數據類型 | 取得方式 | 精確度 | 估計成本 |
|---|------|---------|---------|--------|---------|
| 4 | **Amazon BSR → 銷量** | CoreCap / Clik 在 Amazon 的月銷量 | Helium10 / Jungle Scout（免費試用或 $39-79/mo） | 中-高 | $0-79/mo |
| 5 | **Amazon review count → 銷量** | Review 數 × 反推比例（5-15 reviews per 100 units） | 手動計數 or 爬蟲 | 中 | 免費 |
| 6 | **海關進出口數據** | HS Code 8714（自行車零件）進出口量 | TradeVision / Volza / Cybex（$50-500/query） | 中-高 | $50-500 |
| 7 | **Schwalbe (Ralf Bohle GmbH) 財務數據** | 德國商業登記處年報 | NorthData.com（部分免費）/ Bundesanzeiger | 中 | 免費-€50 |
| 8 | **BBB Cycling (Augusta Benelux) 財務數據** | 荷蘭 KvK 商業登記年報 | KvK.nl / Owler（$8M 年營收已知） | 中 | 免費-€28 |
| 9 | **QBP / Wiggle / Chain Reaction 經銷商數據** | 北美/歐洲分銷商的 CoreCap/Clik 進貨量 | 業務關係 / 直接詢問 | 中-高 | 免費（關係） |
| 10 | **Google Shopping / PriceRunner 定價追蹤** | 零售商數量 × 庫存狀態 | 手動或 Prisync/Competera | 中 | 免費-$99/mo |

### Tier 3 — Proxy Signals（間接指標，需校準）

| # | 節點 | 數據類型 | 取得方式 | 精確度 | 校準方法 |
|---|------|---------|---------|--------|---------|
| 11 | **Google Trends** | CoreCap vs Clik 搜尋量比（相對值） | trends.google.com | 低-中 | 用已知 CoreCap 銷量校準比例 |
| 12 | **YouTube 評測影片觀看數** | 產品曝光 ≈ 市場興趣 | 手動收集 | 低-中 | 統計 top 20 影片觀看數 |
| 13 | **社群媒體提及量** | Reddit / Weight Weenies / MTBR / Pinkbike 討論數 | 手動 or SocialBlade / BuzzSumo | 低 | 聲量 ≈ 興趣，非銷量 |
| 14 | **Strava 騎乘設備統計** | 180M 用戶，28% 用 Edge 車錶 | Strava Year in Sport（公開） | 低 | 間接推估 tubeless 普及率 |
| 15 | **Shopify 商店分析** | BBB 官網 /collections/all?sort_by=best-selling | 直接瀏覽（Shopify 技巧） | 低-中 | 排名 ≈ 相對銷量 |
| 16 | **Eurobike / Taipei Cycle 展會觀察** | 攤位大小、人流、訂單傳聞 | 實地觀察 / 業界人脈 | 低 | 定性 |
| 17 | **Clik Valve OEM 預裝車款數** | 2026 哪些品牌/車型預裝 Clik | 新車規格表 / 展會發布 | 中 | OEM 車款 × 該車款年產量 |
| 18 | **Wolf Tooth / 第三方 Clik 配件銷量** | Wolf Tooth Clik pump head 銷量 | Amazon BSR / 詢問 | 中 | 配件銷量 ≈ Clik 安裝量的比例 |

### Tier 2.5 — Channel Rotation Data（通路週轉，ChatGPT 建議）

| # | 節點 | 數據類型 | 取得方式 | 精確度 |
|---|------|---------|---------|--------|
| 27 | **各國 retailer 上架數** | 上架數 vs 有貨數，按國家分 | 手動爬取 or Prisync | 中-高 |
| 28 | **Dealer locator 密度** | 品牌 dealer locator 回傳的經銷商數 | 直接查品牌官網 | 中 |
| 29 | **SKU 深度** | 單一零售商列了幾個 SKU（長度/顏色/套組） | 手動 | 中 |
| 30 | **缺貨頻率（每週快照）** | In stock / Out of stock / Backorder | 腳本每週爬取 | 中-高 |
| 31 | **價格分散度** | 零售價標準差 — 高=價格紀律, 低=傾銷 | PriceRunner / 手動 | 中 |
| 32 | **促銷頻率** | 折扣出現頻率（多=庫存壓力，少=自然動銷） | 手動追蹤 | 中 |
| 33 | **零售商保留時間** | 上架後持續銷售幾個月（assortment retention） | 歷史追蹤 | 中-高 |
| 34 | **經銷商補貨間隔** | 經銷商兩次進貨之間的天數 | 業務關係詢問 or B2B 後台 | 高 |
| 35 | **平均補貨量** | 單次補貨的量級 | 業務關係 | 高 |

### Tier 3.5 — Installed Base Signals（安裝基數，ChatGPT 建議）

| # | 節點 | 數據類型 | 取得方式 | 精確度 |
|---|------|---------|---------|--------|
| 36 | **Clik 生態系配件 attach rate** | Wolf Tooth + 其他第三方 Clik pump head 銷量 | Amazon BSR / 詢問 | 中 |
| 37 | **替換零件需求** | 密封圈、帽蓋、轉接頭的銷量 | Amazon / 官網 | 中 |
| 38 | **二手車規格描述** | 二手車賣家提及 Clik / CoreCap 的頻率 | eBay / Marketplace 爬取 | 低-中 |
| 39 | **Workshop 安裝頻率** | 「你們每月裝幾組？」 | 20 家 LBS 問卷 | 中-高 |
| 40 | **技師教學影片數** | YouTube 安裝/維護教學影片數量 | 手動計數 | 低-中 |
| 41 | **OEM 持續沿用率** | 同車系下一年式是否繼續標配 | 規格表比較 | 高 |
| 42 | **Review velocity（月增 review 數）** | 比累積 review 更能追蹤當前速度 | 月度快照 | 中-高 |
| 43 | **Q&A 成長** | 產品頁新問題/月 | Amazon 爬取 | 中 |
| 44 | **BSR 持續天數** | 在 Top X 的天數，非單次快照 | 每日追蹤 | 中-高 |

### Tier 4 — Creative / Unconventional Nodes（腦力激盪區）

| # | 節點 | 概念 | 可行性 |
|---|------|------|--------|
| 19 | **專利引用分析** | Clik / CoreCap 專利被引用次數 ≈ 競品跟進意願 | 低（延遲指標） |
| 20 | **回收 / 二手市場** | eBay / Marketplace 二手 Clik/CoreCap 出現頻率 | 低-中 |
| 21 | **維修店 / LBS 問卷** | 直接問 20-30 家 bike shop「你們賣 CoreCap/Clik 嗎？月銷量？」 | 中-高（小樣本但直接） |
| 22 | **Warranty / RMA 比例** | BBB 的 RMA 率 × N.S.-LIN 出貨量 → 反推終端存活量 | 中 |
| 23 | **Schwalbe 年度經銷商大會投影片** | 偶爾流出的內部數據 | 低（碰運氣） |
| 24 | **LinkedIn 員工增長** | Schwalbe Clik 團隊人數變化 ≈ 投資力度 | 低 |
| 25 | **Google Ads 競標價** | CoreCap / Clik 關鍵字 CPC ≈ 競爭激烈度 | 中 |
| 26 | **E-bike 品牌規格表掃描** | 2026 新款 e-bike 規格表中 Clik 出現頻率 | 中-高 |

### Tier 5 — Supply Chain & OEM Nodes（供應鏈，Gemini 建議）

| # | 節點 | 數據類型 | 取得方式 | 精確度 |
|---|------|---------|---------|--------|
| 45 | **輪組廠規格轉換率** | DT Swiss / Mavic / Hunt / Reserve 新款輪組是否標配 Clik | 官網 Tech Specs 爬取 | 高 |
| 46 | **打氣筒廠生態系支援** | Topeak / Lezyne / Silca 是否推出 Clik 轉接頭 | B2B 目錄更新 | 高 |
| 47 | **代工廠產能動態** | 競爭規格的模具開模數、銅材/鋁材進貨異常 | 業界人脈（N.S.-LIN 優勢） | 極高 |
| 48 | **FCC / Bluetooth SIG 認證** | TPMS 整合產品的無線認證，提前 3-6 個月知道新型號 | FCC ID 資料庫爬取 | 高 |
| 49 | **99spokes / BikeInsights 規格表爬蟲** | 2026 年式 e-bike/road/MTB 標配 valve 類型統計 | Python 爬蟲 | 中-高 |
| 50 | **Schwalbe 技術手冊下載量** | 安裝 PDF URL 訪問量 ≈ 實際安裝量 | SimilarWeb | 中 |
| 51 | **整車廠年報出貨量 × 高階車款比例 × Tubeless 比例** | OEM TAM 推估公式 | 年報 + 規格表交叉 | 中-高 |
| 52 | **展會後 60-120 天新上架追蹤** | Eurobike/Taipei Cycle 後零售商新增 listing | 手動追蹤 | 中 |

## 推估模型架構

### Model A: Top-Down（市場 → 產品）

```
全球無內胎氣嘴市場 ($110M, 2023)
  × 替代閥門滲透率 (1-3%)
  = 替代閥門 TAM ($1.1-3.3M)
  ÷ 平均單價 ($20-40)
  = 年銷量 55K-165K units
  × 各品牌市佔推估
  = CoreCap / Clik / Fillmore 各自銷量
```

校準：N.S.-LIN 出貨 > 100K/半年 → CoreCap 年銷量 > 200K → 替代閥門滲透率需上修。

### Model B: Bottom-Up（通路 × 銷量）

```
CoreCap:
  N.S.-LIN 出貨量（精確）
  + BBB 其他供應商出貨量（如有）
  = Total production
  − 通路庫存（估 2-3 個月 buffer）
  = 終端銷售量

Clik:
  Amazon BSR 推估（美/德/英三站）
  + Schwalbe 自有電商推估
  + 經銷商通路推估（QBP、Wiggle 等）
  + OEM 預裝推估（2026 車款 × 該車年產量）
  = 終端銷售量
```

### Model C: Signal Triangulation（多信號交叉驗證）

```
取 3+ 個獨立信號，各自推出一個估值，取中位數：

Signal 1: Amazon BSR → 月銷量
Signal 2: Google Trends CoreCap:Clik 比 × CoreCap 已知銷量 → Clik 銷量
Signal 3: Review count × (100/review_rate) → 累計銷量
Signal 4: OEM 車款數 × 車款年產量 → OEM channel 銷量
Signal 5: 德國 KvK/Bundesanzeiger 年報 Clik 品類營收 → 單位數

中位數 = 最佳估計值
IQR = 信賴區間
```

### Model D: Funnel-Constrained Triangulation（ChatGPT 建議）

```
Availability × Conversion × Replenishment × Installed Base

Availability score:
  - weighted retailer count (Tier 2.5 #27)
  - dealer locator density (#28)
  - in-stock ratio (#30)

Conversion score:
  - review velocity (#42)
  - BSR persistence (#44)
  - tutorial/content growth (#40)

Replenishment score:
  - reorder interval (#34)
  - stockout recurrence (#30)
  - promo frequency inverse (#32)

Installed-base score:
  - accessory attach-rate (#36)
  - workshop install mentions (#39)
  - OEM persistence (#41)

用 CoreCap 已知出貨量校準各 score → unit mapping。
```

**權重配置（ChatGPT 建議）：**
- A = 0.40（直接商業證據：出貨、補貨、進口量）
- B = 0.30（通路證據：庫存、SKU 深度、上架數）
- C = 0.20（採用證據：review、配件、workshop 安裝）
- D = 0.10（關注度：Trends、YouTube、論壇、廣告）

## Implementation Steps

1. **收集 Hard Data** — N.S.-LIN 出貨紀錄整理成月度時間序列
2. **Amazon BSR 擷取** — 用 Helium10 免費版查 CoreCap + Clik 在 amazon.com / amazon.de / amazon.co.uk 的 BSR + 月銷估計
3. **Google Trends 校準** — 下載 CoreCap vs Clik 12 個月趨勢，用已知 CoreCap 銷量反推 Clik
4. **Review Count 快照** — 記錄 Amazon 各站 CoreCap / Clik 的 review 數量，用 5-15% 比例反推
5. **OEM 車款掃描** — 搜集 2026 新車規格表，統計預裝 Clik 的車款數
6. **經銷商詢問** — 透過業務關係詢問 3-5 家主要經銷商的進貨量
7. **Schwalbe 財務查詢** — NorthData / Bundesanzeiger 查最新年報
8. **建立 Spreadsheet** — 三個 model 平行計算，最終取加權平均
9. **月度更新** — 每月更新 Amazon BSR + Google Trends + 出貨數據

## Files Affected

| File | Change | Description |
|------|--------|-------------|
| `docs/SALES_ESTIMATION_MODEL.md` | new | 推估模型文件（本 spec） |
| `docs/COMPETITIVE_LANDSCAPE_TUBELESS_VALVES_ZH-TW.md` | edit | 替換粗估數字為模型輸出 |
| `docs/BICYCLE_TPMS_MARKET_ZH-TW.md` | edit | 更新終端銷售量推估 |
| Google Sheet（新建） | new | 模型計算 spreadsheet |

## Open Questions — 供多 AI 腦力激盪

1. **還有哪些數據節點沒想到？** 特別是可以免費或低成本取得的。
2. **Clik Valve 的 OEM 通路怎麼推估？** 我們知道 2026 高階車款開始預裝，但哪些品牌、多少台？
3. **替代閥門的市場滲透率怎麼校準？** N.S.-LIN 的 100K/半年數據顯示我之前的 1-3% 嚴重低估。
4. **有沒有辦法推估 Clik 的 aftermarket vs OEM 比例？** 這會大幅影響總量估計。
5. **E-bike 品牌的規格表資料庫在哪裡？** 需要結構化數據來源，不想一個一個查。
6. **有沒有自行車產業的 POS 數據聚合商？** 類似 NPD / Circana 對消費電子的角色。
7. **N.S.-LIN 除了 BBB，還有其他客戶用類似閥門技術嗎？** 可以擴大校準基礎。
8. **Schwalbe 的管材（tube）帶 Clik 介面的出貨量怎麼追蹤？** 這可能是 Clik 最大的量體來源。
9. **輪組廠的決策節點比整車廠更關鍵？** 如果 DT Swiss 全面轉向 Clik，影響遠大於某個整車品牌的單一車款。輪組廠的決策樹怎麼追蹤？
10. **Schwalbe 管材（tube）帶 Clik 介面的量是否才是真正的量體來源？** 內胎市場遠大於 tubeless 氣嘴市場。
11. **N.S.-LIN 的代工廠人脈能否直接探聽 Clik 的模具與材料動態？** 這可能是精確度最高的單一節點。
12. **99spokes 規格表爬蟲是否值得建？** 結構化的 e-bike 規格資料庫可以一次回答 OEM 滲透率問題。

## Risks

- **Amazon BSR 只代表 Amazon 通路**，自行車配件的 Amazon 佔比可能只有 10-30%（LBS + 官網佔多數）
- **Google Trends 是相對值**，無法直接轉換為絕對銷量
- **Review → Sales 比例變異大**（1:7 到 1:20），需要用 CoreCap 已知數據校準
- **OEM 預裝量是最大的 unknown** — 如果 Schwalbe 成功說服 Trek/Specialized 預裝 Clik，年銷量可能直接跳 10x
- **OEM 是最大的量體也是最大的黑盒子** — 如果 Schwalbe 成功讓 DT Swiss/Mavic 標配 Clik，Aftermarket 推估會嚴重失真
- **管材 (tube) 市場可能是 Clik 的隱藏殺手鐧** — 每年全球賣出數億條內胎，Schwalbe 如果逐步切換為 Clik 介面，量體遠超 tubeless 氣嘴
