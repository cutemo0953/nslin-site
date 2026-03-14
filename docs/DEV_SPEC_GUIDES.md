# DEV_SPEC: 知識中心 (Guides)

> Status: SPEC v3 — 等簽收（v2 + Gemini/ChatGPT round 2 feedback）
> Last Updated: 2026-03-14
> Strategy: 9.0 | Architecture: 8.8 | Implementation: 8.4 → target 9.0+

## 定位

知識中心是**長青 SEO 著陸頁**，目標是：
1. 攔截搜尋意圖（"tire valve standards comparison"、"tubeless valve how it works"）
2. 作為 AI/LLM citation 的權威來源（FAQ schema + Direct Answer Block）
3. 自然導流到產品頁和部落格

**不是**時效性文章（那是 Blog 的工作）。

| 面向 | Guides (知識中心) | Blog (技術文章) |
|------|------------------|----------------|
| 內容類型 | 長青百科、工具書 | 時效性文章、品牌故事 |
| 更新頻率 | 極少（季/年） | 持續新增 |
| SEO 角色 | 攔截搜尋意圖 | 建立 topical authority |
| 互連關係 | 被 blog 引用 | 引用 guide |

## 現況

| Guide | 路由 | 狀態 |
|-------|------|------|
| valve-standards | `/guides/valve-standards` | 骨架完成（Quick Summary + TODO placeholder） |
| valve-materials | `/guides/valve-materials` | ~~已宣告但 404~~ → **Phase 0 已從 sitemap/llms.txt 移除** |
| tubeless-basics | `/guides/tubeless-basics` | ~~已宣告但 404~~ → **Phase 0 已從 sitemap/llms.txt 移除** |

## 架構決策

### Option A: 延續 hardcoded TSX（現行方式）
- 每篇 guide 是一個獨立的 `page.tsx`
- 內容用 `isZh` 分支直接寫在 JSX 裡
- 優點：完全控制佈局、SEO schema、每篇可以有不同結構
- 缺點：中英文混在同一檔案、新增一篇要碰 5+ 個 JSX 區塊

### Option B: MDX prebuild pipeline（跟 Blog 一樣）
- 內容放 `content/guides/{slug}/{locale}.mdx`
- 加 registry + gen script，跟 blog 同一套 prebuild
- 優點：寫作體驗好、中英文分開、可以用 markdown
- 缺點：需要開發 pipeline、guide 數量少（3-5 篇）ROI 低

### **決定：Option B**
理由：
- Blog pipeline 已驗證可用，複製成本低
- Guide 內容偏長（2000-5000 字），hardcoded TSX 維護痛苦
- 中英文分開檔案，翻譯更新更乾淨
- 未來擴充到 5-10 篇 guide 時不需重寫

### 為什麼不用 remark-gfm / custom components

prebuild pipeline 的產出是**純 HTML string**，runtime 用 `dangerouslySetInnerHTML` 渲染。
沒有 React component mapping 的機會 — `<table>` 就是 `<table>`，不會被替換成 React 元件。
因此 markdown table 必須手寫 HTML `<table>`，圖片必須用 `<img>` — 這是 Cloudflare Workers 部署模式的根本限制，不是工具選擇問題。

## Source of Truth 規則

### Registry vs MDX Frontmatter

| 來源 | 角色 | 誰維護 |
|------|------|--------|
| MDX frontmatter | 單純存在於 MDX 檔案中，**不作為 runtime 讀取來源** | 作者 |
| `data/guides/registry.ts` | **唯一 runtime source of truth**（跟 blog 一致） | 作者 |
| `gen-guide-content.mjs` | **驗證兩邊一致性**：registry ↔ MDX frontmatter 不一致 = build fail | 自動 |

決定保留 manual registry（跟 blog pipeline 一致），但 gen script 加入 cross-validation。
理由：blog 已用此模式運作穩定，guide 數量少（3-5 篇），手動維護成本可控。

### Locale 發布規則

| 情境 | 行為 |
|------|------|
| MDX 存在 + registry `draft: false` | 上線（included in route generation, sitemap, llms.txt） |
| MDX 存在 + registry `draft: true` | compile 但**不上線**（excluded from routes, sitemap, llms.txt） |
| MDX 不存在（某語系缺頁） | 該語系 404，**不做跨語系 fallback** |
| Registry 列了 locale 但 MDX 不存在 | gen script **build fail**（強制修正） |
| en draft + zh-TW published | 各語系獨立：en 404, zh-TW 上線 |

