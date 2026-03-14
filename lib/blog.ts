import { blogEntries } from '@/data/blog/registry';
import { blogHtmlContent } from '@/data/blog/content.generated';

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  tags: string[];
  author?: string;
  coverImage?: string;
  draft?: boolean;
}

export interface BlogPost {
  slug: string;
  locale: string;
  frontmatter: BlogFrontmatter;
}

export interface BlogPostWithContent extends BlogPost {
  htmlContent: string;
}

/* ── Query functions (no fs, no runtime MDX — all pre-compiled) ── */

export function getAllPosts(locale: string): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const entry of blogEntries) {
    const fm = entry.frontmatter[locale];
    if (!fm) continue;
    if (fm.draft) continue;
    posts.push({ slug: entry.slug, locale, frontmatter: fm });
  }

  posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
  return posts;
}

export function getPost(
  slug: string,
  locale: string,
): BlogPostWithContent | null {
  const entry = blogEntries.find((e) => e.slug === slug);
  if (!entry) return null;

  const frontmatter = entry.frontmatter[locale];
  if (!frontmatter) return null;

  const htmlContent = blogHtmlContent[`${slug}/${locale}`];
  if (!htmlContent) return null;

  return { slug, locale, frontmatter, htmlContent };
}

export function getAllTags(locale: string): string[] {
  const posts = getAllPosts(locale);
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.frontmatter.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export function getAllSlugs(): Array<{ slug: string; locale: string }> {
  const results: Array<{ slug: string; locale: string }> = [];
  for (const entry of blogEntries) {
    for (const locale of entry.locales) {
      results.push({ slug: entry.slug, locale });
    }
  }
  return results;
}

export function getAvailableLocales(slug: string): string[] {
  const entry = blogEntries.find((e) => e.slug === slug);
  return entry ? [...entry.locales] : [];
}

export function getAdjacentPosts(
  slug: string,
  locale: string,
): { prev: BlogPost | null; next: BlogPost | null } {
  const posts = getAllPosts(locale);
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
