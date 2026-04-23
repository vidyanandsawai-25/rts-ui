'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { authService } from '@/lib/api/auth.service';
import { locales, defaultLocale } from '@/i18n/config';
import type { AuthLoginApiBody } from '@/types/login.types';
import type { UlbMaster } from '@/types/master.types';
import { getUlbConfigForLogin } from '@/lib/api/ulb-config.service';

// Import centralized constants and validation utilities
import {
  AUTH_COOKIES,
  ULB_COOKIES,
  LOGOUT_CLEAR_COOKIES,
  SECURE_COOKIE_OPTIONS,
  CLIENT_COOKIE_OPTIONS,
  AUTH_ERROR_CODES,
} from '@/components/modules/login/constants';
import {
  validateCredentials as validateCredentialsInput,
  mapAuthErrorToCode,
  mapValidationErrorToCode,
  AuthValidationError,
} from '@/lib/api/auth-validation';
import {
  isAuthLoginResponseShape,
  normalizeAuthLoginResponse,
  hasValidSessionTokens,
  extractUserDisplayName,
} from '@/lib/api/auth-types-guard';

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Validates and normalizes locale string.
 * @param raw - Raw locale from form data
 * @returns Valid locale string
 */
function sanitizeLocale(raw: string): string {
  return (locales as readonly string[]).includes(raw) ? raw : defaultLocale;
}

/**
 * Detects Next.js redirect errors to allow them to propagate.
 * @param e - Caught error
 * @returns True if this is a Next.js redirect
 */
function isRedirectError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'digest' in e &&
    typeof (e as { digest?: unknown }).digest === 'string' &&
    String((e as { digest: string }).digest).startsWith('NEXT_REDIRECT')
  );
}

// ---------------------------------------------------------------------------
// Cookie Management
// ---------------------------------------------------------------------------

/**
 * Fetches ULB config and applies branding cookies.
 * @param cookieStore - Next.js cookie store
 */