### Draft Semantics

- Draft content **會 compile**（gen script 產出 HTML）以便 preview
- Draft **排除於**：`generateStaticParams`、sitemap、llms.txt
- Related-content **不可連到 draft** guide
- Production URL 存取 draft slug → `notFound()` (404)

## 實作規劃

### Phase 0: SEO Stabilization (DONE)

- [x] 從 `sitemap.ts` 移除 `valve-materials`、`tubeless-basics`
- [x] 從 `llms.txt/route.ts` 移除 `valve-materials`、`tubeless-basics`
- [x] 修正 `llms.txt` BASE_URL（vercel → workers.dev）
- [x] 確認 `valve-standards` 繼續可存取

### Phase 1: Core Guide System（中事）

#### 1a. Content Model + Pipeline

1. **Content 目錄**：`content/guides/{slug}/{locale}.mdx`
2. **Registry**：`data/guides/registry.ts`
   ```ts
   export interface GuideFrontmatter {
     title: string;
     seoTitle?: string;              // 覆寫 <title>，省略則用 title
     description: string;
     seoDescription?: string;        // 覆寫 meta description，省略則用 description
     lastUpdated: string;            // guide 特有：最後更新日
     tags: string[];
     author: string;
     draft: boolean;
     summary: string;                // 1-2 句摘要，用於列表頁卡片
     directAnswer: string;           // 顯式 Direct Answer Block（AI/SEO 用）
     relatedProductSlugs?: string[]; // 手動指定關聯產品 category slug
     faq: { q: string; a: string }[];
   }

   export interface GuideEntry {
     slug: string;
     locales: ('en' | 'zh-TW')[];
     frontmatter: {
       en?: GuideFrontmatter;
       'zh-TW'?: GuideFrontmatter;
     };
   }
   ```
3. **Prebuild script**：`scripts/gen-guide-content.mjs`
   - 跟 `gen-blog-content.mjs` 同架構
   - 輸出 `data/guides/content.generated.ts`
   - **Zod 驗證** frontmatter schema（特別是 `faq` 陣列）
   - **Cross-validation**：registry frontmatter ↔ MDX frontmatter，title/description/tags 不一致 = build fail
   - 驗證失敗時印出**具體欄位名稱 + slug + locale**，不只丟通用錯誤
   - Build fail = 不部署
4. **Library**：`lib/guides.ts`
   - `getAllGuides()` — 只回傳 `draft: false` 的 guide
   - `getGuide(slug, locale)` — 回傳指定 guide（含 draft，由 page.tsx 決定是否 404）
   - `getAllGuideSlugs()` — 只回傳 `draft: false` 的 slug+locale pairs

#### 1b. Dynamic Route + Rendering

5. **Dynamic route**：`app/[locale]/(site)/guides/[slug]/page.tsx`
   - **Hero**：Phase 1 一律 gradient（無 per-guide cover image），Phase 2+ 可加 `coverImage`
   - **Direct Answer Block**：從 frontmatter `directAnswer` 欄位渲染，框在醒目區塊中
   - FAQ JSON-LD 從 frontmatter `faq` 自動產生
   - FAQPage schema 驗證：確保 `faq` 陣列非空才輸出 JSON-LD
   - Related Products CTA：從 `relatedProductSlugs` 查 products data，最多 3 個，渲染卡片（名稱 + 圖）
   - Related Blog Posts：依 tag 關聯，最多 3 則，同 locale，draft excluded，無匹配則隱藏
   - `generateMetadata`：使用 `seoTitle`/`seoDescription`（若有），否則 fallback 到 `title`/`description`
   - `lastUpdated` 顯示在頁面上（「最後更新：2026-03-14」）
   - Draft guard：`if (guide.frontmatter.draft) notFound()`
6. **package.json prebuild**：加入 `gen-guide-content.mjs`
7. **sitemap.ts**：改用 `getAllGuideSlugs()` 動態產生（自動排除 draft）
8. **llms.txt**：改用 `getAllGuides()` 動態產生（自動排除 draft）

### Phase 2: Content Migration + Creation（每篇各一個中事）

| # | Slug | 主題 | 目標關鍵字 | 狀態 |
|---|------|------|-----------|------|
| 1 | valve-standards | TRA vs ETRTO vs JATMA 標準對照 | tire valve standards, valve specifications | 遷移（TSX → MDX） |
| 2 | valve-materials | 氣嘴閥材質科學：EPDM/NBR/Brass/Aluminum | tire valve rubber material, brass vs aluminum valve | 全新 |
| 3 | tubeless-basics | 無內胎系統入門 | tubeless tire system, how tubeless works | 全新 |

