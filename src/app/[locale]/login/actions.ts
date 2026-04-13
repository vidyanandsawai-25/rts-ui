'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import 'server-only';

import { authService } from '@/lib/api/auth.service';
import type { AuthLoginApiBody, UlbConfigApiBody } from '@/types/login.types';
import type { UlbMaster } from '@/types/master.types';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
};

const CLIENT_ULB_COOKIE = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
};

function isRedirectError(e: unknown): boolean {
    return (
        typeof e === 'object' &&
        e !== null &&
        'digest' in e &&
        typeof (e as { digest?: unknown }).digest === 'string' &&
        String((e as { digest: string }).digest).startsWith('NEXT_REDIRECT')
    );
}

function mapUlbConfigApiToMaster(raw: UlbConfigApiBody): UlbMaster {
    return {
        id: raw.ulbId,
        ulbCode: raw.ulbCode,
        ulbName: raw.ulbName,
        ulbNameLocal: raw.ulbNameLocal ?? undefined,
        ulbTypeId: 1,
        isActive: true,
        ulbLogo: raw.ulbLogo ?? undefined,
        email: raw.emailId ?? undefined,
        phoneNo: raw.mobileNo ?? undefined,
        websiteUrl: raw.websiteUrl ?? undefined,
        ulbAddress: raw.ulbAddress ?? undefined,
    };
}

async function applyUlbCookiesFromApi(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<void> {
    const ulbRes = await authService.getUlbConfig();
    if (!ulbRes.success || !ulbRes.data) return;
    const ulb = ulbRes.data;
    const logo = (ulb.ulbLogo ?? '').trim();
    cookieStore.set('ulb_name', ulb.ulbName || '', CLIENT_ULB_COOKIE);
    cookieStore.set('ulb_name_local', (ulb.ulbNameLocal ?? '').trim(), CLIENT_ULB_COOKIE);
    cookieStore.set('ulb_logo', logo, CLIENT_ULB_COOKIE);
    cookieStore.set('ulb_code', ulb.ulbCode || '', CLIENT_ULB_COOKIE);
}

/**
 * Persists auth + ULB cookies and redirects to dashboard after successful `/Auth/login`.
 */
async function completeLoginSession(
    locale: string,
    auth: AuthLoginApiBody,
    sessionId: string,
    formUsername: string
): Promise<never> {
    const cookieStore = await cookies();
    const accessToken = (auth.token ?? '').trim();
    const refreshToken = (auth.refreshToken ?? '').trim();

    cookieStore.set('auth_token', accessToken, COOKIE_OPTIONS);
    cookieStore.set('refresh_token', refreshToken, COOKIE_OPTIONS);
    cookieStore.set('session_id', sessionId, COOKIE_OPTIONS);
    cookieStore.set('is_logged_in', 'true', { ...COOKIE_OPTIONS, httpOnly: false });

    const displayName = (auth.name ?? '').trim() || (auth.username ?? '').trim() || formUsername.trim();
    cookieStore.set('user_name', displayName, { ...COOKIE_OPTIONS, httpOnly: false });

    const uid = auth.userId;
    if (typeof uid === 'number' && Number.isFinite(uid) && uid > 0) {
        cookieStore.set('user_id', String(uid), COOKIE_OPTIONS);
    }

    cookieStore.delete('pending_auth');

    try {
        await applyUlbCookiesFromApi(cookieStore);
    } catch {
        /* ignore */
    }

    redirect(`/${locale}/dashboard`);
}

export async function validateCredentialsAction(formData: FormData) {
    const username = ((formData.get('username') as string) || '').trim();
    const password = (formData.get('password') as string) || '';
    const locale = (formData.get('locale') as string) || 'en';

    if (!username || !password) {
        return { success: false as const, errorCode: 'CREDENTIALS_REQUIRED' as const };
    }

    const sessionId = crypto.randomUUID();

    let response;
    try {
        response = await authService.validateCredentials({ username, password });
    } catch {
        return { success: false as const, errorCode: 'SERVICE_UNAVAILABLE' as const };
    }

    if (!response?.success) {
        return {
            success: false as const,
            errorCode: 'SERVICE_UNAVAILABLE' as const,
            message: response?.error,
        };
    }

    if (!response.data) {
        return {
            success: false as const,
            errorCode: 'SERVICE_UNAVAILABLE' as const,
            message: response.error,
        };
    }

    const apiData = response.data;

    if (!apiData.success) {
        return {
            success: false as const,
            errorCode: 'INVALID_CREDENTIALS' as const,
            message: apiData.message || response.error,
        };
    }

    const token = (apiData.token ?? '').trim();
    const refresh = (apiData.refreshToken ?? '').trim();
    const hasFullSession = token.length > 0 && refresh.length > 0;

    if (hasFullSession) {
        await completeLoginSession(locale, apiData, sessionId, username);
    }

    return {
        success: false as const,
        errorCode: 'LOGIN_FAILED' as const,
        message: apiData.message || response.error,
    };
}

export async function logoutAction(locale: string = 'en') {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    if (token) {
        try {
            await authService.logout(sessionId || '', token);
        } catch {
            /* ignore */
        }
    }

    const cookiesToClear = [
        'auth_token',
        'refresh_token',
        'session_id',
        'pending_auth',
        'is_logged_in',
        'user_name',
        'user_id',
        'ulb_name',
        'ulb_name_local',
        'ulb_logo',
        'ulb_code',
        'forgot_flow',
        'forgot_reset_otp',
    ];

    for (const name of cookiesToClear) {
        cookieStore.delete({ name, path: '/' });
    }

    redirect(`/${locale}/login`);
}

/** SSR: council branding for the login page — call from the login Server Component only. */
export async function fetchLoginBrandingAction(): Promise<{ ulbData: UlbMaster | undefined }> {
    try {
        const res = await authService.getUlbConfig();
        if (!res.success || !res.data) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(
                    '[fetchLoginBrandingAction] ULB config unavailable:',
                    res.error || 'no data',
                    '(dev: self-signed https is allowed for 127.0.0.1/localhost unless NTIS_STRICT_LOCAL_TLS=1; try SERVER_API_BASE_URL=http://…; verify GET …/UlbConfig)'
                );
            }
            return { ulbData: undefined };
        }
        return { ulbData: mapUlbConfigApiToMaster(res.data) };
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[fetchLoginBrandingAction] ULB config threw:', e);
        }
        return { ulbData: undefined };
    }
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
