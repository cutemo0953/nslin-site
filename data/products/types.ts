/**
 * Product Content Data Model
 * Spec: DEV_SPEC_NSLIN_AI_SEO.md Section 4.1
 */

export interface LocalizedString {
  en: string;
  'zh-TW': string;
}

export interface ProductFAQ {
  q: LocalizedString;
  a: LocalizedString;
}

export interface ProductData {
  // Identity
  sku: string;
  name: LocalizedString;
  family: string; // category slug, e.g. "bicycle-tubeless-valve"
  valveType?: string; // "schrader" | "presta" | "dunlop"

  // Technical Specs
  rimHoleDiameter?: string;
  effectiveLength?: string;
  material: string;
  finish?: string;
  shoreHardness?: string;
  pressureRange?: string;
  installationType?: string; // "snap-in" | "clamp-in" | "bolt-in"
  valveCore?: string; // "removable" | "fixed"

  // Standards & Compatibility
  standards: string[]; // ["TRA", "ETRTO", "JATMA"]
  application: string; // "bicycle" | "motorcycle" | "car" | "truck"
  vehicleTypes?: string[];
  oeCrossReference?: string[];

  // Content
  description: LocalizedString;
  technicalDescription?: LocalizedString;
  faq?: ProductFAQ[];

  // Media
  images: string[];
  specPdf?: string;
  dimensionDrawing?: string;

  // Relations
  relatedProducts?: string[]; // SKU references

  // Manufacturing
  manufacturingCapabilities?: string[];

  // Meta
  status: 'active' | 'discontinued';
  updatedAt: string; // ISO 8601
}

export interface CategoryData {
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  parentCategory?: string;
  productCount: number;
  featuredProducts: string[]; // SKU refs
  pillarPageLink?: string;
  image?: string;
}
