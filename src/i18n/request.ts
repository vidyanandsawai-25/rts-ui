/**
 * i18n Request Configuration
 * Server-side locale detection and message loading
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, Locale } from './config';

// Validate locale and fallback to default if invalid
const validateLocale = (locale: string | undefined): Locale => {
  return locale && locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
};

export default getRequestConfig(async ({ locale }) => {
  const validatedLocale = validateLocale(locale);

  // Load all translation files
  const [commonMessages, dashboardMessages, constructionMessages, modulesMessages,taxzoneMessages,quickDataEntryMessages] = await Promise.all([
    import(`./locales/${validatedLocale}/common.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/dashboard.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/construction.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/modules.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/taxzone.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/quickDataEntry.json`).then((m) => m.default),
  ]);

  return {
    locale: validatedLocale,
    messages: {
      common: commonMessages,
      dashboard: dashboardMessages,
      construction: constructionMessages,
      modules: modulesMessages,
      quickDataEntry: quickDataEntryMessages,      
      taxZone: taxzoneMessages.taxZone,
    },
  };
});
