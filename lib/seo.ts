// TODO: Replace with actual domain once registered
const BASE_URL = 'https://nslin-site.vercel.app';

/**
 * Generate canonical + hreflang alternates (including x-default)
 */
export function seoAlternates(pathname: string, locale: string) {
  const enUrl = `${BASE_URL}${pathname}`;
  const zhUrl = `${BASE_URL}/zh-TW${pathname}`;

  return {
    canonical: locale === 'en' ? enUrl : zhUrl,
    languages: {
      en: enUrl,
      'zh-TW': zhUrl,
      'x-default': enUrl,
    },
  };
}

export { BASE_URL };
