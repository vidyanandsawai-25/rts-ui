/**
 * API Client Service
 * Centralized HTTP client for making API requests with built-in Auth and TLS support.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { ApiResponse } from '@/types/common.types';
import { handleHttpUnauthorized } from '@/lib/utils/session-unauthorized.server';

export const LOCAL_HTTPS_RE = /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;
interface ApiError extends Error {
  httpStatus?: number;
  rawText?: string;
}

let relaxedTlsDispatcher: unknown;

async function serverFetch(url: string, init: RequestInit): Promise<Response> {
  const useRelaxedTls =
    typeof window === 'undefined' &&
    process.env.NTIS_STRICT_LOCAL_TLS !== '1' &&
    (LOCAL_HTTPS_RE.test(url) ||
      process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ||
      process.env.NODE_ENV === 'development');

  if (useRelaxedTls) {
    const { Agent, fetch: uFetch } = await import('undici');
    relaxedTlsDispatcher ??= new Agent({ connect: { rejectUnauthorized: false } });
    return uFetch(url, {
      ...init,
      body: init.body ?? undefined,
      dispatcher: relaxedTlsDispatcher,
    } as unknown as import('undici').RequestInit) as unknown as Promise<Response>;
  }
  return fetch(url, init);
}

class ApiClient {
  private timeout: number;
  private publicEndpoints = [
    '/Auth/login',
    '/Auth/verify-otp',
    '/Auth/verify-login-otp',
    '/Auth/forgot-password',
    '/Auth/reset-password',
    '/Auth/send-otp',
    '/Auth/resend-otp',
    '/Auth/refresh',
    '/Auth/validate-reset-token',
    '/UlbConfig',
    '/ApprovalFlowMaster',
    '/RTSDepartment',
    '/RTSService',
    '/RTSPayment',
    '/RTSCitizenSession',
    '/RTSApplication',
    '/RTSApplicationDocument',
    '/RTSApplicationTracking',
    '/rts-certificate',
    '/rts-certificate-verification',
    '/rts-service-officers',
  ];

  constructor() {
    this.timeout = 30000;
  }

  private getBaseUrl(): string {
    const config = getAppConfig();
    return config.api.baseUrl;
  }

  private getTimeout(): number {
    const config = getAppConfig();
    return config.api.timeout || this.timeout;
  }

  private isPublicEndpoint(endpoint: string): boolean {
    let path = endpoint.toLowerCase().split('?')[0];
    if (path.startsWith('/api/')) {
      path = path.substring(4);
    } else if (path.startsWith('api/')) {
      path = '/' + path.substring(4);
    }
    return this.publicEndpoints.some(
      (pe) => path === pe.toLowerCase() || path.startsWith(pe.toLowerCase() + '/')
    );
  }

  private async getAuthHeaders(
    options: RequestInit,
    skipAuth: boolean
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json, text/plain, */*',
      'Accept-Charset': 'utf-8',
      ...(options.headers as Record<string, string>),
    };
    if (skipAuth) {
      try {
        const store = await cookies();
        const token = store.get('auth_token')?.value;
        const has = (n: string) =>
          Object.keys(headers).some((k) => k.toLowerCase() === n.toLowerCase());
        if (token && !has('authorization')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {}
      return headers;
    }

    try {
      const store = await cookies();
      const has = (n: string) =>
        Object.keys(headers).some((k) => k.toLowerCase() === n.toLowerCase());

      const token = store.get('auth_token')?.value;
      if (token && !has('authorization')) headers['Authorization'] = `Bearer ${token}`;

      const csrf = store.get('csrf_token')?.value;
      if (csrf && !has('x-csrf-token') && /POST|PUT|DELETE|PATCH/.test(options.method || 'GET')) {
        headers['X-CSRF-Token'] = csrf;
      }

      const cookieStr = store
        .getAll()
        .filter((c) =>
          /auth_token|refresh_token|session_id|csrf_token|\.AspNetCore\.Antiforgery/.test(c.name)
        )
        .map(
          (c) => `${c.name.replace(/[^\x00-\x7F]/g, '')}=${c.value.replace(/[^\x00-\x7F]/g, '')}`
        )
        .join('; ');
      if (cookieStr && !has('cookie')) headers['Cookie'] = cookieStr;
    } catch {}
    return headers;
  }

  private async parseResponseBody<T>(response: Response): Promise<T | undefined> {
    if (response.status === 204 || response.headers.get('Content-Length') === '0') return undefined;
    const text = await response.text();
    if (!text?.trim()) return undefined;

    const isJson = (response.headers.get('Content-Type') ?? '').includes('application/json');
    if (!isJson) {
      if (response.ok) return undefined;
      const err = new Error(text.trim() || response.statusText || 'An error occurred') as ApiError;
      err.httpStatus = response.status;
      err.rawText = text;
      throw err;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      if (response.ok) return undefined;
      const err = new Error(
        `Invalid JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`
      ) as ApiError;
      err.httpStatus = response.status;
      throw err;
    }
  }

  private extractErrorMessage(errBody: unknown, statusText: string): string {
    if (typeof errBody === 'string' && errBody.trim()) {
      return errBody.trim();
    }

    const body = errBody as Record<string, unknown> | null | undefined;

    // First check for specific error messages in the errors object (e.g., validation errors)
    // Ensure errors is a plain object (not an array) before treating it as a key/value map
    if (body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)) {
      const errors = body.errors as Record<string, unknown>;
      // Check for General error first, then other error keys
      const errorKeys = ['General', ...Object.keys(errors).filter((k) => k !== 'General')];
      for (const key of errorKeys) {
        const errorValue = errors[key];
        if (typeof errorValue === 'string' && errorValue.trim()) {
          return errorValue.trim();
        }
        // Handle array of error messages
        if (Array.isArray(errorValue) && errorValue.length > 0) {
          const firstError = errorValue[0];
          if (typeof firstError === 'string' && firstError.trim()) {
            return firstError.trim();
          }
        }
      }
    }

    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      const firstErr = body.errors[0];
      if (typeof firstErr === 'string' && firstErr.trim()) return firstErr.trim();
      if (typeof firstErr === 'object' && firstErr !== null && 'message' in firstErr) {
        const msg = (firstErr as { message?: string }).message;
        if (msg?.trim()) return msg.trim();
      }
    }

    // Fall back to standard error message fields
    const candidates = [
      body?.message,
      body?.error,
      body?.errorMessage,
      body?.detail,
      body?.title,
      body?.ExceptionMessage,
      body?.exceptionMessage,
      body?.messageDetail,
      statusText,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
    }
    return 'An error occurred';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true
  ): Promise<ApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const timeout = this.getTimeout();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const skipAuth = !requireAuth || this.isPublicEndpoint(endpoint);

    try {
      const headers = await this.getAuthHeaders(options, skipAuth);
      let cleanEndpoint = endpoint.replace(/^\//, '');
      const trimmedBase = baseUrl.replace(/\/$/, '');
      if (trimmedBase.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
        cleanEndpoint = cleanEndpoint.substring(4);
      }
      const url = `${trimmedBase}/${cleanEndpoint}`;

      const cleanHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(
        ([k, v]) => (cleanHeaders[k] = String(v).replace(/[^\x00-\x7F]/g, ''))
      );

      const response = await serverFetch(url, {
        cache: 'no-store',
        ...options,
        signal: controller.signal,
        headers: cleanHeaders,
      });

      clearTimeout(timeoutId);

      const data = await this.parseResponseBody<T>(response);
      if (!response.ok) {
        if (response.status === 401) {
          if (!skipAuth) {
            const hadAuth = !!headers['Authorization'] || !!headers['authorization'];
            await handleHttpUnauthorized(401, hadAuth);
          }
          const errorMsg = (data as { message?: string })?.message || 'Invalid credentials';
          return {
            success: false,
            statusCode: 401,
            error: skipAuth ? errorMsg : 'Unauthorized: Token expired or invalid',
          };
        }
        if (response.status === 403)
          return { success: false, statusCode: 403, error: 'Forbidden: Access denied' };
        return {
          success: false,
          statusCode: response.status,
          error: this.extractErrorMessage(data, response.statusText),
        };
      }
      return { success: true, statusCode: response.status, data: data as T };
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        typeof (error as { digest?: unknown }).digest === 'string' &&
        String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')
      ) {
        throw error;
      }
      const err = error as ApiError;
      if (err.name === 'AbortError')
        return { success: false, statusCode: 408, error: 'Request timeout' };
      return {
        success: false,
        ...(err.httpStatus ? { statusCode: err.httpStatus } : {}),
        error: err.message || 'Network error',
      };
    }
  }

  async fetch(endpoint: string, options: RequestInit = {}, requireAuth = true): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const skipAuth = !requireAuth || this.isPublicEndpoint(endpoint);

    try {
      const headers = await this.getAuthHeaders(options, skipAuth);
      const url = `${this.getBaseUrl().replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

      const cleanHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(
        ([k, v]) => (cleanHeaders[k] = String(v).replace(/[^\x00-\x7F]/g, ''))
      );

      const response = await serverFetch(url, {
        cache: 'no-store',
        ...options,
        signal: controller.signal,
        headers: cleanHeaders,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get<T>(url: string, opt?: RequestInit, auth = true) {
    return this.request<T>(url, { ...opt, method: 'GET' }, auth);
  }
  async post<T>(url: string, body?: unknown, opt?: RequestInit, auth = true) {
    return this.request<T>(url, { ...opt, method: 'POST', body: JSON.stringify(body) }, auth);
  }
  async put<T>(url: string, body?: unknown, opt?: RequestInit, auth = true) {
    return this.request<T>(url, { ...opt, method: 'PUT', body: JSON.stringify(body) }, auth);
  }
  async patch<T>(url: string, body?: unknown, opt?: RequestInit, auth = true) {
    return this.request<T>(url, { ...opt, method: 'PATCH', body: JSON.stringify(body) }, auth);
  }
  async delete<T>(url: string, opt?: RequestInit, auth = true) {
    return this.request<T>(url, { ...opt, method: 'DELETE' }, auth);
  }
}

export const apiClient = new ApiClient();
