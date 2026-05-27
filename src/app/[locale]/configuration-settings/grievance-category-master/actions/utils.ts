/**
 * Action Utilities for Grievance Category
 *
 * SECURITY NOTE (B-3):
 * `getCurrentUserId` reads the user ID from cookies in the following priority order:
 *   1. A direct `user_id` / `userId` / `login_id` cookie (set httpOnly by the auth layer).
 *   2. A JWT cookie — the payload is base64-decoded to extract the userId claim.
 *
 * The JWT path is safe ONLY because Next.js middleware validates the JWT signature
 * before any Server Action executes. If middleware validation is ever removed, this
 * function MUST be updated to use `jose` to verify the signature with AUTH_SECRET.
 *
 * AUDIT NOTE (I-6):
 * `resolveAuditUserId` now requires a `number` (not `number | undefined`).
 * Callers MUST return early if `getCurrentUserId()` returns undefined.
 * There is no fallback ID — a missing userId must halt the action.
 */
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getTranslations } from 'next-intl/server';

const DIRECT_USER_ID_COOKIE_KEYS = [
  'user_id',
  'userId',
  'login_id',
  'loginId',
  'employee_id',
  'employeeId',
] as const;

const TOKEN_COOKIE_KEYS = ['auth_token', 'access_token', 'token'] as const;

const JWT_USER_ID_CLAIM_KEYS = [
  'user_id',
  'userId',
  'id',
  'sub',
  'nameid',
  'employeeId',
  'employee_id',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
] as const;

export function parsePositiveInteger(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

/**
 * Base64URL encode for signature verification
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Verifies JWT signature using HMAC-SHA256
 */
export function verifyJWTSignature(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;

    const expectedSignature = base64UrlEncode(
      createHmac('sha256', secret).update(signatureInput).digest()
    );

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Decodes a JWT payload with signature verification using JWT_SECRET.
 * Falls back to unverified decode in development ONLY if JWT_SECRET is not set.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const jwtSecret = process.env.JWT_SECRET;

  if (jwtSecret) {
    if (!verifyJWTSignature(token, jwtSecret)) {
      return null;
    }
  } else if (process.env.NODE_ENV === 'production') {
    // CRITICAL: Signature verification is strictly required in production
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(decoded);

    if (payload && typeof payload === 'object') {
      const exp = (payload as Record<string, unknown>).exp;
      if (typeof exp === 'number' && exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired token
      }
      return payload as Record<string, unknown>;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<number | undefined> {
  const cookieStore = await cookies();

  // Priority 1: direct userId cookie (set httpOnly by auth middleware — most secure)
  for (const key of DIRECT_USER_ID_COOKIE_KEYS) {
    const cookieValue = cookieStore.get(key)?.value;
    const parsedValue = parsePositiveInteger(cookieValue);
    if (parsedValue) {
      return parsedValue;
    }
  }

  // Priority 2: extract userId from JWT payload (safe only when middleware validates signature)
  for (const key of TOKEN_COOKIE_KEYS) {
    const token = cookieStore.get(key)?.value;
    if (!token) {
      continue;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      continue;
    }

    for (const claimKey of JWT_USER_ID_CLAIM_KEYS) {
      const parsedValue = parsePositiveInteger(
        payload[claimKey] as string | number | null | undefined
      );
      if (parsedValue) {
        return parsedValue;
      }
    }
  }

  return undefined;
}

export function getGrievanceCategoryMasterPath(locale: string): string {
  return `/${locale}/configuration-settings/grievance-category-master`;
}

export function getAuditTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Returns the audit user ID.
 * Requires a verified `number` — callers must guard against undefined before calling.
 * There is NO fallback default; a missing userId must halt the action.
 */
export function resolveAuditUserId(currentUserId: number): number {
  return currentUserId;
}

export async function tGrievanceMessage(
  locale: string,
  key: string,
  fallback: string
): Promise<string> {
  try {
    const isToast = key.startsWith('master.toast.');
    const namespace = isToast ? 'grievanceCategory' : 'grievanceCategory.form.errors';

    const t = await getTranslations({ locale, namespace });
    const translated = t(key as never);
    if (!translated || translated === key || translated === `${namespace}.${key}`) {
      return fallback;
    }
    return translated;
  } catch {
    return fallback;
  }
}

export async function localizeBackendMessage(
  messageOrError: string | null | undefined,
  locale: string,
  fallbackKey: string,
  fallbackDefault: string
): Promise<string> {
  if (!messageOrError) {
    return await tGrievanceMessage(locale, fallbackKey, fallbackDefault);
  }

  const msg = messageOrError.toLowerCase();

  // 1. Duplicate
  if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('unique constraint')) {
    if (msg.includes('code')) {
      return await tGrievanceMessage(locale, 'duplicateCode', 'Category code already exists. Please use a unique code.');
    }
    if (msg.includes('name')) {
      return await tGrievanceMessage(locale, 'duplicateName', 'Category name already exists. Please use a unique name.');
    }
    return await tGrievanceMessage(locale, 'duplicateRecord', 'Grievance category already exists.');
  }

  // 2. Not Found
  if (msg.includes('not found') || msg.includes('does not exist')) {
    return await tGrievanceMessage(locale, 'recordNotFound', 'Grievance category not found.');
  }

  // 3. Dependency Conflict
  if (
    msg.includes('conflict') || 
    msg.includes('association') || 
    msg.includes('associated') || 
    msg.includes('dependency') || 
    msg.includes('dependent') ||
    msg.includes('foreign key') ||
    msg.includes('cannot delete') ||
    msg.includes('referenced')
  ) {
    return await tGrievanceMessage(locale, 'dependencyExists', 'Cannot delete/modify because associated grievances or records exist.');
  }

  // 4. Unauthorized
  if (msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('invalid token') || msg.includes('expired')) {
    return await tGrievanceMessage(locale, 'unauthorized', 'Unauthorized. Please log in.');
  }

  return await tGrievanceMessage(locale, fallbackKey, fallbackDefault);
}

