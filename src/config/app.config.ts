/**
 * Application Configuration
 * Central configuration file for the application
 */

export const appConfig = {
  app: {
    name: 'App',
    description: 'Application',
    version: '1.0.0',
    env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:44346/api',
    timeout: 30000,
  },
  auth: {
    enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
    debug: process.env.NEXT_PUBLIC_FEATURE_DEBUG === 'true',
  },
} as const;

export type AppConfig = typeof appConfig;