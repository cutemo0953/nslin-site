// Canonical host; www + workers.dev 301 here via middleware.
const BASE_URL = 'https://nslin.com';

// Strip trailing slash so canonical/hreflang match the served URL
// (trailingSlash off; /zh-TW/ would 308-redirect). Bare root stays the host.
function norm(url: string): string {
  return url.replace(/\/+$/, '') || BASE_URL;
}

/**
 * Generate canonical + hreflang alternates (including x-default)
 */
export function seoAlternates(pathname: string, locale: string) {
  const enUrl = norm(`${BASE_URL}${pathname}`);
  const zhUrl = norm(`${BASE_URL}/zh-TW${pathname}`);

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
