/**
 * Application Configuration
 * Central configuration file for the application
 *
 * Runtime values (API URL, environment, feature flags) are injected at runtime
 * via RuntimeConfigScript, allowing the same build to be deployed to different environments.
 *
 * Build-time values (version) are embedded during build via NEXT_PUBLIC_ variables.
 *
 * Server-side: reads from process.env
 * Client-side: reads from window.__RUNTIME_CONFIG__
 */

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

/**
 * Runtime configuration (from env on server, from injected script on client)
 */
export interface RuntimeConfig {
  apiBaseUrl: string;
  appEnv: string;
  authEnabled: boolean;
  featureAnalytics: boolean;
  featureDebug: boolean;
}

const defaultConfig: RuntimeConfig = {
  apiBaseUrl: 'https://localhost:7293/api',
  appEnv: 'development',
  authEnabled: false,
  featureAnalytics: false,
  featureDebug: false,
};

const isServer = typeof window === 'undefined';

/**
 * Get runtime configuration from environment variables (server-side only)
 */
export function getServerRuntimeConfig(): RuntimeConfig {
  return {
    apiBaseUrl: process.env.RUNTIME_API_BASE_URL || defaultConfig.apiBaseUrl,
    appEnv: process.env.RUNTIME_APP_ENV || defaultConfig.appEnv,
    authEnabled: process.env.RUNTIME_AUTH_ENABLED === 'true',
    featureAnalytics: process.env.RUNTIME_FEATURE_ANALYTICS === 'true',
    featureDebug: process.env.RUNTIME_FEATURE_DEBUG === 'true',
  };
}

/**
 * Get runtime configuration (server: process.env, client: window.__RUNTIME_CONFIG__)
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (isServer) {
    return getServerRuntimeConfig();
  }
  return window.__RUNTIME_CONFIG__ || defaultConfig;
}

/**
 * Log warnings in non-development when default env values are used
 */
export function validateRuntimeConfig(config: RuntimeConfig): void {
  const warnings: string[] = [];

  if (!config.apiBaseUrl || config.apiBaseUrl === defaultConfig.apiBaseUrl) {
    warnings.push('RUNTIME_API_BASE_URL is not set, using default');
  }

  if (!config.appEnv || config.appEnv === defaultConfig.appEnv) {
    warnings.push('RUNTIME_APP_ENV is not set, using default');
  }

  if (warnings.length > 0 && config.appEnv !== 'development') {
    console.warn('⚠️  Runtime Configuration Warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }
}

// Build-time version (embedded during build, not runtime)
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/**
 * Get the current application configuration
 */
export function getAppConfig() {
  const runtimeConfig = getRuntimeConfig();

  return {
    app: {
      name: 'NTIS UI',
      description: 'NTIS Platform UI',
      version: APP_VERSION,
      env: runtimeConfig.appEnv,
    },
    api: {
      baseUrl: runtimeConfig.apiBaseUrl,
      timeout: 30000,
    },
    auth: {
      enabled: runtimeConfig.authEnabled,
      tokenKey: 'auth_token',
      refreshTokenKey: 'refresh_token',
    },
    features: {
      analytics: runtimeConfig.featureAnalytics,
      debug: runtimeConfig.featureDebug,
    },
  } as const;
}

/**
 * Static app config for use in server components and metadata
 */
export const appConfig = getAppConfig();

export type AppConfig = ReturnType<typeof getAppConfig>;
