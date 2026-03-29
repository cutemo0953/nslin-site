import type { MetadataRoute } from 'next';
import { categories } from '@/data/products/categories';
import { getAllProductSlugs } from '@/data/products';
import { getAllSlugs as getAllBlogSlugs } from '@/lib/blog';
import { getAllGuideSlugs } from '@/lib/guides';

const BASE_URL = 'https://nslin-site.tom-e31.workers.dev';

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/products',
  '/blog',
  '/guides',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes (both locales)
  staticRoutes.forEach((route) => {
    const enUrl = `${BASE_URL}${route}`;
    const zhUrl = `${BASE_URL}/zh-TW${route}`;

    entries.push({
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: route === '/' ? 'weekly' : 'monthly',
      priority: route === '/' ? 1.0 : 0.8,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });

    entries.push({
      url: zhUrl,
      lastModified: new Date(),
      changeFrequency: route === '/' ? 'weekly' : 'monthly',
      priority: route === '/' ? 1.0 : 0.8,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
  });

  // Product category pages
  categories.forEach((cat) => {
    const enUrl = `${BASE_URL}/products/${cat.slug}`;
    const zhUrl = `${BASE_URL}/zh-TW/products/${cat.slug}`;
    entries.push({
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
    entries.push({
      url: zhUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
  });

  // Product SKU pages
  const productSlugs = getAllProductSlugs();
  productSlugs.forEach(({ category, sku }) => {
    const enUrl = `${BASE_URL}/products/${category}/${sku}`;
    const zhUrl = `${BASE_URL}/zh-TW/products/${category}/${sku}`;
    entries.push({
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
    entries.push({
      url: zhUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
  });

  // Blog article pages
  const blogSlugs = getAllBlogSlugs();
  const slugSet = new Set(blogSlugs.map((b) => b.slug));
  slugSet.forEach((slug) => {
    const enUrl = `${BASE_URL}/blog/${slug}`;
    const zhUrl = `${BASE_URL}/zh-TW/blog/${slug}`;
    entries.push({
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
    entries.push({
      url: zhUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
  });

  // Guide pages (dynamic from registry, excludes drafts)
  const guideSlugs = getAllGuideSlugs();
  const guideSlugSet = new Set(guideSlugs.map((g) => g.slug));
  guideSlugSet.forEach((slug) => {
    const enUrl = `${BASE_URL}/guides/${slug}`;
    const zhUrl = `${BASE_URL}/zh-TW/guides/${slug}`;
    entries.push({
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
    entries.push({
      url: zhUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: { en: enUrl, 'zh-TW': zhUrl, 'x-default': enUrl },
      },
    });
  });

  return entries;
}
