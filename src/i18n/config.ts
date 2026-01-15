/**
 * i18n Configuration
 * Defines supported locales and default locale for the application
 */

export const locales = ['en', 'hi', 'mr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
};
