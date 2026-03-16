# Dev Spec: 競品情報系統改進 (v1.3)

> 狀態：SPEC READY — 待簽收
> 作者：架構師
> 日期：2026-03-16
> 版本：v1.3（v1.2 Gemini + ChatGPT review 反饋：CI 解耦、anchor 穩定化、schema 清理）
> 前置規格：`docs/DEV_SPEC_COMPETITIVE_INTEL_AUTO_UPDATE.md` (v2.1)

---

## 目標

針對現行競品情報收集與週報系統的四項改進：

1. **URL Health Check** — 證據收集時驗證 URL 存活狀態，精確分類失敗原因，email 標記不可用連結
2. **Material Price Tracking** — 用確定性金融 API 追蹤銅/鋁/原油期貨報價（TWD），加入週報「原材料行情」區塊
3. **Email Value Truncation Fix** — 放寬截斷長度 + 條件式省略號 + 手機防爆版
4. **Report Page + Email Link** — 將原材料行情加入競品分析報告頁面，週報 email 加入報告頁面連結

Feature 1-3 彼此獨立。Feature 4 依賴 Feature 2（需要 material-prices.json 資料）。

> **複雜度不對稱聲明：** Feature 3 是純顯示層小修；Feature 1 是有邊界的 evidence enrichment；Feature 2 實際上是一個新的資料收集子系統；Feature 4 是前端整合 + prebuild pipeline 擴充。執行規劃應反映此差異。

---

## Feature 1: URL Health Check

### 動機

Tavily 回傳的 `evidence.source_url` 可能已失效（404、domain 過期、WAF 攔截等）。目前 email 和 PR summary 照原樣顯示，reviewer 點進去才發現連結壞了，浪費時間。

### 設計

#### 1.1 收集階段：HEAD + GET Fallback 驗證

在 `collect-competitive-intel.mjs` 的 `collectEvidenceForEntity()` 函數中，對每一筆 Tavily 回傳的 evidence URL 做 health check。

**策略：** 先 HEAD，若遇 WAF/方法不允許則降級 GET。

```javascript
async function checkUrlHealth(url, timeoutMs = 5000) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; NSLinBot/1.0)',
    'Accept': 'text/html',
  };

  // Step 1: try HEAD
  const headResult = await timedFetch(url, 'HEAD', headers, timeoutMs);

  // Step 2: if WAF/method-blocked, fallback to lightweight GET
  if (headResult.status === 403 || headResult.status === 405 || headResult.status === 406) {
    const getResult = await timedFetch(url, 'GET', headers, timeoutMs);
    return classifyResult(getResult, 'get');
  }

  return classifyResult(headResult, 'head');
}

async function timedFetch(url, method, headers, timeoutMs) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: 'follow',
      headers,
    });
    clearTimeout(timer);
    return { status: res.status, ok: true };
  } catch (e) {
    const reason = e.name === 'AbortError' ? 'timeout' : 'network';
    return { status: 0, ok: false, reason };
  }
}

function classifyResult(result, method) {
  if (result.status >= 200 && result.status < 400) {
    return { url_status: 'alive', url_http_status: result.status, url_check_method: method };
  }
  if (result.status === 403) {
    return { url_status: 'blocked', url_http_status: 403, url_check_method: method,
             url_status_reason: 'waf_block' };
  }
  if (result.status === 0) {
    return { url_status: 'unreachable', url_http_status: 0, url_check_method: method,
             url_status_reason: result.reason || 'unknown' };
  }
  // 404, 410, 5xx, etc.
  return { url_status: 'dead', url_http_status: result.status, url_check_method: method,
           url_status_reason: `http_${result.status}` };
}
```

**規則：**
- Timeout：5 秒
- 跟隨 redirect（301/302 視為 alive）
- HEAD 遇 403/405/406 → fallback GET（避免 WAF 誤判）
- GET fallback 使用瀏覽器 User-Agent + `Accept: text/html`
- 失敗不阻塞 pipeline

#### 1.2 URL Status 分類（五種狀態）

| 狀態 | 意義 | 觸發條件 |
|------|------|----------|
| `alive` | 可正常存取 | 200-399 |
| `blocked` | WAF/CDN 攔截，頁面可能仍存在 | HEAD+GET 都 403 |
| `unreachable` | 無法連線 | DNS 失敗、timeout、network error |
| `dead` | 確定失效 | 404、410、5xx |
| `unchecked` | 未檢查（向下相容舊資料） | default |

> **v1.0 → v1.1 變更：** 原本只有 `alive/dead/unchecked`，現拆分為五種狀態，避免 `dead` 語義過載。`blocked` 與 `dead` 對 reviewer 意義不同：blocked 表示「bot 被擋但頁面可能仍在」，reviewer 可手動瀏覽器開啟驗證。

#### 1.3 Evidence 物件擴充

```javascript
results.push({
  ...r,
  source_type: 'official_site',
  url_status: healthResult.url_status,         // 'alive' | 'blocked' | 'unreachable' | 'dead' | 'unchecked'
  url_http_status: healthResult.url_http_status, // HTTP status code (0 = network error)
  url_check_method: healthResult.url_check_method, // 'head' | 'get' | 'none'
  url_status_reason: healthResult.url_status_reason, // 'timeout' | 'dns' | 'waf_block' | 'http_404' | ...
  url_checked_at: new Date().toISOString(),
});
```

#### 1.4 Schema 變更

`scripts/schemas/competitive-intel.mjs` 的 `EvidenceSourceSchema` 擴充：

```javascript
export const EvidenceSourceSchema = z.object({
  source_url: z.string().url(),
  source_type: z.enum([...]),
  retrieved_at: z.string().datetime(),
  snippet: z.string().max(500),
  url_status: z.enum(['alive', 'blocked', 'unreachable', 'dead', 'unchecked']).default('unchecked'),
  url_http_status: z.number().int().min(0).optional(),
  url_check_method: z.enum(['head', 'get', 'none']).default('none'),
  url_status_reason: z.string().optional(),
  url_checked_at: z.string().datetime().optional(),
});
```

`'unchecked'` 作為 default，向下相容舊資料。

**SUBMIT_PROPOSALS_TOOL 的 input_schema** 同步新增這些屬性（非 required）。收集腳本以自己的 check 結果為準，不依賴 Claude 判斷。

#### 1.5 Email 模板變更

`generate-proposal-email.mjs` 中處理 source link row：

