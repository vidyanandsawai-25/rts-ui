import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { appConfig } from '@/config/app.config';
import { locales } from '@/i18n/config';

const USER_ID_KEY = 'user_id';

export type ActionResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  validationErrors?: Record<string, string>;
};

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(appConfig.auth.tokenKey)?.value?.trim();
  return token ? token : undefined;
}

export async function getUserId(): Promise<number | undefined> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_KEY)?.value;
  if (!userId) return undefined;
  const num = parseInt(userId, 10);
  return isNaN(num) ? undefined : num;
}

export async function performAction<T>(
  action: () => Promise<T>,
  shouldRevalidate = false
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    if (shouldRevalidate) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/configuration-settings/screenAccess`, 'page');
      }
    }
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'messages.errorOccurred';
    return { success: false, message };
  }
}
