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

// ── Collect evidence per entity ──

async function collectEvidenceForEntity(entity, adapter) {
  const results = [];

  try {
    // Fetch from official site
    const official = await adapter.fetchOfficialPage(entity.official_url);
    for (const r of official) {
      results.push({ ...r, source_type: 'official_site' });
    }
  } catch (e) {
    console.warn(`  Official page fetch failed for ${entity.id}: ${e.message}`);
  }

  try {
    // Fetch retail listings
    const retail = await adapter.fetchRetailListing(entity.brand, entity.product);
    for (const r of retail) {
      results.push({ ...r, source_type: 'retail' });
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

  // Update last-collected timestamp
  const lastCollected = {
    date: new Date().toISOString().slice(0, 10),
    method: isDryRun ? 'dry_run' : 'automated',
    sources_queried: sourcesQueried,
    proposals_generated: deduped.length,
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
