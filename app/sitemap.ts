import type { MetadataRoute } from 'next';

const BASE_URL = 'https://nslin-site.vercel.app'; // TODO: Replace with actual domain

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/products',
  '/guides/valve-standards',
  '/guides/valve-materials',
  '/guides/tubeless-basics',
];

// Product categories — expand as we add more
const productCategories = [
  'bicycle-tubeless-valve',
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
  productCategories.forEach((cat) => {
    const enUrl = `${BASE_URL}/products/${cat}`;
    const zhUrl = `${BASE_URL}/zh-TW/products/${cat}`;
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

  // TODO: Add blog article pages (from getAllSlugs)
  // TODO: Add individual product SKU pages

  return entries;
}
