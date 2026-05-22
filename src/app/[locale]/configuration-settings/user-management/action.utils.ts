import { cookies } from 'next/headers';
import { revalidateTag, revalidatePath } from 'next/cache';
import { appConfig } from '@/config/app.config';
import { getUserIdFromCookies } from '@/lib/utils/cookie';

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
  return getUserIdFromCookies(cookieStore) ?? undefined;
}

export async function performAction<T>(
  action: () => Promise<T>,
  shouldRevalidate = false
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    if (shouldRevalidate) {
      revalidateTag('user-management', 'default');
      revalidatePath('/[locale]/configuration-settings/user-management', 'layout');
    }
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'messages.errorOccurred';
    return { success: false, message };
  }
}
