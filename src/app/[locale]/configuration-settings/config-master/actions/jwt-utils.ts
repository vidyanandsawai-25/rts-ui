import { createHmac, timingSafeEqual } from 'crypto';
import { UserRole } from '@/types/common.types';

/**
 * Base64URL decode (JWT uses base64url encoding)
 */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Base64URL encode for signature comparison
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Verify JWT signature using HMAC-SHA256
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
 * Decode JWT payload
 */
export function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = base64UrlDecode(parts[1]);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract user information from JWT payload
 */
export function extractPayload(payload: Record<string, unknown>) {
  const userId =
    payload.userId ||
    payload.sub ||
    payload.id ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload.nameidentifier;

  if (!userId) return null;

  const rawRoleValue = payload.role || 
                       payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                       payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
  
  const roles = Array.isArray(rawRoleValue) 
    ? rawRoleValue.map(String) 
    : [String(rawRoleValue || 'USER')];

  const recognizedRoles = [UserRole.ADMIN, UserRole.USER, UserRole.GUEST];
  let role = UserRole.USER;

  for (const r of recognizedRoles) {
    if (roles.some(val => val.toUpperCase() === r)) {
      role = r;
      break;
    }
  }

  return {
    userId: Number(userId),
    email:
      (payload.email as string) ||
      (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string),
    role,
    exp: payload.exp as number | undefined,
  };
}
