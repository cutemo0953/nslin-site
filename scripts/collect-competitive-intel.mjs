#!/usr/bin/env node
/**
 * Competitive Intelligence Collection Script (Phase 2)
 *
 * Fetches sources → Claude API (per-entity) → validated JSON proposals
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... TAVILY_API_KEY=tvly-... node scripts/collect-competitive-intel.mjs
 *
 * Or for dry-run (skip source fetching, use mock evidence):
 *   node scripts/collect-competitive-intel.mjs --dry-run
 */
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { ProposalsArraySchema, SUBMIT_PROPOSALS_TOOL } from './schemas/competitive-intel.mjs';

const DATA_DIR = path.join(process.cwd(), 'data/competitive-intel');
const isDryRun = process.argv.includes('--dry-run');

// ── Load current data ──

function loadJSON(filename) {
  const fp = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

const entities = loadJSON('competitor-entities.json').entities;
const currentStates = loadJSON('competitor-current-state.json').states;
const priceSnapshots = loadJSON('price-snapshots.json').snapshots;

// ── Source Adapter Layer ──

class TavilyAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.tavily.com';
  }

  async search(query, maxResults = 5) {
    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        include_raw_content: false,
        include_answer: false,
        search_depth: 'basic',
      }),
    });
    if (!res.ok) {
      console.warn(`Tavily search failed for "${query}": ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.results || []).map((r) => ({
      url: r.url,
      title: r.title,
      content: r.content?.slice(0, 500) || '',
      retrieved_at: new Date().toISOString(),
    }));
  }

  async fetchOfficialPage(url) {
    return this.search(`site:${new URL(url).hostname} tubeless valve`, 3);
  }

  async fetchRetailListing(brand, product) {
    return this.search(`${brand} ${product} tubeless valve price buy`, 3);
  }
}

// ── URL Health Check ──

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
    return { url_status: 'blocked', url_http_status: 403, url_check_method: method, url_status_reason: 'waf_block' };
  }
  if (result.status === 0) {
    return { url_status: 'unreachable', url_http_status: 0, url_check_method: method, url_status_reason: result.reason || 'unknown' };
  }
  return { url_status: 'dead', url_http_status: result.status, url_check_method: method, url_status_reason: `http_${result.status}` };
}

async function checkUrlHealth(url, timeoutMs = 5000) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; NSLinBot/1.0)',
    'Accept': 'text/html',
  };

  const headResult = await timedFetch(url, 'HEAD', headers, timeoutMs);

  if (headResult.status === 403 || headResult.status === 405 || headResult.status === 406) {
    const getResult = await timedFetch(url, 'GET', headers, timeoutMs);
    return { ...classifyResult(getResult, 'get'), url_checked_at: new Date().toISOString() };
  }

  return { ...classifyResult(headResult, 'head'), url_checked_at: new Date().toISOString() };
}

// ── Collect evidence per entity ──

async function collectEvidenceForEntity(entity, adapter) {
  const results = [];

  try {
    // Fetch from official site
    const official = await adapter.fetchOfficialPage(entity.official_url);
    for (const r of official) {
      const health = await checkUrlHealth(r.url);
      results.push({ ...r, source_type: 'official_site', ...health });
    }
  } catch (e) {
    console.warn(`  Official page fetch failed for ${entity.id}: ${e.message}`);
  }

  try {
    // Fetch retail listings
    const retail = await adapter.fetchRetailListing(entity.brand, entity.product);
    for (const r of retail) {
      const health = await checkUrlHealth(r.url);
      results.push({ ...r, source_type: 'retail', ...health });
    }
  } catch (e) {
    console.warn(`  Retail fetch failed for ${entity.id}: ${e.message}`);
  }

  return results;
}

// ── Claude API: per-entity proposal generation ──

async function generateProposalsForEntity(client, entity, currentState, latestPrice, evidence) {
  if (evidence.length === 0) {
    console.log(`  No evidence for ${entity.id}, skipping API call`);
    return [];
  }

  const systemPrompt = `You are a competitive intelligence analyst for tubeless bicycle valves.
You receive the current state of ONE competitor and newly collected evidence.
Your job:
- Compare new evidence against existing data
- Call the submit_proposals tool with your findings
- Each proposal must include: entity_id, change_type, field, old_value, new_value, evidence, confidence, change_class
- change_class: 1=mechanical (timestamps, links), 2=factual (specs, price, new product), 3=interpretive (positioning, narrative), 4=noisy (forum, unverified)
- Do NOT invent information. If evidence is ambiguous, set confidence < 0.5 and change_class = 4
- If no changes detected, call submit_proposals with an empty array
- One proposal per field per run (no duplicates)`;

  const userMessage = `## Current state for: ${entity.brand} ${entity.product}

Entity ID: ${entity.id}
Tier: ${entity.tier}
Official URL: ${entity.official_url}

### Current specs:
${JSON.stringify(currentState?.specs || {}, null, 2)}

### Latest price:
${JSON.stringify(latestPrice || 'No price data', null, 2)}

### Awards:
${JSON.stringify(currentState?.awards || [], null, 2)}

---

## Newly collected evidence (${evidence.length} sources):

${evidence.map((e, i) => `### Source ${i + 1}
- URL: ${e.url}
- Type: ${e.source_type}
- Retrieved: ${e.retrieved_at}
- Content: ${e.content}
`).join('\n')}

Compare the evidence against current state. Submit proposals for any changes found.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools: [SUBMIT_PROPOSALS_TOOL],
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract tool use result
    const toolUse = response.content.find((c) => c.type === 'tool_use' && c.name === 'submit_proposals');
    if (!toolUse) {
      console.warn(`  No tool use in response for ${entity.id}`);
      return [];
    }

    const rawProposals = toolUse.input.proposals || [];

    // Validate with Zod
    const parsed = ProposalsArraySchema.safeParse(rawProposals);
    if (!parsed.success) {
      console.error(`  Zod validation failed for ${entity.id}:`, parsed.error.issues);
      return [];
    }

    return parsed.data;
  } catch (e) {
    console.error(`  Claude API error for ${entity.id}: ${e.message}`);
    return [];
  }
}

