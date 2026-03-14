export interface GuideFrontmatter {
  title: string;
  seoTitle?: string;
  description: string;
  seoDescription?: string;
  lastUpdated: string;
  tags: string[];
  author: string;
  draft: boolean;
  summary: string;
  directAnswer: string;
  relatedProductSlugs?: string[];
  faq: { q: string; a: string }[];
}

export interface GuideEntry {
  slug: string;
  locales: ('en' | 'zh-TW')[];
  frontmatter: {
    en?: GuideFrontmatter;
    'zh-TW'?: GuideFrontmatter;
  };
}

/**
 * Guide registry — add new entries here when creating guides.
 * Runtime source of truth for guide metadata.
 * gen-guide-content.mjs cross-validates against MDX frontmatter.
 */
export const guideEntries: GuideEntry[] = [
  {
    slug: 'valve-standards',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'Tire Valve Standards Guide: TRA vs ETRTO vs JATMA',
        description:
          'Complete guide to the three major global tire valve standards: TRA (US), ETRTO (EU), and JATMA (Japan) — differences, specifications, and applications.',
        lastUpdated: '2026-03-14',
        tags: ['valve-standards', 'tire-valve', 'oem'],
        author: 'N.S.-LIN Technical Team',
        draft: false,
        summary:
          'A comprehensive comparison of TRA, ETRTO, and JATMA tire valve standards — the three systems that govern global valve manufacturing.',
        directAnswer:
          'The three major global tire valve standards are TRA (Tire and Rim Association, North America), ETRTO (European Tyre and Rim Technical Organisation, Europe), and JATMA (Japan Automobile Tyre Manufacturers Association, Japan). While they share compatible valve dimensions, they differ in test methods, marking requirements, and certification processes. Most manufacturers like N.S.-LIN design valves that comply with all three simultaneously.',
        relatedProductSlugs: ['car-light-truck-valve', 'motorcycle-valve', 'truck-bus-valve'],
        faq: [
          {
            q: 'What is the difference between TRA, ETRTO, and JATMA tire valve standards?',
            a: 'TRA (Tire and Rim Association) sets US standards, ETRTO (European Tyre and Rim Technical Organisation) covers EU specifications, and JATMA (Japan Automobile Tyre Manufacturers Association) defines Japanese standards. While they share similar valve dimensions, they differ in test methods, marking requirements, and regional certifications.',
          },
          {
            q: 'Can one tire valve meet all three standards (TRA, ETRTO, JATMA)?',
            a: 'Yes, many manufacturers like N.S.-LIN design valves that simultaneously comply with TRA, ETRTO, and JATMA specifications, ensuring global market compatibility with a single product line.',
          },
        ],
      },
      'zh-TW': {
        title: '氣嘴閥標準指南：TRA vs ETRTO vs JATMA',
        description:
          '完整解析全球三大氣嘴閥標準體系：TRA（美國）、ETRTO（歐洲）、JATMA（日本）的差異與適用範圍。',
        lastUpdated: '2026-03-14',
        tags: ['valve-standards', 'tire-valve', 'oem'],
        author: '奕道實業技術團隊',
        draft: false,
        summary:
          '全面比較 TRA、ETRTO、JATMA 三大氣嘴閥標準體系 — 全球氣嘴閥製造的三套規範。',
        directAnswer:
          '全球氣嘴閥主要遵循三大標準體系：TRA（美國輪胎與輪圈協會）定義北美規範、ETRTO（歐洲輪胎與輪圈技術組織）定義歐洲規範、JATMA（日本汽車輪胎製造商協會）定義日本規範。三者在氣嘴閥尺寸上大致相容，但在測試方法、標記要求和認證流程上有所不同。奕道實業等製造商設計的產品同時符合三大標準。',
        relatedProductSlugs: ['car-light-truck-valve', 'motorcycle-valve', 'truck-bus-valve'],
        faq: [
          {
            q: 'TRA、ETRTO、JATMA 三大氣嘴閥標準有什麼差異？',
            a: 'TRA（美國輪胎與輪圈協會）制定北美標準、ETRTO（歐洲輪胎與輪圈技術組織）制定歐洲規範、JATMA（日本汽車輪胎製造商協會）定義日本標準。三者在氣嘴閥尺寸上大致相容，但測試方法、標記要求和區域認證有所不同。',
          },
          {
            q: '一款氣嘴閥能同時符合 TRA、ETRTO、JATMA 三大標準嗎？',
            a: '可以。奕道實業等製造商設計的氣嘴閥同時符合 TRA、ETRTO 與 JATMA 規範，確保產品在全球市場的相容性。',
          },
        ],
      },
    },
  },
  {
    slug: 'tubeless-basics',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'How Tubeless Tires Work: A Complete Guide to Tubeless Systems',
        description:
          'Everything you need to know about tubeless tire systems — how they work, key components, valve selection, installation steps, and maintenance tips.',
        lastUpdated: '2026-03-14',
        tags: ['tubeless', 'tire-valve', 'bicycle'],
        author: 'N.S.-LIN Technical Team',
        draft: false,
        summary:
          'A comprehensive guide to tubeless tire systems — from how they seal without inner tubes to choosing the right valve and maintaining your setup.',
        directAnswer:
          'A tubeless tire system eliminates the inner tube by creating an airtight seal between the tire bead and rim. The system relies on four key components: a tubeless-ready rim (or rim tape conversion), a tubeless-compatible tire, a tubeless valve, and liquid sealant. The valve allows air in while the sealant fills small punctures automatically, providing lower rolling resistance, better puncture protection, and the ability to run lower pressures for improved traction.',
        relatedProductSlugs: ['bicycle-tubeless-valve'],
        faq: [
          {
            q: 'What is the difference between tubeless and tube-type tires?',
            a: 'Tube-type tires use a separate rubber inner tube to hold air, while tubeless tires seal directly against the rim using an airtight bead and liquid sealant. Tubeless systems are lighter, more puncture-resistant (sealant fills small holes instantly), and allow lower tire pressures for better grip and comfort.',
          },
          {
            q: 'Can I convert my regular wheels to tubeless?',
            a: "Yes, most modern rims can be converted to tubeless using tubeless rim tape, a tubeless valve, sealant, and a tubeless-compatible tire. The rim tape seals the spoke holes, and the valve provides an airtight air entry point. However, rims marketed as 'tubeless-ready' provide the best results because their bead hooks are designed for an airtight tire-to-rim interface.",
          },
          {
            q: 'How often should I replace tubeless tire sealant?',
            a: 'Tubeless sealant should be checked and topped up every 2-6 months depending on climate, riding frequency, and sealant brand. In hot, dry climates sealant dries faster. Remove old dried sealant before adding fresh sealant to maintain effectiveness.',
          },
          {
            q: 'What type of valve do I need for tubeless tires?',
            a: 'You need a tubeless-specific valve with a rubber base that seals against the rim. For bicycles, Presta valves are most common (6-7.5mm rim hole). Choose valve length based on your rim depth — 40mm for standard rims, 60-80mm for mid-depth, and 100mm+ for deep-section aero rims.',
          },
        ],
      },
      'zh-TW': {
        title: '無內胎輪胎系統完全指南：原理、元件、安裝與保養',
        description:
          '從原理到實作，完整解說無內胎輪胎系統的運作方式、關鍵元件選擇、氣嘴閥安裝步驟及日常保養要點。',
        lastUpdated: '2026-03-14',
        tags: ['tubeless', 'tire-valve', 'bicycle'],
        author: '奕道實業技術團隊',
        draft: false,
        summary:
          '無內胎輪胎系統完全指南 — 從密封原理、元件選擇到安裝步驟與保養，一篇搞懂。',
        directAnswer:
          '無內胎輪胎系統取消傳統內胎，改由輪胎胎唇直接密封在輪圈上。系統由四大元件組成：無內胎專用輪圈（或以膠帶改裝的一般輪圈）、無內胎輪胎、無內胎氣嘴閥、以及補胎液。氣嘴閥是密封系統唯一的進氣口，補胎液則自動填補小型穿刺。好處包括：更低的滾動阻力、自動修補小穿孔、可跑更低胎壓以提升抓地力和舒適性。',
        relatedProductSlugs: ['bicycle-tubeless-valve'],
        faq: [
          {
            q: '無內胎和有內胎輪胎有什麼差別？',
            a: '有內胎輪胎使用獨立的橡膠內管充氣；無內胎輪胎則由輪胎胎唇直接密封在輪圈上，搭配補胎液自動填補穿孔。無內胎系統更輕、防穿刺能力更好（補胎液即時堵孔）、且可跑更低胎壓以獲得更好的抓地力和舒適性。',
          },
          {
            q: '一般輪圈可以改裝成無內胎嗎？',
            a: '可以。多數現代輪圈可用無內胎膠帶封住幅條孔，搭配無內胎氣嘴閥、補胎液和無內胎輪胎完成改裝。不過標示「Tubeless Ready」的輪圈效果最好，因為胎唇鉤設計本身就為氣密而優化。',
          },
          {
            q: '補胎液多久要更換一次？',
            a: '建議每 2-6 個月檢查並補充。炎熱乾燥氣候下補胎液乾得較快（2-3 個月），溫帶氣候約 3-4 個月，涼爽潮濕環境可延至 4-6 個月。補充前先清除舊的乾燥結塊。',
          },
          {
            q: '無內胎輪胎要用哪種氣嘴閥？',
            a: '需要底部有橡膠墊圈的無內胎專用氣嘴閥。自行車最常用法式（Presta），輪圈孔徑 6-7.5mm。選擇氣嘴長度時依輪圈高度決定 — 一般輪圈用 40mm，中深輪圈用 60-80mm，超深碳纖維輪圈用 80-100mm 以上。',
          },
        ],
      },
    },
  },
  {
    slug: 'tpms-valve-guide',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'TPMS Valve Guide: Sensor Compatibility, Types & Replacement',
        description:
          'Complete guide to TPMS tire pressure sensor valves — clamp-in vs snap-in, sensor brand compatibility, replacement intervals, and aftermarket design engineering.',
        lastUpdated: '2026-03-14',
        tags: ['tpms', 'tire-valve', 'aftermarket'],
        author: 'N.S.-LIN Technical Team',
        draft: false,
        summary:
          'Everything tire shops and distributors need to know about TPMS sensor valves — from matching valve stems to sensor brands, to understanding when replacement is needed.',
        directAnswer:
          'TPMS (Tire Pressure Monitoring System) valves are the physical valve stems that house or connect to tire pressure sensors. Unlike standard tire valves, TPMS valves must match specific sensor brands and mounting types. The three main types are clamp-in (aluminum, most common), snap-in (rubber body, primarily Ford/GM), and bolt-on (bracket-mounted). Replacement is needed every 5-10 years or when rubber seals degrade, and the valve must be compatible with the vehicle\'s sensor brand — Continental, Schrader, Huf, TRW, or Pacific.',
        relatedProductSlugs: ['tpms-sensor-valve', 'car-light-truck-valve'],
        faq: [
          {
            q: 'How do I know which TPMS valve fits my vehicle?',
            a: 'TPMS valve compatibility depends on the sensor brand installed in your vehicle. European vehicles typically use Continental/VDO or Huf/Beru sensors, American vehicles use Schrader sensors, and Japanese vehicles use Pacific or Schrader sensors. Check the existing sensor unit to identify the brand, then select a matching valve stem.',
          },
          {
            q: 'What is the difference between clamp-in and snap-in TPMS valves?',
            a: 'Clamp-in TPMS valves use an aluminum alloy stem secured with a hex nut through the rim hole. They are more durable and used on most modern vehicles. Snap-in TPMS valves have a rubber body that pushes into the rim hole, similar to standard tire valves. Snap-in types are primarily found on older Ford and GM vehicles.',
          },
          {
            q: 'How often should TPMS valves be replaced?',
            a: 'TPMS valve stems should be inspected at every tire change and replaced every 5-10 years. The EPDM rubber grommet that seals against the rim degrades over time due to heat cycling, UV exposure, and chemical contact. Signs of failure include slow air leaks, visible cracking on the rubber seal, and corrosion on aluminum stems.',
          },
          {
            q: 'Can aftermarket TPMS valves replace OE valves?',
            a: "Yes. Aftermarket TPMS valves like N.S.-LIN's SD series are engineered to be dimensionally and functionally equivalent to OE valves while using independent structural designs. They provide the same sensor compatibility and sealing performance at lower cost, making them the standard choice for tire shops performing TPMS service.",
          },
        ],
      },
      'zh-TW': {
        title: 'TPMS 氣嘴閥完全指南：感測器對應、類型與更換時機',
        description:
          'TPMS 胎壓偵測氣嘴閥技術指南 — 鎖式/嵌入式/螺栓式差異、各品牌感測器對應、更換週期與售後設計工程。',
        lastUpdated: '2026-03-14',
        tags: ['tpms', 'tire-valve', 'aftermarket'],
        author: '奕道實業技術團隊',
        draft: false,
        summary:
          '從感測器品牌對應到更換時機，TPMS 氣嘴閥技師與代理商的完整參考指南。',
        directAnswer:
          'TPMS（胎壓偵測系統）氣嘴閥是連接胎壓感測器的實體閥桿。與一般氣嘴閥不同，TPMS 氣嘴閥必須對應特定感測器品牌與安裝方式。主要分三類：鎖式（鋁合金，最常見）、嵌入式（橡膠本體，主要用於 Ford/GM）、螺栓式（支架固定）。橡膠密封件會隨時間劣化，建議每 5-10 年或每次換胎時檢查更換。選購時須確認車輛使用的感測器品牌 — Continental、Schrader、Huf、TRW 或 Pacific。',
        relatedProductSlugs: ['tpms-sensor-valve', 'car-light-truck-valve'],
        faq: [
          {
            q: '怎麼知道我的車需要哪種 TPMS 氣嘴閥？',
            a: 'TPMS 氣嘴閥的相容性取決於車上安裝的感測器品牌。歐系車多用 Continental/VDO 或 Huf/Beru，美系車用 Schrader，日系車用 Pacific 或 Schrader。拆下原有感測器確認品牌，再選擇對應的閥桿型號。',
          },
          {
            q: '鎖式和嵌入式 TPMS 氣嘴閥有什麼差別？',
            a: '鎖式（clamp-in）使用鋁合金閥桿，以六角螺帽穿過輪圈孔鎖固，耐用度高，是多數現代車款的標準配置。嵌入式（snap-in）為橡膠本體直接壓入輪圈孔，類似傳統氣嘴閥，主要見於較早期的 Ford 及 GM 車款。',
          },
          {
            q: 'TPMS 氣嘴閥多久需要更換？',
            a: '建議每次換胎時檢查，每 5-10 年更換一次。密封用的 EPDM 橡膠墊圈會因熱循環、紫外線及化學物質接觸而老化。台灣夏季高溫多濕，劣化速度可能更快。出現慢漏氣、橡膠可見裂紋或鋁桿腐蝕時應立即更換。',
          },
          {
            q: '售後 TPMS 氣嘴閥能替代原廠嗎？',
            a: '可以。奕道實業 SD 系列等售後 TPMS 氣嘴閥在尺寸與功能上與原廠等效，但採用獨立的結構設計（design-around）。提供相同的感測器相容性與密封性能，且成本更低，是輪胎行 TPMS 維修的標準選擇。',
          },
        ],
      },
    },
  },
  {
    slug: 'valve-materials',
    locales: ['en', 'zh-TW'],
    frontmatter: {
      en: {
        title: 'Tire Valve Materials Guide: Brass, Aluminum, Zinc & Rubber',
        description:
          'Technical guide to tire valve materials — comparing brass, aluminum alloy, zinc alloy, and rubber compounds for different valve applications and environments.',
        lastUpdated: '2026-03-14',
        tags: ['materials', 'tire-valve', 'engineering'],
        author: 'N.S.-LIN Technical Team',
        draft: false,
        summary:
          'A materials science guide to tire valve construction — why brass remains the standard, when aluminum makes sense, and how rubber compounds determine seal life.',
        directAnswer:
          'Tire valves use four primary materials: brass (C36000, the century-old industry standard for corrosion resistance and machinability), aluminum alloy (6061-T6 for lightweight TPMS and bicycle valves), zinc alloy (die-cast for heavy-duty truck/bus valves), and rubber compounds (EPDM for seals, rated -40 to +125 degrees Celsius). Material choice depends on the application — brass for universal durability, aluminum where weight matters, zinc for cost-effective heavy-duty service, and EPDM rubber for all weather sealing.',
        relatedProductSlugs: ['car-light-truck-valve', 'bicycle-tubeless-valve', 'truck-bus-valve', 'tpms-sensor-valve'],
        faq: [
          {
            q: 'What is the best material for tire valves?',
            a: 'Brass (C36000 free-cutting brass) remains the industry standard for most tire valve applications due to its excellent corrosion resistance, machinability, and 100+ year track record. However, aluminum alloy (6061-T6) is preferred for TPMS and bicycle valves where weight reduction matters, and zinc alloy is used for heavy-duty truck/bus valves where die-casting economics are advantageous.',
          },
          {
            q: 'Why do aluminum TPMS valves corrode?',
            a: 'Aluminum TPMS valve stems can corrode due to galvanic corrosion when in contact with dissimilar metals, particularly steel rims. Road salt, moisture, and brake dust accelerate this process. Anodizing or chrome plating provides a protective barrier, and using a proper EPDM rubber grommet isolates the aluminum from direct metal-to-metal contact with the rim.',
          },
          {
            q: 'What rubber is used in tire valve seals?',
            a: 'EPDM (Ethylene Propylene Diene Monomer) is the standard rubber compound for tire valve seals and grommets. It offers excellent resistance to weathering, ozone, UV, and temperature extremes (-40 to +125 degrees Celsius). Shore A hardness typically ranges from 60 to 75, with 65-70 being most common for snap-in valve bodies.',
          },
          {
            q: 'Does valve material affect tire pressure accuracy?',
            a: 'The valve material itself does not affect pressure accuracy, but material degradation does. A corroded aluminum stem or aged EPDM grommet can develop micro-leaks that cause gradual pressure loss. Brass valves are less susceptible to this issue due to superior corrosion resistance, which is why they remain the default for standard (non-TPMS) applications.',
          },
        ],
      },
      'zh-TW': {
        title: '氣嘴閥材質指南：黃銅、鋁合金、鋅合金與橡膠',
        description:
          '氣嘴閥材質技術指南 — 比較黃銅、鋁合金、鋅合金與橡膠化合物在不同應用場景的優劣。',
        lastUpdated: '2026-03-14',
        tags: ['materials', 'tire-valve', 'engineering'],
        author: '奕道實業技術團隊',
        draft: false,
        summary:
          '從材料科學角度解析氣嘴閥用材 — 黃銅為何百年不衰、鋁合金何時該用、橡膠配方如何決定密封壽命。',
        directAnswer:
          '氣嘴閥主要使用四種材料：黃銅（C36000 快削黃銅，百年業界標準，耐蝕且易加工）、鋁合金（6061-T6，用於 TPMS 及自行車閥以減輕重量）、鋅合金（壓鑄成型，用於大客車/貨車的經濟型重型閥）、以及橡膠化合物（EPDM 密封件，耐溫 -40 至 +125 度）。選材依應用而定 — 黃銅求耐用通用、鋁合金求輕量、鋅合金求重載成本效益、EPDM 橡膠求全天候密封。',
        relatedProductSlugs: ['car-light-truck-valve', 'bicycle-tubeless-valve', 'truck-bus-valve', 'tpms-sensor-valve'],
        faq: [
          {
            q: '氣嘴閥用什麼材質最好？',
            a: '黃銅（C36000 快削黃銅）仍是多數氣嘴閥應用的業界標準，因其優異的耐蝕性、可加工性及百年以上的使用實績。但 TPMS 及自行車閥偏好鋁合金（6061-T6）以減輕重量，大客車/貨車閥則使用鋅合金壓鑄以降低成本。',
          },
          {
            q: '為什麼鋁合金 TPMS 氣嘴閥會腐蝕？',
            a: '鋁合金 TPMS 閥桿與鋼製輪圈等異種金屬接觸時，會產生電化學腐蝕（galvanic corrosion）。路面鹽分、水氣及煞車粉塵加速此過程。陽極處理或鍍鉻可提供保護層，適當的 EPDM 橡膠墊圈也可隔離鋁桿與輪圈的直接金屬接觸。台灣高溫多濕環境下，此問題尤其值得注意。',
          },
          {
            q: '氣嘴閥密封件用的是什麼橡膠？',
            a: 'EPDM（三元乙丙橡膠）是氣嘴閥密封件與墊圈的標準材料，具備優異的耐候、抗臭氧、抗紫外線及耐溫性能（-40 至 +125 度）。Shore A 硬度通常在 60-75 之間，嵌入式閥本體最常用 65-70。',
          },
          {
            q: '閥材會影響胎壓準確性嗎？',
            a: '閥材本身不影響胎壓準確性，但材料劣化會。腐蝕的鋁桿或老化的 EPDM 墊圈可能產生微滲漏，導致胎壓緩降。黃銅閥因耐蝕性較佳，較不易發生此問題，這也是非 TPMS 標準閥仍以黃銅為主的原因。',
          },
        ],
      },
    },
  },
];
