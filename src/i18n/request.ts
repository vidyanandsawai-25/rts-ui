/**
 * i18n Request Configuration
 * Server-side locale detection and message loading
 */

import { DEFAULT_ULB_CODE, DEFAULT_ULB_NAME } from '@/config/app.config';
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
  const [commonMessages, dashboardMessages, modulesMessages] = await Promise.all([
    import(`./locales/${validatedLocale}/common.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/dashboard.json`).then((m) => m.default),
    import(`./locales/${validatedLocale}/modules.json`).then((m) => m.default),
  ]);

  const common = {
    ...commonMessages,
    app: {
      ...commonMessages.app,
      defaultUlbCode: DEFAULT_ULB_CODE,
      defaultUlbName: DEFAULT_ULB_NAME,
    },
  };

  return {
    locale: validatedLocale,
    messages: {
      common,
      dashboard: dashboardMessages,
      modules: modulesMessages,
    },
  };
});
