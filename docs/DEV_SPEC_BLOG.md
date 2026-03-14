# Blog System — Dev Spec

## Architecture

Blog 系統部署在 Cloudflare Workers（via `@opennextjs/cloudflare`），不使用 Vercel。

### 核心限制：Cloudflare Workers 無 `fs` / MDX Runtime

**問題 1 — `fs` 不可用**：Cloudflare Workers 的 runtime 沒有 Node.js `fs` 模組。雖然 Next.js SSG 頁面在 build time 可以用 `fs` 讀檔，但 OpenNext for Cloudflare（無 R2 cache 設定下）會在 runtime 重新渲染頁面，此時 `fs.readFileSync()` / `fs.existsSync()` 會 silently fail（回傳 `false` 或空陣列），導致頁面顯示為空。

**問題 2 — MDX compile+run 不可用**：`@mdx-js/mdx` 的 `compile()` + `run()` 在 Workers runtime 也會失敗（Internal Server Error 500），因為這些函數依賴 Node.js 環境功能。

**症狀**：
- Blog list page 顯示「尚無文章」（`fs` 失敗 → 空陣列）
- Blog article page 回傳 500 Internal Server Error（MDX compile 失敗）
- `.next/server/app/` 的 HTML 有正確內容（build time 正常）
- 部署後 RSC payload 中 `posts:[]` 為空（runtime 重新渲染失敗）

**產品頁不受影響**的原因：產品資料來自 TypeScript 檔案（`data/products/*.ts`），會被 bundled 進 Worker；Blog 原本用 `fs` 讀 MDX 檔案 + runtime MDX 編譯。

### 解決方案：Pre-build Content Generation + HTML Pre-rendering

消除所有 `fs` 和 MDX runtime 依賴。prebuild script 在 Node.js 環境中：
1. 用 `fs` 讀取 MDX 檔案
2. 用 `@mdx-js/mdx` 編譯 MDX
3. 用 `react-dom/server` 的 `renderToStaticMarkup()` 渲染為 HTML 字串
4. 輸出為 TypeScript 模組供 import

```
content/blog/{slug}/{locale}.mdx    ← MDX 原始檔案（source of truth）
    ↓ scripts/gen-blog-content.mjs  ← prebuild script（fs + MDX compile + SSR to HTML）
data/blog/content.generated.ts      ← 自動生成的 HTML 字串模組
data/blog/registry.ts               ← 手動維護的 metadata registry
lib/blog.ts                         ← 查詢函數（import registry + generated HTML，無 fs/MDX）
```

**文章頁面**使用 `dangerouslySetInnerHTML` 渲染預編譯的 HTML。

**流程**：
1. `node scripts/gen-blog-content.mjs` — 讀 MDX → 編譯 → SSR → 生成 `content.generated.ts`
2. `next build` — TypeScript import，無 `fs` / MDX 調用
3. `opennextjs-cloudflare build` — bundle 進 Worker
4. `opennextjs-cloudflare deploy` — 部署到 Cloudflare

`package.json` 的 `prebuild` script 會在 `npm run build` 前自動執行。

### 除錯筆記（2026-03-13）

**Round 1：`fs` 問題**
- 初始實作直接從 denovortho-site（Vercel 部署）移植 `lib/blog.ts`，使用 `fs.readFileSync()` 讀 MDX
- Build 時顯示 SSG (`●`)，看起來正常
- 部署後 blog list 頁空白（「尚無文章」），curl 確認 RSC payload `posts:[]`
- 本地 `.next/server/app/zh-TW/blog.html` 有完整 CoreCap 資料
- 本地 `.open-next/cache/*/zh-TW/blog.cache` 也有資料
- 但 Workers runtime 重新渲染時 `fs.existsSync()` 回傳 `false` → 空陣列
- 修正：metadata 改用 TypeScript registry（`data/blog/registry.ts`），content 用 prebuild script 生成

**Round 2：MDX runtime 問題**
- 修正 `fs` 後，blog list 正常顯示文章卡片
- 但文章頁回傳 500 Internal Server Error
- 原因：`getPost()` 中的 `compile()` + `run()` 在 Workers runtime 無法執行
- 修正：prebuild script 增加 `renderToStaticMarkup()` 預渲染 MDX → HTML
- `lib/blog.ts` 的 `getPost()` 回傳 `htmlContent: string`（預編譯 HTML）
- 文章頁用 `dangerouslySetInnerHTML` 渲染
- MDX 原始檔案仍保留在 `content/blog/` 作為 source of truth