```javascript
const status = p.evidence.url_status || 'unchecked';
const fullUrl = p.evidence.source_url;

if (status === 'dead') {
  // 確定失效：灰色刪除線 + 紅色 [失效]，但保留完整 URL 作為 title tooltip
  h += `<span style="font-size:11px;color:${S.slate400};text-decoration:line-through;" title="${fullUrl}">`;
  h += `${srcLabel} → ${truncate(fullUrl, 60)}`;
  h += `</span>`;
  h += ` <span style="font-size:10px;color:${S.rose};font-weight:600;">[失效]</span>`;
} else if (status === 'blocked') {
  // WAF 攔截：仍可點擊（人類瀏覽器可能能開），橘色標記
  h += `<a href="${fullUrl}" style="font-size:11px;color:${S.amber};text-decoration:none;" title="${fullUrl}">`;
  h += `${srcLabel} → ${truncate(fullUrl, 60)}</a>`;
  h += ` <span style="font-size:10px;color:${S.amber};font-weight:600;">[受限]</span>`;
} else if (status === 'unreachable') {
  // 無法連線：灰色 + [離線]
  h += `<span style="font-size:11px;color:${S.slate400};" title="${fullUrl}">`;
  h += `${srcLabel} → ${truncate(fullUrl, 60)}`;
  h += `</span>`;
  h += ` <span style="font-size:10px;color:${S.slate400};font-weight:600;">[離線]</span>`;
} else {
  // alive 或 unchecked：照常顯示
  h += `<a href="${fullUrl}" style="font-size:11px;color:${S.steel};text-decoration:none;" title="${fullUrl}">`;
  h += `${srcLabel} → ${truncate(fullUrl, 60)}</a>`;
}
```

**設計選擇：**
- 死連結仍顯示（灰色刪除線），reviewer 能看到來源曾存在
- blocked 連結仍可點擊（人類瀏覽器可能繞過 WAF），橘色標注 [受限]
- 所有連結加 `title` tooltip 保留完整 URL，reviewer hover 即可看到

#### 1.6 Proposal Summary 變更

`generate-proposal-summary.mjs` 的 evidence 行：

```markdown
# alive / unchecked
- Source: [official_site](https://example.com/product)

# blocked
- Source: [official_site](https://example.com/product) [BLOCKED]

# unreachable
- Source: ~~[official_site](https://example.com/product)~~ [UNREACHABLE]

# dead
- Source: ~~[official_site](https://example.com/dead-link)~~ [DEAD]
```

#### 1.7 不變更 Claude API 呼叫

Claude API 的 user message 中仍然提供完整 evidence（包含所有狀態的連結）。讓 AI 自行判斷權重。

### 影響範圍

| 檔案 | 變更 |
|------|------|
| `scripts/collect-competitive-intel.mjs` | 新增 `checkUrlHealth()`, `timedFetch()`, `classifyResult()` |
| `scripts/schemas/competitive-intel.mjs` | `EvidenceSourceSchema` 加四個欄位 |
| `scripts/generate-proposal-email.mjs` | Source link row 四路分支顯示 |
| `scripts/generate-proposal-summary.mjs` | 依 status 標記連結 |

### 風險

| 風險 | 嚴重度 | 緩解 |
|------|--------|------|
| GET fallback 仍被擋 | 低 | 分類為 `blocked`（不是 `dead`），reviewer 可手動驗證 |
| 大量 HEAD+GET 拖慢速度 | 低 | GET fallback 僅在 403/405/406 時觸發；worst case 每 entity 多 ~10 秒 |
| 舊 proposals 沒有新欄位 | 低 | Schema default 值 + email 走 else 分支 |

---

## Feature 2: Material Price Tracking

### 動機

N.S.-LIN 的主要原材料是銅（黃銅氣嘴本體）和鋁（鋁合金氣嘴本體 + 鎖固環）。原材料價格波動直接影響產品成本與定價策略。目前週報只追蹤競品零售價格，缺乏上游原材料行情。

> **Scope 聲明：** 本區塊提供的是**方向性上游 benchmark**，不是採購級 landed-cost model。
>
> - **金屬（銅/鋁）：** 價格來自國際期貨收盤價經匯率換算為 TWD/kg。黃銅 ≠ 純銅，鋁合金 ≠ 純鋁——實際採購價格因合金成分、規格、供應商而異。
> - **塑膠/橡膠（ABS/PC/EPDM/NBR）：** 無直接期貨合約，使用 WTI 原油期貨作為上游 proxy。ABS/PC 源自石腦油裂解，EPDM/NBR 源自丁二烯/丙烯等石化原料，均與原油正相關但非線性。
> - **共通限制：** 不含運輸、關稅、加工損耗、MOQ 差異。本訊號的用途是追蹤趨勢方向與週變化幅度，不應直接用於成本計算。

### 設計

> **v1.0 → v1.1 關鍵變更：** 放棄 Tavily + Claude LLM 解析的方案。改用確定性金融 API（Yahoo Finance）：確定性擷取、無幻覺、省 token。Yahoo Finance 是非正式公開 API，provider/schema 穩定性不保證永久不變，但比 LLM 解析可靠度高一個等級。

#### 2.1 資料來源：Yahoo Finance API（確定性）

> **v1.2 實測驗證（2026-03-16）：** 以下所有 symbol 均已實際呼叫 Yahoo Finance API 確認回傳正確數值。

**直接期貨（精確價格）：**

| 符號 | 商品 | 實測值 | 單位 | 用途 |
|------|------|--------|------|------|
| `HG=F` | COMEX 銅期貨 | 5.744 | **USD/lb** | 銅價（黃銅閥體原料） |
| `ALI=F` | COMEX 鋁期貨 | 3450.0 | **USD/ton** | 鋁價（鋁合金閥體 + 鎖固環） |
| `TWDUSD=X` | 台幣匯率 | 0.0312 | **TWD→USD** | 需取倒數 = 32.05 TWD/USD |

