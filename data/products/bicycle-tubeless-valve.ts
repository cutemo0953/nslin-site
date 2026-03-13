import type { ProductData } from './types';

export const bicycleTubelessValves: ProductData[] = [
  {
    sku: 'FVRa',
    name: {
      en: 'FVRa — Tubeless Presta Valve with Fixed Oblong Rubber Base',
      'zh-TW': 'FVRa — 固定橢圓膠座法式無內胎氣嘴閥',
    },
    family: 'bicycle-tubeless-valve',
    valveType: 'presta',
    rimHoleDiameter: '6.5-7.5mm',
    material: 'Brass (Cu) with Nickel/Chrome plating',
    finish: 'Original Bronze / Nickel Silver / Chrome Black',
    installationType: 'snap-in',
    valveCore: 'removable',
    standards: ['OE replacement'],
    application: 'bicycle',
    vehicleTypes: ['road bike', 'mountain bike', 'gravel bike'],
    description: {
      en: '40mm tubeless Presta valve designed as OEM replacement for tubeless-ready rims. Fixed oblong rubber base prevents valve rotation during installation and provides better sealing than conical bases due to larger surface contact area.',
      'zh-TW': '40mm 無內胎法式氣嘴閥，專為 OEM 替換設計。固定橢圓形膠座可防止安裝時氣嘴旋轉，且比錐形膠座有更大接觸面積，密封性更佳。',
    },
    technicalDescription: {
      en: 'Compatible with DT Swiss and Giant Bicycles rims. Fixed oblong rubber base eliminates the common issue of valve rotation and pulling-through during tire mounting. Rim height compatibility up to 25mm.',
      'zh-TW': '相容 DT Swiss 及 Giant Bicycles 輪圈。固定橢圓膠座解決了安裝時氣嘴旋轉及穿出的常見問題。適用輪圈高度 25mm 以下。',
    },
    faq: [
      {
        q: {
          en: 'What rims are compatible with the FVRa valve?',
          'zh-TW': 'FVRa 氣嘴閥相容哪些輪圈？',
        },
        a: {
          en: 'The FVRa is designed for tubeless-ready rims with 6.5-7.5mm valve holes and up to 25mm rim height. It is compatible with DT Swiss and Giant Bicycles rims.',
          'zh-TW': 'FVRa 專為氣嘴孔徑 6.5-7.5mm、輪圈高度 25mm 以下的無內胎輪圈設計，相容 DT Swiss 及 Giant Bicycles 輪圈。',
        },
      },
    ],
    images: [
      '/images/products/bicycle/FVRa.jpg',
    ],
    relatedProducts: ['FVRb', 'FV', 'W-CAP1'],
    manufacturingCapabilities: ['CNC', 'plating'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'FVRb',
    name: {
      en: 'FVRb — Advanced Tubeless Presta Valve with Fixed Oblong Base',
      'zh-TW': 'FVRb — 進階型固定橢圓膠座法式無內胎氣嘴閥',
    },
    family: 'bicycle-tubeless-valve',
    valveType: 'presta',
    rimHoleDiameter: '6.5-7.5mm',
    effectiveLength: '40-100mm (10 variants)',
    material: 'Brass (Cu) or Anodized Aluminum (Al)',
    finish: 'Bronze / Nickel / Chrome / Anodized (multiple colors)',
    installationType: 'snap-in',
    valveCore: 'removable',
    standards: ['NSS 336'],
    application: 'bicycle',
    vehicleTypes: ['road bike', 'mountain bike', 'gravel bike', 'e-bike'],
    description: {
      en: 'Advanced tubeless Presta valve with improved flow and enhanced sealing. Solid extruded rod stem construction is 50-200% stronger than hollow tube competitors. Available in 40-100mm lengths in both brass and aluminum.',
      'zh-TW': '進階版無內胎法式氣嘴閥，提升流量與密封性能。實心擠壓桿體比競品空心管強 50-200%。提供 40-100mm 銅及鋁兩種材質。',
    },
    technicalDescription: {
      en: 'Larger internal diameter than FVRa for improved sealant flow. Solid extruded rod stem (50-200% stronger than hollow tube competitors). Passed NSS 336 (Neutral Salt Spray) test — 336 hours equivalent to 1,680 beach-exposure days or 14 years natural environment.',
      'zh-TW': '內徑大於 FVRa，改善補胎液流動性。實心擠壓桿（比空心管競品強 50-200%）。通過 NSS 336 鹽霧測試 — 336 小時等同海邊暴露 1,680 天或自然環境 14 年。',
    },
    faq: [
      {
        q: {
          en: 'How is the FVRb different from the FVRa?',
          'zh-TW': 'FVRb 和 FVRa 有什麼差別？',
        },
        a: {
          en: 'The FVRb has a larger internal diameter for better sealant flow, superior corrosion resistance, and is available in more lengths (40-100mm) and materials (brass + aluminum). The FVRa is the basic model available only in 40mm brass.',
          'zh-TW': 'FVRb 內徑更大，補胎液流動性更好，防腐蝕性能更優，且提供更多長度（40-100mm）及材質（銅+鋁）選擇。FVRa 為基本款，僅有 40mm 銅製。',
        },
      },
    ],
    images: [
      '/images/products/bicycle/FVRb.jpg',
    ],
    relatedProducts: ['FVRa', 'FV', 'FVTH'],
    manufacturingCapabilities: ['CNC', 'extrusion', 'anodizing', 'plating'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'FV',
    name: {
      en: 'FV — Universal Tubeless Presta Valve (Patented Double Taper Base)',
      'zh-TW': 'FV — 通用型無內胎法式氣嘴閥（專利雙錐膠座）',
    },
    family: 'bicycle-tubeless-valve',
    valveType: 'presta',
    rimHoleDiameter: '6-7.5mm',
    effectiveLength: '40-120mm (8 variants)',
    material: 'Anodized Aluminum',
    finish: 'Anodized (multiple colors)',
    installationType: 'snap-in',
    valveCore: 'removable',
    standards: ['NSS 336'],
    application: 'bicycle',
    vehicleTypes: ['road bike', 'mountain bike', 'gravel bike', 'e-bike'],
    description: {
      en: 'Universal tubeless Presta valve with patented double tapered round rubber base design. Compatible with both tubeless-ready and conversion rims. Solid extruded rod stem is 50-200% stronger than competitors.',
      'zh-TW': '通用型無內胎法式氣嘴閥，採用專利雙錐圓形膠座設計。同時相容無內胎專用及改裝輪圈。實心擠壓桿比競品強 50-200%。',
    },
    faq: [
      {
        q: {
          en: 'Can the FV valve be used on non-tubeless rims?',
          'zh-TW': 'FV 氣嘴閥可以用在非無內胎輪圈上嗎？',
        },
        a: {
          en: 'Yes, the FV features a patented double tapered rubber base that works with both tubeless-ready rims and conversion rims (non-tubeless rims converted with tubeless tape).',
          'zh-TW': '可以。FV 採用專利雙錐膠座設計，同時適用於無內胎專用輪圈及改裝輪圈（用無內胎膠帶改裝的一般輪圈）。',
        },
      },
    ],
    images: [
      '/images/products/bicycle/FV.jpg',
    ],
    relatedProducts: ['FVTH', 'FVRb', 'W-CAP1'],
    manufacturingCapabilities: ['CNC', 'extrusion', 'anodizing', 'vulcanization'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'FVTH',
    name: {
      en: 'FVTH — Tire Insert Compatible Tubeless Presta Valve',
      'zh-TW': 'FVTH — 防刺內襯相容無內胎法式氣嘴閥',
    },
    family: 'bicycle-tubeless-valve',
    valveType: 'presta',
    rimHoleDiameter: '6-7.5mm',
    effectiveLength: '40-100mm (7 variants)',
    material: 'Anodized Aluminum',
    finish: 'Anodized — 9 colors: Titanium, Standard, Black, Red, Orange, Gold, Green, Blue, Purple',
    installationType: 'snap-in',
    valveCore: 'removable',
    pressureRange: 'High flow optimized',
    standards: ['NSS 336'],
    application: 'bicycle',
    vehicleTypes: ['mountain bike', 'enduro', 'downhill', 'gravel bike'],
    description: {
      en: 'Tubeless Presta valve specifically designed for tire insert compatibility. Features patented T-shaped 3-hole high flow air passageway and 2-stairs surrounded gap for enhanced sealant flow with tire inserts. Patented 4mm hex key slot for easy installation.',
      'zh-TW': '專為防刺內襯（tire insert）相容性設計的無內胎法式氣嘴閥。採用專利 T 形三孔高流量氣道及雙階環繞間隙設計，搭配防刺內襯時補胎液流動性更佳。專利 4mm 六角孔方便安裝。',
    },
    faq: [
      {
        q: {
          en: 'What makes the FVTH different from regular tubeless valves?',
          'zh-TW': 'FVTH 和一般無內胎氣嘴有什麼不同？',
        },
        a: {
          en: 'The FVTH features a patented T-shaped 3-hole high flow passageway and 2-stairs surrounded gap specifically designed to work with tire inserts like CushCore, Vittoria Air-Liner, etc. Regular valves can get blocked by tire inserts.',
          'zh-TW': 'FVTH 採用專利 T 形三孔高流量氣道及雙階環繞間隙，專為搭配 CushCore、Vittoria Air-Liner 等防刺內襯設計。一般氣嘴容易被防刺內襯堵住。',
        },
      },
    ],
    images: [
      '/images/products/bicycle/FVTH.jpg',
    ],
    relatedProducts: ['FV', 'FVRb', 'W-CAP1'],
    manufacturingCapabilities: ['CNC', 'extrusion', 'anodizing'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'VA',
    name: {
      en: 'VA — Tubeless Schrader/American Bicycle Valve',
      'zh-TW': 'VA — 無內胎美式自行車氣嘴閥',
    },
    family: 'bicycle-tubeless-valve',
    valveType: 'schrader',
    rimHoleDiameter: '8-9mm',
    effectiveLength: '43mm',
    material: 'Brass (Cu) or Anodized Aluminum',
    finish: 'Bronze / Nickel / Chrome / Anodized',
    installationType: 'snap-in',
    valveCore: 'removable',
    standards: ['TRA', 'ETRTO'],
    application: 'bicycle',
    vehicleTypes: ['mountain bike', 'e-bike', 'city bike'],
    description: {
      en: 'Tubeless Schrader valve with removable round conical rubber base design. Universal compatibility with tubeless-ready and conversion rims. Available in brass and aluminum with multiple finish options.',
      'zh-TW': '無內胎美式氣嘴閥，採用可拆式圓錐膠座設計。通用相容無內胎專用及改裝輪圈。提供銅及鋁材質多種表面處理。',
    },
    faq: [
      {
        q: {
          en: 'When should I choose a Schrader valve instead of Presta for my bicycle?',
          'zh-TW': '什麼時候應該選美式氣嘴而非法式？',
        },
        a: {
          en: 'Schrader valves are preferred for mountain bikes and e-bikes due to their durability, compatibility with standard car/gas station pumps, and 8-9mm rim holes that provide stronger rim integrity. Presta is preferred for road bikes due to narrower rim holes and lighter weight.',
          'zh-TW': '登山車和電動自行車較適合美式氣嘴，因為更耐用、可用一般汽車/加油站打氣機充氣，且 8-9mm 氣嘴孔讓輪圈結構更強。公路車則偏好法式氣嘴，因為輪圈孔更窄、重量更輕。',
        },
      },
    ],
    images: [
      '/images/products/bicycle/VA.jpg',
    ],
    relatedProducts: ['FV', 'FVRb', 'VHR'],
    manufacturingCapabilities: ['CNC', 'plating', 'anodizing', 'vulcanization'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
  {
    sku: 'W-CAP1',
    name: {
      en: 'W-CAP1 — Patented 3-in-1 Wrenching Cap',
      'zh-TW': 'W-CAP1 — 專利三合一扳手氣嘴帽',
    },
    family: 'bicycle-tubeless-valve',
    material: 'Aluminum alloy',
    finish: 'Anodized (multiple colors)',
    standards: [],
    application: 'bicycle',
    description: {
      en: 'Patented 3-in-1 wrenching cap: dust-proof cap + valve core installation/removal tool + valve extender installation/removal tool. Aluminum alloy construction replaces the need for separate tools.',
      'zh-TW': '專利三合一扳手氣嘴帽：防塵帽 + 氣嘴芯安裝/拆卸工具 + 延長管安裝/拆卸工具。鋁合金材質，一帽取代三個工具。',
    },
    images: [
      '/images/products/bicycle/W-CAP1.jpg',
    ],
    relatedProducts: ['W-CAP2', 'FVRb', 'FVTH'],
    status: 'active',
    updatedAt: '2026-03-13',
  },
];