**關鍵教訓**：在 Cloudflare Workers 上，任何依賴 Node.js 專有功能（`fs`、MDX compiler 等）的程式碼都不能在 runtime 執行。所有內容必須在 build time（prebuild script）預處理為純字串/TypeScript 可 import 的格式。

## 新增 Blog 文章

### 步驟

1. 建立 MDX 檔案：`content/blog/{slug}/en.mdx` 和 `zh-TW.mdx`

   ```yaml
   ---
   title: "文章標題"
   description: "一句話描述"
   date: "2026-03-13"
   tags:
     - tag-name
   author: "N.S.-LIN Technical Team"  # 或 "奕道實業技術團隊"
   coverImage: "/images/blog/{slug}/cover.jpg"
   ---
   ```

2. 在 `data/blog/registry.ts` 新增 entry：

   ```typescript
   {
     slug: 'your-slug',
     locales: ['en', 'zh-TW'],
     frontmatter: {
       en: { title: '...', description: '...', date: '...', tags: [...], ... },
       'zh-TW': { title: '...', description: '...', date: '...', tags: [...], ... },
     },
   },
   ```

3. 執行 `node scripts/gen-blog-content.mjs` 重新生成 content

4. Build + deploy：
   ```bash
   npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy
   ```

### Tag 規則

- 小寫英數字 + 連字號：`/^[a-z0-9]+(-[a-z0-9]+)*$/`
- 範例：`tubeless-valve`, `bicycle`, `oem`, `product-innovation`

### 圖片

- 放在 `public/images/blog/{slug}/`
- 使用 `<img>` 標籤（NOT `next/image`，Cloudflare Workers 不支援 image optimization API）
- 必須加 `{/* eslint-disable-next-line @next/next/no-img-element */}` 在 `<img>` 前

### MDX 注意事項

- 不支援 Markdown table（`@mdx-js/mdx` compile+run 模式不渲染 markdown tables）
- 改用 HTML `<table>` + Tailwind className
- MDX 中的 `className` 會被 `renderToStaticMarkup` 轉為 `class`（正常行為）
- 範例見 `content/blog/corecap-bbb-valve-innovation/en.mdx`

## File Structure

```
lib/blog.ts                          — 查詢 API（getAllPosts, getPost, getAllTags, etc.）
data/blog/registry.ts                — Blog metadata registry（手動維護）
data/blog/content.generated.ts       — 預編譯 HTML 字串（自動生成，勿手動編輯）
scripts/gen-blog-content.mjs         — prebuild script（MDX → HTML）
content/blog/{slug}/{locale}.mdx     — MDX 原始檔案（source of truth）
public/images/blog/{slug}/           — Blog 文章圖片
app/[locale]/(site)/blog/page.tsx    — Blog 列表頁（SSG，server component）
app/[locale]/(site)/blog/[slug]/page.tsx — Blog 文章頁（SSG，dangerouslySetInnerHTML）
components/BlogPostGrid.tsx          — Client component（tag 篩選 + 文章卡片 grid）
```

## Cloudflare Workers 部署 Gotchas

| 問題 | 原因 | 解法 |
|------|------|------|
| Blog list 空白 | `fs` 不可用 | metadata 用 TypeScript registry，prebuild 生成 content |
| Blog article 500 | `@mdx-js/mdx` compile+run 不可用 | prebuild 預編譯 MDX → HTML，`dangerouslySetInnerHTML` 渲染 |
| `next/image` 不顯示 | Workers 無 image optimization API | 使用原生 `<img>` |
| 503 大量錯誤 | Workers 免費方案 CPU 限制 + Link prefetch | `prefetch={false}` on all Link components |
| 空白頁面 | `@vercel/analytics` 等 Vercel 套件 | 移除所有 Vercel 專有套件 |
| markdown table 不渲染 | `@mdx-js/mdx` compile+run 模式限制 | 使用 HTML `<table>` |

## 與 denovortho-site Blog 的差異

| | denovortho-site | nslin-site |
|---|---|---|
| Hosting | Vercel | Cloudflare Workers |
| MDX 編譯 | Runtime（`getPost()` 內） | Build time（prebuild script） |
| Blog metadata | `fs` 讀 frontmatter | TypeScript registry |
| 內容格式 | React element | HTML string |
| 渲染方式 | `{content}` JSX | `dangerouslySetInnerHTML` |
| `fs` 依賴 | 有 | 無 |
