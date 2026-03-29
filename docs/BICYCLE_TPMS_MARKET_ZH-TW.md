# 自行車 TPMS 市場研究

> 最後更新：2026-03-30（新增終端銷售量推估 + BBB CoreCap vs Clik 銷量對比）
> 用途：自行車胎壓監控系統市場研究，與無內胎氣嘴市場的交集分析

> **背景：** TPMS（Tire Pressure Monitoring System）正與無內胎氣嘴市場產生交集。氣嘴帽型感測器取代傳統氣嘴帽，整合型感測氣嘴合併了「高流量氣嘴」與「即時胎壓監控」兩個品類。對 N.S.-LIN 而言，這是潛在的產品線擴展方向。

---

## 更新紀錄

### 2026-03-30（終端銷售量推估）
- **新增** [終端銷售量推估](#終端銷售量推估) — TPMS 3-8 萬對/年、BBB CoreCap vs Clik 10:1 銷量差距
- **新增** BBB CoreCap vs Clik Valve 論壇輿情比較

### 2026-03-26（晶片分析更新）
- **新增** [TPMS 感測器晶片分析](#tpms-感測器晶片分析) 完整章節 — Infineon SP49、Senasic SNP746、Bosch SMP290、Nordic nRF52 方案比較
- **新增** [氣嘴帽整合可行性評估](#氣嘴帽整合可行性評估) — 12mm 直徑限制、電池壽命、天線方案

### 2026-03-26
- **新增** [E-bike 與 Motorcycle 市場背景](#e-bike-與-motorcycle-市場背景) 完整章節（氣嘴型式、sealant、全球市場規模、區域分佈）
- **新增** TPMS 專屬市場規模（$185.7M → $676M，CAGR 17.53%）→ [市場趨勢](#市場趨勢)
- **更新** Outrider 已出貨（Kickstarter 批次交付）→ [產品總覽](#產品總覽)
- **更新** Gravaa 破產細節（荷蘭法院、收購動向）→ [市場趨勢](#市場趨勢)
- **新增** StatCap V2 開發中（AI 異常偵測、雙協議）→ [市場趨勢](#市場趨勢)
- **新增** 33 筆資料來源（E-bike 市場、Valve/Sealant、破產報導、用戶回饋）

### 2026-03-16
- 首版上線：產品總覽（7 款 + 8 款其他）、安裝方式分類、通訊協議、RideNow T1 深度分析、OEM 供應商、專利、資料來源

---

## 目錄

1. [產品總覽](#產品總覽)
2. [安裝方式分類](#安裝方式分類)
3. [通訊協議](#通訊協議)
4. [RideNow TPMS T1 深度分析](#ridenow-tpms-t1-深度分析)
5. [E-bike 與 Motorcycle 市場背景](#e-bike-與-motorcycle-市場背景)
6. [市場趨勢](#市場趨勢)
7. [與無內胎氣嘴市場的交集](#與無內胎氣嘴市場的交集)
8. [TPMS 相關 OEM 供應商](#tpms-相關-oem-供應商)
9. [TPMS 相關專利](#tpms-相關專利)
10. [TPMS 感測器晶片分析](#tpms-感測器晶片分析)
11. [氣嘴帽整合可行性評估](#氣嘴帽整合可行性評估)
12. [資料來源](#資料來源)

---

## 產品總覽

### Quarq TyreWiz 2.0（SRAM）

| 屬性 | 詳情 |
|---|---|
| **品牌** | Quarq（SRAM 子公司） |
| **價格** | ~$120/對 |
| **重量** | 10g/顆 |
| **協議** | ANT+ / BLE 雙協議 |
| **相容裝置** | Garmin Edge、Wahoo ELEMNT/BOLT/ROAM、Hammerhead Karoo、SRAM AXS app |
| **精度** | ±2% |
| **防水** | IPX7 |
| **電池** | CR1632，~300 小時 |
| **安裝** | Presta 氣嘴帽替換 |
| **特色** | LED 紅/綠指示燈顯示胎壓狀態。AXS app 根據體重/胎寬/輪位自動推薦胎壓。市場龍頭。 |
| **來源** | [官方](https://www.sram.com/en/quarq/series/tyrewiz) · [DC Rainmaker](https://www.dcrainmaker.com/2018/04/tirewiz-cycling-pressure.html) |

### SKS Airspy SV / Airspy TL

| 屬性 | Airspy SV | Airspy TL |
|---|---|---|
| **價格** | ~$145/對 | ~$145/對 |
| **重量** | 18g/顆 | 17g/顆 |
| **協議** | ANT+ / BLE | ANT+ / BLE |
| **相容裝置** | Garmin (Connect IQ)、SKS MYBIKE app | 同左 |
| **最大壓力** | 8.3 bar (~120 PSI) | 8.3 bar (~120 PSI) |
| **電池** | CR2032，~500 小時 | CR2032 |
| **安裝** | 外掛式，滑套在 Presta 氣嘴上，支架勾住輻條 | **整合式鋁合金無內胎氣嘴**（60/67/81mm） |
| **特色** | 德國品牌。TL 版是「TPMS + 無內胎氣嘴」的匯流產品。 |
| **來源** | [SV 官方](https://www.sks-germany.com/en/Products/Multi-Tools/AIRSPY-SET.htm) · [TL 官方](https://sks-us.com/products/airspy-tl-pressure-sensor) · [NSMB 評測](https://nsmb.com/articles/sks-airspy-review/) |

### Outrider TL / TL Pro

| 屬性 | Outrider TL | Outrider TL Pro |
|---|---|---|
| **價格** | $55-79/對 | ~$79/對 |
| **重量** | 3.5g/顆 | 6.9g/顆 |
| **協議** | ANT+ only | ANT+ only |
| **相容裝置** | Garmin Edge 系列 | 同左 |
| **壓力範圍** | 0-85 PSI | 0-200 PSI |
| **精度** | ±0.7% (0-39 PSI)，±1.4% (40-85 PSI) | ±0.5% |
| **電池** | CR1225，~2 年 | ~5 年以上 |
| **安裝** | **胎內**——安裝在既有無內胎氣嘴桿底座 | 同左 |
| **狀態** | **已開始出貨**（2025 年初 Kickstarter 批次已交付，零售持續接單中） |
| **特色** | 市場最輕（TL 僅 3.5g）。胎內安裝，隱藏且受保護。刺破通知。僅限無內胎。無 BLE——純 Garmin 取向。 |
| **來源** | [TL 官方](https://www.outridercomponents.com/products/the-outrider-tpms) · [TL Pro 官方](https://www.outridercomponents.com/products/outrider-tl-pro) · [Bikerumor](https://bikerumor.com/outrider-tpms-lightweight-affordable-bicycle-tire-pressure-monitoring-sensors/) · [New Atlas](https://newatlas.com/bicycles/outrider-bike-tire-pressure-sensor/) |

### RideNow TPMS T1

> 詳見下方「[RideNow TPMS T1 深度分析](#ridenow-tpms-t1-深度分析)」

### AIRsistant（Schrader / Sensata）

| 屬性 | 詳情 |
|---|---|
| **價格** | EUR 99.99 (~$108) |
| **重量** | 20g/輪（氣嘴 + 感測器合計） |
| **協議** | BLE |
| **相容裝置** | Garmin（BLE 相容型號）、AIRsistant app、相容 e-bike 儀表板 |
| **電池** | 密封式，~5,000 小時 / ~5 年，不可更換 |
| **安裝** | 閥芯替換（Schrader 和 Presta 版） |
| **特色** | Schrader 發明者（現 Sensata Technologies 旗下）製造。全球 #1 TPMS 製造商（~40% 汽車售後市佔）。E-bike OEM 整合取向。FIT 系統整合。 |
| **來源** | [官方](https://www.airsistant.com/) · [ENDURO MTB 評測](https://enduro-mtb.com/en/schrader-airsistant-review/) |

### FOBO Bike 2

| 屬性 | 詳情 |
|---|---|
| **價格** | ~$99 |
| **重量** | 7.6g/顆 |
| **協議** | BLE 5.0 |
| **相容裝置** | FOBO app、智慧手錶、藍牙耳機警示 |
| **壓力範圍** | 0-116 PSI (800 kPa) |
| **電池** | CR1632，~1 年 |
| **安裝** | 氣嘴帽替換（Schrader 為主，也適用機車） |
| **更新間隔** | 每 15 秒 |
| **特色** | 原為機車產品，也用於自行車。防盜鎖緊螺母。多級警報（慢漏/快漏）。無車錶整合（手機 only）。 |
| **來源** | [官方](https://my-fobo.com/product-family/FOBO_Bike_2) · [RideApart 評測](https://www.rideapart.com/reviews/698971/gear-review-fobo-bike-tpms/) |

### 其他產品

| 產品 | 價格 | 協議 | 安裝方式 | 備註 |
|---|---|---|---|---|
| [StatCap P1](https://teamstatcap.com/product/statcap-p1/) | $99 | BLE | 氣嘴帽替換 | 250ms 更新間隔。Tahuna app。小量生產。含溫度和搖晃偵測。**V2 開發中**：含 AI 異常偵測、ANT+/BLE 雙協議、輪圈/輪胎異常警報、互動串流功能。 |
| [Tubolito PSENS](https://www.tubolito.com/product/tubo-mtb-psens/) | ~$50 | NFC | TPU 內胎內建 | 按需讀取（手機貼近）。無電池。~93g（含管）。27.5"/29"。 |
| [Tubolito SYNCD](https://www.tubolito.com/product/tubo-road-syncd/) | 未公布 | BLE | TPU 內胎內建 | 即時監控。2 年/10,000km 電池壽命。不可更換（換胎方案）。700c。 |
| [Rover PSIcle](https://www.tindie.com/products/CaptMcAllister/psicle-nfc-pressure-sensor-for-presta-valves/) | 小量 | NFC | 閥芯延長管 | 無電池。MTB 版 ±0.06 PSI 精度。Maker 產品（Tindie）。專利申請中。 |
| [Gravaa KAPS](https://gravaa.com/) | EUR 3,200+ | ANT+/BLE | 花鼓整合 | **已破產**（2026 年 1 月，荷蘭法院宣告）。主動充/放氣系統。Visma-Lease a Bike 曾使用（Marianne Vos 2024 Gravel 世界冠軍、Ferrand-Prévot Paris-Roubaix 冠軍均使用）。破產原因：無法量產降價（需 tubeless 化 + 降價才能 scale），多家業界方有意收購資產重啟。[road.cc](https://road.cc/content/news/gravaa-declared-bankrupt-due-lack-sales-317767) · [Bikerumor](https://bikerumor.com/gravaa-declares-bankruptcy-despite-race-winning-performances-of-its-pressure-adjusting-hubs/) |
| [JOSN TyreDog](https://tyredog.en.taiwantrade.com/product/bicycle-tpms-345524.html) | OEM | — | 氣嘴帽型 | 台灣 OEM/ODM 製造商。汽車/機車/自行車 TPMS。 |
| Cikada MLD-B08 | 隨車 | 專有 2.4GHz | 外掛式 | E-bike 品牌專屬。非 ANT+/BLE 相容。 |
| [FIT (Rotax/Schrader)](https://www.fit-ebike.com/en-en/technology/accessories/tire-pressure-sensors-fit/) | 未公布 | BLE | Schrader/Presta | E-bike OEM 整合。FIT 儀表板顯示紅/綠胎壓狀態。非零售。 |

---

## 安裝方式分類

| 類型 | 代表產品 | 優點 | 缺點 |
|---|---|---|---|
| **氣嘴帽替換** | TyreWiz、RideNow T1、FOBO | 最簡單安裝，通用 | 增加高度，暴露在外 |
| **閥芯替換** | AIRsistant | 低矮輪廓 | 安裝複雜 |
| **整合式無內胎氣嘴** | SKS Airspy TL | 最乾淨的整合 | 較重，綁定單一氣嘴品牌 |
| **胎內安裝** | Outrider TL/Pro | 最輕（3.5g），隱藏，受保護 | 僅限無內胎，換電池需拆胎 |
| **TPU 內胎內建** | Tubolito PSENS/SYNCD | 無額外零件 | 僅限有內胎，鎖定品牌 |
| **閥芯延長管** | Rover PSIcle | 超輕，無電池 | 僅 NFC 按需讀取 |

---

## 通訊協議

| 協議 | 產品 | 特點 |
|---|---|---|
| **ANT+** | TyreWiz、Airspy、Outrider、RideNow T1 | ANT+ 有官方 TPMS 裝置 profile，Garmin/Wahoo/Karoo 原生支援 |
| **BLE** | TyreWiz、Airspy、AIRsistant、FOBO、StatCap、SYNCD | 更通用但 TPMS 標準化不足，多數走手機 app |
| **NFC（被動）** | Tubolito PSENS、Rover PSIcle | 無需電池，但非即時（需手機貼近讀取） |

**關鍵：ANT+ 有已發布的 TPMS device profile，是車錶整合的標準。** Hammerhead 明確表示只支援「標準 ANT+ TPMS spec」。

### 車錶相容性矩陣

| 感測器 | Garmin Edge | Wahoo ELEMNT | Hammerhead Karoo | 手機 app |
|---|---|---|---|---|
| Quarq TyreWiz 2.0 | 是（原生 ANT+） | 是 | 是 | SRAM AXS |
| SKS Airspy | 是（Connect IQ） | 可能 | 是 | SKS MYBIKE |
| Outrider TL/Pro | 是（原生 ANT+） | 可能 | 可能 | 透過 Garmin Connect |
| RideNow T1 | 是 | 未知 | 未知 | Tireo |
| AIRsistant | 是（BLE） | 未知 | 未知 | AIRsistant |
| FOBO Bike 2 | 否 | 否 | 否 | FOBO |
| Tubolito SYNCD | 是（BLE） | 未知 | 未知 | Tubolito |

---

## RideNow TPMS T1 深度分析

### 規格

| 參數 | 值 |
|---|---|
| 型號 | TPMS T1 |
| 製造商 | 青島 RideNow Tech Co., Ltd.（中國） |
| 尺寸 | ⌀13.5 × 31.5 mm |
| 重量 | 6.1g |
| 氣嘴型式 | Presta 帽蓋替換 |
| 壓力範圍 | 0-150 PSI (0-10.3 bar) |
| 精度 | ±1.5 PSI (±0.1 bar) |
| 防水 | IPX9 |
| 電池 | CR1025 (30mAh)，可更換 |
| 續航 | ~300 小時 |
| 工作電流 | 發射模式 5mA 以下 |
| 工作電壓 | 2.5-3.3V |
| 工作溫度 | -20 至 +80°C |
| 連線 | ANT+（Garmin）+ BLE（Tireo app）雙協議同時 |
| 相容裝置 | Garmin Edge Explore 2、840、830、540、530、1050、1040、1030 Plus；Bontrager 車錶 |
| 包裝 | 2 顆感測器 + 安裝扳手 |
| **來源** | [官方](https://www.ridenowtech.com/?page_id=2213&lang=en) · [Velo 報導](https://velo.outsideonline.com/road/road-gear/randoms-part-1-taipei-cycle-show-2025/) · [Amazon UK](https://www.amazon.co.uk/Ridenow-Pressure-Monitoring-Compatible-Bontrager/dp/B0GGHTKJTX) |

### 工作原理

感測器旋入標準 Presta 氣嘴，取代氣嘴帽。旋緊時壓下 Presta 閥芯頂部，使感測器暴露於胎內氣壓。透過 ANT+ 或 BLE 無線傳輸即時胎壓數據至 Garmin 車錶或 Tireo 手機 app。

### Sensor 晶片分析（無公開拆解，基於特性推斷）

**無線 SoC：幾乎確定是 Nordic nRF52810（不是 TI）**

- RideNow T1 同時支援 ANT+ 和 BLE 雙協議
- **全球唯一能在單晶片上同時跑 ANT + BLE 的只有 Nordic nRF52 系列**（透過 S332 SoftDevice）
- TI CC26xx（CC2640, CC2652）支援 BLE/Thread/Zigbee 但**不支援 ANT 協議**——排除 TI
- ANT 授權專屬於 Nordic nRF52 系列（每顆 $0.08 權利金）
- 在 nRF52 家族中，nRF52810 最可能：最低成本、最小封裝（QFN 6x6mm, 192KB Flash, 24KB RAM），適合成本優化的 TPMS
- 已知案例：[TREEL Mobility TPMS 確認使用 nRF52810](https://www.nordicsemi.com/Nordic-news/2024/04/TREEL-Mobility-Solutions-incorporates-Nordics-nRF52833-nRF52832-and-nRF52810-SoCs)
- 競品 SKS Airspy [已被拆解](https://github.com/bitmeal/sks_airspy_ant_community_fw/blob/master/doc/HARDWARE_PROTO.md)，確認使用 **nRF52832**

**壓力感測器（MEMS）：可能為中國國產或 Bosch BMP 系列**

- SKS Airspy 使用 NXP FXTH87（汽車級 TPMS SoC，含 MEMS 電容式壓力感測器 + 溫度 + 2 軸加速度計 + 8-bit MCU + RF 發射器），但此晶片**已停產**（NXP 推薦 NTM88 替代）
- RideNow 作為青島製造商，更可能使用成本更低的方案：
  - Bosch BMP390 / BMP581（超小型氣壓感測器）
  - 國產 MEMS（歌爾微電子 / 敏芯微電子）
- 透過 I2C/SPI 連接 nRF52

**白牌 OEM 可能性高**

- RideNow 核心業務是 TPU 內胎，非無線電子
- 「Tireo」app 名稱與「RideNow」品牌不同，暗示第三方模組/app 供應商
- 深圳 OEM 供應商在 Alibaba 上有類似 TPMS 模組
- 產品在台北自行車展 2025 首次展出，暗示近期 OEM 合作

**估計 BOM 成本**

| 元件 | 可能型號 | 估價 |
|---|---|---|
| 無線 SoC | Nordic nRF52810 | $1.00-1.50 |
| MEMS 壓力感測器 | 國產或 Bosch BMP | $0.50-1.50 |
| 電池 | CR1025 | $0.10-0.20 |
| 天線 | PCB trace antenna | $0.00 |
| 被動元件 | 電容、電阻、晶振 | $0.10-0.20 |
| PCB | 2 層板 | $0.10-0.20 |
| 外殼 | CNC 鋁 + O-ring | $1.00-2.00 |
| ANT 授權金 | $0.08/顆 | $0.08 |
| **BOM 合計** | | **~$3-6/顆** |

> 售價 $80/對 = $40/顆，毛利率極高。

---

## E-bike 與 Motorcycle 市場背景

### 氣嘴型式

| 車種 | 氣嘴型式 | 說明 |
|---|---|---|
| **Motorcycle（機車/重機）** | **100% Schrader**（TR412/TR413） | 無例外。TR412（短）為現代機車標準，TR413（長）為汽車標準但可替代 |
| **E-bike — 通勤/Fat tire/入門** | **Schrader 為主** | 佔 e-bike 市場大宗。加油站可直接打氣，不需轉接頭 |
| **E-bike — e-MTB/e-Road/e-Gravel** | **Presta 為主** | 跟隨傳統高階自行車慣例。高壓路線（80-120+ PSI） |

**關鍵洞察：** E-bike 市場越大，Schrader valve 需求成長越快——與傳統自行車的 Presta 主導格局不同。這對 N.S.-LIN 的 Schrader 產品線是直接利多。

### E-bike 補胎液（Sealant）使用狀況

| 模式 | 說明 | 常見車種 | 市場成熟度 |
|---|---|---|---|
| **Tubeless + Sealant** | 需 tubeless-ready 輪組 + tubeless 外胎 + sealant | 高階 e-MTB | 成熟 |
| **傳統內胎 + Slime** | 在一般內胎灌注 sealant（如 Slime、Muc-Off） | 通勤 e-bike | 成熟 |
| **TPU 內胎 + Sealant** | 2025 新趨勢「仿 tubeless」（Eclipse、Pirelli Smartube） | 各類型 | 新興 |

**E-bike 特有問題：** 許多平價 e-bike 輪圈是鉚釘拼合（非焊接），即使貼上 tubeless 膠帶，接合處仍容易漏氣。這導致 e-bike 的 tubeless 轉換失敗率高於一般自行車，中低階車款多數仍使用傳統內胎。

**Sealant 維護：** Tubeless sealant 約每 90 天需補充、每年完全更換。CO2 氣瓶不可與 sealant 併用（會使其凝固）。

### E-bike 全球市場規模

| 研究機構 | 2025 估值 (USD) | CAGR | 預測期 | 目標年估值 |
|---|---|---|---|---|
| Grand View Research | $69.7B | 9.2% | 2026-2033 | $144.3B (2033) |
| Fortune Business Insights | $57.5B | 14.4% | 2025-2034 | — |
| Precedence Research | $68.3B | 10.2% | 2026-2035 | $180.3B (2035) |
| MarketsandMarkets | ~$51B | 6.6% | 2024-2030 | $71.5B (2030) |
| Mordor Intelligence | $38.1B | 3.6% | 2025-2030 | $45.4B (2030) |
| Allied Market Research | — | 10.5% | 2020-2030 | $118.6B (2030) |

> 估值差異主要來自是否包含中國低速電動車。共識 CAGR 約 **9-11%**，屬高成長市場。

### 區域分佈

| 區域 | 市佔 (2025) | CAGR | 備註 |
|---|---|---|---|
| **亞太** | ~77% | — | 中國主導（年產 3,000 萬台以上） |
| **歐洲** | ~20% | ~14% | 補貼政策最成熟，法規驅動 |
| **北美** | ~3-4% | ~15% | 成長最快。各州補貼最高 $1,750（加州、紐約） |

> 美國子市場：2022 年 $1.98B，以 **15.6% CAGR** 成長至 2030 年。

### 對 TPMS 市場的影響

- E-bike 重量（20-30kg，一般自行車 2-3 倍）→ 胎壓正確性更關鍵 → TPMS 需求更強
- E-bike 騎士多為非傳統車友（通勤、外送、休閒），對操作簡便的 Schrader 氣嘴帽型 TPMS 接受度高
- AIRsistant（Sensata）和 FIT（Rotax/Schrader）已瞄準 e-bike OEM 整合
- E-bike 輪胎市場預估 2024 年 $1.2B → 2033 年 $3.5B（CAGR 12.5%），防穿刺與 tubeless 是主要驅動力

---

## 市場趨勢

### 終端銷售量推估（2026-03-30 新增）

> **注意：** 無直接銷售數據。以下為間接推估。

#### 自行車 TPMS 終端銷售量

| 層級 | 數字 | 來源 |
|------|------|------|
| 全球 Smart Bicycle Accessories 市場 | $1.76B (2025) | DataInsightsMarket |
| 其中 TPMS 專屬 | $185.7M (2024) | Newstrail |
| TPMS 平均單價 | $55-145/pair | 產品調查 |
| **推估年銷量** | **30,000-80,000 對/年** | Top-down: $185.7M ÷ $80 avg |

#### 按產品推估

| 產品 | 年銷量推估 | 備註 |
|------|-----------|------|
| Quarq TyreWiz | 5,000-15,000 pairs | SRAM 旗下，中高階 |
| SKS Airspy | 3,000-10,000 pairs | 歐洲通路強 |
| RideNow T1 | 10,000-30,000 pairs | 中國白牌最大量 |
| Outrider | 1,000-5,000 pairs | Kickstarter 已出貨 |
| 其他（Silca、AIRsistant 等） | 5,000-15,000 pairs | 零散 |
| **Total** | **~30,000-80,000 pairs/year** | |

**成長動力：** E-bike 崛起（用戶更在意安全 → TPMS 需求）、Garmin/Wahoo 整合、價格壓縮到 $55 以下。

#### BBB CoreCap vs Schwalbe Clik Valve（關聯市場）

氣嘴帽 / 替代閥芯市場與 TPMS 有潛在交集（氣嘴帽型感測器）。

| 產品 | 年銷量推估 | 銷量差距 |
|------|-----------|---------|
| BBB CoreCap | 5,000-15,000 對 | 1x |
| Schwalbe Clik Valve | 50,000-200,000 組 | **~10x** |

**Clik OEM 動態：** 2026 高階車款開始 OEM 預裝。若 Clik 成為 OEM 標準，氣嘴帽型 TPMS 整合方向需重新評估（Clik 的 snap-on 介面不相容傳統 Presta 帽型感測器）。

---

### Smart Bicycle TPMS 專屬市場規模（2026-03 更新）

| 研究機構 | 2024 估值 | 目標年估值 | CAGR | 來源 |
|---|---|---|---|---|
| Newstrail | USD 185.7M | USD 676M (2032) | **17.53%** | [Newstrail](https://www.newstrail.com/smart-bicycle-tire-pressure-monitor-market-share/) |

> TPMS 專屬市場 CAGR 17.5% 遠高於整體 E-bike 市場 9-11%，顯示 TPMS 正處於 S 曲線早期。亞太和歐洲為主要成長區域。

### 趨勢（2026-03 更新）

1. **ANT+ TPMS profile 普及** — Garmin、Wahoo、Hammerhead 都支援官方 ANT+ TPMS device profile，新進者（Outrider、RideNow）優先對接 ANT+
2. **E-bike 整合驅動量產** — AIRsistant 和 FIT 瞄準 OEM 整合到 e-bike 儀表板。E-bike 重量不敏感 + 安全需求強 = TPMS 的最大成長動力。汽車 TPMS 大廠（Sensata/Schrader）積極跨入自行車 OEM 市場
3. **價格壓縮** — 從 $145（SKS Airspy）下滑到 $55-80（Outrider、RideNow）。新專利 WO2025/261588 宣稱可將售價降至現有系統的 20-30%
4. **內建/整合式趨勢** — 從外掛帽蓋型→胎內型（Outrider）、整合氣嘴型（SKS TL）、內胎內建型（Tubolito）
5. **Gravel/MTB 優先於公路** — 即時 TPMS 在越野場景（頻繁調壓）比公路有更強使用案例。公路主要是賽前確認和慢漏偵測
6. **亞洲平價進入者** — RideNow、JOSN（TyreDog）等亞洲 OEM 以低價進入，基礎帽蓋型 TPMS 正被商品化。RideNow T1 在台北自行車展 2025 首次亮相，$80/對定價衝擊市場
7. **Gravaa 破產的教訓（2026-01 更新）** — 最先進的主動充/放氣系統（Marianne Vos 2024 Gravel 世界冠軍、Paris-Roubaix 冠軍均使用）因無法量產降價而破產。商業總監 John Zopfi 指出「需要 tubeless 化 + 量產降價 + 資本」三要素未能到位。多家業界方有意收購資產重啟，顯示技術有價值但商業模式未成熟
8. **StatCap V2 開發中** — 新一代將加入 AI 異常偵測（區分真問題 vs 正常波動）、ANT+/BLE 雙協議、輪圈/輪胎異常警報，代表 TPMS 正從「讀數值」走向「智慧診斷」
9. **Outrider 已出貨** — Kickstarter 批次已交付，用戶回饋正面（Garmin 即時顯示胎壓），但單裝置連線限制和氣嘴相容性為已知痛點

---

## 與無內胎氣嘴市場的交集

**氣嘴正在從「空氣通道」演變為「電子平台」：**

1. **SKS Airspy TL** 是最明確的匯流案例——它本身就是一支含壓力感測器的無內胎氣嘴，購買 TPMS = 購買新氣嘴
2. **Outrider TL** 安裝在現有無內胎氣嘴桿底座的胎內側，物理上屬於氣嘴組件
3. **AIRsistant** 替換閥芯，氣嘴桿不變但內部結構改變
4. **帽蓋型感測器（TyreWiz、RideNow、FOBO）** 直接取代氣嘴帽，使傳統氣嘴帽失去存在意義

### 產品空白 / 機會

目前無產品同時具備：
- 高流量無內胎氣嘴設計（方便座胎與補胎液注入）
- 整合 TPMS + ANT+/BLE 雙協議
- 輕量（含氣嘴 10g 以下）
- 公路壓力相容（120+ PSI）

SKS Airspy TL 最接近但偏重（17g）且使用標準（非高流量）氣嘴內徑。

---

## TPMS 相關 OEM 供應商

| 公司 | 地點 | 產品 | 備註 |
|---|---|---|---|
| [JOSN (TyreDog)](https://tyredog.en.taiwantrade.com/product/bicycle-tpms-345524.html) | 台灣 | 自行車/機車/汽車 TPMS | OEM/ODM，白牌方案 |
| SMP (Standard Motor Products) | 台中 | TPMS 設計製造 | 台灣工廠 |
| Sensata / Schrader | 愛爾蘭/全球 | AIRsistant、FIT | 全球 #1 TPMS 製造商（~40% 汽車售後市佔） |
| 深圳 Bonrre Technology | 深圳 | 機車/自行車 TPMS | OEM |
| 佛山百信德 | 佛山 | TPMS 感測器（1999 成立） | |
| Alibaba 供應商 | 廣東(189)/浙江(66)/山東(65) | TPMS 模組 | 白牌方案 |

---

## TPMS 相關專利

| 專利 | 持有者 | 內容 |
|---|---|---|
| Patent pending | Rover PSIcle | NFC 供電閥門整合壓力感測 |
| 已授權 | Gravaa KAPS | 花鼓動能氣壓系統（公司已破產） |
| WO2025/261588 | 獨立發明人 | 低成本輪胎壓力管理系統（3D 列印歧管 + 現成工業元件）。[Bikerumor 報導](https://bikerumor.com/patent-patrol-inventor-with-tire-pressure-management-system-patent-seeks-industry-partner/) |
| 已授權 | Tubolito | TPU 內胎製造 + 感測器嵌入製程 |

---

## TPMS 感測器晶片分析

> 評估哪些 TPMS 晶片適合整合到自行車氣嘴帽中。核心需求：BLE 連線（手機/車錶）、低功耗（CR1225 電池 1 年以上）、封裝 ≤ 6mm 寬。

### 晶片比較總表

<table>
<thead>
<tr>
<th>晶片</th><th>廠商</th><th>封裝尺寸</th><th>BLE</th><th>Sub-GHz</th><th>MCU</th><th>休眠電流</th><th>BLE TX 電流</th><th>壓力範圍</th><th>評價</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>SNP746</strong></td><td>Senasic（南京）</td><td>6×5×1.9mm LGA-24</td><td><strong>BLE 5.1 雙向</strong></td><td>433/315 MHz</td><td>ARM Cortex-M0+ 64MHz, 512KB Flash</td><td>0.3 µA</td><td><strong>6.3 mA</strong>（DCDC）</td><td>100-900/1500 kPa</td><td>⭐ <strong>首選</strong></td>
</tr>
<tr>
<td>SNP736</td><td>Senasic（南京）</td><td>6×5×1.9mm LGA-24</td><td>BLE 4.2 廣播</td><td>433/315 MHz</td><td>8051, ~64KB Flash</td><td>0.5 µA</td><td>13 mA</td><td>100-900 kPa</td><td>可用但舊款</td>
</tr>
<tr>
<td>SMP290</td><td>Bosch</td><td><strong>4.5×3.5mm</strong> DFN</td><td><strong>BLE 5.4</strong></td><td>無</td><td>ARC EM6 32-bit</td><td>&lt;0.3 µA</td><td>&lt;5 mA</td><td>90-920/1500 kPa</td><td>最小封裝，但可能僅供汽車 OEM</td>
</tr>
<tr>
<td>SP490</td><td>Infineon</td><td>5.4×5.7×<strong>3.4mm</strong> DSOSP-14</td><td><strong>無 BLE</strong></td><td>315/434 MHz</td><td>ARM Cortex-M0+, 19KB Flash</td><td>0.24 µA</td><td>5.5 mA（RF）</td><td>100-920 kPa</td><td>❌ 無 BLE，不適用</td>
</tr>
<tr>
<td>nRF52832 + BMP390</td><td>Nordic + Bosch</td><td>~6×6mm（兩顆堆疊）</td><td><strong>BLE 5.0 + ANT+</strong></td><td>無</td><td>ARM Cortex-M4F 64MHz, 512KB Flash</td><td>1.9 µA</td><td>5.3 mA</td><td>300-1250 hPa（BMP390）</td><td>最靈活，可自行開發韌體</td>
</tr>
</tbody>
</table>

### Senasic SNP746 詳細規格

| 參數 | 數值 |
|---|---|
| **封裝** | LGA-24, 6.0×5.0×1.9mm |
| **MCU** | ARM Cortex-M0+ @ 64 MHz（也支援 16 MHz 省電模式） |
| **Flash / RAM** | 512 KB / 80 KB |
| **ADC** | 16-bit, 5 通道 |
| **BLE** | 5.1，支援廣播 + 連線模式 |
| **Sub-GHz** | 433/315 MHz ASK/FSK/GFSK（可僅用 BLE 不啟用） |
| **壓力精度** | ±3 kPa（-40 至 125°C），相當於 ±0.44 PSI |
| **溫度精度** | ±2°C（-20 至 70°C） |
| **供電** | 2.1-3.6V（直接接鈕扣電池） |
| **休眠電流** | 0.3 µA |
| **BLE TX 電流** | 6.3 mA @ 0 dBm（含 DCDC） |
| **內建感測器** | 壓力 MEMS + XZ 軸加速度計 + 溫度 + 電池電壓 |
| **介面** | I2C / SPI / UART / LIN |
| **車規認證** | AEC-Q100, ISO 26262 ASIL D |
| **來源** | [Senasic 產品頁](https://www.senasic.com/en/product/tire-pressu-monitoring-system/14) · [Datasheet PDF](https://www.senasic.com/Public/Uploads/uploadfile/files/20240124/DS0026SNP746Datasheet.pdf) |

### Senasic 公司背景

| 項目 | 資訊 |
|---|---|
| 中文名稱 | 南京英銳創電子科技有限公司 |
| 成立 | 2015 年 |
| 總部 | 南京江北新區，上海張江研發中心 |
| 人數 | 189 人 |
| 模式 | Fabless（無晶圓廠，純晶片設計） |
| 全球 TPMS 晶片市佔 | 7-8%（全球第三，僅次於 Infineon 30%、Sensata 21%） |
| 中國 TPMS 市佔 | 22%（國內第一） |
| 客戶 | 吉利、上汽、廣汽、三一等 |
| 2024 年營收 | 4.78 億人民幣（~$66M USD），YoY +37% |
| 上市狀態 | 2026 年 3 月申請香港交易所上市（中金承銷） |
| 採購管道 | 需直接洽 info@senasic.com（DigiKey/Mouser 無庫存） |

### Infineon SP49 — 為什麼不適用

Infineon XENSIV SP490 是汽車 TPMS 市場龍頭，但對自行車氣嘴帽有兩個致命問題：

1. **沒有 BLE** — 只有 315/434 MHz 射頻，手機和車錶無法接收。必須額外配一顆 BLE 晶片才能通訊。
2. **封裝過高** — DSOSP-14 cavity 封裝高度 3.4mm（加上 PCB + 電池堆疊超過 8mm），且需要 26 MHz 石英振盪器 + 1.1 mH LF 天線線圈 + ~15 顆被動元件。
3. **LF 接收器多餘** — 115-135 kHz 低頻接收器用於汽車自動定位（前左/前右/後左/後右），自行車不需要。

> 來源：[Infineon SP490 Datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-sp490-01-12-datasheet-en.pdf) · [XENSIV TPMS 新聞稿](https://www.infineon.com/cms/en/about-infineon/press/market-news/2023/INFATV202309-149.html)

### Nordic nRF52 + MEMS 分離方案

另一種路線是不用 TPMS 專用晶片，改用通用 BLE SoC + 獨立壓力感測器：

- **BLE SoC**：Nordic nRF52832（6×6mm QFN-48）或 nRF52810（5×5mm QFN-32，較低成本）
- **壓力感測器**：Bosch BMP390（2×2×0.75mm LGA）或 TE MS5839（3.3×3.3×2.75mm）
- **優點**：完整 BLE 5.0 + ANT+ 雙協議（Garmin 原生支援）、開源韌體（Zephyr RTOS）、Nordic 有完整開發板與文件
- **缺點**：兩顆晶片 + 天線，BOM 成本和 PCB 面積較大
- **市場驗證**：TREEL Mobility（印度）已用 nRF52833/52832/52810 量產二輪車 TPMS（[Nordic 案例](https://www.nordicsemi.com/Nordic-news/2024/04/TREEL-Mobility-Solutions-incorporates-Nordics-nRF52833-nRF52832-and-nRF52810-SoCs)）

---

## 氣嘴帽整合可行性評估

> 目標：在 CoreCap 氣嘴帽形式（~12mm 直徑 × 15-20mm 高度圓柱）內整合 TPMS 感測器。

### 空間堆疊分析

<table>
<thead>
<tr><th>層</th><th>元件</th><th>厚度</th><th>備註</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>外殼底蓋（含壓力孔）</td><td>~1 mm</td><td>需開孔讓氣壓進入 MEMS</td></tr>
<tr><td>2</td><td>PCB + SNP746 + 被動元件</td><td>~2.5 mm</td><td>晶片 1.9mm + PCB 0.8mm，12mm 圓形 PCB</td></tr>
<tr><td>3</td><td>CR1225 電池</td><td>~2.5 mm</td><td>12.5mm 直徑，需 0.25mm 邊緣讓位</td></tr>
<tr><td>4</td><td>天線層（MIFA PCB trace 或 chip antenna）</td><td>~1 mm</td><td>可與電池共面或獨立層</td></tr>
<tr><td>5</td><td>外殼頂蓋</td><td>~1 mm</td><td></td></tr>
<tr><td colSpan="2"><strong>總計</strong></td><td><strong>~8 mm</strong></td><td>15mm cap 有 7mm 餘裕；20mm 有 12mm</td></tr>
</tbody>
</table>

### 電池壽命估算（CR1225, 50mAh）

<table>
<thead>
<tr><th>狀態</th><th>電流</th><th>時長</th><th>占比</th><th>平均電流貢獻</th></tr>
</thead>
<tbody>
<tr><td>休眠</td><td>0.3 µA</td><td>~99.5%</td><td>—</td><td>0.30 µA</td></tr>
<tr><td>量測（ADC + 感測器）</td><td>~2 mA</td><td>~5ms / 30s</td><td>0.017%</td><td>0.33 µA</td></tr>
<tr><td>BLE TX（0 dBm）</td><td>6.3 mA</td><td>~3ms / 60s</td><td>0.005%</td><td>0.32 µA</td></tr>
<tr><td colSpan="4"><strong>平均總電流</strong></td><td><strong>~1.0 µA</strong></td></tr>
</tbody>
</table>

**理論壽命：** 50 mAh ÷ 0.001 mA ≈ 50,000 hr ≈ **5.7 年**

**實際估計：1.5-2.5 年**（考慮自放電 ~1%/年、低溫容量衰減 ~20%、MCU 喚醒開銷、BLE 多頻廣播）

**市場對比：** Outrider 使用 CR1225 宣稱 ~2 年，FOBO Bike 2 使用 CR1632（140mAh）宣稱 ~1 年。

### BLE 天線方案

| 方案 | 尺寸 | 優點 | 缺點 |
|---|---|---|---|
| **MIFA PCB trace** | ~7×11mm（可彎折適應 12mm 圓形 PCB） | 零 BOM 成本 | 需 RF 工程設計、地平面較小影響效率 |
| **Chip antenna**（如 Johanson 2450AT18x100） | 1.2×2.0mm | 免設計、可靠 | 成本 ~$0.15-0.30 |

12mm 直徑下地平面不足（建議 15×15mm），但自行車用途只需 1-3m 有效距離（感測器到車錶），衰減後仍可達 5-10m，完全足夠。

### 結論與建議

1. **首選方案：Senasic SNP746** — BLE 5.1 + 壓力 MEMS + 加速度計整合在 6×5×1.9mm 單晶片，明確支援二輪車市場，公司背景可靠（全球第三大 TPMS 晶片商，港交所上市申請中）
2. **備選方案：Nordic nRF52810 + Bosch BMP390** — 開源韌體 + ANT+ 原生支援（Garmin 直接相容），但兩顆晶片增加 BOM 和面積
3. **未來關注：Bosch SMP290** — 4.5×3.5mm 最小封裝 + BLE 5.4，但目前可能僅供汽車 Tier-1 客戶
4. **不推薦：Infineon SP490** — 無 BLE、封裝過高、需外掛 LF 天線
5. **下一步**：聯繫 Senasic（info@senasic.com）取得 SNP746 EVK + SDK，確認小量採購可行性

---

## 資料來源

### TPMS 產品
- [Quarq TyreWiz 2.0 官方](https://www.sram.com/en/quarq/series/tyrewiz)
- [DC Rainmaker TyreWiz Hands-on](https://www.dcrainmaker.com/2018/04/tirewiz-cycling-pressure.html)
- [SKS Airspy SV 官方](https://www.sks-germany.com/en/Products/Multi-Tools/AIRSPY-SET.htm)
- [SKS Airspy TL 官方](https://sks-us.com/products/airspy-tl-pressure-sensor)
- [SKS Airspy 評測 - NSMB](https://nsmb.com/articles/sks-airspy-review/)
- [Outrider TPMS - Bikerumor](https://bikerumor.com/outrider-tpms-lightweight-affordable-bicycle-tire-pressure-monitoring-sensors/)
- [Outrider TL Pro 官方](https://www.outridercomponents.com/products/outrider-tl-pro)
- [Outrider - New Atlas](https://newatlas.com/bicycles/outrider-bike-tire-pressure-sensor/)
- [RideNow TPMS 官方](https://www.ridenowtech.com/?page_id=2213&lang=en)
- [RideNow T1 - Amazon UK](https://www.amazon.co.uk/Ridenow-Pressure-Monitoring-Compatible-Bontrager/dp/B0GGHTKJTX)
- [RideNow 台北自行車展 - Velo](https://velo.outsideonline.com/road/road-gear/randoms-part-1-taipei-cycle-show-2025/)
- [AIRsistant 官方](https://www.airsistant.com/)
- [AIRsistant 評測 - ENDURO MTB](https://enduro-mtb.com/en/schrader-airsistant-review/)
- [FOBO Bike 2 官方](https://my-fobo.com/product-family/FOBO_Bike_2)
- [FOBO Bike 2 評測 - RideApart](https://www.rideapart.com/reviews/698971/gear-review-fobo-bike-tpms/)
- [StatCap P1 評測](https://www.roadbikerider.com/statcap-p1-tire-pressure-monitoring-system-tpms-review/)
- [Tubolito PSENS 官方](https://www.tubolito.com/product/tubo-mtb-psens/)
- [Tubolito SYNCD 官方](https://www.tubolito.com/product/tubo-road-syncd/)
- [Tubolito PSENS 評測 - Singletracks](https://www.singletracks.com/mtb-gear/trying-out-tubolitos-new-mtb-psens-smart-tube/)
- [Rover PSIcle - Bikerumor](https://bikerumor.com/exclusive-rover-psicle-wireless-tire-pressure-monitor-is-accurate-tubeless-battery-free/)
- [Rover PSIcle - Pinkbike](https://www.pinkbike.com/news/psicle-batteryless-nfc-sensor-threads-into-presta-valve-to-measure-tire-pressure.html)
- [Gravaa 破產 - road.cc](https://road.cc/content/news/gravaa-declared-bankrupt-due-lack-sales-317767)
- [JOSN TyreDog - TaiwanTrade](https://tyredog.en.taiwantrade.com/product/bicycle-tpms-345524.html)

### 技術與晶片
- [SKS Airspy 硬體逆向工程 - GitHub](https://github.com/bitmeal/sks_airspy_ant_community_fw/blob/master/doc/HARDWARE_PROTO.md)
- [SKS Airspy 逆向工程 - Hackaday](https://hackaday.com/2025/02/25/reverse-engineering-sks-airspy-tire-pressure-sensors-for-custom-firmware/)
- [TREEL TPMS 使用 nRF52 - Nordic 案例](https://www.nordicsemi.com/Nordic-news/2024/04/TREEL-Mobility-Solutions-incorporates-Nordics-nRF52833-nRF52832-and-nRF52810-SoCs)
- [Nordic nRF52 ANT 支援](https://www.thisisant.com/developer/components/nrf52832)
- [ANT Stack 授權 FAQ](https://www.thisisant.com/developer/components/view-all-components/nrf52-ant-stack-licensing-faq)
- [Infineon XENSIV TPMS 感測器](https://www.infineon.com/cms/en/about-infineon/press/market-news/2023/INFATV202309-149.html)
- [NXP FXTH87E TPMS 感測器（已停產）](https://www.nxp.com/products/sensors/pressure-sensors/tire-pressure-monitoring-sensors-tpms/fxth87e-tire-pressure-monitor-sensor-tpms-family:FXTH87E)
- [Quarq TyreWiz FCC Filing (C9O-PMB1)](https://fccid.io/C9O-PMB1)

### E-bike 市場
- [Grand View Research - E-Bike Market Report 2033](https://www.grandviewresearch.com/industry-analysis/e-bikes-market-report)
- [Fortune Business Insights - Electric Bike Market 2034](https://www.fortunebusinessinsights.com/electric-e-bike-market-102022)
- [Precedence Research - E-Bike Market 2035](https://www.precedenceresearch.com/e-bike-market)
- [MarketsandMarkets - Electric Bike Market 2032](https://www.marketsandmarkets.com/Market-Reports/electric-bike-market-110827400.html)
- [Mordor Intelligence - E-Bike Market 2030](https://www.mordorintelligence.com/industry-reports/e-bike-market)
- [Allied Market Research - Electric Bikes Market 2030](https://www.alliedmarketresearch.com/electric-bikes-market)
- [Grand View Research - U.S. E-Bike Market 2030](https://www.grandviewresearch.com/industry-analysis/us-e-bike-market-report)
- [Accio - Electric Bike Tire Trends 2025](https://www.accio.com/t-v2/business/electric-bike-tire-trends)

### E-bike Valve 與 Sealant
- [Lacros E-Bike - Presta vs Schrader Valve](https://lacrosebike.com/blogs/lacrosebike-blogs/presta-vs-schrader-valve-which-one-should-you-choose)
- [eBikes Forum - Schrader vs Presta](https://ebikesforum.com/threads/schrader-vs-presta-valve.3942/)
- [Vitilan - E-Bike Tires Tubed vs Tubeless](https://www.eu.vitilanebike.com/blogs/news/understanding-e-bike-tires-tubed-vs-tubeless)
- [Electric Bike Forums - Tubeless Tire Experiences](https://forums.electricbikereview.com/threads/tubeless-tire-experiences.54367/)
- [Eclipse - TPU vs Tubeless 2025](https://eclipse.bike/en/blogs/news/tpu-vs-tubeless-which-setup-is-right-for-your-ride-in-2025)
- [Cycling Weekly - Sealant Shunning: Rise of TPU Inner Tube](https://www.cyclingweekly.com/deals/sealant-shunning-the-rise-of-the-tpu-inner-tube-4-cyber-monday-discounts-on-the-performance-trend-of-2025)
- [BikeRadar - Faux Tubeless](https://www.bikeradar.com/news/faux-tubeless)

### TPMS 市場規模（2026-03 新增）
- [Newstrail - Smart Bicycle Tire Pressure Monitor Market](https://www.newstrail.com/smart-bicycle-tire-pressure-monitor-market-share/)
- [Research & Markets - TPMS Sensor Chip Market 2026-2032](https://www.researchandmarkets.com/reports/6119313/tpms-tire-pressure-sensor-chip-market-global)

### Gravaa 破產（2026-03 新增）
- [Bikerumor - Gravaa Declares Bankruptcy](https://bikerumor.com/gravaa-declares-bankruptcy-despite-race-winning-performances-of-its-pressure-adjusting-hubs/)
- [Pinkbike - Gravaa Bankruptcy Low Sales](https://www.pinkbike.com/news/gravaa-declares-bankruptcy-after-low-sales-of-its-on-board-tire-inflator.html)
- [Cyclingnews - Was Gravaa Ahead of Its Time?](https://www.cyclingnews.com/cycling-tech-components/gravaa-has-been-declared-bankrupt-was-the-adjustable-tyre-inflation-system-simply-ahead-of-its-time/)
- [Escape Collective - Gravaa Declared Bankrupt](https://escapecollective.com/gravaa-declared-bankrupt/)

### StatCap / Outrider 用戶回饋（2026-03 新增）
- [Road Bike Rider - StatCap P1 Review](https://www.roadbikerider.com/statcap-p1-tire-pressure-monitoring-system-tpms-review/)
- [Outrider TL Pro 官方](https://www.outridercomponents.com/products/outrider-tl-pro)

### TPMS 晶片與感測器（2026-03 新增）
- [Senasic SNP746 產品頁](https://www.senasic.com/en/product/tire-pressu-monitoring-system/14)
- [Senasic SNP746 Datasheet PDF](https://www.senasic.com/Public/Uploads/uploadfile/files/20240124/DS0026SNP746Datasheet.pdf)
- [Senasic SNP736 技術文章](https://www.senasic.com/en/technical-support/technical-article/18)
- [Senasic 香港上市新聞 - Benzinga](https://www.benzinga.com/Opinion/26/03/51156780/senasic-sheds-mom-and-pop-chip-shop-roots-with-hong-kong-ipo)
- [Senasic HKEX 招股文件](https://www1.hkexnews.hk/app/sehk/2026/108265/documents/sehk26030600295.pdf)
- [Infineon SP490 Datasheet PDF](https://www.infineon.com/assets/row/public/documents/24/49/infineon-sp490-01-12-datasheet-en.pdf)
- [Infineon XENSIV TPMS 新聞稿](https://www.infineon.com/cms/en/about-infineon/press/market-news/2023/INFATV202309-149.html)
- [Bosch SMP290 產品頁](https://www.bosch-semiconductors.com/products/mems-sensors/safety-systems/smp290/)
- [Bosch SMP290 介紹 - Rutronik](https://www.rutronik.com/article/single-chip-solution-for-tpms-the-smp290-sensor-module-from-bosch-in-rutroniks-automotive-portfolio)
- [NXP FXTH87E（已停產）](https://www.nxp.com/products/sensors/pressure-sensors/tire-pressure-monitoring-sensors-tpms/fxth87e-tire-pressure-monitor-sensor-tpms-family:FXTH87E)
- [TREEL 使用 Nordic nRF52 量產 TPMS](https://www.nordicsemi.com/Nordic-news/2024/04/TREEL-Mobility-Solutions-incorporates-Nordics-nRF52833-nRF52832-and-nRF52810-SoCs)
- [RF-star CC2340 BLE TPMS 方案](https://www.rfstariot.com/blog/rf-star-cc2340-ble-modules-show-how-to-work-in-tpms_b60)
- [BLE-TPMS 開源專案 - GitHub](https://github.com/ra6070/BLE-TPMS)
- [TPMS PCB 天線專利 CN204424429U](https://patents.google.com/patent/CN204424429U/en)

### 市場與比較
- [Cycling Weekly TPMS 比較](https://www.cyclingweekly.com/reviews/tyres-and-wheels/what-pressure-are-you-running-three-different-pressure-monitoring-systems-put-to-the-test)
- [Hammerhead Karoo TPMS 支援](https://support.hammerhead.io/hc/en-us/articles/25605314831131-Karoo-OS-Tire-Pressure-Sensor-Integration)
- [Pinkbike 民調：你會用 TPMS 嗎？](https://www.pinkbike.com/news/pinkbike-poll-real-time-pressure-sensors.html)
- [TPMS 市場報告 - IMARC Group](https://www.imarcgroup.com/tire-pressure-monitoring-system-market)
- [自行車 TPMS 專利 WO2025/261588 - Bikerumor](https://bikerumor.com/patent-patrol-inventor-with-tire-pressure-management-system-patent-seeks-industry-partner/)
