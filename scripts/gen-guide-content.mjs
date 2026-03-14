/**
 * Pre-build script: reads MDX files from content/guides/, compiles them to
 * HTML strings, cross-validates against registry, and generates
 * data/guides/content.generated.ts.
 *
 * Run: node scripts/gen-guide-content.mjs
 */
import fs from 'fs';
import path from 'path';
import { compile, run } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';

const GUIDE_DIR = path.join(process.cwd(), 'content/guides');
const OUT_FILE = path.join(process.cwd(), 'data/guides/content.generated.ts');

/* ── Zod schema for MDX frontmatter ── */

const FaqItemSchema = z.object({
  q: z.string().min(1, 'FAQ question cannot be empty'),
  a: z.string().min(1, 'FAQ answer cannot be empty'),
});

const GuideFrontmatterSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().optional(),
  description: z.string().min(1),
  seoDescription: z.string().optional(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  tags: z.array(z.string()).min(1, 'At least one tag required'),
  author: z.string().min(1),
  draft: z.boolean(),
  summary: z.string().min(1),
  directAnswer: z.string().min(10, 'directAnswer must be at least 10 chars'),
  relatedProductSlugs: z.array(z.string()).optional(),
  faq: z.array(FaqItemSchema).min(1, 'At least one FAQ item required'),
});

