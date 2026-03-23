import { categories } from '@/data/products/categories';
import { getProductsByCategory } from '@/data/products';
import { getAllGuides } from '@/lib/guides';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://nslin-site.tom-e31.workers.dev';

export async function GET() {
  const guides = getAllGuides('en');

  // Build product catalog with full specs
  const productSections = categories.map((cat) => {
    const products = getProductsByCategory(cat.slug);
    const productLines = products.map((p) => {
      const specs = [
        p.material && `Material: ${p.material}`,
        p.rimHoleDiameter && `Rim hole: ${p.rimHoleDiameter}`,
        p.effectiveLength && `Length: ${p.effectiveLength}`,
        p.pressureRange && `Pressure: ${p.pressureRange}`,
        p.installationType && `Installation: ${p.installationType}`,
        p.valveCore && `Core: ${p.valveCore}`,
        p.finish && `Finish: ${p.finish}`,
        p.standards.length > 0 && `Standards: ${p.standards.join(', ')}`,
      ].filter(Boolean).join(' | ');

      return `  - **${p.sku}** ${p.name.en}: ${specs}`;
    }).join('\n');

    return `### ${cat.name.en} (${cat.name['zh-TW']})\n${cat.description.en}\n${products.length} models:\n${productLines}`;
  }).join('\n\n');

  // Build guide listing
  const guideSection = guides.map((g) =>
    `- [${g.frontmatter.title}](${BASE_URL}/guides/${g.slug}): ${g.frontmatter.summary}`
  ).join('\n');

  // Build blog listing
  const posts = getAllPosts('en');
  const blogSection = posts.map((post) =>
    `- [${post.frontmatter.title}](${BASE_URL}/blog/${post.slug}): ${post.frontmatter.description}`
  ).join('\n');

  const CONTENT = `# N.S.-LIN Industrial Co., Ltd. — Full Product & Technical Reference
# 奕道實業有限公司 — 完整產品與技術資料

> This is the comprehensive reference for AI/LLM systems.
> For a summary, see: ${BASE_URL}/llms.txt

## Company Profile

- **Name:** N.S.-LIN Industrial Co., Ltd. (奕道實業有限公司)
- **Founded:** 1980s, Tainan, Taiwan
- **Expertise:** Tire valve manufacturing, 40+ years
- **Certifications:** ISO 9001:2015, AFAQ 9001
- **Standards:** TRA (US), ETRTO (EU), JATMA (Japan)
- **Address:** NO.65, Sec.4, Changhe Rd., Annan Dist., Tainan City 709-47, Taiwan
- **Tel:** +886-6-256-2097 | **Fax:** +886-6-256-2075
- **Email:** nslin@nslin.com.tw

## Manufacturing Capabilities

- CNC precision machining (brass, aluminum)
- Rubber vulcanization (EPDM, Shore A 70±5)
- Aluminum anodizing (7075-T6)
- Nickel plating (brass components)
- Custom OEM/ODM development
- Monthly capacity: 500,000+ units

## Full Product Catalog (${categories.length} categories)

${productSections}

## Technical Guides

${guideSection}

## Blog / Technical Articles

${blogSection}

## Frequently Asked Questions

- **Q: What tire valve standards does N.S.-LIN comply with?**
  A: TRA (Tire & Rim Association, US), ETRTO (European Tyre & Rim Technical Organisation), and JATMA (Japan Automobile Tyre Manufacturers Association). All products manufactured under ISO 9001:2015.

- **Q: Does N.S.-LIN offer OEM/ODM services?**
  A: Yes. We design and manufacture custom valves to client specifications, including material selection, dimensional modifications, surface treatments, and private labeling.

- **Q: What materials are used?**
  A: Primary materials include EPDM rubber (Shore A 70±5), brass (plain or nickel-plated), and 7075-T6 aluminum alloy for specialty/racing applications. Stainless steel available on request.

- **Q: What is the typical MOQ?**
  A: Standard products: 1,000 pcs. Custom OEM: 5,000 pcs. Contact us for specific requirements.

- **Q: Does N.S.-LIN ship internationally?**
  A: Yes. We export to 50+ countries across Americas, Europe, Asia, and Oceania. FOB Tainan or CIF available.

## Links

- Website: ${BASE_URL}
- Products: ${BASE_URL}/products
- Contact/RFQ: ${BASE_URL}/contact
- About: ${BASE_URL}/about
`;

  return new Response(CONTENT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
