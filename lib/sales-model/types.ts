export interface NodeDefinition {
  id: number;
  name: string;
  nameEn: string;
  layer: string;
  timing: string;
  unit: string;
  sourceType: string;
  products: string[];
}

export interface NodeValue {
  raw: number | string | boolean | null;
  corecap?: number | string | null;
  clik?: number | string | null;
  updatedAt: string | null;
  source: 'manual' | 'scraper' | 'api' | 'estimate' | 'field' | 'survey' | 'internal' | 'public_filing' | 'paid_api' | 'paid_report' | 'patent_db' | 'public' | 'free_api' | 'relationship' | null;
  confidence: 'high' | 'medium' | 'low' | 'estimate' | null;
  enteredBy?: string;
  entryMethod?: string;
  note?: string;
  sourceRef?: string;
  previousValue?: number | string | null;
  changeReason?: string;
}

export interface FrictionNode {
  id: string;
  name: string;
  nameZh: string;
  effect: string;
  range: [number, number];
  products: string[];
}

export interface EstimatorConfig {
  name: string;
  nameZh: string;
  inputNodes: number[];
  weights: number[];
  description: string;
}

export interface CorrelationPenalty {
  pair: number[];
  label: string;
  penalty: number;
}

export interface RegionConfig {
  id: string;
  name: string;
  nameZh: string;
  diffusionOrder: number;
  keyRetailers: string[];
}

export interface StalenessThreshold {
  freshDays: number;
  staleDays: number;
}

export interface SalesModelConfig {
  version: string;
  layers: Array<{ id: string; name: string; nameZh: string; timing: string }>;
  nodes: NodeDefinition[];
  frictionNodes: FrictionNode[];
  regions: RegionConfig[];
  estimators: {
    aftermarket: EstimatorConfig;
    oem: EstimatorConfig;
    ecosystem: EstimatorConfig;
  };
  correlationPenalties: CorrelationPenalty[];
  confidenceWeights: Record<string, number>;
  staleness?: Record<string, StalenessThreshold>;
  sourcePrecedence?: Record<string, number>;
}

export interface CalibrationData {
  monthlyShipment: number;
  aftermarketPct: number;
  oemPct: number;
  period: string;
  anchorScope: 'shipment' | 'sell_in' | 'sell_through';
  anchorGeography: 'global' | 'DACH' | 'Benelux' | 'UK' | 'US' | 'JP' | 'TW';
  anchorConfidence: 'high' | 'medium' | 'low';
  notes: string;
  updatedAt: string | null;
}

export interface SalesModelNodes {
  lastScan: string | null;
  calibration: CalibrationData;
  nodes: Record<string, NodeValue>;
}

export interface EstimationResult {
  corecap: { aftermarket: number | null; oem: number | null; total: number | null };
  clik: { aftermarket: number | null; oem: number | null; total: number | null };
  estimatorScores: { aftermarket: number; oem: number; ecosystem: number };
  ecosystemMultiplier: number;
  frictionMultiplier: number;
  confidence: number;
  coverage: { total: number; collected: number; stale: number };
  estimatorDetails: {
    aftermarket: Array<{ id: number; score: number; weight: number }>;
    oem: Array<{ id: number; score: number; weight: number }>;
    ecosystem: Array<{ id: number; score: number; weight: number }>;
  };
}
