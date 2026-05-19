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
    PTIS: '/property-tax/ptis',
    WATER_CONNECTION_MASTER: '/property-tax/water-connection-master',
  },
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SCREEN_ACCESS: '/configuration-settings/screenAccess',
} as const;
