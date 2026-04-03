#!/usr/bin/env node
/**
 * Sales Model Node Collection Script
 *
 * Fetches observed node values via Tavily search or direct API,
 * extracts structured data via Claude Haiku tool_use,
 * validates with 4-layer checks, and outputs a patch file.
 *
 * Usage:
 *   TAVILY_API_KEY=tvly-... ANTHROPIC_API_KEY=sk-... node scripts/update-sales-model-nodes.mjs
 *
 * Options:
 *   --dry-run        Use mock evidence, skip API calls
 *   --node 27        Only run a single node
 *   --tier A         Only run a specific tier (A/B/C)
 *   --force          Ignore schedule (run all enabled nodes regardless of volatility)
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = process.cwd();
const DASHBOARDS_DIR = path.join(ROOT, 'data/dashboards');
const PATCHES_DIR = path.join(DASHBOARDS_DIR, 'patches');

// ── CLI flags ──

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceAll = args.includes('--force');
const singleNodeId = args.includes('--node')
  ? Number(args[args.indexOf('--node') + 1])
  : null;
const tierFilter = args.includes('--tier')
  ? args[args.indexOf('--tier') + 1]?.toUpperCase()
  : null;

// ── Load data ──

function loadJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

const queryRegistry = loadJSON(path.join(DASHBOARDS_DIR, 'sales-model-queries.json'));
const currentNodes = loadJSON(path.join(DASHBOARDS_DIR, 'sales-model-nodes.json'));

// ── Schedule matching ──

const VOLATILITY_TO_TIER = { high: 'A', medium: 'B', low: 'C' };

function shouldRunToday(volatility) {
  if (forceAll) return true;
  const dayOfMonth = new Date().getDate();
  const dayOfWeek = new Date().getDay(); // 0=Sun

  switch (volatility) {
    case 'high': return true; // daily
    case 'medium': return dayOfMonth % 3 === 1; // every 3 days
    case 'low': return dayOfWeek === 0; // Sunday
    default: return false; // manual nodes never auto-run
  }
}

// ── Monthly budget guardrail ──

function getMonthlyBurn() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let total = 0;

  if (!fs.existsSync(PATCHES_DIR)) return 0;

  for (const f of fs.readdirSync(PATCHES_DIR)) {
    if (!f.startsWith('run-summary-') || !f.endsWith('.json')) continue;
    if (!f.includes(yearMonth)) continue;
    try {
      const summary = loadJSON(path.join(PATCHES_DIR, f));
      total += summary.queriesUsed || 0;
    } catch { /* skip corrupt files */ }
  }
  return total;
}

function getAllowedTiers(monthlyBurn) {
  const threshold = queryRegistry.globalQueryCap * 25; // 75% of 1000 = 750
  if (monthlyBurn > threshold * 1.2) return ['A']; // critical: Tier A only
  if (monthlyBurn > threshold) return ['A', 'B']; // warning: stop Tier C
  return ['A', 'B', 'C']; // normal: all tiers
}

// ── Tavily Collector ──

class TavilyCollector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.tavily.com';
  }

  async search(query, options = {}) {
    const includeRaw = options.evidenceMode === 'fetch_page';
    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query: query.q,
        max_results: 5,
        include_raw_content: includeRaw,
        include_answer: false,
        search_depth: 'basic',
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `tavily_${res.status}`, results: [] };
    }

    const data = await res.json();
    let results = (data.results || []).map((r) => ({
      url: r.url,
      title: r.title,
      content: (includeRaw ? r.raw_content : r.content)?.slice(0, 800) || '',
      retrieved_at: new Date().toISOString(),
    }));

    // Filter by allowedDomains
    if (query.allowedDomains?.length) {
      results = results.filter((r) =>
        query.allowedDomains.some((d) => r.url.includes(d)),
      );
    }

    // Filter by requiredKeywords
    if (query.requiredKeywords?.length) {
      results = results.filter((r) => {
        const text = `${r.title} ${r.content}`.toLowerCase();
        return query.requiredKeywords.some((kw) => text.includes(kw.toLowerCase()));
      });
    }

    // Filter out disallowedKeywords
    if (query.disallowedKeywords?.length) {
      results = results.filter((r) => {
        const text = `${r.title} ${r.content}`.toLowerCase();
        return !query.disallowedKeywords.some((kw) => text.includes(kw.toLowerCase()));
      });
    }

    return { ok: true, results };
  }
}

