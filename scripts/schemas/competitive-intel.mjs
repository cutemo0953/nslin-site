/**
 * Zod schemas for competitive intelligence data validation.
 * Used by collect/apply/summary scripts.
 */
import { z } from 'zod';

// --- Proposal Schema (Claude API output) ---

export const EvidenceSourceSchema = z.object({
  source_url: z.string().url(),
  source_type: z.enum([
    'official_site',
    'press_release',
    'patent',
    'media_review',
    'retail',
    'forum',
    'youtube',
  ]),
  retrieved_at: z.string().datetime(),
  snippet: z.string().max(500),
  url_status: z.enum(['alive', 'blocked', 'unreachable', 'dead', 'unchecked']).default('unchecked'),
  url_http_status: z.number().int().min(0).optional(),
  url_check_method: z.enum(['head', 'get', 'none']).default('none'),
  url_status_reason: z.string().optional(),
  url_checked_at: z.string().datetime().optional(),
});

export const ProposalSchema = z.object({
  entity_id: z.string(),
  change_type: z.enum([
    'price_update',
    'spec_update',
    'new_product',
    'discontinued',
    'award',
    'patent',
    'source_append',
  ]),
  field: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string(),
  evidence: EvidenceSourceSchema,
  confidence: z.number().min(0).max(1),
  change_class: z.number().int().min(1).max(4),
});

export const ProposalsArraySchema = z.array(ProposalSchema);

// --- Price Snapshot Schema ---

export const PriceSnapshotSchema = z.object({
  entity_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'TWD']),
  price_type: z.enum(['MSRP', 'street', 'sale']),
  seller: z.string(),
  pack_quantity: z.number().int().positive(),
  tax_included: z.boolean(),
  shipping_included: z.boolean(),
  in_stock: z.boolean(),
  raw_price_text: z.string(),
  normalized_per_unit: z.number().positive(),
  notes: z.string().nullable().optional(),
});

// --- Entity Schema ---

export const EntitySchema = z.object({
  id: z.string(),
  brand: z.string(),
  product: z.string(),
  tier: z.number().int().min(0).max(4),
  official_url: z.string().url(),
  patent_ids: z.array(z.string()),
  notes: z.string().optional(),
});

// --- Evidence Log Entry ---

export const EvidenceLogEntrySchema = z.object({
  id: z.string(),
  entity_id: z.string(),
  change_type: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string(),
  field: z.string(),
  source: EvidenceSourceSchema,
  confidence: z.number().min(0).max(1),
  change_class: z.number().int().min(1).max(4),
  requires_review: z.boolean(),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

// --- Material Price Snapshot Schema ---

const SharedMaterialFields = {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  material: z.enum(['copper', 'aluminum', 'abs', 'pc', 'epdm', 'nbr']),
  material_zh: z.string(),
  source_type: z.enum(['futures_api', 'manual']),
  source_symbol: z.string(),
  source_currency: z.string(),
  source_url: z.string().url(),
  source_description: z.string(),
  conversion_method: z.enum(['direct_twd', 'usd_fx_derived', 'proxy']),
  retrieved_at: z.string().datetime(),
};

export const MaterialPriceSnapshotSchema = z.discriminatedUnion('data_class', [
  z.object({
    ...SharedMaterialFields,
    data_class: z.literal('direct'),
    price_twd_per_kg: z.number().positive(),
    price_usd_per_ton: z.number().positive(),
    price_usd_raw: z.number().positive(),
    price_raw_unit: z.string(),
    exchange_rate: z.number().positive(),
  }),
  z.object({
    ...SharedMaterialFields,
    data_class: z.literal('proxy'),
    proxy_symbol: z.string(),
    proxy_name: z.string(),
    proxy_price: z.number().positive(),
    proxy_unit: z.string(),
  }),
]);

export const MaterialPricesFileSchema = z.object({
  snapshots: z.array(MaterialPriceSnapshotSchema),
});

// --- Tool definition for Claude API Tool Use ---

export const SUBMIT_PROPOSALS_TOOL = {
  name: 'submit_proposals',
  description:
    'Submit competitive intelligence change proposals based on evidence comparison. Call with an empty array if no changes detected.',
  input_schema: {
    type: 'object',
    properties: {
      proposals: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entity_id: { type: 'string' },
            change_type: {
              type: 'string',
              enum: [
                'price_update',
                'spec_update',
                'new_product',
                'discontinued',
                'award',
                'patent',
                'source_append',
              ],
            },
            field: { type: 'string' },
            old_value: { type: ['string', 'null'] },
            new_value: { type: 'string' },
            evidence: {
              type: 'object',
              properties: {
                source_url: { type: 'string' },
                source_type: {
                  type: 'string',
                  enum: [
                    'official_site',
                    'press_release',
                    'patent',
                    'media_review',
                    'retail',
                    'forum',
                    'youtube',
                  ],
                },
                retrieved_at: { type: 'string' },
                snippet: { type: 'string', maxLength: 500 },
              },
              required: ['source_url', 'source_type', 'retrieved_at', 'snippet'],
            },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            change_class: { type: 'integer', minimum: 1, maximum: 4 },
          },
          required: [
            'entity_id',
            'change_type',
            'field',
            'old_value',
            'new_value',
            'evidence',
            'confidence',
            'change_class',
          ],
        },
      },
    },
    required: ['proposals'],
  },
};
