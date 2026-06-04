import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  AUTH_COOKIES,
  LOGOUT_CLEAR_COOKIES,
  SECURE_COOKIE_OPTIONS,
  CLIENT_COOKIE_OPTIONS,
  SESSION_EXPIRED_LOGIN_ERROR,
  DEFAULT_SESSION_MAX_AGE_SECONDS,
} from '@/components/modules/login/constants';
import type { AuthLoginApiBody } from '@/types/login.types';
import {
  getJwtExpiryUnix,
  getSecondsUntilIsoExpiry,
  getSecondsUntilJwtExpiry,
} from '@/lib/utils/jwt-expiry';
import { getUserIdFromCookies, type CookieStoreLike } from './cookie';

export { getUserIdFromCookies };
export type { CookieStoreLike };
export type { SessionValidity, AuthSessionTokens } from './auth-session-types';

/**
 * Cookie lifetime aligned with the backend session (JWT `exp` or API `expiresAt`).
 */
export function resolveSessionMaxAgeSeconds(
  accessToken: string,
  refreshToken: string,
  expiresAt?: string | null
): number {
  const accessRemaining = getSecondsUntilJwtExpiry(accessToken);
  if (accessRemaining !== null) return Math.max(1, accessRemaining);

  if (expiresAt) {
    const apiRemaining = getSecondsUntilIsoExpiry(expiresAt);
    if (apiRemaining !== null) return Math.max(1, apiRemaining);
  }

  const refreshRemaining = getSecondsUntilJwtExpiry(refreshToken);
  if (refreshRemaining !== null) return Math.max(1, refreshRemaining);

  return DEFAULT_SESSION_MAX_AGE_SECONDS;
}

export function buildSecureCookieOptions(maxAgeSeconds: number) {
  return { ...SECURE_COOKIE_OPTIONS, maxAge: Math.max(1, maxAgeSeconds) };
}

export function buildClientCookieOptions(maxAgeSeconds: number) {
  return { ...CLIENT_COOKIE_OPTIONS, maxAge: Math.max(1, maxAgeSeconds) };
}

/**
 * Unix timestamp (seconds) when the session ends — must be in the future at login time.
 */
export function resolveSessionExpiresAtUnix(
  accessToken: string,
  refreshToken: string,
  expiresAt: string | null | undefined,
  maxAgeSeconds: number
): number {
  const nowUnix = Math.floor(Date.now() / 1000);
  const futureExps: number[] = [];

  const accessExp = getJwtExpiryUnix(accessToken);
  if (accessExp !== null && accessExp > nowUnix) futureExps.push(accessExp);

  if (expiresAt) {
    const apiRemaining = getSecondsUntilIsoExpiry(expiresAt);
    if (apiRemaining !== null) {
      futureExps.push(nowUnix + apiRemaining);
    }
  }

  const refreshExp = getJwtExpiryUnix(refreshToken);
  if (refreshExp !== null && refreshExp > nowUnix) futureExps.push(refreshExp);

  if (futureExps.length > 0) return Math.min(...futureExps);

  return nowUnix + Math.max(1, maxAgeSeconds);
}

/**
 * Clears all auth/session cookies from a Next.js cookie store (logout / expiry).
 */
export async function clearAuthSessionCookies(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<void> {
  const store = cookieStore ?? (await cookies());
  for (const name of LOGOUT_CLEAR_COOKIES) {
    store.delete({ name, path: '/' });
  }
}

/**
 * Persists tokens and profile cookies after successful login.
 * @returns Session maxAge in seconds (for ULB branding cookies).
 */
export async function persistAuthSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  auth: AuthLoginApiBody,
  sessionId: string,
  displayName: string
): Promise<number> {
  const accessToken = (auth.token ?? '').trim();
  const refreshToken = (auth.refreshToken ?? '').trim();
  const maxAge = resolveSessionMaxAgeSeconds(accessToken, refreshToken, auth.expiresAt ?? null);
  const expiresAtUnix = resolveSessionExpiresAtUnix(
    accessToken,
    refreshToken,
    auth.expiresAt ?? null,
    maxAge
  );
  const nowUnix = Math.floor(Date.now() / 1000);
  const cookieMaxAge = Math.max(1, expiresAtUnix - nowUnix);
  const secure = buildSecureCookieOptions(cookieMaxAge);
  const client = buildClientCookieOptions(cookieMaxAge);

  cookieStore.set(AUTH_COOKIES.AUTH_TOKEN, accessToken, secure);
  cookieStore.set(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, secure);
  cookieStore.set(AUTH_COOKIES.SESSION_ID, sessionId, secure);
  cookieStore.set(AUTH_COOKIES.IS_LOGGED_IN, 'true', client);
  cookieStore.set(AUTH_COOKIES.USER_NAME, displayName, client);
  cookieStore.set(AUTH_COOKIES.SESSION_EXPIRES_AT, String(expiresAtUnix), client);

  const uid = auth.userId;
  if (typeof uid === 'number' && Number.isFinite(uid) && uid > 0) {
    cookieStore.set(AUTH_COOKIES.USER_ID, String(uid), secure);
  }

  cookieStore.delete(AUTH_COOKIES.PENDING_AUTH);
  return cookieMaxAge;
}

/**
 * Server actions: clear session and redirect to login with session-expired messaging.
 */
export async function redirectToLoginSessionExpired(locale: string): Promise<never> {
  await clearAuthSessionCookies();
  redirect(`/${locale}/login?error=${SESSION_EXPIRED_LOGIN_ERROR}`);
}
