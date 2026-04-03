/**
 * Sales Model Calculation Engine
 *
 * Three parallel estimators:
 * A: Aftermarket Demand Engine
 * B: OEM / Spec-In Engine
 * C: Ecosystem Adoption Engine (multiplier)
 *
 * Total = (A + B) × C_multiplier
 */

import type { SalesModelConfig, SalesModelNodes, CalibrationData, EstimationResult, NodeValue, StalenessThreshold } from './types';

// ── Staleness helpers ──

const DEFAULT_STALENESS: Record<string, StalenessThreshold> = {
  high:   { freshDays: 3,  staleDays: 7 },
  medium: { freshDays: 7,  staleDays: 14 },
  low:    { freshDays: 14, staleDays: 30 },
  manual: { freshDays: 30, staleDays: 90 },
};

// Volatility lookup: loaded from query registry at runtime if available,
// falls back to sourceType-based heuristic
let volatilityMap: Record<string, string> | null = null;

export function setVolatilityMap(map: Record<string, string>) {
  volatilityMap = map;
}

function getNodeVolatility(nodeId: number, sourceType?: string): string {
  if (volatilityMap?.[String(nodeId)]) return volatilityMap[String(nodeId)];
  // Heuristic fallback based on sourceType
  if (sourceType === 'scraper') return 'high';
  if (sourceType === 'free_api') return 'low';
  if (sourceType === 'internal' || sourceType === 'manual' || sourceType === 'field' ||
      sourceType === 'survey' || sourceType === 'relationship') return 'manual';
  return 'medium';
}

function getStalenessThresholds(config: SalesModelConfig, volatility: string): StalenessThreshold {
  return config.staleness?.[volatility] || DEFAULT_STALENESS[volatility] || DEFAULT_STALENESS.medium;
}

export function getNodeStatus(
  daysSince: number | null,
  config: SalesModelConfig,
  nodeId: number,
  sourceType?: string,
): 'fresh' | 'stale' | 'outdated' | 'not_collected' {
  if (daysSince == null) return 'not_collected';
  const vol = getNodeVolatility(nodeId, sourceType);
  const thresholds = getStalenessThresholds(config, vol);
  if (daysSince <= thresholds.freshDays) return 'fresh';
  if (daysSince <= thresholds.staleDays) return 'stale';
  return 'outdated';
}

// ── Node scoring ──

/**
 * Convert a raw node value into a 0-1 normalized score.
 * Each node type needs its own normalization logic.
 */
function normalizeNodeValue(nodeId: number, value: NodeValue | undefined): number {
  if (!value || value.raw == null) return 0;

  // Default: linear normalization with reasonable bounds
  // Override per-node as we learn more about actual ranges
  const raw = typeof value.raw === 'number' ? value.raw : 0;

  // Node-specific normalization
  switch (nodeId) {
    case 4: // Amazon BSR — lower is better, invert
      return Math.max(0, 1 - raw / 50000);
    case 27: // Retailer count — more is better
      return Math.min(1, raw / 200);
    case 30: // Stockout % — higher stockout = higher demand signal
      return Math.min(1, raw / 50);
    case 42: // Review velocity — reviews/month
      return Math.min(1, raw / 50);
    case 45: // Wheelset conversion — percent
      return Math.min(1, raw / 100);
    case 56: // Tube SKU ratio — percent Clik
      return Math.min(1, raw / 100);
    default:
      return Math.min(1, raw / 100);
  }
}

// ── Estimator calculation ──

interface EstimatorConfig {
  inputNodes: number[];
  weights: number[];
}

function calculateEstimator(
  config: EstimatorConfig,
  nodes: Record<string, NodeValue>,
  correlationPenalties: Array<{ pair: number[]; penalty: number }>,
): { score: number; nodeScores: Array<{ id: number; score: number; weight: number }> } {
  const nodeScores: Array<{ id: number; score: number; weight: number }> = [];
  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < config.inputNodes.length; i++) {
    const nodeId = config.inputNodes[i];
    let weight = config.weights[i];
    const nodeValue = nodes[String(nodeId)];
    const score = normalizeNodeValue(nodeId, nodeValue);

    // Apply correlation penalty
    for (const penalty of correlationPenalties) {
      if (penalty.pair.includes(nodeId)) {
        const otherNodeId = penalty.pair.find(id => id !== nodeId);
        if (otherNodeId && config.inputNodes.includes(otherNodeId)) {
          weight *= (1 - penalty.penalty / 2); // Split penalty between the pair
        }
      }
    }

    nodeScores.push({ id: nodeId, score, weight });
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { score: normalizedScore, nodeScores };
}

// ── Main calculation ──

