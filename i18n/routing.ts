import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Extensible: add 'de', 'fr', 'es', 'it' when ready
  locales: ['en', 'zh-TW'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
