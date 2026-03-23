#!/usr/bin/env node
/**
 * SEO Benchmark — Autoresearch-style quantitative scoring
 *
 * Measures denovortho.com SEO health as a single numeric score (0-100).
 * Used as the "val_bpb equivalent" for the SEO optimization loop:
 *   baseline score → Claude modifies code → re-run benchmark → compare → keep/discard
 *
 * Usage:
 *   node scripts/seo-benchmark.mjs                    # full score (with CWV via PageSpeed Insights)
 *   node scripts/seo-benchmark.mjs --skip-cwv         # fast mode, skip PSI API calls (~5s vs ~30s)
 *   node scripts/seo-benchmark.mjs --url http://...   # score custom URL
 *   node scripts/seo-benchmark.mjs --append           # append result to results.tsv
 *
 * Exit code 0 always (scoring, not gating).
 */

import { readFileSync, readdirSync, statSync, existsSync, appendFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import https from 'https';
import http from 'http';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const BASE_URL = args.find(a => a.startsWith('--url='))?.split('=')[1] || 'https://nslin-site.tom-e31.workers.dev';
const APPEND = args.includes('--append');
const PSI_API_KEY = process.env.PSI_API_KEY || '';
const RESULTS_FILE = join(ROOT, 'seo-results.tsv');

// ═══════════════════════════════════════════════════
// Scoring weights (total = 100)
// ═══════════════════════════════════════════════════
const SKIP_CWV = args.includes('--skip-cwv');
const WEIGHTS = SKIP_CWV ? {
  metadata:       15,  // All pages have title + description
  ogTags:         10,  // Open Graph tags present
  jsonLd:         15,  // Structured data (JSON-LD) on key pages
  sitemap:        10,  // Sitemap completeness
  robots:          5,  // robots.txt + AI crawlers
  llmsTxt:         5,  // LLMs discovery files
  images:         10,  // next/image + alt text coverage
  performance:    15,  // Response times (simple)
  i18n:           10,  // hreflang + locale coverage
  codeQuality:     5,  // next/font, no external fonts, no console errors
} : {
  metadata:       12,  // All pages have title + description
  ogTags:          8,  // Open Graph tags present
  jsonLd:         12,  // Structured data (JSON-LD) on key pages
  sitemap:         8,  // Sitemap completeness
  robots:          4,  // robots.txt + AI crawlers
  llmsTxt:         4,  // LLMs discovery files
  images:          8,  // next/image + alt text coverage
  performance:     5,  // Response times (simple)
  cwv:            20,  // Core Web Vitals via PageSpeed Insights (Google ranking factor)
  i18n:            8,  // hreflang + locale coverage
  psiSeo:          7,  // Google Lighthouse SEO audit score
  codeQuality:     4,  // next/font, no external fonts, no console errors
};

const checks = {};
let totalScore = 0;

// ═══════════════════════════════════════════════════
// HTTP helper
// ═══════════════════════════════════════════════════
function fetch(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const start = Date.now();
    const req = mod.get(url, { headers: { 'User-Agent': 'SEO-Benchmark/1.0' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, ms: Date.now() - start, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ═══════════════════════════════════════════════════
// Check functions — each returns 0.0 to 1.0
// ═══════════════════════════════════════════════════

// 1. Metadata coverage (static analysis)
function checkMetadata() {
  const pages = findFiles(join(ROOT, 'app'), /page\.tsx$/);
  let withMeta = 0;
  for (const p of pages) {
    const c = readFileSync(p, 'utf-8');
    if (c.includes('generateMetadata') || c.includes('export const metadata') || c.includes('export { metadata')) {
      withMeta++;
    }
  }
  const ratio = pages.length > 0 ? withMeta / pages.length : 0;
  checks.metadata = { score: ratio, detail: `${withMeta}/${pages.length} pages` };
  return ratio;
}

// 2. OG tags (live check on key pages)
async function checkOgTags() {
  const paths = ['/', '/about', '/products', '/guides', '/blog'];
  let found = 0;
  for (const p of paths) {
    try {
      const { body } = await fetch(`${BASE_URL}${p}`);
      const hasOgTitle = /og:title/.test(body);
      const hasOgDesc = /og:description/.test(body);
      const hasOgImage = /og:image/.test(body);
      if (hasOgTitle && hasOgDesc && hasOgImage) found++;
    } catch { /* skip */ }
  }
  const ratio = found / paths.length;
  checks.ogTags = { score: ratio, detail: `${found}/${paths.length} pages` };
  return ratio;
}

// 3. JSON-LD structured data (live)
async function checkJsonLd() {
  const paths = ['/', '/about', '/products', '/guides', '/blog'];
  let found = 0;
  for (const p of paths) {
    try {
      const { body } = await fetch(`${BASE_URL}${p}`);
      const ldMatches = body.match(/application\/ld\+json/g) || [];
      if (ldMatches.length > 0) found++;
    } catch { /* skip */ }
  }
  const ratio = found / paths.length;
  checks.jsonLd = { score: ratio, detail: `${found}/${paths.length} pages` };
  return ratio;
}

// 4. Sitemap completeness
async function checkSitemap() {
  try {
    const { body } = await fetch(`${BASE_URL}/sitemap.xml`);
    const urlCount = (body.match(/<url>/g) || []).length;
    // Expect at least 24 (12 routes x 2 locales) + blog pages
    const ratio = Math.min(urlCount / 30, 1.0);
    checks.sitemap = { score: ratio, detail: `${urlCount} URLs` };
    return ratio;
  } catch {
    checks.sitemap = { score: 0, detail: 'unreachable' };
    return 0;
  }
}

// 5. Robots.txt + AI crawlers
async function checkRobots() {
  try {
    const { body } = await fetch(`${BASE_URL}/robots.txt`);
    const bots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Amazonbot', 'Applebot'];
    const found = bots.filter(b => body.includes(b)).length;
    const hasSitemap = body.includes('Sitemap:');
    const ratio = (found / bots.length * 0.8) + (hasSitemap ? 0.2 : 0);
    checks.robots = { score: ratio, detail: `${found}/${bots.length} AI bots, sitemap=${hasSitemap}` };
    return ratio;
  } catch {
    checks.robots = { score: 0, detail: 'unreachable' };
    return 0;
  }
}

// 6. LLMs discovery files
async function checkLlmsTxt() {
  let score = 0;
  const detail = [];
  try {
    const r1 = await fetch(`${BASE_URL}/llms.txt`);
    if (r1.status === 200 && r1.body.length > 100) { score += 0.5; detail.push('llms.txt OK'); }
    else detail.push('llms.txt missing/empty');
  } catch { detail.push('llms.txt error'); }
  try {
    const r2 = await fetch(`${BASE_URL}/llms-full.txt`);
    if (r2.status === 200 && r2.body.length > 100) { score += 0.5; detail.push('llms-full.txt OK'); }
    else detail.push('llms-full.txt missing/empty');
  } catch { detail.push('llms-full.txt error'); }
  checks.llmsTxt = { score, detail: detail.join(', ') };
  return score;
}

// 7. Image optimization (static analysis)
function checkImages() {
  const pages = findFiles(join(ROOT, 'app'), /\.(tsx|jsx)$/)
    // Exclude OG image generators — they use Satori which requires native <img>
    .filter(p => !p.includes('opengraph-image'));
  let totalImages = 0;
  let nextImages = 0;
  let withAlt = 0;

  for (const p of pages) {
    const c = readFileSync(p, 'utf-8');
    // Count <img and <Image tags
    const imgTags = (c.match(/<img\s/g) || []).length;
    const nextImgTags = (c.match(/<Image\s/g) || []).length;
    totalImages += imgTags + nextImgTags;
    nextImages += nextImgTags;
    // Count alt attributes
    const altMatches = (c.match(/alt\s*=\s*["{]/g) || []).length;
    withAlt += altMatches;
  }

  const nextImgRatio = totalImages > 0 ? nextImages / totalImages : 1;
  const altRatio = totalImages > 0 ? Math.min(withAlt / totalImages, 1) : 1;
  const score = nextImgRatio * 0.6 + altRatio * 0.4;
  checks.images = { score, detail: `next/image: ${nextImages}/${totalImages}, alt: ${withAlt}/${totalImages}` };
  return score;
}

// 8. Performance (response times)
async function checkPerformance() {
  const paths = ['/', '/about', '/products', '/guides', '/blog'];
  const times = [];
  for (const p of paths) {
    try {
      const { ms } = await fetch(`${BASE_URL}${p}`);
      times.push(ms);
    } catch { times.push(5000); }
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  // Score: <200ms = 1.0, >3000ms = 0.0, linear between
  const score = Math.max(0, Math.min(1, (3000 - avg) / 2800));
  checks.performance = { score, detail: `avg=${Math.round(avg)}ms, max=${Math.max(...times)}ms` };
  return score;
}

// 9. i18n / hreflang
async function checkI18n() {
  const paths = ['/', '/about', '/products'];
  let correct = 0;
  for (const p of paths) {
    try {
      const { body } = await fetch(`${BASE_URL}${p}`);
      const hasZhAlt = /hreflang.*zh/.test(body) || /alternate.*zh-TW/.test(body);
      const hasEnAlt = /hreflang.*en/.test(body) || /alternate.*\/en/.test(body) || body.includes('x-default');
      if (hasZhAlt || hasEnAlt) correct++;
    } catch { /* skip */ }
  }
  const ratio = correct / paths.length;
  checks.i18n = { score: ratio, detail: `${correct}/${paths.length} pages with hreflang` };
  return ratio;
}

// 10. Code quality (static)
function checkCodeQuality() {
  let score = 0;
  const detail = [];

  // No external font links
  const layouts = findFiles(join(ROOT, 'app'), /layout\.tsx$/);
  let externalFont = false;
  for (const f of layouts) {
    const c = readFileSync(f, 'utf-8');
    if (c.includes('fonts.googleapis.com') && c.includes('<link')) externalFont = true;
  }
  if (!externalFont) { score += 0.5; detail.push('next/font OK'); }
  else detail.push('external font detected');

  // OG images < 500KB
  const imgDir = join(ROOT, 'public/images');
  if (existsSync(imgDir)) {
    const ogFiles = readdirSync(imgDir).filter(f => f.startsWith('og-'));
    const allSmall = ogFiles.every(f => statSync(join(imgDir, f)).size < 512000);
    if (allSmall) { score += 0.5; detail.push(`OG images OK (${ogFiles.length})`); }
    else detail.push('OG image too large');
  }

  checks.codeQuality = { score, detail: detail.join(', ') };
  return score;
}

// 11. Core Web Vitals via PageSpeed Insights API (free with API key)
async function checkCwv() {
  if (SKIP_CWV) return 0;
  const testUrl = encodeURIComponent(BASE_URL);
  const keyParam = PSI_API_KEY ? `&key=${PSI_API_KEY}` : '';
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${testUrl}&strategy=mobile&category=PERFORMANCE${keyParam}`;
  try {
    console.log('  ... fetching PageSpeed Insights (mobile) — may take 15-30s ...');
    const { body, status } = await fetch(psiUrl, 60000);

    let data;
    try { data = JSON.parse(body); } catch {
      const hint = !PSI_API_KEY ? ' — get free key at console.cloud.google.com → APIs → PageSpeed Insights API' : '';
      checks.cwv = { score: 0, detail: `PSI HTTP ${status}, non-JSON response${hint}` };
      return 0;
    }

    if (data.error) {
      const hint = !PSI_API_KEY ? ' — set PSI_API_KEY env var' : '';
      checks.cwv = { score: 0, detail: `PSI: ${data.error.message?.slice(0, 60)}${hint}` };
      return 0;
    }

    const lhr = data.lighthouseResult;
    if (!lhr) {
      checks.cwv = { score: 0, detail: 'PSI returned no lighthouse data' };
      return 0;
    }

    // Extract Core Web Vitals from field data (CrUX) if available, else lab data
    const audits = lhr.audits || {};
    const lcp = audits['largest-contentful-paint']?.numericValue || 0;  // ms
    const cls = audits['cumulative-layout-shift']?.numericValue || 0;
    const tbt = audits['total-blocking-time']?.numericValue || 0;      // ms (proxy for INP)

    // Score each metric: Google "good" thresholds
    // LCP: good <2500ms, poor >4000ms
    const lcpScore = lcp <= 0 ? 0.5 : Math.max(0, Math.min(1, (4000 - lcp) / 1500));
    // CLS: good <0.1, poor >0.25
    const clsScore = Math.max(0, Math.min(1, (0.25 - cls) / 0.15));
    // TBT: good <200ms, poor >600ms
    const tbtScore = tbt <= 0 ? 0.5 : Math.max(0, Math.min(1, (600 - tbt) / 400));

    const score = lcpScore * 0.4 + clsScore * 0.3 + tbtScore * 0.3;
    checks.cwv = {
      score,
      detail: `LCP=${Math.round(lcp)}ms(${(lcpScore*100).toFixed(0)}%) CLS=${cls.toFixed(3)}(${(clsScore*100).toFixed(0)}%) TBT=${Math.round(tbt)}ms(${(tbtScore*100).toFixed(0)}%)`,
    };
    return score;
  } catch (e) {
    const hint = e.message?.includes('429') || e.message?.includes('Quota')
      ? ' — set PSI_API_KEY env var (free at console.cloud.google.com)'
      : '';
    checks.cwv = { score: 0, detail: `PSI error: ${e.message}${hint}` };
    return 0;
  }
}

// 12. Google Lighthouse SEO audit score via PSI
async function checkPsiSeo() {
  if (SKIP_CWV) return 0;
  const testUrl = encodeURIComponent(BASE_URL);
  const keyParam = PSI_API_KEY ? `&key=${PSI_API_KEY}` : '';
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${testUrl}&strategy=mobile&category=SEO${keyParam}`;
  try {
    console.log('  ... fetching PSI SEO audit ...');
    const { body, status } = await fetch(psiUrl, 60000);

    let data;
    try { data = JSON.parse(body); } catch {
      checks.psiSeo = { score: 0, detail: `PSI HTTP ${status}, non-JSON response` };
      return 0;
    }

    if (data.error) {
      checks.psiSeo = { score: 0, detail: `PSI: ${data.error.message?.slice(0, 60)}` };
      return 0;
    }

    const lhr = data.lighthouseResult;
    if (!lhr) {
      checks.psiSeo = { score: 0, detail: 'PSI returned no data' };
      return 0;
    }

    const seoScore = lhr.categories?.seo?.score ?? 0;  // 0.0 - 1.0
    const failedAudits = [];
    for (const [id, audit] of Object.entries(lhr.audits || {})) {
      if (audit.score === 0 && audit.scoreDisplayMode !== 'manual' && audit.scoreDisplayMode !== 'notApplicable') {
        failedAudits.push(id);
      }
    }
    const detail = `Lighthouse SEO: ${(seoScore * 100).toFixed(0)}/100` +
      (failedAudits.length > 0 ? ` (fail: ${failedAudits.slice(0, 3).join(', ')})` : '');
    checks.psiSeo = { score: seoScore, detail };
    return seoScore;
  } catch (e) {
    const hint = e.message?.includes('429') || e.message?.includes('Quota')
      ? ' — set PSI_API_KEY env var'
      : '';
    checks.psiSeo = { score: 0, detail: `PSI error: ${e.message}${hint}` };
    return 0;
  }
}

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════
function findFiles(dir, pattern) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      results.push(...findFiles(full, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════
async function main() {
  console.log(`\n${'═'.repeat(56)}`);
  console.log(`  SEO Benchmark — ${BASE_URL}`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${'═'.repeat(56)}\n`);

  // Run all checks
  const scores = {
    metadata:     checkMetadata(),
    ogTags:       await checkOgTags(),
    jsonLd:       await checkJsonLd(),
    sitemap:      await checkSitemap(),
    robots:       await checkRobots(),
    llmsTxt:      await checkLlmsTxt(),
    images:       checkImages(),
    performance:  await checkPerformance(),
    ...(SKIP_CWV ? {} : {
      cwv:        await checkCwv(),
      psiSeo:     await checkPsiSeo(),
    }),
    i18n:         await checkI18n(),
    codeQuality:  checkCodeQuality(),
  };

  // Calculate weighted total
  totalScore = 0;
  for (const [key, ratio] of Object.entries(scores)) {
    const weighted = ratio * WEIGHTS[key];
    totalScore += weighted;
  }

  // Output
  const maxName = Math.max(...Object.keys(WEIGHTS).map(k => k.length));
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const ratio = scores[key];
    const earned = (ratio * weight).toFixed(1);
    const bar = '█'.repeat(Math.round(ratio * 10)) + '░'.repeat(10 - Math.round(ratio * 10));
    const color = ratio >= 0.8 ? '\x1b[32m' : ratio >= 0.5 ? '\x1b[33m' : '\x1b[31m';
    console.log(`  ${key.padEnd(maxName)}  ${bar}  ${color}${earned}/${weight}\x1b[0m  ${checks[key]?.detail || ''}`);
  }

  console.log(`\n${'─'.repeat(56)}`);
  const scoreColor = totalScore >= 80 ? '\x1b[32m' : totalScore >= 60 ? '\x1b[33m' : '\x1b[31m';
  console.log(`  TOTAL SCORE: ${scoreColor}${totalScore.toFixed(1)} / 100\x1b[0m`);
  console.log(`${'─'.repeat(56)}\n`);

  // Append to TSV for tracking
  if (APPEND) {
    const tsvLine = [
      new Date().toISOString(),
      totalScore.toFixed(1),
      ...Object.keys(WEIGHTS).map(k => (scores[k] * WEIGHTS[k]).toFixed(1)),
    ].join('\t');

    if (!existsSync(RESULTS_FILE)) {
      const header = ['timestamp', 'total', ...Object.keys(WEIGHTS)].join('\t');
      writeFileSync(RESULTS_FILE, header + '\n');
    }
    appendFileSync(RESULTS_FILE, tsvLine + '\n');
    console.log(`  Result appended to seo-results.tsv`);
  }

  // JSON output for programmatic use
  console.log('\n' + JSON.stringify({
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    totalScore: Math.round(totalScore * 10) / 10,
    checks,
  }));
}

main().catch(console.error);