/* ── Parse YAML-like frontmatter (simple parser for our fields) ── */

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  // Use a simple approach: parse YAML manually for our known structure
  // We support: strings, arrays of strings, boolean, arrays of objects
  const yaml = match[1].replace(/\r\n/g, '\n');
  const result = {};
  const lines = yaml.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) { i++; continue; }

    // Top-level key: value
    const kvMatch = line.match(/^(\w[\w-]*?):\s*(.*)$/);
    if (!kvMatch) { i++; continue; }

    const key = kvMatch[1];
    let value = kvMatch[2].trim();

    if (value === 'true') {
      result[key] = true;
      i++;
    } else if (value === 'false') {
      result[key] = false;
      i++;
    } else if (value.startsWith('"') || value.startsWith("'")) {
      // Quoted string — may span multiple lines
      const quote = value[0];
      if (value.endsWith(quote) && value.length > 1) {
        result[key] = value.slice(1, -1);
      } else {
        // Multi-line quoted string
        let full = value.slice(1);
        i++;
        while (i < lines.length && !lines[i].trimEnd().endsWith(quote)) {
          full += ' ' + lines[i].trim();
          i++;
        }
        if (i < lines.length) {
          full += ' ' + lines[i].trim().slice(0, -1);
        }
        result[key] = full.trim();
      }
      i++;
    } else if (value === '' || value === undefined) {
      // Could be array or nested structure
      i++;
      const items = [];
      while (i < lines.length) {
        const itemLine = lines[i];
        // Array item: "  - value" or "  - q: ..."
        const arrayMatch = itemLine.match(/^\s+-\s+(.*)$/);
        if (!arrayMatch) break;

        const itemValue = arrayMatch[1].trim();
        // Check if it's a key:value (object array like faq)
        const objMatch = itemValue.match(/^(\w+):\s*(.*)$/);
        if (objMatch && key === 'faq') {
          // FAQ item — collect q and a
          const obj = {};
          obj[objMatch[1]] = objMatch[2].replace(/^["']|["']$/g, '');
          i++;
          // Read remaining keys of this object
          while (i < lines.length) {
            const subLine = lines[i];
            const subMatch = subLine.match(/^\s{4,}(\w+):\s*(.*)$/);
            if (!subMatch) break;
            obj[subMatch[1]] = subMatch[2].replace(/^["']|["']$/g, '');
            i++;
          }
          items.push(obj);
        } else {
          // Simple array item
          items.push(itemValue.replace(/^["']|["']$/g, ''));
          i++;
        }
      }
      result[key] = items;
    } else {
      // Unquoted string value
      result[key] = value;
      i++;
    }
  }

  return result;
}

/* ── Load registry for cross-validation ── */

async function loadRegistry() {
  const registryPath = path.join(process.cwd(), 'data/guides/registry.ts');
  const registrySource = fs.readFileSync(registryPath, 'utf-8');

  // Extract the guideEntries array using regex (simple approach for build script)
  const match = registrySource.match(/export const guideEntries:\s*GuideEntry\[\]\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not parse guideEntries from registry.ts');

  // Evaluate as JavaScript (strip TypeScript types)
  const cleaned = match[1]
    .replace(/as\s+const/g, '')
    .replace(/\/\/.*$/gm, '');
  return eval(`(${cleaned})`);
}

/* ── Main ── */

const entries = [];
const errors = [];

// Load registry
let registry;
try {
  registry = await loadRegistry();
} catch (e) {
  console.error('FATAL: Could not load registry:', e.message);
  process.exit(1);
}

// Process each guide directory
if (!fs.existsSync(GUIDE_DIR)) {
  fs.mkdirSync(GUIDE_DIR, { recursive: true });
  console.log('Created content/guides/ directory');
}

const slugDirs = fs
  .readdirSync(GUIDE_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const slug of slugDirs) {
  const slugDir = path.join(GUIDE_DIR, slug);
  const files = fs.readdirSync(slugDir).filter((f) => f.endsWith('.mdx'));

  // Find registry entry
  const regEntry = registry.find((e) => e.slug === slug);

  for (const file of files) {
    const locale = file.replace('.mdx', '');
    const raw = fs.readFileSync(path.join(slugDir, file), 'utf-8');

    // Parse and validate frontmatter
    const fm = parseFrontmatter(raw);
    if (!fm) {
      errors.push(`[${slug}/${locale}] No frontmatter found`);
      continue;
    }

    const validation = GuideFrontmatterSchema.safeParse(fm);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        errors.push(`[${slug}/${locale}] Zod: ${issue.path.join('.')}: ${issue.message}`);
      }
      continue;
    }

    // Cross-validate with registry
    if (regEntry) {
      const regFm = regEntry.frontmatter[locale];
      if (regFm) {
        if (regFm.title !== fm.title) {
          errors.push(`[${slug}/${locale}] title mismatch: registry="${regFm.title}" vs MDX="${fm.title}"`);
        }
        if (regFm.description !== fm.description) {
          errors.push(`[${slug}/${locale}] description mismatch between registry and MDX`);
        }
      }
    }

    // Compile MDX to HTML
    const body = raw.replace(/\r\n/g, '\n').replace(/^---[\s\S]*?---\s*/, '');
    try {
      const compiled = await compile(body, {
        outputFormat: 'function-body',
        remarkPlugins: [remarkGfm],
      });
      const { default: MDXContent } = await run(String(compiled), {
        ...runtime,
        baseUrl: import.meta.url,
      });
      const html = renderToStaticMarkup(MDXContent({}));
      entries.push({ slug, locale, html });
    } catch (e) {
      errors.push(`[${slug}/${locale}] MDX compile error: ${e.message}`);
    }
  }
}

// Validate registry entries have corresponding MDX files
for (const regEntry of registry) {
  for (const locale of regEntry.locales) {
    const mdxPath = path.join(GUIDE_DIR, regEntry.slug, `${locale}.mdx`);
    if (!fs.existsSync(mdxPath)) {
      errors.push(`[${regEntry.slug}/${locale}] Registry declares locale but MDX file missing: ${mdxPath}`);
    }
  }
}

// Fail on errors
if (errors.length > 0) {
  console.error('\nGuide prebuild FAILED with errors:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

// Generate output
let output = `// AUTO-GENERATED by scripts/gen-guide-content.mjs — do not edit manually\n\n`;
output += `export const guideHtmlContent: Record<string, string> = {\n`;

for (const { slug, locale, html } of entries) {
  const key = `${slug}/${locale}`;
  const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  output += `  '${key}': \`${escaped}\`,\n`;
}

output += `};\n`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, output, 'utf-8');

console.log(`Generated ${OUT_FILE} with ${entries.length} pre-compiled guide(s)`);
