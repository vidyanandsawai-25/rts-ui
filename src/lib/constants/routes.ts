/**
 * Application route constants
 */

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  PROPERTY_TAX: {
    SEARCH_PROPERTY: '/property-tax/search-property',
    PTIS: '/property-tax/ptis',
  },
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SCREEN_ACCESS: '/configuration-settings/screenAccess',
} as const;