// ── Material Price Tracking (Yahoo Finance) ──

const DIRECT_MATERIALS = [
  { id: 'copper',   zh: '銅',  symbol: 'HG=F',  unit: 'USD/lb',  toTwdPerKg: (price, fx) => price * 2.20462 * fx },
  { id: 'aluminum', zh: '鋁',  symbol: 'ALI=F', unit: 'USD/ton', toTwdPerKg: (price, fx) => (price / 1000) * fx },
];

const PROXY_MATERIALS = [
  { id: 'abs',  zh: 'ABS 塑膠',    usage: '閥帽、保護蓋' },
  { id: 'pc',   zh: 'PC 聚碳酸酯',  usage: '透明件、結構件' },
  { id: 'epdm', zh: 'EPDM 橡膠',   usage: 'O-ring、密封件' },
  { id: 'nbr',  zh: 'NBR 丁腈橡膠', usage: '耐油 O-ring' },
];
const PROXY_SYMBOL = 'CL=F';

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
    console.warn(`Yahoo Finance fetch failed for ${symbol}: ${e.message}`);
    return null;
  }
}

async function collectMaterialPrices() {
  const fxQuote = await fetchYahooQuote('TWDUSD=X');
  if (!fxQuote?.price) {
    console.warn('Failed to fetch USD/TWD exchange rate, skipping material prices');
    return [];
  }
  const usdToTwd = 1 / fxQuote.price;

  const snapshots = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const mat of DIRECT_MATERIALS) {
    const quote = await fetchYahooQuote(mat.symbol);
    if (!quote?.price) {
      console.warn(`Failed to fetch ${mat.id} price (${mat.symbol}), skipping`);
      continue;
    }

    const priceRaw = quote.price;
    const priceTwdPerKg = mat.toTwdPerKg(priceRaw, usdToTwd);
    const priceUsdPerTon = mat.unit === 'USD/lb'
      ? priceRaw * 2204.62
      : priceRaw;

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

// ── Main ──

async function main() {
  console.log('=== Competitive Intelligence Collection ===');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Entities: ${entities.length}`);
  console.log();

  // Initialize clients
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!isDryRun && (!anthropicKey || !tavilyKey)) {
    console.error('Missing required env vars: ANTHROPIC_API_KEY, TAVILY_API_KEY');
    console.error('Use --dry-run to skip source fetching');
    process.exit(1);
  }

  const adapter = isDryRun ? null : new TavilyAdapter(tavilyKey);
  const client = isDryRun ? null : new Anthropic({ apiKey: anthropicKey });

  const allProposals = [];
  let sourcesQueried = 0;
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const entity of entities) {
    // Skip reference product (CoreCap)
    if (entity.id === 'bbb-corecap') continue;

    console.log(`Processing: ${entity.brand} ${entity.product} (${entity.id})`);

    // Collect evidence
    let evidence = [];
    if (!isDryRun) {
      evidence = await collectEvidenceForEntity(entity, adapter);
      sourcesQueried += evidence.length;
      console.log(`  Collected ${evidence.length} evidence items`);
      // Rate limit: 2s between entities to avoid 429s
      await delay(2000);
    } else {
      console.log('  [dry-run] Skipping source fetch');
    }

    // Get current state and latest price for this entity
    const currentState = currentStates.find((s) => s.entity_id === entity.id);
    const latestPrice = priceSnapshots
      .filter((s) => s.entity_id === entity.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    // Generate proposals via Claude
    if (!isDryRun && evidence.length > 0) {
      const proposals = await generateProposalsForEntity(client, entity, currentState, latestPrice, evidence);
      console.log(`  Generated ${proposals.length} proposals`);
      allProposals.push(...proposals);
    }
  }

  // Deduplicate: one proposal per entity+field
  const seen = new Set();
  const deduped = allProposals.filter((p) => {
    const key = `${p.entity_id}:${p.field}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log();
  console.log(`Total proposals: ${deduped.length} (${allProposals.length - deduped.length} duplicates removed)`);

  if (deduped.length > 0) {
    // Write proposals file
    const dateStr = new Date().toISOString().slice(0, 10);
    const proposalsFile = path.join(DATA_DIR, `proposals-${dateStr}.json`);
    fs.writeFileSync(proposalsFile, JSON.stringify(deduped, null, 2), 'utf-8');
    console.log(`Written to: ${proposalsFile}`);
  } else {
    console.log('No proposals generated. No file written.');
  }

  // Collect material prices (independent of Tavily/Claude)
  let materialSnapshotsCount = 0;
  if (!isDryRun) {
    console.log('Collecting material prices...');
    const materialSnapshots = await collectMaterialPrices();
    if (materialSnapshots.length > 0) {
      const mpFile = path.join(DATA_DIR, 'material-prices.json');
      const existing = fs.existsSync(mpFile)
        ? JSON.parse(fs.readFileSync(mpFile, 'utf-8'))
        : { snapshots: [] };

      // Upsert: date + material as unique key
      for (const snap of materialSnapshots) {
        const idx = existing.snapshots.findIndex(
          (s) => s.date === snap.date && s.material === snap.material,
        );
        if (idx >= 0) {
          existing.snapshots[idx] = snap;
        } else {
          existing.snapshots.push(snap);
        }
      }

      // Retain only last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoff = sixMonthsAgo.toISOString().slice(0, 10);
      existing.snapshots = existing.snapshots.filter((s) => s.date >= cutoff);

      fs.writeFileSync(mpFile, JSON.stringify(existing, null, 2), 'utf-8');
      materialSnapshotsCount = materialSnapshots.length;
      console.log(`Material prices: ${materialSnapshotsCount} snapshots saved`);
    }
  }

  // Update last-collected timestamp
  const lastCollected = {
    date: new Date().toISOString().slice(0, 10),
    method: isDryRun ? 'dry_run' : 'automated',
    sources_queried: sourcesQueried,
    proposals_generated: deduped.length,
    material_snapshots: materialSnapshotsCount,
  };
  fs.writeFileSync(
    path.join(DATA_DIR, 'last-collected.json'),
    JSON.stringify(lastCollected, null, 2),
    'utf-8',
  );

  console.log();
  console.log('Done.');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
