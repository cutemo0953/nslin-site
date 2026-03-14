import type { ProductData } from './types';

export const rimHolePlugs: ProductData[] = [
  {
    sku: 'RPV-01',
    name: {
      en: 'RPV-01 — Rim Hole Plug (Valve Relocation Seal)',
      'zh-TW': 'RPV-01 — 輪圈氣嘴孔塞 (氣嘴移位密封用)',
    },
    family: 'rim-hole-plug',
    rimHoleDiameter: '8mm / 11.5mm',
    material: 'Aluminum Alloy',
    finish: 'Anodized',
    installationType: 'snap-in',
    standards: [],
    application: 'car',
    vehicleTypes: ['passenger car', 'light truck'],
    description: {
      en: 'Aluminum alloy rim hole plug for sealing 8mm or 11.5mm valve holes when relocating the tire valve to a different position. Anodized finish for corrosion resistance. Essential accessory for TPMS sensor relocation and aftermarket wheel modifications.',
      'zh-TW': '鋁合金輪圈氣嘴孔塞，適用於 8mm 或 11.5mm 氣嘴孔。當氣嘴移位至其他位置時，用於密封原有孔位。陽極處理表面防腐蝕。TPMS 感測器移位及改裝輪圈必備配件。',
    },
    images: ['/images/products/rim-plug/RPV-01.jpg'],
    relatedProducts: ['RPV-02'],
    manufacturingCapabilities: ['CNC', 'anodizing'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'RPV-02',
    name: {
      en: 'RPV-02 — Rim Hole Plug with TPMS Sensor Housing',
      'zh-TW': 'RPV-02 — 輪圈氣嘴孔塞 (可搭載 TPMS 感測器)',
    },
    family: 'rim-hole-plug',
    rimHoleDiameter: '8mm / 11.5mm',
    material: 'Aluminum Alloy',
    finish: 'Anodized',
    installationType: 'snap-in',
    standards: [],
    application: 'car',
    vehicleTypes: ['passenger car', 'light truck'],
    description: {
      en: 'Aluminum alloy rim hole plug for sealing 8mm or 11.5mm valve holes. Can be equipped with TPMS sensor housing, allowing tire pressure monitoring without occupying the primary valve position. Anodized finish for durability.',
      'zh-TW': '鋁合金輪圈氣嘴孔塞，適用於 8mm 或 11.5mm 氣嘴孔。可搭載 TPMS 胎壓感測器座，無需佔用主氣嘴位即可監控胎壓。陽極處理表面耐久。',
    },
    images: ['/images/products/rim-plug/RPV-02.jpg'],
    relatedProducts: ['RPV-01'],
    manufacturingCapabilities: ['CNC', 'anodizing'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
];
