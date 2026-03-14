import { guideEntries } from '@/data/guides/registry';
import type { GuideFrontmatter, GuideEntry } from '@/data/guides/registry';
import { guideHtmlContent } from '@/data/guides/content.generated';

export type { GuideFrontmatter, GuideEntry };

export interface Guide {
  slug: string;
  locale: string;
  frontmatter: GuideFrontmatter;
}

export interface GuideWithContent extends Guide {
  htmlContent: string;
}

/* ── Query functions (no fs, no runtime MDX — all pre-compiled) ── */

/** Returns all published (non-draft) guides for a locale, sorted by lastUpdated desc */
export function getAllGuides(locale: string): Guide[] {
  const guides: Guide[] = [];

  for (const entry of guideEntries) {
    const fm = entry.frontmatter[locale as keyof typeof entry.frontmatter];
    if (!fm) continue;
    if (fm.draft) continue;
    guides.push({ slug: entry.slug, locale, frontmatter: fm });
  }

  guides.sort(
    (a, b) =>
      new Date(b.frontmatter.lastUpdated).getTime() -
      new Date(a.frontmatter.lastUpdated).getTime(),
  );
  return guides;
}

/** Returns a guide (including drafts — caller decides 404 behavior) */
export function getGuide(
  slug: string,
  locale: string,
): GuideWithContent | null {
  const entry = guideEntries.find((e) => e.slug === slug);
  if (!entry) return null;

  const frontmatter = entry.frontmatter[locale as keyof typeof entry.frontmatter];
  if (!frontmatter) return null;

  const htmlContent = guideHtmlContent[`${slug}/${locale}`];
  if (!htmlContent) return null;

  return { slug, locale, frontmatter, htmlContent };
}

/** Returns slug+locale pairs for published (non-draft) guides only */
export function getAllGuideSlugs(): Array<{ slug: string; locale: string }> {
  const results: Array<{ slug: string; locale: string }> = [];
  for (const entry of guideEntries) {
    for (const locale of entry.locales) {
      const fm = entry.frontmatter[locale as keyof typeof entry.frontmatter];
      if (fm && !fm.draft) {
        results.push({ slug: entry.slug, locale });
      }
    }
  }
  return results;
}

/** Returns available locales for a guide slug */
export function getAvailableLocales(slug: string): string[] {
  const entry = guideEntries.find((e) => e.slug === slug);
  return entry ? [...entry.locales] : [];
}