每篇 MDX 只包含主體內容（H2 sections）。以下區塊由 page.tsx 自動渲染，不寫在 MDX 裡：
- Direct Answer Block（從 `directAnswer` frontmatter）
- FAQ section（從 `faq` frontmatter）
- Related Products / Related Blog（從 `relatedProductSlugs` + tag matching）

#### valve-standards Migration Acceptance Criteria

- [ ] URL 不變：`/guides/valve-standards` (en) 和 `/zh-TW/guides/valve-standards`
- [ ] Metadata parity：title、description 保留或改善
- [ ] 不可少任何主要 section（Quick Summary → directAnswer、FAQ、Related Products CTA）
- [ ] FAQ JSON-LD schema output 驗證通過
- [ ] 內部連結不可壞
- [ ] 中英文內容語意對等
- [ ] 舊 hardcoded `page.tsx` 刪除後無殘留 import
- [ ] Visual regression：頁面外觀與舊版無明顯退化

### Phase 3: Guide 列表頁 + Enrichment

- `/guides` 列表頁（所有 guide 的 hub page）
- 導覽從直連改為列表頁入口
- BreadcrumbList JSON-LD
- Blog ↔ Guides 強內鏈（guide 頁底連 blog，blog 內文連 guide）
- 新 guide 上線時，回補舊 blog 中的相關連結

### Phase 4: Knowledge Hub Completion

- 新增更多 guide（依 SEO keyword research 決定）
- 自動化 guide freshness 提醒（`lastUpdated` > 6 個月 → 標記 stale）
- Optional: per-guide cover image（`coverImage`, `coverImageAlt` in frontmatter）

## Related Content Rules

| 規則 | 值 |
|------|---|
| Related blog posts 上限 | 3 則 |
| Related products 上限 | 3 個 |
| Locale 匹配 | 同語系，不 fallback |
| Manual override | `relatedProductSlugs` 優先於 tag 推導 |
| Draft exclusion | related-content 不可連到 draft guide 或 draft blog |
| 無匹配時 | 隱藏該區塊，不硬塞不相關內容 |

## 檔案清單

### Phase 1 新增/修改

| 動作 | 檔案 |
|------|------|
| 新增 | `data/guides/registry.ts` |
| 新增 | `scripts/gen-guide-content.mjs` |
| 新增 | `data/guides/content.generated.ts`（auto-generated） |
| 新增 | `lib/guides.ts` |
| 新增 | `app/[locale]/(site)/guides/[slug]/page.tsx` |
| 修改 | `package.json`（prebuild 加 gen-guide-content） |
| 修改 | `app/sitemap.ts`（改用 getAllGuideSlugs） |
| 修改 | `app/llms.txt/route.ts`（改用 getAllGuides 動態產生） |

### Phase 2 新增/刪除

| 動作 | 檔案 |
|------|------|
| 新增 | `content/guides/valve-standards/en.mdx` |
| 新增 | `content/guides/valve-standards/zh-TW.mdx` |
| 新增 | `content/guides/valve-materials/en.mdx` |
| 新增 | `content/guides/valve-materials/zh-TW.mdx` |
| 新增 | `content/guides/tubeless-basics/en.mdx` |
| 新增 | `content/guides/tubeless-basics/zh-TW.mdx` |
| 刪除 | `app/[locale]/(site)/guides/valve-standards/page.tsx`（被 dynamic route 取代） |

## 注意事項

- Guide MDX **不能用 markdown table**（`|---|`），必須用 HTML `<table>` — prebuild 產出是純 HTML string，無 React component mapping
- Guide MDX **不能用 `next/image`**，必須用 `<img>` + eslint-disable — Cloudflare Workers 無 image optimization
- Guide MDX **不能有 emoji** — 用 Heroicons inline SVG
- FAQ 的 q/a 需中英文各自撰寫（不是翻譯，是 locale-native 寫法）
- `directAnswer` 是顯式欄位，不是自動抽第一段 — 確保 AI retrieval 品質
- `lastUpdated` 用於 schema.org `dateModified` 和頁面上的「最後更新」顯示
- Zod 驗證在 prebuild 階段執行，錯誤訊息包含 slug + locale + 欄位名
- Registry 是 runtime source of truth，gen script 負責 cross-validate 與 MDX 的一致性
