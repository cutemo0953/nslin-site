#!/usr/bin/env node
/**
 * Sales Model Patch Apply Script
 *
 * Merges a patch file into sales-model-nodes.json with:
 * - Source precedence checks
 * - Partial market/product merge
 * - Null protection
 * - Derived node computation
 * - Monthly history snapshot
 * - PR threshold evaluation + markdown summary
 *
 * Usage:
 *   node scripts/apply-sales-model-patch.mjs data/dashboards/patches/sales-model-patch-2026-04-02.json
 *
 * Options:
 *   --out <path>      Write merged result to path instead of canonical file (for temp copy)
 *   --summary         Generate markdown summary for PR body
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DASHBOARDS_DIR = path.join(ROOT, 'data/dashboards');

// ── CLI ──

const args = process.argv.slice(2);
const patchPath = args.find((a) => !a.startsWith('--'));
const outPath = args.includes('--out')
  ? args[args.indexOf('--out') + 1]
  : path.join(DASHBOARDS_DIR, 'sales-model-nodes.json');
const generateSummary = args.includes('--summary');

if (!patchPath) {
  console.error('Usage: node scripts/apply-sales-model-patch.mjs <patch-file> [--out <path>] [--summary]');
  process.exit(1);
}

// ── Load data ──

function loadJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

const patch = loadJSON(patchPath);
const nodes = loadJSON(path.join(DASHBOARDS_DIR, 'sales-model-nodes.json'));
const config = loadJSON(path.join(DASHBOARDS_DIR, 'sales-model-config.json'));
const queryRegistry = loadJSON(path.join(DASHBOARDS_DIR, 'sales-model-queries.json'));

const precedence = config.sourcePrecedence || {};

// ── Merge ──

const mergeLog = [];
let mergedCount = 0;
let skippedCount = 0;
let blockedCount = 0;
let reviewCount = 0;

for (const [nodeId, entry] of Object.entries(patch.nodes)) {
  const currentNode = nodes.nodes[nodeId] || {};

  // Skip unchanged
  if (entry.proposedChangeReason === 'no change detected') {
    skippedCount++;
    mergeLog.push({ nodeId, action: 'skip', reason: 'unchanged' });
    continue;
  }

  // Skip locked
  const queryConfig = queryRegistry.nodes.find((n) => n.nodeId === Number(nodeId));
  if (queryConfig?.locked) {
    blockedCount++;
    mergeLog.push({ nodeId, action: 'blocked', reason: 'locked' });
    continue;
  }

  // Skip requiresReview
  if (entry.requiresReview) {
    reviewCount++;
    mergeLog.push({
      nodeId,
      action: 'review',
      reason: 'requires_review',
      validatorResults: entry.validatorResults,
    });
    continue;
  }

  // Null protection: never overwrite non-null with null
  if (entry.rawValue == null && currentNode.raw != null) {
    skippedCount++;
    mergeLog.push({ nodeId, action: 'skip', reason: 'null_protection' });
    continue;
  }

  // Source precedence check
  const currentRank = precedence[currentNode.entryMethod] || 99;
  const newMethod = entry.collector === 'tavily' ? 'auto_tavily' : 'auto_api';
  const newRank = precedence[newMethod] || 99;

  if (newRank > currentRank) {
    // Lower rank trying to overwrite higher rank
    const delta = entry.deltaPct != null ? Math.abs(entry.deltaPct) : 0;
    const confidenceOk = getConfidenceLevel(entry.confidence) >= getConfidenceLevel(currentNode.confidence);
    if (delta <= 20 || !confidenceOk) {
      blockedCount++;
      mergeLog.push({ nodeId, action: 'blocked', reason: 'precedence', currentMethod: currentNode.entryMethod, newMethod });
      continue;
    }
  }

  // Apply merge
  const updatedNode = {
    ...currentNode,
    raw: entry.rawValue,
    updatedAt: new Date().toISOString(),
    source: entry.collector,
    confidence: entry.confidence || 'medium',
    enteredBy: 'automation',
    entryMethod: newMethod,
    note: entry.extractionRationale,
    sourceRef: entry.sourceUrl,
    previousValue: currentNode.raw ?? null,
    changeReason: entry.proposedChangeReason,
  };

  // Partial product merge: only update the specific product field
  if (entry.product === 'corecap') {
    updatedNode.corecap = entry.rawValue;
    if (currentNode.clik !== undefined) updatedNode.clik = currentNode.clik;
  } else if (entry.product === 'clik') {
    updatedNode.clik = entry.rawValue;
    if (currentNode.corecap !== undefined) updatedNode.corecap = currentNode.corecap;
  } else {
    updatedNode.corecap = entry.rawValue;
    updatedNode.clik = entry.rawValue;
  }

  nodes.nodes[nodeId] = updatedNode;
  mergedCount++;
  mergeLog.push({
    nodeId,
    action: 'merged',
    oldValue: currentNode.raw ?? null,
    newValue: entry.rawValue,
    deltaPct: entry.deltaPct,
    product: entry.product,
  });
}

// ── Derived Nodes ──

const derivedResults = {};

for (const derived of queryRegistry.derivedNodes || []) {
  if (!derived.enabled) continue;

  const { nodeId, derivedFrom, calculation } = derived;

  // Check if dependencies exist in canonical state
  const depValues = derivedFrom.map((depId) => {
    const dep = nodes.nodes[String(depId)];
    return dep?.raw;
  });

  const hasAllDeps = depValues.every((v) => v != null);
  if (!hasAllDeps) {
    console.log(`[Derived #${nodeId}] Skipped: missing dependencies ${derivedFrom}`);
    continue;
  }

  let derivedValue = null;
  let calcDescription = '';

  switch (calculation) {
    case 'std_dev': {
      // Collect all price samples from the dependent node's various patches
      // For now, use raw value array if available, else just the single value
      const samples = depValues.filter((v) => typeof v === 'number');
      if (samples.length > 1) {
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
        derivedValue = Math.round(Math.sqrt(variance) * 100) / 100;
        calcDescription = `std_dev([${samples.join(', ')}])`;
      } else {
        derivedValue = 0;
        calcDescription = 'single sample, no dispersion';
      }
      break;
    }
    case 'delta': {
      // Current - previous for the dependent node
      const dep = nodes.nodes[String(derivedFrom[0])];
      if (dep?.raw != null && dep?.previousValue != null) {
        derivedValue = dep.raw - dep.previousValue;
        calcDescription = `${dep.raw} - ${dep.previousValue}`;
      }
      break;
    }
    case 'consecutive_days': {
      // Would need historical patch data; stub for now
      derivedValue = null;
      calcDescription = 'requires historical data (not yet implemented)';
      break;
    }
  }

  if (derivedValue != null) {
    // Check if any dependencies are stale
    const staleComponents = [];
    for (const depId of derivedFrom) {
      const dep = nodes.nodes[String(depId)];
      if (dep?.updatedAt) {
        const days = (Date.now() - new Date(dep.updatedAt).getTime()) / 86_400_000;
        const vol = queryRegistry.nodes.find((n) => n.nodeId === depId)?.volatility || 'manual';
        const staleDays = config.staleness?.[vol]?.staleDays || 14;
        if (days > staleDays) staleComponents.push(depId);
      }
    }

    // Confidence: medium by default, low if stale components
    const confidence = staleComponents.length > 0 ? 'low' : 'medium';

    derivedResults[String(nodeId)] = {
      nodeType: 'derived',
      derivedFrom,
      rawValue: derivedValue,
      calculation: calcDescription,
      confidence,
      staleComponents: staleComponents.length > 0 ? staleComponents : undefined,
    };

    // Also update in nodes.json
    nodes.nodes[String(nodeId)] = {
      ...(nodes.nodes[String(nodeId)] || {}),
      raw: derivedValue,
      updatedAt: new Date().toISOString(),
      source: 'estimate',
      confidence,
      enteredBy: 'automation',
      entryMethod: 'derived',
      note: calcDescription,
    };

    console.log(`[Derived #${nodeId}] ${calcDescription} = ${derivedValue} (confidence: ${confidence})`);
  }
}

// Update patch with derived results
patch.derived = derivedResults;

// ── Monthly History Snapshot ──

const today = new Date();
if (today.getDate() === 1) {
  console.log('Monthly snapshot: appending to history...');

  const historyPath = path.join(DASHBOARDS_DIR, 'sales-model-history.json');
  const history = fs.existsSync(historyPath) ? loadJSON(historyPath) : [];

  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Don't duplicate
  if (!history.some((h) => h.month === month)) {
    const totalNodes = config.nodes?.length || 66;
    const collectedNodes = Object.keys(nodes.nodes).filter((k) => nodes.nodes[k]?.raw != null).length;
    const staleNodes = Object.values(nodes.nodes).filter((n) => {
      if (!n?.updatedAt) return false;
      return (Date.now() - new Date(n.updatedAt).getTime()) / 86_400_000 > 14;
    }).length;

    const snapshot = {
      month,
      snapshotAt: new Date().toISOString(),
      methodVersion: queryRegistry.version,
      extractorVersion: queryRegistry.extractorVersion,
      queryRegistryVersion: patch.queryRegistryHash,
      coverage: { total: totalNodes, collected: collectedNodes, stale: staleNodes },
      estimation: { corecapTotal: null, clikTotal: null }, // Would need calculate.ts
      nodes: {},
    };

    for (const [id, val] of Object.entries(nodes.nodes)) {
      if (val?.raw != null) {
        snapshot.nodes[id] = { corecap: val.corecap ?? null, clik: val.clik ?? null };
      }
    }

    history.push(snapshot);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
    console.log(`Snapshot added for ${month}`);
  }
}

// ── Update lastScan ──

nodes.lastScan = new Date().toISOString();

// ── Write output ──

fs.writeFileSync(outPath, JSON.stringify(nodes, null, 2), 'utf-8');
console.log();
console.log(`Nodes written to: ${outPath}`);
console.log(`Merged: ${mergedCount} | Skipped: ${skippedCount} | Blocked: ${blockedCount} | Review: ${reviewCount}`);

// ── PR Threshold Evaluation ──

const prDecision = evaluatePRThreshold(patch, mergeLog);
console.log(`PR decision: ${prDecision.create ? 'CREATE' : 'SKIP'} (${prDecision.reason})`);

// ── Markdown Summary ──

if (generateSummary) {
  const summary = generateMarkdownSummary(patch, mergeLog, prDecision);
  const summaryPath = path.join(DASHBOARDS_DIR, 'patches', `pr-summary-${patch.date}.md`);
  fs.writeFileSync(summaryPath, summary, 'utf-8');
  console.log(`PR summary: ${summaryPath}`);
}

// Write PR decision to run summary
const summaryPath = path.join(DASHBOARDS_DIR, 'patches', `run-summary-${patch.date}.json`);
if (fs.existsSync(summaryPath)) {
  const runSummary = loadJSON(summaryPath);
  runSummary.prCreated = prDecision.create;
  runSummary.prReason = prDecision.reason;
  fs.writeFileSync(summaryPath, JSON.stringify(runSummary, null, 2), 'utf-8');
}

// ── Helper Functions ──

function getConfidenceLevel(conf) {
  switch (conf) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

function evaluatePRThreshold(patch, log) {
  const { stats } = patch;

  // No PR if all unchanged
  if (stats.collected === 0 && stats.failed === 0) {
    return { create: false, reason: 'all_unchanged' };
  }

  // PR if any requiresReview
  if (log.some((l) => l.action === 'review')) {
    return { create: true, reason: 'requires_review' };
  }

  // PR if any overwrite blocked
  if (log.some((l) => l.action === 'blocked' && l.reason === 'precedence')) {
    return { create: true, reason: 'overwrite_blocked' };
  }

  // PR if high failure rate
  const failureRate = stats.eligible > 0 ? stats.failed / stats.eligible : 0;
  if (failureRate > 0.3) {
    return { create: true, reason: `high_failure_rate_${Math.round(failureRate * 100)}pct` };
  }

  // PR if any Tier A node has significant delta
  for (const [nodeId, entry] of Object.entries(patch.nodes)) {
    const qConfig = queryRegistry.nodes.find((n) => n.nodeId === Number(nodeId));
    if (qConfig?.volatility === 'high' && entry.deltaPct != null && Math.abs(entry.deltaPct) > 10) {
      return { create: true, reason: `tier_a_delta_node_${nodeId}` };
    }
  }

  // No PR for low-confidence, small delta
  const allSmallDelta = Object.values(patch.nodes).every(
    (e) => e.deltaPct == null || Math.abs(e.deltaPct) < 5,
  );
  if (allSmallDelta && stats.collected > 0) {
    return { create: false, reason: 'low_delta_only' };
  }

  // Default: create PR if data was collected
  return { create: stats.collected > 0, reason: 'data_collected' };
}

function generateMarkdownSummary(patch, log, prDecision) {
  const lines = [];
  lines.push(`## Sales Model Update ${patch.date}`);
  lines.push('');
  lines.push(`**Trigger:** ${prDecision.reason}`);
  lines.push(`**Method version:** ${patch.methodVersion} | **Extractor:** ${patch.extractorVersion}`);
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Eligible | ${patch.stats.eligible} |`);
  lines.push(`| Collected | ${patch.stats.collected} |`);
  lines.push(`| Unchanged | ${patch.stats.unchanged} |`);
  lines.push(`| Failed | ${patch.stats.failed} |`);
  lines.push('');

  // Changes table
  const changes = log.filter((l) => l.action === 'merged');
  if (changes.length) {
    lines.push('### Changes');
    lines.push('');
    lines.push('| Node | Old | New | Delta | Product | Confidence |');
    lines.push('|------|-----|-----|-------|---------|------------|');
    for (const c of changes) {
      const entry = patch.nodes[c.nodeId];
      lines.push(`| #${c.nodeId} | ${c.oldValue ?? 'null'} | ${c.newValue ?? 'null'} | ${c.deltaPct != null ? c.deltaPct + '%' : 'N/A'} | ${c.product || 'all'} | ${entry?.confidence || '?'} |`);
    }
    lines.push('');
  }

  // Review required
  const reviews = log.filter((l) => l.action === 'review');
  if (reviews.length) {
    lines.push('### Requires Review');
    lines.push('');
    lines.push('| Node | Reason | Validator Results |');
    lines.push('|------|--------|-------------------|');
    for (const r of reviews) {
      const vr = r.validatorResults
        ? Object.entries(r.validatorResults).filter(([, v]) => v === 'fail').map(([k]) => k).join(', ')
        : '?';
      lines.push(`| #${r.nodeId} | ${r.reason} | ${vr || 'all pass'} |`);
    }
    lines.push('');
  }

  // Failures
  if (patch.failures.length) {
    lines.push('### Failures');
    lines.push('');
    lines.push('| Node | Code | Query |');
    lines.push('|------|------|-------|');
    for (const f of patch.failures) {
      lines.push(`| #${f.nodeId} | ${f.code} | ${(f.query || '').slice(0, 50)} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('Generated by `apply-sales-model-patch.mjs`');

  return lines.join('\n');
}
