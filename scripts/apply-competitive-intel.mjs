#!/usr/bin/env node
/**
 * Apply accepted competitive intelligence proposals to canonical data.
 *
 * Usage:
 *   node scripts/apply-competitive-intel.mjs data/competitive-intel/proposals-2026-03-14.json
 *
 * Reads proposals, applies accepted Class 1/2 changes to current-state,
 * Class 3 to interpretive_notes_draft, Class 4 to market-signals.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/competitive-intel');

const proposalsFile = process.argv[2];
if (!proposalsFile) {
  console.error('Usage: node scripts/apply-competitive-intel.mjs <proposals-file.json>');
  process.exit(1);
}

function loadJSON(filename) {
  const fp = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function saveJSON(filename, data) {
  const fp = path.join(DATA_DIR, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  Updated: ${fp}`);
}

// ── Load data ──

const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf-8'));
const currentStateData = loadJSON('competitor-current-state.json');
const evidenceLog = loadJSON('evidence-log.json');
const marketSignals = loadJSON('market-signals.json');
const priceSnapshots = loadJSON('price-snapshots.json');

// ── Counters ──

let applied = 0;
let skippedInterpretive = 0;
let appendedSignals = 0;

// ── Process proposals ──

console.log(`Processing ${proposals.length} proposals from ${proposalsFile}`);
console.log();

for (const proposal of proposals) {
  const { entity_id, change_type, field, old_value, new_value, evidence, confidence, change_class } = proposal;

  // Create evidence log entry
  const evidenceEntry = {
    id: `ev-${new Date().toISOString().slice(0, 10)}-${String(evidenceLog.evidence.length + 1).padStart(3, '0')}`,
    entity_id,
    change_type,
    old_value,
    new_value,
    field,
    source: {
      type: evidence.source_type,
      url: evidence.source_url,
      retrieved_at: evidence.retrieved_at,
      snippet: evidence.snippet,
    },
    confidence,
    change_class,
    requires_review: change_class >= 2,
    status: 'accepted', // This script only runs on reviewed proposals
  };

  evidenceLog.evidence.push(evidenceEntry);

  // Apply based on change class
  if (change_class <= 2) {
    // Class 1 (mechanical) / Class 2 (factual) → update canonical state
    const state = currentStateData.states.find((s) => s.entity_id === entity_id);
    if (!state) {
      console.warn(`  Entity ${entity_id} not found in current-state, skipping`);
      continue;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (change_type === 'price_update') {
      // Price → add snapshot
      priceSnapshots.snapshots.push({
        entity_id,
        date: today,
        price: parseFloat(new_value) || 0,
        currency: 'USD',
        price_type: 'MSRP',
        seller: evidence.source_type,
        pack_quantity: 2,
        tax_included: false,
        shipping_included: false,
        in_stock: true,
        raw_price_text: evidence.snippet,
        normalized_per_unit: (parseFloat(new_value) || 0) / 2,
      });
      if (state.field_freshness) state.field_freshness.price = today;
    } else if (change_type === 'award') {
      if (!state.awards) state.awards = [];
      if (!state.awards.includes(new_value)) {
        state.awards.push(new_value);
      }
      if (state.field_freshness) state.field_freshness.awards = today;
    } else {
      // spec_update, new_product, patent, etc. → update specs
      if (!state.specs) state.specs = {};
      // Handle dotted paths (specs.airflow_claim) and bare names (lengths)
      const parts = field.split('.');
      const specKey = parts.length === 2 && parts[0] === 'specs' ? parts[1] : field;
      state.specs[specKey] = new_value;
      if (state.field_freshness) state.field_freshness[specKey] = today;
    }

    state.last_updated = today;

    console.log(`  [APPLIED] ${entity_id}.${field}: ${old_value} → ${new_value} (class ${change_class})`);
    applied++;

  } else if (change_class === 3) {
    // Class 3 (interpretive) → draft only, not canonical
    const draftsFile = path.join(DATA_DIR, 'interpretive_notes_draft.json');
    let drafts = { notes: [] };
    if (fs.existsSync(draftsFile)) {
      drafts = JSON.parse(fs.readFileSync(draftsFile, 'utf-8'));
    }
    drafts.notes.push({
      entity_id,
      field,
      suggestion: new_value,
      evidence_id: evidenceEntry.id,
      date: new Date().toISOString().slice(0, 10),
    });
    fs.writeFileSync(draftsFile, JSON.stringify(drafts, null, 2) + '\n', 'utf-8');
    console.log(`  [DRAFT] ${entity_id}.${field}: "${new_value}" → interpretive_notes_draft.json`);
    skippedInterpretive++;

  } else {
    // Class 4 (noisy) → market signals only
    marketSignals.signals.push({
      entity_id,
      field,
      value: new_value,
      source_url: evidence.source_url,
      source_type: evidence.source_type,
      date: new Date().toISOString().slice(0, 10),
      confidence,
    });
    console.log(`  [SIGNAL] ${entity_id}.${field}: "${new_value}" → market-signals.json`);
    appendedSignals++;
  }
}

// ── Save all ──

console.log();
saveJSON('competitor-current-state.json', currentStateData);
saveJSON('evidence-log.json', evidenceLog);
saveJSON('market-signals.json', marketSignals);
saveJSON('price-snapshots.json', priceSnapshots);

// ── Update last-collected timestamp ──

const lastCollected = loadJSON('last-collected.json');
lastCollected.date = new Date().toISOString().slice(0, 10);
lastCollected.method = 'apply';
saveJSON('last-collected.json', lastCollected);

console.log();
console.log(`Summary: ${applied} applied, ${skippedInterpretive} interpretive (draft), ${appendedSignals} signals`);
console.log('Done. Run `node scripts/gen-report-content.mjs` to regenerate the report.');