async function applyUlbCookiesFromApi(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<void> {
  const ulbRes = await authService.getUlbConfig();
  if (!ulbRes.success || !ulbRes.data) return;
  
  const ulb = ulbRes.data;
  const logo = (ulb.ulbLogo ?? '').trim();
  
  // Use centralized cookie names
  cookieStore.set(ULB_COOKIES.ULB_NAME, ulb.ulbName || '', CLIENT_COOKIE_OPTIONS);
  cookieStore.set(ULB_COOKIES.ULB_NAME_LOCAL, (ulb.ulbNameLocal ?? '').trim(), CLIENT_COOKIE_OPTIONS);
  cookieStore.set(ULB_COOKIES.ULB_LOGO, logo, CLIENT_COOKIE_OPTIONS);
  cookieStore.set(ULB_COOKIES.ULB_CODE, ulb.ulbCode || '', CLIENT_COOKIE_OPTIONS);
}

// ---------------------------------------------------------------------------
// Session Management
// ---------------------------------------------------------------------------

/**
 * Persists auth + ULB cookies and redirects to dashboard after successful `/Auth/login`.
 * Uses centralized cookie names and validated auth data.
 * 
 * @param locale - User's locale for redirect
 * @param auth - Normalized auth response
 * @param sessionId - Generated session ID
 * @param formUsername - Username from form (fallback for display name)
 */
async function completeLoginSession(
  locale: string,
  auth: AuthLoginApiBody,
  sessionId: string,
  formUsername: string
): Promise<never> {
  const cookieStore = await cookies();
  
  // Extract tokens (already validated by caller)
  const accessToken = (auth.token ?? '').trim();
  const refreshToken = (auth.refreshToken ?? '').trim();

  // Set secure auth cookies using centralized names
  cookieStore.set(AUTH_COOKIES.AUTH_TOKEN, accessToken, SECURE_COOKIE_OPTIONS);
  cookieStore.set(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, SECURE_COOKIE_OPTIONS);
  cookieStore.set(AUTH_COOKIES.SESSION_ID, sessionId, SECURE_COOKIE_OPTIONS);
  cookieStore.set(AUTH_COOKIES.IS_LOGGED_IN, 'true', CLIENT_COOKIE_OPTIONS);

  // Set user display name using type guard utility
  const displayName = extractUserDisplayName(auth, formUsername);
  cookieStore.set(AUTH_COOKIES.USER_NAME, displayName, CLIENT_COOKIE_OPTIONS);

  // Set user ID if valid
  const uid = auth.userId;
  if (typeof uid === 'number' && Number.isFinite(uid) && uid > 0) {
    cookieStore.set(AUTH_COOKIES.USER_ID, String(uid), SECURE_COOKIE_OPTIONS);
  }

  // Clean up pending auth state
  cookieStore.delete(AUTH_COOKIES.PENDING_AUTH);

  // Apply ULB branding cookies (non-blocking)
  try {
    await applyUlbCookiesFromApi(cookieStore);
  } catch {
    // ULB branding is optional, don't fail login
  }

  redirect(`/${locale}/dashboard`);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Validates user credentials and establishes a session on success.
 * Uses server-side validation utilities for input sanitization and
 * type guards for API response validation.
 * 
 * @param formData - Form data containing username, password, and locale
 * @returns Result object with success status and error details if failed
 */
export async function validateCredentialsAction(formData: FormData) {
  const usernameEntry = formData.get('username');
  const passwordEntry = formData.get('password');
  const localeEntry = formData.get('locale');
  const locale = sanitizeLocale(typeof localeEntry === 'string' ? localeEntry : 'en');

  // ---------------------------------------------------------------------------
  // Step 1: Validate and sanitize input using validation utilities
  // ---------------------------------------------------------------------------
  let validatedUsername: string;
  let validatedPassword: string;
  
  try {
    const validated = validateCredentialsInput(usernameEntry, passwordEntry);
    validatedUsername = validated.username;
    validatedPassword = validated.password;
  } catch (error) {
    if (error instanceof AuthValidationError) {
      return {
        success: false as const,
        errorCode: mapValidationErrorToCode(error),
        statusCode: 400,
      };
    }
    return {
      success: false as const,
      errorCode: AUTH_ERROR_CODES.CREDENTIALS_REQUIRED,
      statusCode: 400,
    };
  }

  // Generate session ID for this login attempt
  const sessionId = crypto.randomUUID();

  // ---------------------------------------------------------------------------
  // Step 2: Call authentication API
  // ---------------------------------------------------------------------------
  let response;
  try {
    response = await authService.validateCredentials({
      username: validatedUsername,
      password: validatedPassword,
    });
  } catch (error) {
    // Network or service error
    const message = error instanceof Error ? error.message : undefined;
    return {
      success: false as const,
      errorCode: mapAuthErrorToCode(503, message),
      statusCode: 503,
    };
  }

  // ---------------------------------------------------------------------------
  // Step 3: Validate API response structure
  // ---------------------------------------------------------------------------
  if (!response?.success || !response.data) {
    return {
      success: false as const,
      errorCode: mapAuthErrorToCode(response?.statusCode, response?.error),
      statusCode: response?.statusCode ?? 500,
      message: response?.error,
    };
  }

  // Validate response shape using type guard
  if (!isAuthLoginResponseShape(response.data)) {
    const t = await getTranslations({ locale, namespace: 'common' });
    return {
      success: false as const,
      errorCode: AUTH_ERROR_CODES.SERVICE_UNAVAILABLE,
      statusCode: 500,
      message: t('login.errors.invalidResponseFormat'),
    };
  }

  // Normalize the auth response for consistent field access
  const normalizedAuth = normalizeAuthLoginResponse(response.data as Record<string, unknown>);

  // ---------------------------------------------------------------------------
  // Step 4: Check authentication result
  // ---------------------------------------------------------------------------
  if (!normalizedAuth.success) {
    return {
      success: false as const,
      errorCode: mapAuthErrorToCode(401, normalizedAuth.message),
      statusCode: 401,
      message: normalizedAuth.message,
    };
  }

  // Check for password change requirement
  if (normalizedAuth.requiresPasswordChange) {
    return {
      success: false as const,
      errorCode: AUTH_ERROR_CODES.PASSWORD_CHANGE_REQUIRED,
      statusCode: 403,
      message: normalizedAuth.message,
    };
  }

  // ---------------------------------------------------------------------------
  // Step 5: Validate session tokens using type guard utility
  // ---------------------------------------------------------------------------
  if (hasValidSessionTokens(normalizedAuth)) {
    // Success - complete the login session
    await completeLoginSession(locale, normalizedAuth, sessionId, validatedUsername);
    // Note: completeLoginSession redirects and never returns
  }

  // Tokens missing or invalid
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  return {
    success: false as const,
    errorCode: AUTH_ERROR_CODES.LOGIN_FAILED,
    statusCode: 500,
    message: normalizedAuth.message || tCommon('login.errors.sessionEstablishmentFailed'),
  };
}

/**
 * Logs out the user by clearing all auth cookies and calling the logout API.
 * Uses centralized cookie list for consistency.
 * 
 * @param locale - User's locale for redirect
 */
export async function logoutAction(locale: string = 'en') {
  const safeLocale = sanitizeLocale(locale);
  const cookieStore = await cookies();
  
  // Get token using centralized cookie name
  const token = cookieStore.get(AUTH_COOKIES.AUTH_TOKEN)?.value;
  const sessionId = cookieStore.get(AUTH_COOKIES.SESSION_ID)?.value;

  // Attempt to notify server of logout (non-blocking)
  if (token) {
    try {
      await authService.logout(sessionId || '', token);
    } catch {
      // Server logout is best-effort, don't fail client logout
    }
  }

  // Clear all auth-related cookies using centralized list
  for (const name of LOGOUT_CLEAR_COOKIES) {
    cookieStore.delete({ name, path: '/' });
  }

  redirect(`/${safeLocale}/login`);
}

/**
 * SSR: council branding for the login page — delegates to
 * `getUlbConfigForLogin` in `@/lib/api/ulb-config.service` (same layering as
 * construction type: page → action → `lib/api` service).
 */
export async function fetchLoginBrandingAction(): Promise<{ ulbData: UlbMaster | undefined }> {
  const ulbData = await getUlbConfigForLogin();
  return { ulbData };
}
export type LoginCredentialsFormState = { message: string; resetKey: string } | null;

export async function loginCredentialsFormAction(
  _prev: LoginCredentialsFormState,
  formData: FormData
): Promise<LoginCredentialsFormState> {
  try {
    const result = await validateCredentialsAction(formData);
    if (result && 'success' in result && result.success === false) {
      const errorCode = result.errorCode || 'LOGIN_FAILED';
      return { message: errorCode, resetKey: crypto.randomUUID() };
    }
  } catch (e) {
    if (isRedirectError(e)) throw e;
  }
  return { message: 'LOGIN_FAILED', resetKey: crypto.randomUUID() };
}

