import type { ProductData } from './types';
import { bicycleTubelessValves } from './bicycle-tubeless-valve';
import { motorcycleValves } from './motorcycle-valve';
import { carLightTruckValves } from './car-light-truck-valve';
import { truckBusValves } from './truck-bus-valve';
import { truckValveExtensions } from './truck-valve-extension';
import { industrialValves } from './industrial-valve';
import { specialValveCaps } from './special-valve-cap';
import { tpmsSensorValves } from './tpms-sensor-valve';
import { invisibleValves } from './invisible-valve';
import { tractorValves } from './tractor-valve';
import { alloyLugNuts } from './alloy-lug-nuts';
import { rimHolePlugs } from './rim-hole-plug';
import { motorcycleValveExtensions } from './motorcycle-valve-extension';

// Registry of all products by family
const productsByFamily: Record<string, ProductData[]> = {
  'bicycle-tubeless-valve': bicycleTubelessValves,
  'motorcycle-valve': motorcycleValves,
  'car-light-truck-valve': carLightTruckValves,
  'truck-bus-valve': truckBusValves,
  'truck-valve-extension': truckValveExtensions,
  'industrial-valve': industrialValves,
  'special-valve-cap': specialValveCaps,
  'tpms-sensor-valve': tpmsSensorValves,
  'invisible-valve': invisibleValves,
  'tractor-valve': tractorValves,
  'alloy-lug-nuts': alloyLugNuts,
  'rim-hole-plug': rimHolePlugs,
  'motorcycle-valve-extension': motorcycleValveExtensions,
};

// Get all products for a category
export function getProductsByCategory(category: string): ProductData[] {
  return productsByFamily[category] || [];
}

// Get a single product by SKU
export function getProductBySku(sku: string): ProductData | undefined {
  for (const products of Object.values(productsByFamily)) {
    const found = products.find(
      (p) => p.sku.toLowerCase() === sku.toLowerCase()
    );
    if (found) return found;
  }
  return undefined;
}

// Get all product SKUs (for generateStaticParams)
export function getAllProductSlugs(): Array<{ category: string; sku: string }> {
  const slugs: Array<{ category: string; sku: string }> = [];
  for (const [category, products] of Object.entries(productsByFamily)) {
    for (const product of products) {
      slugs.push({
        category,
        sku: product.sku.toLowerCase(),
      });
    }
  }
  return slugs;
}
