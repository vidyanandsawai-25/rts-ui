/**
 * Next.js Middleware for i18n routing
 * Handles locale detection and URL-based language routing
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // Supported locales
  locales,

  // Default locale when none specified
  defaultLocale,

  // Always show locale in URL for consistency
  // /en/dashboard = English
  // /hi/dashboard = Hindi
  // /mr/dashboard = Marathi
  localePrefix: 'always',

  // Disable auto-detection to prioritize cookie
  localeDetection: false,
});

export const config = {
  // Match all paths except API routes, Next.js internals, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