> **v1.1 → v1.2 修正：** 鋁期貨 `ALI=F` 的單位是 USD/**ton**（非 USD/lb），換算公式不同。匯率 `TWDUSD=X` 回傳的是 TWD→USD 方向（0.0312），需取倒數才是 USD→TWD（32.05）。

**上游 proxy（方向性指標）：**

ABS、PC、EPDM、NBR 在主要交易所均無直接期貨合約（僅有 ICIS/Platts 產業指數，需付費訂閱）。這四種材料全為石化衍生物，與原油價格高度相關，使用原油期貨作為共用上游 proxy。

| 符號 | 商品 | 實測值 | 單位 | Proxy 對象 |
|------|------|--------|------|------------|
| `CL=F` | WTI 原油期貨 | 99.58 | USD/barrel | ABS、PC、EPDM、NBR 共用上游 |

**材料 → 數據源對照：**

| 材料 | 中文 | 閥門用途 | 數據源 | 精確度 |
|------|------|----------|--------|--------|
| 銅 (Copper) | 銅 | 黃銅閥芯、配件 | `HG=F` 直接期貨 | 精確 |
| 鋁 (Aluminum) | 鋁 | 鋁合金閥體、鎖固環 | `ALI=F` 直接期貨 | 精確 |
| ABS 塑膠 | ABS | 閥帽、保護蓋 | `CL=F` 上游 proxy | 方向性 |
| PC 聚碳酸酯 | PC | 透明件、結構件 | `CL=F` 上游 proxy | 方向性 |
| EPDM 橡膠 | EPDM | O-ring、密封件 | `CL=F` 上游 proxy | 方向性 |
| NBR 丁腈橡膠 | NBR | 耐油 O-ring | `CL=F` 上游 proxy | 方向性 |

```javascript
async function fetchYahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NSLinBot/1.0)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    return {
      price: meta?.regularMarketPrice,
      currency: meta?.currency,
      symbol,
    };
  } catch (e) {
    // CAPTCHA page, non-JSON response, network error
    console.warn(`Yahoo Finance fetch failed for ${symbol}: ${e.message}`);
    return null;
  }
}
```

> **v1.2 防禦：** `res.json()` 包在 try/catch 中。Yahoo 偶爾回傳 HTTP 200 但內容是 CAPTCHA HTML，直接 `.json()` 會拋 SyntaxError。

**換算公式（依材料單位不同）：**
```
# 匯率（取倒數）
usd_to_twd = 1 / twdusd_quote.price   // 0.0312 → 32.05

# 銅（HG=F 單位 = USD/lb）
copper_twd_per_kg = copper_usd_per_lb × 2.20462 × usd_to_twd
copper_usd_per_ton = copper_usd_per_lb × 2204.62

# 鋁（ALI=F 單位 = USD/ton）
aluminum_twd_per_kg = aluminum_usd_per_ton / 1000 × usd_to_twd
aluminum_usd_per_ton = aluminum_usd_per_ton  // 直接使用

# 原油（CL=F 單位 = USD/barrel）— proxy 不換算為 TWD/kg
# 直接以 USD/barrel 呈現，標示週變化方向
```

**為什麼不用 Tavily + Claude：**
- 金融報價需要精確數字，LLM 的機率特性會引入誤差
- 搜尋結果可能抓到「廢鋁回收價」而非 LME 現貨價
- Yahoo Finance API 免費、無需 API key、確定性輸出
- 省掉 ~$0.08/次 的 Tavily + Claude token 成本

#### 2.2 資料結構

新增 `data/competitive-intel/material-prices.json`：

```jsonc
{
  "snapshots": [
    // 直接期貨材料（精確價格）
    {
      "date": "2026-03-16",
      "material": "copper",
      "material_zh": "銅",
      "data_class": "direct",
      "price_twd_per_kg": 405.9,
      "price_usd_per_ton": 12662.0,
      "price_usd_raw": 5.744,
      "price_raw_unit": "USD/lb",
      "exchange_rate": 32.05,
      "source_type": "futures_api",
      "source_symbol": "HG=F",
      "source_currency": "USD",
      "source_url": "https://finance.yahoo.com/quote/HG=F",
      "source_description": "COMEX Copper Futures (HG=F) + USD/TWD",
      "conversion_method": "usd_fx_derived",
      "retrieved_at": "2026-03-16T06:00:00Z"
    },
    // 上游 proxy 材料（方向性指標）
    {
      "date": "2026-03-16",
      "material": "abs",
      "material_zh": "ABS 塑膠",
      "data_class": "proxy",
      "proxy_symbol": "CL=F",
      "proxy_name": "WTI Crude Oil",
      "proxy_price": 99.58,
      "proxy_unit": "USD/barrel",
      "source_type": "futures_api",
      "source_symbol": "CL=F",
      "source_currency": "USD",
      "source_url": "https://finance.yahoo.com/quote/CL=F",
      "source_description": "WTI Crude Oil Futures (upstream proxy for ABS)",
      "conversion_method": "proxy",
      "retrieved_at": "2026-03-16T06:00:00Z"
    }
  ]
}
```

**為什麼不用 `market-signals.json`：** `market-signals.json` 的設計用途是存放 Class 4 低可信度雜訊。原材料價格是高可信度的結構化時間序列資料，語義不同，應獨立存放。

**兩種 data_class：**
- `direct`：有直接期貨合約，換算為 TWD/kg 精確報價
- `proxy`：無直接期貨，顯示上游原物料（原油）報價作為方向性指標

#### 2.3 Schema

`scripts/schemas/competitive-intel.mjs` 新增：

```javascript
// 直接期貨材料
const DirectMaterialFields = {
  data_class: z.literal('direct'),
  price_twd_per_kg: z.number().positive(),
  price_usd_per_ton: z.number().positive(),
  price_usd_raw: z.number().positive(),
  price_raw_unit: z.string(),  // "USD/lb" | "USD/ton"
  exchange_rate: z.number().positive(),
};

// 上游 proxy 材料
const ProxyMaterialFields = {
  data_class: z.literal('proxy'),
  proxy_symbol: z.string(),
  proxy_name: z.string(),
  proxy_price: z.number().positive(),
  proxy_unit: z.string(),  // "USD/barrel"
  // 注意：不存 proxy_change_pct。週變化完全由 render 時從歷史資料計算。
  // 避免 schema 中出現「半導出欄位」——要嘛全存、要嘛全算。
};

// 共用欄位
const SharedFields = {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  material: z.enum(['copper', 'aluminum', 'abs', 'pc', 'epdm', 'nbr']),
  material_zh: z.string(),
  source_type: z.enum(['futures_api', 'manual', 'search_derived']),
  source_symbol: z.string(),
  source_currency: z.string(),
  source_url: z.string().url(),
  source_description: z.string(),
  conversion_method: z.enum(['direct_twd', 'usd_fx_derived', 'proxy']),
  retrieved_at: z.string().datetime(),
};

export const MaterialPriceSnapshotSchema = z.discriminatedUnion('data_class', [
  z.object({ ...SharedFields, ...DirectMaterialFields }),
  z.object({ ...SharedFields, ...ProxyMaterialFields }),
]);

export const MaterialPricesFileSchema = z.object({
  snapshots: z.array(MaterialPriceSnapshotSchema),
});
```

#### 2.4 收集邏輯

在 `collect-competitive-intel.mjs` 新增 `collectMaterialPrices()` 函數，在主迴圈完成後執行：

```javascript
// 直接期貨材料（精確價格）
const DIRECT_MATERIALS = [
  { id: 'copper',   zh: '銅',  symbol: 'HG=F',  unit: 'USD/lb',  toTwdPerKg: (price, fx) => price * 2.20462 * fx },
  { id: 'aluminum', zh: '鋁',  symbol: 'ALI=F', unit: 'USD/ton', toTwdPerKg: (price, fx) => (price / 1000) * fx },
];

// 上游 proxy 材料（方向性指標，共用原油期貨）
const PROXY_MATERIALS = [
  { id: 'abs',  zh: 'ABS 塑膠',   usage: '閥帽、保護蓋' },
  { id: 'pc',   zh: 'PC 聚碳酸酯', usage: '透明件、結構件' },
  { id: 'epdm', zh: 'EPDM 橡膠',  usage: 'O-ring、密封件' },
  { id: 'nbr',  zh: 'NBR 丁腈橡膠', usage: '耐油 O-ring' },
];
const PROXY_SYMBOL = 'CL=F'; // WTI Crude Oil

const LB_PER_KG = 2.20462;
const LB_PER_TON = 2204.62;

async function collectMaterialPrices() {
  // Step 1: fetch exchange rate (TWDUSD=X returns TWD→USD, need inverse)
  const fxQuote = await fetchYahooQuote('TWDUSD=X');
  if (!fxQuote?.price) {
    console.warn('Failed to fetch USD/TWD exchange rate, skipping material prices');
    return [];
  }
  const usdToTwd = 1 / fxQuote.price; // 0.0312 → 32.05

  const snapshots = [];
  const today = new Date().toISOString().slice(0, 10);

  // Step 2: Direct materials (copper, aluminum)
  for (const mat of DIRECT_MATERIALS) {
    const quote = await fetchYahooQuote(mat.symbol);
    if (!quote?.price) {
      console.warn(`Failed to fetch ${mat.id} price (${mat.symbol}), skipping`);
      continue;
    }

    const priceRaw = quote.price;
    const priceTwdPerKg = mat.toTwdPerKg(priceRaw, usdToTwd);
    // Compute USD/ton regardless of source unit
    const priceUsdPerTon = mat.unit === 'USD/lb'
      ? priceRaw * LB_PER_TON
      : priceRaw; // ALI=F already USD/ton

    snapshots.push({
      date: today,
      material: mat.id,
      material_zh: mat.zh,
      data_class: 'direct',
      price_twd_per_kg: Math.round(priceTwdPerKg * 10) / 10,
      price_usd_per_ton: Math.round(priceUsdPerTon * 100) / 100,
      price_usd_raw: priceRaw,
      price_raw_unit: mat.unit,
      exchange_rate: Math.round(usdToTwd * 100) / 100,
      source_type: 'futures_api',
      source_symbol: mat.symbol,
      source_currency: 'USD',
      source_url: `https://finance.yahoo.com/quote/${encodeURIComponent(mat.symbol)}`,
      source_description: `COMEX ${mat.zh} Futures (${mat.symbol}) + USD/TWD`,
      conversion_method: 'usd_fx_derived',
      retrieved_at: new Date().toISOString(),
    });
  }

  // Step 3: Proxy materials (ABS, PC, EPDM, NBR → crude oil)
  const oilQuote = await fetchYahooQuote(PROXY_SYMBOL);
  if (oilQuote?.price) {
    for (const mat of PROXY_MATERIALS) {
      snapshots.push({
        date: today,
        material: mat.id,
        material_zh: mat.zh,
        data_class: 'proxy',
        proxy_symbol: PROXY_SYMBOL,
        proxy_name: 'WTI Crude Oil',
        proxy_price: oilQuote.price,
        proxy_unit: 'USD/barrel',
        source_type: 'futures_api',
        source_symbol: PROXY_SYMBOL,
        source_currency: 'USD',
        source_url: `https://finance.yahoo.com/quote/${encodeURIComponent(PROXY_SYMBOL)}`,
        source_description: `WTI Crude Oil (upstream proxy for ${mat.zh})`,
        conversion_method: 'proxy',
        retrieved_at: new Date().toISOString(),
      });
    }
  } else {
    console.warn('Failed to fetch crude oil price, skipping proxy materials');
  }

  return snapshots;
}
```

**注意：** `collectMaterialPrices()` 不依賴 Tavily 或 Claude API。即使兩者的 key 缺失或失效，原材料價格收集仍能正常運作。Yahoo Finance API 亦免費且無需 API key。

#### 2.5 存儲：Upsert by date + material

```javascript
// 在 main() 尾部
if (!isDryRun) {
  const materialSnapshots = await collectMaterialPrices();
  if (materialSnapshots.length > 0) {
    const mpFile = path.join(DATA_DIR, 'material-prices.json');
    const existing = fs.existsSync(mpFile)
      ? JSON.parse(fs.readFileSync(mpFile, 'utf-8'))
      : { snapshots: [] };

    // Upsert: date + material 為 unique key，rerun 不產生重複
    for (const snap of materialSnapshots) {
      const idx = existing.snapshots.findIndex(
        (s) => s.date === snap.date && s.material === snap.material
      );
      if (idx >= 0) {
        existing.snapshots[idx] = snap; // overwrite
      } else {
        existing.snapshots.push(snap);
      }
    }

    // Archive: 只保留最近 6 個月
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoff = sixMonthsAgo.toISOString().slice(0, 10);
    existing.snapshots = existing.snapshots.filter((s) => s.date >= cutoff);

    fs.writeFileSync(mpFile, JSON.stringify(existing, null, 2), 'utf-8');
    console.log(`Material prices: ${materialSnapshots.length} snapshots saved`);
  }
}
```

#### 2.6 Email 報告：「原材料行情」區塊

在 `generate-proposal-email.mjs` 中，summary cards 與 staleness alerts 之間插入新區塊。

**Stale / Missing 行為：**

| 情境 | 行為 |
|------|------|
| 本週資料正常 | 正常顯示 + 週變化 |
| 某材料本週缺 | 顯示上次值 + 灰色 `[上週資料]` badge |
| 全部缺（run 失敗） | 顯示上次值 + 灰色 `[N 天前]` badge |
| 最新 snapshot > 14 天 | 該材料行顯示橘色 `[過時]` badge |
| 完全無歷史資料 | 隱藏整個「原材料行情」區塊 |

**Email 分兩區呈現：**

```
┌─────────────────────────────────────────────┐
│ 原材料行情                                    │
├─────────────────────────────────────────────┤
│ 金屬（精確報價）                               │
│ ┌──────┬──────────┬────────┬──────┐        │
│ │ 材料  │ 台幣/公斤 │ 週變化  │ 來源 │        │
│ ├──────┼──────────┼────────┼──────┤        │
│ │ 銅    │ NT$ 405.9│ +1.2%  │ 查看 │        │
│ │ 鋁    │ NT$ 110.6│ -0.5%  │ 查看 │        │
│ └──────┴──────────┴────────┴──────┘        │
│                                              │
│ 石化衍生材料（上游 proxy）                     │
│ ┌──────────────────────────────────────┐    │
│ │ ABS / PC / EPDM / NBR               │    │
│ │ WTI 原油：$99.58/barrel  ▲ +2.3%    │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ⓘ 方向性上游指標。期貨價非採購成本。           │
└─────────────────────────────────────────────┘
```

金屬用精確表格（每種一行），石化衍生材料用單一 card（共用一個原油價格，列出所有受影響材料名稱）。

```javascript
// ── 原材料行情 ──

const mpFile = path.join(DATA_DIR, 'material-prices.json');
if (fs.existsSync(mpFile)) {
  const allSnapshots = JSON.parse(fs.readFileSync(mpFile, 'utf-8')).snapshots;
  const today = new Date();

  // === 金屬（direct）===
  const directMaterials = ['copper', 'aluminum'];
  const directData = [];

  for (const mat of directMaterials) {
    const sorted = allSnapshots
      .filter((s) => s.material === mat && s.data_class === 'direct')
      .sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) continue;

    const current = sorted[0];
    const previous = sorted.length > 1 ? sorted[1] : null;
    const change = previous
      ? ((current.price_twd_per_kg - previous.price_twd_per_kg) / previous.price_twd_per_kg) * 100
      : null;
    const daysSince = Math.floor((today - new Date(current.date)) / 86_400_000);
    const staleBadge = daysSince > 14 ? '[過時]' : daysSince > 7 ? `[${daysSince}天前]` : '';

    directData.push({ current, change, staleBadge });
  }

  // === 石化（proxy）===
  const latestProxy = allSnapshots
    .filter((s) => s.data_class === 'proxy')
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  // 算 proxy 週變化
  const prevProxy = allSnapshots
    .filter((s) => s.data_class === 'proxy' && s.material === 'abs') // 任取一個算
    .sort((a, b) => b.date.localeCompare(a.date))[1];
  const proxyChange = latestProxy && prevProxy
    ? ((latestProxy.proxy_price - prevProxy.proxy_price) / prevProxy.proxy_price) * 100
    : null;

  if (directData.length > 0 || latestProxy) {
    // render 兩區表格
    // 漲價用紅色（成本上升 = 壞消息），跌價用綠色
    // ⚠ 色彩語義是 N.S.-LIN 採購視角：漲=成本壓力（紅）、跌=利好（綠）
    //   這不是中性市場報導，而是從買方角度解讀方向性訊號。
    // 石化區列出所有材料名稱 + 共用原油報價
  }
}
```

**Email 底部 disclaimer（每次都顯示）：**
```html
<div style="font-size:10px;color:#94a3b8;margin-top:6px;font-style:italic;">
  方向性上游指標。期貨價非採購成本，不含運輸、關稅、合金成分差異與加工損耗。
  黃銅≠純銅，鋁合金≠純鋁，合成橡膠≠天然橡膠。
</div>
```

#### 2.7 GitHub Actions 變更

`competitive-intel.yml` 需修改觸發條件與新增步驟：

> **v1.3 修正：** 報告生成不應綁定 `has_proposals`。材料價格每週都會更新，即使競品 proposal 為空。將觸發條件改為：proposals changed **OR** material-prices.json changed。

```yaml
      - name: Check for changes (proposals or material prices)
        id: check
        run: |
          FILE=$(ls data/competitive-intel/proposals-*.json 2>/dev/null | head -1)
          HAS_PROPOSALS=false
          if [ -n "$FILE" ] && node -e "const p=JSON.parse(require('fs').readFileSync('$FILE','utf-8')); process.exit(p.length > 0 ? 0 : 1)"; then
            HAS_PROPOSALS=true
          fi

          # v1.3.1 修正：用 git diff 偵測「本輪是否真的寫入新資料」，
          # 而非「檔案是否存在」。避免每輪都觸發。
          HAS_MATERIALS=false
          if git diff --name-only -- data/competitive-intel/material-prices.json | grep -q .; then
            HAS_MATERIALS=true
          fi

          echo "has_proposals=$HAS_PROPOSALS" >> $GITHUB_OUTPUT
          echo "has_materials=$HAS_MATERIALS" >> $GITHUB_OUTPUT
          echo "has_changes=$([ $HAS_PROPOSALS = true ] || [ $HAS_MATERIALS = true ] && echo true || echo false)" >> $GITHUB_OUTPUT

      - name: Generate reviewer artifacts
        if: steps.check.outputs.has_proposals == 'true'
        run: |
          node scripts/generate-proposal-summary.mjs
          node scripts/generate-proposal-email.mjs

      - name: Generate report page content
        if: steps.check.outputs.has_changes == 'true'
        run: node scripts/gen-report-content.mjs

      - name: Create PR with changes
        if: steps.check.outputs.has_changes == 'true'
        run: |
          # ...existing code...
          git add data/competitive-intel/ data/reports/
          # ...rest unchanged...
```

`collectMaterialPrices()` 不需要 `ANTHROPIC_API_KEY` 或 `TAVILY_API_KEY`。即使兩者的 key 缺失或失效，材料價格收集仍可獨立運作。

**關鍵變更：** email 生成仍需 proposals（`has_proposals`），但報告頁面生成只需任何資料變動（`has_changes`）。PR 也改為在任何變動時建立。

#### 2.8 成本估算增量

| 項目 | 增量成本 |
|------|---------|
| Yahoo Finance API：4 queries（銅、鋁、原油、匯率） | $0（免費公開 API） |
| Tavily | $0（不使用） |
| Claude API | $0（不使用） |
| **每次 run 增量** | **$0** |

> v1.0 估算為 ~$0.08/次。v1.2 改用 Yahoo Finance 後降為零。

### 影響範圍

| 檔案 | 變更 |
|------|------|
| `scripts/collect-competitive-intel.mjs` | 新增 `fetchYahooQuote()`, `collectMaterialPrices()` |
| `scripts/schemas/competitive-intel.mjs` | 新增 `MaterialPriceSnapshotSchema` |
| `scripts/generate-proposal-email.mjs` | 新增「原材料行情」HTML 區塊 + disclaimer |
| `data/competitive-intel/material-prices.json` | 新檔案（初始 `{ "snapshots": [] }`） |

### 風險

| 風險 | 嚴重度 | 緩解 |
|------|--------|------|
| Yahoo Finance API 改版或被封鎖 | 中 | try/catch 包裹 + console.warn。**Fallback policy：** 失敗時跳過本週材料區塊（warn-only），不寫空值，email 顯示上週資料 + `[上週資料]` badge。若連續 3 週失敗，應切換至 Plan B（Metals API 或 Tavily search） |
| CAPTCHA / non-JSON 回應 | 中 | `res.json()` 包在 try/catch（v1.2 已補），回傳 null 而不 crash |
| 期貨休市日無報價（週末/假日） | 低 | Yahoo 回傳最近交易日收盤價，`meta.regularMarketPrice` 仍有值 |
| 匯率波動大（週間 vs 週末） | 低 | 附帶 `exchange_rate` 欄位 + disclaimer |
| 黃銅 ≠ 純銅、合成橡膠 ≠ 天然橡膠 | N/A | Scope 聲明 + email disclaimer 每次提醒 |
| 原油 proxy 與特定材料的相關性鬆散 | 低 | 明確標示為 `proxy`（非精確報價），email 用不同視覺區塊 |
| Rerun 產生重複資料 | 已解決 | Upsert by `date + material` |
| Proxy 材料 4 筆共用同一個原油價 | 低 | JSON 有冗餘但語義清晰。Email/report renderer 做 dedup 只顯示一個原油 card |
| 週變化不存在 schema 中 | 已解決 | v1.3 移除 `proxy_change_pct`，全部由 render 層從歷史 snapshot 計算。避免半導出欄位 |

### 未來擴充

- 追蹤更多直接材料（不鏽鋼等）只需在 `DIRECT_MATERIALS` 陣列新增條目
- 追蹤更多 proxy 材料只需在 `PROXY_MATERIALS` 新增條目
- 若找到免費 EPDM/NBR 指數 API，可將其從 proxy 升級為 direct
- 可加入台灣金屬公會報價作為 `source_type: 'domestic_quote'` backup
- 趨勢圖表可在 competitive landscape 報告頁面加入
- **Plan B API 候選：** Metals API (metals-api.com)、MetalPriceAPI、Trading Economics

---

## Feature 3: Email Value Truncation Fix

### 動機

目前 `generate-proposal-email.mjs` 第 219-220 行：

```javascript
const oldDisplay = p.old_value ? p.old_value.slice(0, 30) : '—';
const newDisplay = p.new_value.slice(0, 30);
```

30 字元截斷太短，且不論是否真的超過都沒有省略號提示。

### 設計

#### 3.1 Truncation Helper

新增 `truncate()` 函數，只在實際超過時才加 `...`：

```javascript
function truncate(str, maxLen = 80) {
  if (!str) return '—';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
```

#### 3.2 Value 截斷

```javascript
// 第 219-220 行
const oldDisplay = truncate(p.old_value, 80);
const newDisplay = truncate(p.new_value, 80);
```

#### 3.3 URL display text

```javascript
// Source link row
h += `${srcLabel} → ${truncate(fullUrl, 60)}</a>`;
```

#### 3.4 手機防爆版

在 value 欄位的 `<td>` 加入 `word-break` 防止長字串撐破表格：

```javascript
// old/new value <td> 加上
h += `<td style="padding:8px 10px;...;word-break:break-word;overflow-wrap:break-word;">`;
```

### 影響範圍

| 檔案 | 變更 |
|------|------|
| `scripts/generate-proposal-email.mjs` | 新增 `truncate()` helper；第 219-220 行改用 helper；value `<td>` 加 `word-break` |

### 風險

無。向下相容。不影響 schema 或資料。

---

## Feature 4: Report Page + Email Link

### 動機

使用者要求：「加入 spec，並更新網頁。未來週報也請加入網頁連結。」

目前原材料行情只在週報 email 中呈現，但競品分析報告頁面（`/reports/competitive-landscape`）沒有這項資訊。且 email 沒有提供回到報告頁面的明確連結。需要：

1. 報告頁面新增「原材料行情」section（位於「實測數據」和「零售定價與評價」之間）
2. 週報 email 加入報告頁面的直連（含 anchor `#material-prices`）

### 設計

#### 4.1 報告頁面：原材料行情 section

在 `docs/COMPETITIVE_LANDSCAPE_TUBELESS_VALVES_ZH-TW.md` 的「實測數據」和「零售定價與評價」之間，新增由 prebuild script 動態生成的 section。

**方案：在 `gen-report-content.mjs` 中注入材料價格 HTML**

報告 markdown 是靜態的，但材料價格是動態的（每週更新）。不在 markdown 中寫死價格，而是：

1. 在 markdown 中放置一個佔位標記 `<!-- MATERIAL_PRICES_PLACEHOLDER -->`
2. `gen-report-content.mjs` 讀取 `material-prices.json`，生成 HTML 表格，替換佔位標記

```markdown
<!-- 在 COMPETITIVE_LANDSCAPE_TUBELESS_VALVES_ZH-TW.md 中 -->

## 實測數據
...（既有內容）...

<h2 id="material-prices">原材料行情</h2>

<!-- MATERIAL_PRICES_PLACEHOLDER -->

> 方向性上游指標。期貨價非採購成本，不含運輸、關稅、合金成分差異與加工損耗。

## 零售定價與評價
...（既有內容）...
```

> **v1.3 修正：** 使用顯式 `<h2 id="material-prices">` 取代 `## 原材料行情`。中文 heading 經 remark 自動產生的 id 不可預測（可能被 encode 或截斷），不應作為跨表面連結契約。Email 連結一律指向 `#material-prices`。

#### 4.2 gen-report-content.mjs 擴充

在 MDX compile 之前，讀取 material-prices.json，生成 HTML 字串，替換佔位標記：

```javascript
// 在 compile 之前
const materialHtml = renderMaterialPricesHtml(
  loadMaterialSnapshots(),
);
const bodyWithMaterials = body.replace(
  '<!-- MATERIAL_PRICES_PLACEHOLDER -->',
  materialHtml
);
// 用 bodyWithMaterials 取代 body 傳給 compile()

// v1.3: 拆成三層職責
// - loadMaterialSnapshots(): 讀 JSON，pure I/O
// - computeMaterialViewModel(snapshots): 算週變化、staleness，pure logic
// - renderMaterialPricesHtml(viewModel): 產生 HTML，pure template

function loadMaterialSnapshots() {
  const mpFile = path.join(process.cwd(), 'data/competitive-intel/material-prices.json');
  if (!fs.existsSync(mpFile)) return null;
  const { snapshots } = JSON.parse(fs.readFileSync(mpFile, 'utf-8'));
  return snapshots && snapshots.length > 0 ? snapshots : null;
}

function renderMaterialPricesHtml(snapshots) {
  if (!snapshots) return '<p style="color:#94a3b8;">原材料價格資料尚未收集。</p>';
  const viewModel = computeMaterialViewModel(snapshots);
  return renderFromViewModel(viewModel);
}

function computeMaterialViewModel(snapshots) {
  // 取最新日期的快照
  const latestDate = snapshots.map(s => s.date).sort().pop();
  const latest = snapshots.filter(s => s.date === latestDate);

  // 找上一週資料算週變化
  const prevDates = [...new Set(snapshots.map(s => s.date))]
    .filter(d => d < latestDate).sort();
  const prevDate = prevDates.pop();
  const prev = prevDate ? snapshots.filter(s => s.date === prevDate) : [];

  // 金屬 view items
  const directItems = latest
    .filter(s => s.data_class === 'direct')
    .map(item => {
      const prevItem = prev.find(s => s.material === item.material && s.data_class === 'direct');
      const changePct = prevItem
        ? ((item.price_twd_per_kg - prevItem.price_twd_per_kg) / prevItem.price_twd_per_kg * 100)
        : null;
      return { ...item, changePct };
    });

  // 石化 proxy view item（dedup: 只取一個原油報價）
  const proxyLatest = latest.filter(s => s.data_class === 'proxy');
  const prevOil = prev.find(s => s.data_class === 'proxy');
  const proxyViewModel = proxyLatest.length > 0 ? {
    oil: proxyLatest[0],
    materialNames: proxyLatest.map(s => s.material_zh).join(' / '),
    changePct: prevOil
      ? ((proxyLatest[0].proxy_price - prevOil.proxy_price) / prevOil.proxy_price * 100)
      : null,
  } : null;

  return { directItems, proxyViewModel, latestDate };
}

function renderFromViewModel({ directItems, proxyViewModel, latestDate }) {
  let html = '';

  // 金屬表格
  if (directItems.length > 0) {
    html += '<h3>金屬（精確報價）</h3>\n';
    html += '<table><thead><tr>';
    html += '<th>材料</th><th>台幣/公斤</th><th>美元/噸</th><th>週變化</th><th>匯率</th><th>資料日期</th>';
    html += '</tr></thead><tbody>\n';
    for (const item of directItems) {
      // 漲=紅（採購成本壓力）、跌=綠（利好）— N.S.-LIN 採購視角
      const changeStr = item.changePct !== null
        ? `<span style="color:${item.changePct > 0 ? '#ef4444' : '#22c55e'}">${item.changePct > 0 ? '+' : ''}${item.changePct.toFixed(1)}%</span>`
        : '—';
      html += `<tr><td>${item.material_zh}</td><td>NT$ ${item.price_twd_per_kg.toFixed(1)}</td>`;
      html += `<td>$${item.price_usd_per_ton.toLocaleString()}</td><td>${changeStr}</td>`;
      html += `<td>${item.exchange_rate} TWD/USD</td><td>${item.date}</td></tr>\n`;
    }
    html += '</tbody></table>\n';
  }

  // 石化 proxy 區塊
  if (proxyViewModel) {
    const { oil, materialNames, changePct } = proxyViewModel;
    const changeStr = changePct !== null
      ? `${changePct > 0 ? '▲' : '▼'} ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%`
      : '';
    html += '<h3>石化衍生材料（共享石化上游指標）</h3>\n';
    html += `<p><strong>影響材料：</strong>${materialNames}</p>\n`;
    html += '<table><thead><tr><th>上游指標</th><th>報價</th><th>週變化</th><th>資料日期</th></tr></thead><tbody>\n';
    html += `<tr><td>WTI 原油 (${oil.proxy_symbol})</td><td>$${oil.proxy_price.toFixed(2)} / barrel</td>`;
    html += `<td>${changeStr}</td><td>${oil.date}</td></tr>\n`;
    html += '</tbody></table>\n';
    html += '<p style="font-size:0.85em;color:#64748b;">ABS/PC 源自石腦油裂解，EPDM/NBR 源自丁二烯/丙烯，均與原油正相關但非線性。此為共享上游方向性指標，非個別材料精確報價。</p>\n';
  }

  return html;
}
```

#### 4.3 Report page 無需改動

`page.tsx` 已使用 `dangerouslySetInnerHTML={{ __html: html }}` 渲染 `content.generated.ts` 的內容。只要 `gen-report-content.mjs` 正確替換佔位標記並生成 HTML，頁面自動呈現新 section。

Report CSS（`report-content` class）已包含 table、h3 等元素的樣式，新增的表格會套用既有樣式。

#### 4.4 Email 加入報告頁面連結

在 `generate-proposal-email.mjs` 的「原材料行情」區塊底部加入連結：

```javascript
// 在原材料行情區塊結尾
h += `<div style="margin-top:8px;text-align:right;">`;
h += `<a href="https://nslin-site.tom-e31.workers.dev/zh-TW/reports/competitive-landscape#material-prices"`;
h += ` style="font-size:11px;color:${S.steel};text-decoration:none;">`;
h += `查看完整報告 →</a>`;
h += `</div>`;
```

同時更新 email 底部 footer CTA（已有但確保 anchor 正確）：

```javascript
// 現有 footer CTA（line ~252）加上完整報告連結
h += `<a href="https://nslin-site.tom-e31.workers.dev/zh-TW/reports/competitive-landscape"`;
h += ` style="font-size:12px;color:${S.steel};text-decoration:underline;">`;
h += `查看完整競品報告</a>`;
```

#### 4.5 Markdown 目錄更新

在報告的目錄 section 中，「實測數據」和「零售定價與評價」之間插入新項目：

```markdown
13. [實測數據](#實測數據)
14. [原材料行情](#material-prices)    ← 新增（使用顯式 id）
15. [零售定價與評價](#零售定價與評價)
```

#### 4.6 GitHub Actions 變更

已在 Feature 2 的 §2.7 中納入。v1.3 修正：報告頁面生成改由 `has_changes`（proposals OR materials）觸發，不再綁定 `has_proposals`。詳見 §2.7。

#### 4.7 Prebuild 觸發時機

| 時機 | 觸發者 | 說明 |
|------|--------|------|
| CI cron（每週一） | `competitive-intel.yml` | 收集 → 生成 email → 生成報告 HTML → PR |
| 手動 deploy | `/cf-deploy nslin-site` | 內建 `node scripts/gen-report-content.mjs` |
| 開發時 | 工程師手動執行 | `node scripts/gen-report-content.mjs` |

**注意：** CI 產生的 PR 包含 `data/reports/content.generated.ts` 的變更。合併 PR 後下次 deploy 自動生效。或者，合併後手動觸發 `/cf-deploy nslin-site` 立即上線。

### 影響範圍

| 檔案 | 變更 |
|------|------|
| `docs/COMPETITIVE_LANDSCAPE_TUBELESS_VALVES_ZH-TW.md` | 新增「原材料行情」section + 佔位標記 + 目錄更新 |
| `scripts/gen-report-content.mjs` | 新增 `generateMaterialPricesHtml()` + 佔位標記替換邏輯 |
| `scripts/generate-proposal-email.mjs` | 原材料區塊加「查看完整報告」連結 |
| `data/reports/content.generated.ts` | 自動重新生成（包含材料價格 HTML） |

### 風險

| 風險 | 嚴重度 | 緩解 |
|------|--------|------|
| 佔位標記未被替換（material-prices.json 不存在） | 低 | 顯示「原材料價格資料尚未收集。」fallback 文字 |
| 報告 CSS 不適用新表格 | 低 | `report-content` class 已有 table 樣式；部署前本地預覽確認 |
| Anchor 不穩定 | 已解決 | v1.3 改用顯式 `<h2 id="material-prices">`，不依賴 remark 自動生成的中文 id |

---

## 實作順序建議

| 順序 | Feature | 大小 | 依賴 | 備註 |
|------|---------|------|------|------|
| 1 | Email Value Truncation Fix | 小事 | 無 | 純顯示層修正 |
| 2 | URL Health Check | 中事 | 無 | evidence enrichment，bounded |
| 3 | Material Price Tracking | 中事（偏大） | 無 | 新資料收集子系統 |
| 4 | Report Page + Email Link | 中事 | Feature 2 | 需要 material-prices.json |

先做 1-3（彼此獨立，每完成一項即可 push 並驗證），最後做 4（依賴 Feature 2 的 material-prices.json）。完成 4 後需 rebuild + deploy 網站。

---

## 測試策略

### Feature 1: URL Health Check

```bash
# 驗證 checkUrlHealth + fallback
node -e "
  // 測試用例：
  // 1. https://httpstat.us/200        → alive (HEAD)
  // 2. https://httpstat.us/404        → dead (HEAD)
  // 3. https://httpstat.us/403        → try GET fallback
  // 4. https://httpstat.us/500        → dead (HEAD)
  // 5. https://nonexistent.invalid    → unreachable (DNS)
  // 6. 實際 WAF 站點（Cloudflare-protected site）→ blocked or alive via GET
"

# Live run → 檢查 proposals JSON 中 url_status 五種狀態的分布
# 檢查 email 四路分支是否正確渲染
```

### Feature 2: Material Price Tracking

```bash
# Step 1: 驗證各 symbol
node -e "
  async function test() {
    const symbols = ['HG=F', 'ALI=F', 'CL=F', 'TWDUSD=X'];
    for (const s of symbols) {
      const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(s) + '?interval=1d&range=1d');
      const d = await r.json();
      const m = d.chart.result[0].meta;
      console.log(s, m.regularMarketPrice, m.currency, m.shortName);
    }
  }
  test();
"
# 預期：
#   HG=F     ~5.xx   USD  Copper May 26
#   ALI=F    ~3400   USD  Aluminum Futures
#   CL=F     ~99     USD  Crude Oil
#   TWDUSD=X ~0.031  USD  TWD/USD

# Step 2: 換算驗證
# 銅 TWD/kg = 5.744 × 2.20462 × (1/0.0312) ≈ 405.9
# 鋁 TWD/kg = 3450 / 1000 × (1/0.0312) ≈ 110.6

# Step 3: 完整流程 → 檢查 material-prices.json（6 筆：2 direct + 4 proxy）
# Step 4: 重複執行 → 驗證 upsert（不產生重複列）
# Step 5: Email 預覽 → 確認兩區（金屬表格 + 石化 card）
open data/competitive-intel/proposal-email.html
```

### Feature 3: Email Value Truncation Fix

```bash
# 用現有 proposals JSON 重新生成 email
node scripts/generate-proposal-email.mjs
open data/competitive-intel/proposal-email.html
# 確認：短值無 "..."、長值有 "..."、手機寬度不爆版
```

---

## Deployment

### Feature 1-3（scripts + data only）

Feature 1-3 只影響 `scripts/` 和 `data/`。不改 Next.js 頁面，不需 rebuild/deploy 網站。

Commit + push 到 main 後，下次 cron trigger（週一 06:00 台灣時間）或手動 workflow_dispatch 即啟用。

### Feature 4（需要網站 rebuild + deploy）

Feature 4 修改了 `docs/` markdown 和 `scripts/gen-report-content.mjs`，需要重新 prebuild + deploy：

```bash
# 1. 確保 material-prices.json 存在（至少跑過一次 collect）
node scripts/collect-competitive-intel.mjs  # 或手動建立初始資料

# 2. 重新生成報告 HTML（包含材料價格 section）
node scripts/gen-report-content.mjs

# 3. Deploy
/cf-deploy nslin-site
```

或等 CI merge PR 後手動觸發 `/cf-deploy nslin-site`。

### 全部完成後的完整 CI 流程

```
cron trigger (每週一 06:00)
  → collect-competitive-intel.mjs         # 收集競品 + 材料價格（always runs）
  → check: has_proposals? has_materials?   # 判斷哪些下游需要觸發
  → [if proposals] generate-proposal-summary.mjs   # 生成 PR summary
  → [if proposals] generate-proposal-email.mjs     # 生成週報 email
  → [if proposals] send email via Resend           # 發送週報
  → [if any change] gen-report-content.mjs         # 重新生成報告頁面 HTML
  → [if any change] create PR                      # PR 含所有資料更新
```

> **v1.3 重點：** 報告頁面更新與 email 發送是獨立觸發的。即使本週無競品 proposal，只要材料價格更新了，報告頁面仍會重新生成並提 PR。

## 完整影響範圍

| 檔案 | Feature | 變更類型 |
|------|---------|----------|
| `scripts/collect-competitive-intel.mjs` | 1, 2 | 新增 `checkUrlHealth()`, `fetchYahooQuote()`, `collectMaterialPrices()` |
| `scripts/schemas/competitive-intel.mjs` | 1, 2 | 新增 url_status 欄位 + `MaterialPriceSnapshotSchema` |
| `scripts/generate-proposal-email.mjs` | 1, 2, 3, 4 | URL 狀態渲染 + 材料行情區塊 + truncate helper + 報告連結 |
| `scripts/generate-proposal-summary.mjs` | 1 | 依 url_status 標記連結 |
| `scripts/gen-report-content.mjs` | 4 | 新增 `generateMaterialPricesHtml()` + 佔位標記替換 |
| `data/competitive-intel/material-prices.json` | 2 | 新檔案 |
| `data/reports/content.generated.ts` | 4 | 自動重新生成 |
| `docs/COMPETITIVE_LANDSCAPE_TUBELESS_VALVES_ZH-TW.md` | 4 | 新增原材料行情 section + 佔位標記 + 目錄更新 |
| `.github/workflows/competitive-intel.yml` | 2, 4 | 新增 `gen-report-content.mjs` 步驟 + 擴大 git add 範圍 |
