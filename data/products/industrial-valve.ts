import type { ProductData } from './types';

// 08_industrial_valve — shock absorbers, air tanks, air bags, cylinders
export const industrialValves: ProductData[] = [
  {
    sku: 'HHC-01',
    name: {
      en: 'HHC-01 — Industrial Valve for Shock Absorbers & Air Tanks',
      'zh-TW': 'HHC-01 — 避震器及氣壓缸用工業閥',
    },
    family: 'industrial-valve',
    material: 'Brass',
    standards: [],
    application: 'industrial',
    description: {
      en: 'Industrial valve designed for shock absorbers, air tanks, air bags, and cylinders. Provides reliable inflation/deflation control for industrial pneumatic applications.',
      'zh-TW': '適用於避震器、氣壓缸、氣囊等工業用閥。提供可靠的工業氣壓充放氣控制。',
    },
    images: ['/images/products/industrial/HHC-01.jpg'],
    relatedProducts: ['HHC-02', 'HHC-05', 'TV-01'],
    manufacturingCapabilities: ['CNC', 'plating'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'HHC-02',
    name: {
      en: 'HHC-02 — Industrial Valve for Shock Absorbers & Air Tanks',
      'zh-TW': 'HHC-02 — 避震器及氣壓缸用工業閥',
    },
    family: 'industrial-valve',
    material: 'Brass',
    standards: [],
    application: 'industrial',
    description: {
      en: 'Industrial valve designed for shock absorbers, air tanks, air bags, and cylinders. Provides reliable inflation/deflation control for industrial pneumatic applications.',
      'zh-TW': '適用於避震器、氣壓缸、氣囊等工業用閥。提供可靠的工業氣壓充放氣控制。',
    },
    images: ['/images/products/industrial/HHC-02.jpg'],
    relatedProducts: ['HHC-01', 'HHC-05', 'TV-01'],
    manufacturingCapabilities: ['CNC', 'plating'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'HHC-05',
    name: {
      en: 'HHC-05 — Industrial Valve for Shock Absorbers & Air Tanks',
      'zh-TW': 'HHC-05 — 避震器及氣壓缸用工業閥',
    },
    family: 'industrial-valve',
    material: 'Brass',
    standards: [],
    application: 'industrial',
    description: {
      en: 'Industrial valve designed for shock absorbers, air tanks, air bags, and cylinders. Provides reliable inflation/deflation control for industrial pneumatic applications.',
      'zh-TW': '適用於避震器、氣壓缸、氣囊等工業用閥。提供可靠的工業氣壓充放氣控制。',
    },
    images: ['/images/products/industrial/HHC-05.jpg'],
    relatedProducts: ['HHC-01', 'HHC-02', 'TV-01'],
    manufacturingCapabilities: ['CNC', 'plating'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'TV-01',
    name: {
      en: 'TV-01 — NPT Thread Industrial Tire Valve',
      'zh-TW': 'TV-01 — NPT 螺紋工業輪胎閥',
    },
    family: 'industrial-valve',
    valveType: 'schrader',
    material: 'Solid brass, nickel plated',
    installationType: 'bolt-in',
    standards: ['NPT'],
    application: 'industrial',
    description: {
      en: 'Industrial tire valve with 1/8"-27 NPT standard thread. Nickel plated solid brass construction for industrial equipment, air tanks, and pneumatic systems requiring NPT-threaded valve ports.',
      'zh-TW': '工業用輪胎閥，採用 1/8"-27 NPT 標準螺紋。鍍鎳實心黃銅結構，適用於工業設備、氣壓缸及需要 NPT 螺紋閥孔之氣壓系統。',
    },
    images: ['/images/products/industrial/TV-01.jpg'],
    relatedProducts: ['HHC-01', 'HHC-02', 'HHC-05'],
    manufacturingCapabilities: ['CNC', 'plating'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
];
