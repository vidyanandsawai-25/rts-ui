import { cookies, headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { UserRole } from '@/types/common.types';
import { locales } from '@/i18n/config';
import { 
  verifyJWTSignature, 
  decodeJWTPayload, 
  extractPayload 
} from './jwt-utils';

function normalizeHost(value: string | null): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

/**
 * Basic same-origin guard for Server Actions.
 * Mitigates cross-site POST attempts when cookies are present.
 */
export async function verifyRequestOrigin(): Promise<void> {
  const headersList = await headers();
  const origin = headersList.get('origin');

  // Non-browser/internal calls may not send origin; allow those.
  if (!origin) return;

  let originHost = '';
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    throw new Error('Forbidden. Invalid request origin.');
  }

  const host = normalizeHost(headersList.get('x-forwarded-host') || headersList.get('host'));

  if (!host || originHost !== host) {
    throw new Error('Forbidden. Cross-origin request blocked.');
  }
}

/**
 * Verify and decode JWT token
 */
async function verifyAndDecodeJWT(token: string) {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (jwtSecret) {
      if (!verifyJWTSignature(token, jwtSecret)) return null;
    } else if (process.env.NODE_ENV !== 'development') {
      // In production, JWT_SECRET is required
      return null;
    }

    const payload = decodeJWTPayload(token);
    if (!payload) return null;

    return extractPayload(payload);
  } catch {
    return null;
  }
}

/**
 * Get current locale from request headers
 */
export async function getLocaleFromHeaders(): Promise<string> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';
  const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
  const localeMatch = pathname.match(localePattern) || pathname.match(new RegExp(`https?://[^/]+/(${locales.join('|')})(/|$)`));
  return localeMatch ? localeMatch[1] : 'en';
}

export async function tConfigMessage(key: string, fallback: string): Promise<string> {
  try {
    const locale = await getLocaleFromHeaders();
    const t = await getTranslations({ locale, namespace: 'configMaster.messages' });
    const translated = t(key as never);
    if (!translated || translated === key || translated === `configMaster.messages.${key}`) {
      return fallback;
    }
    return translated;
  } catch {
    return fallback;
  }
}

/**
 * Verifies if the user has a valid session and optional role permissions.
 * For Configuration Master, any logged-in user can access and modify settings.
 * @param allowedRoles - Optional array of roles (not enforced for config master by default)
 * @throws Error if unauthorized
 * @returns userId
 */
export async function verifySession(allowedRoles?: UserRole[]): Promise<number> {
  await verifyRequestOrigin();

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Unauthorized. Please log in.');
  }

  const payload = await verifyAndDecodeJWT(token);

  if (!payload || !payload.userId) {
    throw new Error('Unauthorized. Invalid or expired token.');
  }

  // Expiration check
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Unauthorized. Token has expired.');
  }

  // Role verification (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(payload.role)) {
      throw new Error('Forbidden. You do not have permission to perform this action.');
    }
  }

  return payload.userId;
}

/**
 * Helpers to generate consistent audit trail data for requests.
 */
export async function getCreateAuditParams() {
  const userId = await verifySession();
  return { createdBy: userId };
}

export async function getUpdateAuditParams() {
  const userId = await verifySession();
  return { updatedBy: userId };
}

/**
 * Get current session data (role, userId) without throwing if unauthorized.
 * Useful for UI-level conditional rendering.
 */
export async function getSessionData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    return await verifyAndDecodeJWT(token);
  } catch {
    return null;
  }
}

/**
 * Get current user role.
 */
export async function getSessionRole(): Promise<UserRole | null> {
  const data = await getSessionData();
  return data?.role || null;
}

/**
 * Process an array in chunks with a concurrency limit.
 * Useful for bulk operations to avoid overwhelming the backend.
 */
export const MAX_CONCURRENT_UPDATES = 10;
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}