// ── API Collector ──

class ApiCollector {
  async fetch(query) {
    // For API nodes, try direct endpoint first, fall back to Tavily-style search
    if (query.endpoint) {
      try {
        const url = query.endpoint.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] || '');
        const res = await fetch(url, {
          headers: { 'User-Agent': 'NSLinBot/1.0' },
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            ok: true,
            results: [{
              url: query.endpoint.split('?')[0],
              title: 'API Response',
              content: JSON.stringify(data).slice(0, 800),
              retrieved_at: new Date().toISOString(),
            }],
          };
        }
      } catch (e) {
        console.warn(`  API endpoint failed: ${e.message}, trying fallback`);
      }
    }
    // Fallback: use Tavily search with fallbackQuery
    return null; // caller should fallback to TavilyCollector
  }
}

// ── Claude Haiku Extraction ──

const SUBMIT_NODE_VALUE_TOOL = {
  name: 'submit_node_value',
  description: 'Submit the extracted value for a sales model node',
  input_schema: {
    type: 'object',
    properties: {
      nodeId: { type: 'integer', description: 'The node ID' },
      product: { type: 'string', enum: ['corecap', 'clik', 'all'], description: 'Which product this value is for' },
      market: { type: 'string', description: 'Market/region code (DE, UK, US, global)' },
      value: { type: ['number', 'null'], description: 'Extracted numeric value, or null if not found' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      sourceUrl: { type: 'string', description: 'URL of the best matching source' },
      sourceTitle: { type: 'string', description: 'Title of the source page' },
      evidenceText: { type: 'string', description: 'Relevant text snippet (max 500 chars)' },
      extractionRationale: { type: 'string', description: 'Brief explanation of why this value was extracted' },
      unchanged: { type: 'boolean', description: 'True if the data has not changed from what evidence suggests' },
    },
    required: ['nodeId', 'product', 'value', 'confidence', 'sourceUrl', 'evidenceText', 'extractionRationale', 'unchanged'],
  },
};

async function extractValue(client, nodeConfig, queryDef, evidence) {
  if (!evidence.length) {
    return { ok: false, error: 'no_relevant_result' };
  }

  const evidenceBlock = evidence
    .map((e, i) => `Source ${i + 1}:\n- URL: ${e.url}\n- Title: ${e.title}\n- Content: ${e.content}`)
    .join('\n\n');

  const systemPrompt = `You are a precise data extraction tool for competitive intelligence.
Rules:
- Extract ONLY what the evidence directly supports
- If you cannot find a specific number, return null for value and set unchanged to true
- Do NOT guess, calculate, or infer values not directly stated
- Always explain in extractionRationale which exact text the number came from
- Set confidence to "medium" for auto-extracted values (never "high" for automated extraction)`;

  const userMessage = `## Task
${nodeConfig.extractPrompt}

## Context
Node ID: ${nodeConfig.nodeId}
Product: ${queryDef.product}
Market: ${queryDef.market}

## Evidence (${evidence.length} sources)

${evidenceBlock}

Extract the requested value and call the submit_node_value tool.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [SUBMIT_NODE_VALUE_TOOL],
      messages: [{ role: 'user', content: userMessage }],
    });

    const toolUse = response.content.find(
      (c) => c.type === 'tool_use' && c.name === 'submit_node_value',
    );
    if (!toolUse) {
      return { ok: false, error: 'extraction_failed' };
    }

    return { ok: true, data: toolUse.input };
  } catch (e) {
    console.error(`  Claude extraction error: ${e.message}`);
    return { ok: false, error: 'extraction_failed' };
  }
}

// ── Mock Evidence (dry-run) ──

function mockEvidence(nodeId) {
  return [
    {
      url: 'https://example.com/mock',
      title: `Mock evidence for node ${nodeId}`,
      content: `This is mock evidence for testing. Node ${nodeId} value: 42. Product is available.`,
      retrieved_at: new Date().toISOString(),
    },
  ];
}

function mockExtraction(nodeConfig, queryDef) {
  return {
    ok: true,
    data: {
      nodeId: nodeConfig.nodeId,
      product: queryDef.product,
      market: queryDef.market,
      value: 42,
      confidence: 'medium',
      sourceUrl: 'https://example.com/mock',
      sourceTitle: 'Mock source',
      evidenceText: 'Mock evidence text',
      extractionRationale: 'Dry run mock value',
      unchanged: false,
    },
  };
}

// ── Validation (imported inline for .mjs compatibility) ──

function validateEntry(entry, nodeConfig, previousValue) {
  const results = { range: 'pass', evidence: 'pass', delta: 'pass', crossNode: 'pass' };
  const v = nodeConfig.validator;

  if (entry.value == null) return results; // null values pass (apply script handles)

  // 1. Range
  if (v.min !== undefined && entry.value < v.min) results.range = 'fail';
  if (v.max !== undefined && entry.value > v.max) results.range = 'fail';
  if (v.type === 'integer' && !Number.isInteger(entry.value)) results.range = 'fail';

  // 2. Evidence
  if (nodeConfig.queries?.length) {
    const firstQuery = nodeConfig.queries[0];
    if (firstQuery.allowedDomains?.length) {
      const domainMatch = firstQuery.allowedDomains.some((d) => entry.sourceUrl?.includes(d));
      if (!domainMatch && entry.sourceUrl !== 'https://example.com/mock') results.evidence = 'fail';
    }
  }
  if (nodeConfig.minEvidenceCount && !entry.evidenceText) results.evidence = 'fail';

  // 3. Delta (hybrid)
  if (previousValue != null && previousValue !== 0) {
    const absDelta = Math.abs(entry.value - previousValue);
    if (previousValue >= 10) {
      // Use percentage threshold for medium/high baselines
      const deltaPct = (absDelta / Math.abs(previousValue)) * 100;
      if (v.maxDeltaPct !== undefined && deltaPct > v.maxDeltaPct) results.delta = 'fail';
    } else {
      // Use absolute threshold for low baselines
      if (v.maxDeltaAbs !== undefined && absDelta > v.maxDeltaAbs) results.delta = 'fail';
    }
  } else if (previousValue === 0 && entry.value !== 0) {
    // 0 → nonzero transition
    if (v.zeroToNonzeroAllowed === false) results.delta = 'fail';
  }

  // 4. Cross-node (checked at patch level, not per-entry)
  // Will be filled in by the main loop after all nodes collected

  return results;
}

// ── Main ──

async function main() {
  const startTime = Date.now();
  console.log('=== Sales Model Node Collection ===');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  if (singleNodeId) console.log(`Single node: ${singleNodeId}`);
  if (tierFilter) console.log(`Tier filter: ${tierFilter}`);
  if (forceAll) console.log('Force: ignoring schedule');
  console.log();

  // Check env vars
  const tavilyKey = process.env.TAVILY_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!isDryRun && (!tavilyKey || !anthropicKey)) {
    console.error('Missing env vars: TAVILY_API_KEY, ANTHROPIC_API_KEY');
    console.error('Use --dry-run to test without API calls');
    process.exit(1);
  }

  const tavily = isDryRun ? null : new TavilyCollector(tavilyKey);
  const apiCollector = isDryRun ? null : new ApiCollector();
  const claude = isDryRun ? null : new Anthropic({ apiKey: anthropicKey });

  // Budget check
  const monthlyBurn = getMonthlyBurn();
  const allowedTiers = getAllowedTiers(monthlyBurn);
  console.log(`Monthly burn: ${monthlyBurn} queries | Allowed tiers: ${allowedTiers.join(', ')}`);

  // Filter eligible nodes
  let eligibleNodes = queryRegistry.nodes.filter((n) => {
    if (!n.enabled) return false;
    if (n.locked) return false;
    if (singleNodeId && n.nodeId !== singleNodeId) return false;
    if (tierFilter && VOLATILITY_TO_TIER[n.volatility] !== tierFilter) return false;
    if (!singleNodeId && !forceAll && !shouldRunToday(n.volatility)) return false;
    if (!allowedTiers.includes(VOLATILITY_TO_TIER[n.volatility])) return false;
    return true;
  });

  // Sort by tier priority: A > B > C
  const tierOrder = { A: 0, B: 1, C: 2 };
  eligibleNodes.sort((a, b) =>
    (tierOrder[VOLATILITY_TO_TIER[a.volatility]] || 9) - (tierOrder[VOLATILITY_TO_TIER[b.volatility]] || 9)
  );

  // Apply global query cap
  let queryCount = 0;
  const globalCap = queryRegistry.globalQueryCap || 30;

  console.log(`Eligible nodes: ${eligibleNodes.length} | Global cap: ${globalCap} queries/run`);
  console.log();

  // Collect
  const patchNodes = {};
  const failures = [];
  let collectedCount = 0;
  let unchangedCount = 0;
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const nodeConfig of eligibleNodes) {
    const { nodeId } = nodeConfig;
    const currentNode = currentNodes.nodes[String(nodeId)];
    const previousRaw = currentNode?.raw ?? null;

    console.log(`[Node #${nodeId}] ${nodeConfig.volatility} / ${nodeConfig.collector}`);

    for (const queryDef of nodeConfig.queries) {
      // Check query cap
      if (queryCount >= globalCap) {
        console.log(`  RATE LIMITED: global cap ${globalCap} reached`);
        failures.push({ nodeId, code: 'rate_limited', query: queryDef.q });
        continue;
      }

      console.log(`  Query: ${queryDef.product}/${queryDef.market} → ${queryDef.q.slice(0, 60)}...`);

      // Collect evidence
      let evidence;
      if (isDryRun) {
        evidence = mockEvidence(nodeId);
      } else {
        let result = null;

        // Try API collector first for api-type nodes
        if (nodeConfig.collector === 'api') {
          result = await apiCollector.fetch(queryDef);
        }

        // Fallback to Tavily (or primary for tavily-type)
        if (!result) {
          result = await tavily.search(queryDef, { evidenceMode: queryDef.evidenceMode });
          queryCount++;
          await delay(1100); // Rate limit: 1 req/sec
        }

        if (!result.ok) {
          failures.push({ nodeId, code: 'search_failed', query: queryDef.q, error: result.error });
          console.log(`  FAILED: ${result.error}`);
          continue;
        }
        evidence = result.results;
      }

      if (!evidence.length) {
        failures.push({ nodeId, code: 'no_relevant_result', query: queryDef.q });
        console.log('  No relevant results after filtering');
        continue;
      }

      console.log(`  Evidence: ${evidence.length} results`);

      // Extract value
      let extraction;
      if (isDryRun) {
        extraction = mockExtraction(nodeConfig, queryDef);
      } else {
        extraction = await extractValue(claude, nodeConfig, queryDef, evidence);
      }

      if (!extraction.ok) {
        failures.push({ nodeId, code: extraction.error, query: queryDef.q });
        console.log(`  Extraction failed: ${extraction.error}`);
        continue;
      }

      const entry = extraction.data;

      // Validate
      const validatorResults = validateEntry(entry, nodeConfig, previousRaw);
      const allPass = Object.values(validatorResults).every((v) => v === 'pass');
      const requiresReview = !allPass;

      // Check source precedence
      let overwriteBlocked = false;
      if (currentNode?.entryMethod) {
        const config = loadJSON(path.join(DASHBOARDS_DIR, 'sales-model-config.json'));
        const precedence = config.sourcePrecedence || {};
        const currentRank = precedence[currentNode.entryMethod] || 99;
        const newRank = precedence[nodeConfig.collector === 'tavily' ? 'auto_tavily' : 'auto_api'] || 99;
        if (newRank > currentRank) {
          // Lower rank source trying to overwrite higher rank
          const delta = entry.value != null && previousRaw != null
            ? Math.abs(entry.value - previousRaw) / Math.max(1, Math.abs(previousRaw)) * 100
            : 0;
          if (delta <= 20) {
            overwriteBlocked = true;
            failures.push({ nodeId, code: 'overwrite_blocked', query: queryDef.q });
            console.log(`  Overwrite blocked: ${currentNode.entryMethod}(${currentRank}) > auto(${newRank})`);
          }
        }
      }

      // Calculate delta
      const deltaPct = (entry.value != null && previousRaw != null && previousRaw !== 0)
        ? Math.round(((entry.value - previousRaw) / Math.abs(previousRaw)) * 10000) / 100
        : null;

      // Build patch entry
      const patchEntry = {
        nodeType: 'observed',
        rawValue: entry.value,
        product: entry.product,
        market: entry.market || queryDef.market,
        sourceUrl: entry.sourceUrl,
        sourceTitle: entry.sourceTitle || '',
        evidenceText: (entry.evidenceText || '').slice(0, 500),
        extractionRationale: entry.extractionRationale || '',
        collector: nodeConfig.collector,
        model: 'claude-haiku-4-5-20251001',
        confidence: entry.confidence || 'medium',
        previousValue: previousRaw,
        deltaPct,
        validatorResults,
        requiresReview: requiresReview || overwriteBlocked,
        proposedChangeReason: entry.unchanged
          ? 'no change detected'
          : `auto-collected via ${nodeConfig.collector}`,
      };

      // Merge into patch (multiple queries per node → keep best confidence)
      const key = String(nodeId);
      if (!patchNodes[key] || patchEntry.confidence === 'high' ||
          (patchEntry.confidence === 'medium' && patchNodes[key].confidence === 'low')) {
        patchNodes[key] = patchEntry;
      }

      if (entry.unchanged) {
        unchangedCount++;
      } else {
        collectedCount++;
      }

      console.log(`  Value: ${entry.value} | Confidence: ${entry.confidence} | Delta: ${deltaPct ?? 'N/A'}% | Review: ${requiresReview}`);
    }
  }

  // Cross-node validation for dependent nodes
  for (const nodeConfig of eligibleNodes) {
    const v = nodeConfig.validator;
    if (v.dependsOn?.length) {
      for (const depId of v.dependsOn) {
        const depEntry = patchNodes[String(depId)];
        if (!depEntry || depEntry.validatorResults?.range === 'fail') {
          const key = String(nodeConfig.nodeId);
          if (patchNodes[key]) {
            patchNodes[key].validatorResults.crossNode = 'fail';
            patchNodes[key].requiresReview = true;
            console.log(`[Cross-node] #${nodeConfig.nodeId} failed: depends on #${depId} which failed/missing`);
          }
        }
      }
    }
  }

  // Build patch file
  const dateStr = new Date().toISOString().slice(0, 10);
  const registryHash = createHash('sha256')
    .update(JSON.stringify(queryRegistry))
    .digest('hex')
    .slice(0, 12);

  // Count per-node (not per-query)
  const nodesCollected = new Set(Object.keys(patchNodes).filter((k) => patchNodes[k].proposedChangeReason !== 'no change detected'));
  const nodesUnchanged = new Set(Object.keys(patchNodes).filter((k) => patchNodes[k].proposedChangeReason === 'no change detected'));
  const nodesFailed = new Set(failures.map((f) => f.nodeId));
  const nodesSkipped = eligibleNodes.length - nodesCollected.size - nodesUnchanged.size -
    [...nodesFailed].filter((id) => !nodesCollected.has(String(id)) && !nodesUnchanged.has(String(id))).length;

  const patch = {
    date: dateStr,
    methodVersion: queryRegistry.version,
    extractorVersion: queryRegistry.extractorVersion,
    queryRegistryHash: `sha256:${registryHash}`,
    stats: {
      eligible: eligibleNodes.length,
      collected: nodesCollected.size,
      unchanged: nodesUnchanged.size,
      failed: [...nodesFailed].filter((id) => !nodesCollected.has(String(id))).length,
      skipped: Math.max(0, nodesSkipped),
    },
    failures,
    nodes: patchNodes,
    derived: {},
  };

  // Write patch
  if (!fs.existsSync(PATCHES_DIR)) fs.mkdirSync(PATCHES_DIR, { recursive: true });

  const patchFile = path.join(PATCHES_DIR, `sales-model-patch-${dateStr}.json`);
  fs.writeFileSync(patchFile, JSON.stringify(patch, null, 2), 'utf-8');
  console.log();
  console.log(`Patch written: ${patchFile}`);

  // Write run summary (always, even without PR)
  const runSummary = {
    date: dateStr,
    tier: tierFilter || (forceAll ? 'all' : 'scheduled'),
    queriesUsed: queryCount,
    monthlyBurn: monthlyBurn + queryCount,
    monthlyBudget: 1000,
    nodes: patch.stats,
    prCreated: false, // will be updated by GitHub Actions
    reason: collectedCount === 0 && failures.length === 0 ? 'all_unchanged' : 'data_collected',
    failedNodes: [...new Set(failures.map((f) => f.nodeId))],
    duration_ms: Date.now() - startTime,
  };

  const summaryFile = path.join(PATCHES_DIR, `run-summary-${dateStr}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(runSummary, null, 2), 'utf-8');
  console.log(`Run summary: ${summaryFile}`);

  // Print summary
  console.log();
  console.log('=== Summary ===');
  console.log(`Collected: ${collectedCount} | Unchanged: ${unchangedCount} | Failed: ${failures.length}`);
  console.log(`Queries used: ${queryCount} | Monthly burn: ${monthlyBurn + queryCount}/1000`);
  console.log(`Duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
