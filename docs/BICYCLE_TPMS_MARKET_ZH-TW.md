# 自行車 TPMS 市場研究

> 最後更新：2026-03-16
> 用途：自行車胎壓監控系統市場研究，與無內胎氣嘴市場的交集分析

> **背景：** TPMS（Tire Pressure Monitoring System）正與無內胎氣嘴市場產生交集。氣嘴帽型感測器取代傳統氣嘴帽，整合型感測氣嘴合併了「高流量氣嘴」與「即時胎壓監控」兩個品類。對 N.S.-LIN 而言，這是潛在的產品線擴展方向。

---

## 目錄

1. [產品總覽](#產品總覽)
2. [安裝方式分類](#安裝方式分類)
3. [通訊協議](#通訊協議)
4. [RideNow TPMS T1 深度分析](#ridenow-tpms-t1-深度分析)
5. [市場趨勢](#市場趨勢)
6. [與無內胎氣嘴市場的交集](#與無內胎氣嘴市場的交集)
7. [TPMS 相關 OEM 供應商](#tpms-相關-oem-供應商)
8. [TPMS 相關專利](#tpms-相關專利)
9. [資料來源](#資料來源)

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
| **狀態** | 預購中（預計 2025 年 9 月出貨） |
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
| [StatCap P1](https://teamstatcap.com/product/statcap-p1/) | $99 | BLE | 氣嘴帽替換 | 250ms 更新間隔。Tahuna app。小量生產（200 台）。含溫度和搖晃偵測。 |
| [Tubolito PSENS](https://www.tubolito.com/product/tubo-mtb-psens/) | ~$50 | NFC | TPU 內胎內建 | 按需讀取（手機貼近）。無電池。~93g（含管）。27.5"/29"。 |
| [Tubolito SYNCD](https://www.tubolito.com/product/tubo-road-syncd/) | 未公布 | BLE | TPU 內胎內建 | 即時監控。2 年/10,000km 電池壽命。不可更換（換胎方案）。700c。 |
| [Rover PSIcle](https://www.tindie.com/products/CaptMcAllister/psicle-nfc-pressure-sensor-for-presta-valves/) | 小量 | NFC | 閥芯延長管 | 無電池。MTB 版 ±0.06 PSI 精度。Maker 產品（Tindie）。專利申請中。 |
| [Gravaa KAPS](https://gravaa.com/) | EUR 3,200+ | ANT+/BLE | 花鼓整合 | **已破產**（2026 年 1 月）。主動充/放氣系統。Visma-Lease a Bike 曾使用。售價過高。[road.cc 報導](https://road.cc/content/news/gravaa-declared-bankrupt-due-lack-sales-317767) |
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

## 市場趨勢

1. **ANT+ TPMS profile 普及** — Garmin、Wahoo、Hammerhead 都支援官方 ANT+ TPMS device profile，新進者（Outrider、RideNow）優先對接 ANT+
2. **E-bike 整合驅動量產** — AIRsistant 和 FIT 瞄準 OEM 整合到 e-bike 儀表板。E-bike 重量不敏感 + 安全需求強 = TPMS 的最大成長動力
3. **價格壓縮** — 從 $145（SKS Airspy）下滑到 $55-80（Outrider、RideNow）。新專利 WO2025/261588 宣稱可將售價降至現有系統的 20-30%
4. **內建/整合式趨勢** — 從外掛帽蓋型→胎內型（Outrider）、整合氣嘴型（SKS TL）、內胎內建型（Tubolito）
5. **Gravel/MTB 優先於公路** — 即時 TPMS 在越野場景（頻繁調壓）比公路有更強使用案例。公路主要是賽前確認和慢漏偵測
6. **亞洲平價進入者** — RideNow、JOSN（TyreDog）等亞洲 OEM 以低價進入，基礎帽蓋型 TPMS 正被商品化
7. **Gravaa 破產的教訓** — 最先進的主動充/放氣系統（WorldTour 車隊使用）因 EUR 3,200+ 售價在 2026 年 1 月破產。市場還沒準備好為主動胎壓管理支付溢價

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

### 市場與比較
- [Cycling Weekly TPMS 比較](https://www.cyclingweekly.com/reviews/tyres-and-wheels/what-pressure-are-you-running-three-different-pressure-monitoring-systems-put-to-the-test)
- [Hammerhead Karoo TPMS 支援](https://support.hammerhead.io/hc/en-us/articles/25605314831131-Karoo-OS-Tire-Pressure-Sensor-Integration)
- [Pinkbike 民調：你會用 TPMS 嗎？](https://www.pinkbike.com/news/pinkbike-poll-real-time-pressure-sensors.html)
- [TPMS 市場報告 - IMARC Group](https://www.imarcgroup.com/tire-pressure-monitoring-system-market)
- [自行車 TPMS 專利 WO2025/261588 - Bikerumor](https://bikerumor.com/patent-patrol-inventor-with-tire-pressure-management-system-patent-seeks-industry-partner/)
