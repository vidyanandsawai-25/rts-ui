import { ActionResponse } from '@/app/[locale]/configuration-settings/screenAccess/action.utils';
import { logger } from './logger';

export interface FetchConfig<T> {
  /**
   * When false, the fetcher is skipped and fallback is returned.
   */
  condition: boolean;

  /**
   * Server/action fetcher.
   */
  fetcher: () => Promise<ActionResponse<T>>;

  /**
   * Value returned when:
   * 1. condition is false
   * 2. fetcher returns success=false
   * 3. fetcher throws an exception
   */
  fallback: T;

  /**
   * Optional message used for logging failed fetches.
   */
  errorMessage?: string;
}

export async function executeConditionalFetches<T extends Record<string, unknown>>(configs: {
  [K in keyof T]: FetchConfig<T[K]>;
}): Promise<T> {
  const data = {} as Partial<T>;
  const keys = Object.keys(configs) as Array<keyof T>;

  const activeFetches = keys.filter((key) => configs[key].condition);

  keys.forEach((key) => {
    if (!configs[key].condition) {
      data[key] = configs[key].fallback;
    }
  });

  const results = await Promise.all(
    activeFetches.map(async (key) => {
      const config = configs[key];

      try {
        const result = await config.fetcher();

        if (result.success && result.data !== undefined) {
          return {
            key,
            value: result.data,
          };
        }

        const message = config.errorMessage || result.message || `Fetch failed for ${String(key)}`;

        logger.warn(`Fetch failure. Using fallback for "${String(key)}".`, {
          message,
        });

        return {
          key,
          value: config.fallback,
        };
      } catch (error) {
        const message = config.errorMessage || `Exception during fetch for ${String(key)}`;

        logger.error(`Fetch exception. Using fallback for "${String(key)}".`, {
          message,
          error: error instanceof Error ? error : new Error(String(error)),
        });

        return {
          key,
          value: config.fallback,
        };
      }
    })
  );

  results.forEach(({ key, value }) => {
    data[key] = value;
  });

  return data as T;
}
