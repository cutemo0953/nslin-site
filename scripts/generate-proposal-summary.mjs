#!/usr/bin/env node
/**
 * Generate a reviewer-friendly proposal summary for PR body.
 *
 * Usage:
 *   node scripts/generate-proposal-summary.mjs
 *
 * Reads the latest proposals-*.json and generates proposal-summary.md.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/competitive-intel');

// Find latest proposals file
const files = fs.readdirSync(DATA_DIR).filter((f) => f.startsWith('proposals-') && f.endsWith('.json'));
if (files.length === 0) {
  console.log('No proposals files found. Nothing to summarize.');
  process.exit(0);
}

files.sort();
const latestFile = files[files.length - 1];
const proposals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, latestFile), 'utf-8'));

if (proposals.length === 0) {
  console.log('Proposals file is empty. Nothing to summarize.');
  process.exit(0);
}

// Load entities and current state for display names + staleness checks
const entities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'competitor-entities.json'), 'utf-8')).entities;
const entityMap = Object.fromEntries(entities.map((e) => [e.id, `${e.brand} ${e.product}`]));
const currentStates = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'competitor-current-state.json'), 'utf-8')).states;

// ── Class labels ──

const CLASS_LABELS = {
  1: 'Mechanical',
  2: 'Factual',
  3: 'Interpretive',
  4: 'Noisy',
};

const CLASS_EMOJI = {
  1: '',
  2: '**',
  3: '***',
  4: '~',
};

// ── Group proposals ──

// Sort: low confidence first (needs most review), then by class desc
const sorted = [...proposals].sort((a, b) => {
  if (a.confidence !== b.confidence) return a.confidence - b.confidence;
  return b.change_class - a.change_class;
});

// Group by entity
const byEntity = {};
for (const p of sorted) {
  if (!byEntity[p.entity_id]) byEntity[p.entity_id] = [];
  byEntity[p.entity_id].push(p);
}

// ── Generate markdown ──

const lines = [];

lines.push('## Competitive Intelligence Proposals');
lines.push('');
lines.push(`Source file: \`${latestFile}\``);
lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
lines.push(`Total proposals: ${proposals.length}`);
lines.push('');

// Staleness alert: entities with field_freshness > 30 days
const today = new Date();
const staleEntities = [];
for (const state of currentStates) {
  if (!state.field_freshness) continue;
  const staleFields = [];
  for (const [field, dateStr] of Object.entries(state.field_freshness)) {
    const daysSince = Math.floor((today - new Date(dateStr)) / 86_400_000);
    if (daysSince > 30) {
      staleFields.push(`${field} (${daysSince} days)`);
    }
  }
  if (staleFields.length > 0) {
    const name = entityMap[state.entity_id] || state.entity_id;
    staleEntities.push({ name, fields: staleFields });
  }
}

if (staleEntities.length > 0) {
  lines.push('### Staleness Alert');
  lines.push('');
  lines.push('The following competitors have fields not updated in over 30 days. Manual check may be needed.');
  lines.push('');
  lines.push('| Competitor | Stale Fields |');
  lines.push('|-----------|-------------|');
  for (const { name, fields } of staleEntities) {
    lines.push(`| ${name} | ${fields.join(', ')} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
}

// Summary table
lines.push('### Summary');
lines.push('');
lines.push('| Class | Count | Action |');
lines.push('|-------|-------|--------|');

for (const cls of [1, 2, 3, 4]) {
  const count = proposals.filter((p) => p.change_class === cls).length;
  if (count === 0) continue;
  const action =
    cls <= 2 ? 'Review & merge' : cls === 3 ? 'Review interpretive draft' : 'Appended to signals';
  lines.push(`| ${CLASS_LABELS[cls]} (${cls}) | ${count} | ${action} |`);
}

lines.push('');
lines.push('---');
lines.push('');

// Per-entity details
for (const [entityId, entityProposals] of Object.entries(byEntity)) {
  const displayName = entityMap[entityId] || entityId;
  lines.push(`### ${displayName}`);
  lines.push('');

  for (const p of entityProposals) {
    const classLabel = CLASS_LABELS[p.change_class];
    const confPct = Math.round(p.confidence * 100);
    lines.push(`- **${p.field}** (${classLabel}, ${confPct}% confidence)`);
    lines.push(`  - Change: \`${p.old_value}\` -> \`${p.new_value}\``);
    const urlStatus = p.evidence.url_status || 'unchecked';
    if (urlStatus === 'dead') {
      lines.push(`  - Source: ~~[${p.evidence.source_type}](${p.evidence.source_url})~~ [DEAD]`);
    } else if (urlStatus === 'blocked') {
      lines.push(`  - Source: [${p.evidence.source_type}](${p.evidence.source_url}) [BLOCKED]`);
    } else if (urlStatus === 'unreachable') {
      lines.push(`  - Source: ~~[${p.evidence.source_type}](${p.evidence.source_url})~~ [UNREACHABLE]`);
    } else {
      lines.push(`  - Source: [${p.evidence.source_type}](${p.evidence.source_url})`);
    }
    lines.push(`  - Evidence: "${p.evidence.snippet.slice(0, 200)}${p.evidence.snippet.length > 200 ? '...' : ''}"`);
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('### Review Checklist');
lines.push('');
lines.push('- [ ] Check Class 2 proposals (factual changes) for accuracy');
lines.push('- [ ] Check Class 3 proposals (interpretive) for editorial quality');
lines.push('- [ ] Verify price changes against source URLs');
lines.push('- [ ] Confirm no Class 4 (noisy) items leaked into main data');
lines.push('');
lines.push('After merge, run: `node scripts/apply-competitive-intel.mjs data/competitive-intel/' + latestFile + ' && npm run prebuild`');
lines.push('Then deploy via `/cf-deploy nslin-site`');

const output = lines.join('\n');
const outFile = path.join(DATA_DIR, 'proposal-summary.md');
fs.writeFileSync(outFile, output, 'utf-8');

console.log(`Generated ${outFile} (${proposals.length} proposals summarized)`);
