import type { ProductData } from './types';
import { bicycleTubelessValves } from './bicycle-tubeless-valve';

// Registry of all products by family
const productsByFamily: Record<string, ProductData[]> = {
  'bicycle-tubeless-valve': bicycleTubelessValves,
  // TODO: Add more families as they are crawled
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
