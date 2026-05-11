import { ActionResponse } from '@/app/[locale]/configuration-settings/screenAccess/action.utils';

export interface FetchConfig<T> {
  condition: boolean;
  fetcher: () => Promise<ActionResponse<T>>;
  fallback: T;
  errorMessage?: string;
}

export async function executeConditionalFetches<T extends Record<string, unknown>>(configs: {
  [K in keyof T]: FetchConfig<T[K]>;
}): Promise<T> {
  const keys = Object.keys(configs) as Array<keyof T>;
  const promises = keys.map((key) => {
    const config = configs[key];
    if (config.condition) {
      return config.fetcher();
    }
    return Promise.resolve({ success: true, data: config.fallback } as ActionResponse<
      T[typeof key]
    >);
  });

  const results = await Promise.all(promises);
  const data: Partial<T> = {};

  keys.forEach((key, index) => {
    const result = results[index] as ActionResponse<T[typeof key]>;
    if (configs[key].condition && !result.success) {
      throw new Error(
        result.message || configs[key].errorMessage || `Failed to fetch data for ${String(key)}`
      );
    }
    data[key] = result.data!;
  });

  return data as T;
}