export function calculateEstimation(
  config: SalesModelConfig,
  nodes: SalesModelNodes,
  calibration: CalibrationData | null,
): EstimationResult {
  const { estimators, correlationPenalties } = config;

  // Calculate each estimator
  const aftermarket = calculateEstimator(
    estimators.aftermarket,
    nodes.nodes,
    correlationPenalties,
  );
  const oem = calculateEstimator(
    estimators.oem,
    nodes.nodes,
    correlationPenalties,
  );
  const ecosystem = calculateEstimator(
    estimators.ecosystem,
    nodes.nodes,
    correlationPenalties,
  );

  // Ecosystem acts as multiplier (0.5 to 1.5)
  const ecosystemMultiplier = 0.5 + ecosystem.score;

  // Calculate friction
  let frictionMultiplier = 1.0;
  for (const fn of config.frictionNodes) {
    const nodeValue = nodes.nodes[fn.id];
    if (nodeValue && nodeValue.raw != null) {
      const severity = typeof nodeValue.raw === 'number' ? Math.min(1, nodeValue.raw / 100) : 0;
      const penalty = fn.range[0] + (fn.range[1] - fn.range[0]) * severity;
      frictionMultiplier += penalty;
    }
  }
  frictionMultiplier = Math.max(0.5, frictionMultiplier);

  // If calibration available, use it to anchor
  let corecapTotal: number | null = null;
  let clikAftermarket: number | null = null;
  let clikOem: number | null = null;
  let clikTotal: number | null = null;
  let confidence = 0;

  if (calibration && calibration.monthlyShipment) {
    const annualShipment = calibration.monthlyShipment * 12;
    const corecapAftermarket = annualShipment * (calibration.aftermarketPct / 100);
    const corecapOem = annualShipment * (calibration.oemPct / 100);
    corecapTotal = annualShipment;

    // Use CoreCap as anchor to estimate Clik
    // Aftermarket: ratio of estimator scores × CoreCap aftermarket
    const aftermarketRatio = aftermarket.score > 0
      ? 1 / aftermarket.score // Invert: if CoreCap aftermarket score is X, Clik's relative strength
      : 1;
    clikAftermarket = corecapAftermarket * aftermarketRatio * (oem.score / Math.max(0.01, aftermarket.score));

    // OEM: use OEM estimator score directly (Clik has different OEM strength)
    clikOem = corecapOem * (oem.score * 10); // Clik OEM is likely much larger

    clikTotal = ((clikAftermarket || 0) + (clikOem || 0)) * ecosystemMultiplier * frictionMultiplier;

    // Confidence based on data coverage
    const totalNodes = config.nodes.length;
    const collectedNodes = Object.keys(nodes.nodes).filter(k => nodes.nodes[k]?.raw != null).length;
    confidence = Math.round((collectedNodes / totalNodes) * 100);
  }

  // Count collected vs total (using per-node volatility staleness)
  const totalNodes = config.nodes.length;
  const collectedNodes = Object.keys(nodes.nodes).filter(k => nodes.nodes[k]?.raw != null).length;
  const staleNodes = config.nodes.filter(nodeDef => {
    const n = nodes.nodes[String(nodeDef.id)];
    if (!n?.updatedAt) return false;
    const daysSince = (Date.now() - new Date(n.updatedAt).getTime()) / 86_400_000;
    const status = getNodeStatus(daysSince, config, nodeDef.id, nodeDef.sourceType);
    return status === 'stale' || status === 'outdated';
  }).length;

  return {
    corecap: {
      aftermarket: calibration ? (calibration.monthlyShipment * 12 * calibration.aftermarketPct / 100) : null,
      oem: calibration ? (calibration.monthlyShipment * 12 * calibration.oemPct / 100) : null,
      total: corecapTotal,
    },
    clik: {
      aftermarket: clikAftermarket,
      oem: clikOem,
      total: clikTotal,
    },
    estimatorScores: {
      aftermarket: aftermarket.score,
      oem: oem.score,
      ecosystem: ecosystem.score,
    },
    ecosystemMultiplier,
    frictionMultiplier,
    confidence,
    coverage: {
      total: totalNodes,
      collected: collectedNodes,
      stale: staleNodes,
    },
    estimatorDetails: {
      aftermarket: aftermarket.nodeScores,
      oem: oem.nodeScores,
      ecosystem: ecosystem.nodeScores,
    },
  };
}

// ── CSV Export ──

export function exportToCSV(config: SalesModelConfig, nodes: SalesModelNodes): string {
  const rows: string[] = [];
  rows.push('Node ID,Name,Layer,Timing,CoreCap Value,Clik Value,Source,Confidence,Updated At,Status');

  for (const nodeDef of config.nodes) {
    const nodeData = nodes.nodes[String(nodeDef.id)];
    const daysSince = nodeData?.updatedAt
      ? Math.floor((Date.now() - new Date(nodeData.updatedAt).getTime()) / 86_400_000)
      : null;
    const status = getNodeStatus(daysSince, config, nodeDef.id, nodeDef.sourceType);

    rows.push([
      nodeDef.id,
      `"${nodeDef.name}"`,
      nodeDef.layer,
      nodeDef.timing,
      nodeData?.corecap ?? '',
      nodeData?.clik ?? '',
      nodeData?.source ?? '',
      nodeData?.confidence ?? '',
      nodeData?.updatedAt ?? '',
      status,
    ].join(','));
  }

  return rows.join('\n');
}
