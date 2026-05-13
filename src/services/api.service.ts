/**
 * API Client Service
 * Centralized HTTP client for making API requests with built-in Auth and TLS support.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { ApiResponse } from '@/types/common.types';

export const LOCAL_HTTPS_RE = /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;
interface ApiError extends Error {
  httpStatus?: number;
  rawText?: string;
}

let relaxedTlsDispatcher: unknown;

async function serverFetch(url: string, init: RequestInit): Promise<Response> {
  const isDev = process.env.NODE_ENV === 'development' && process.env.NTIS_STRICT_LOCAL_TLS !== '1';
  if (typeof window === 'undefined' && isDev && LOCAL_HTTPS_RE.test(url)) {
    const { Agent, fetch: uFetch } = await import('undici');
    relaxedTlsDispatcher ??= new Agent({ connect: { rejectUnauthorized: false } });
    return uFetch(url, { ...init, body: init.body ?? undefined, dispatcher: relaxedTlsDispatcher } as unknown as import('undici').RequestInit) as unknown as Promise<Response>;
  }
  return fetch(url, init);
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private publicEndpoints = [
    '/Auth/login', '/Auth/verify-otp', '/Auth/verify-login-otp', '/Auth/forgot-password',
    '/Auth/reset-password', '/Auth/send-otp', '/Auth/resend-otp', '/Auth/refresh',
    '/Auth/ulb-config', '/Auth/validate-reset-token', '/UlbConfig'
  ];

  constructor() {
    const config = getAppConfig();
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  private isPublicEndpoint(endpoint: string): boolean {
    const path = endpoint.toLowerCase().split('?')[0];
    return this.publicEndpoints.some(pe => path === pe.toLowerCase() || path.startsWith(pe.toLowerCase() + '/'));
  }

  private async getAuthHeaders(options: RequestInit, skipAuth: boolean): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      ...options.headers as Record<string, string>,
    };
    if (skipAuth) return headers;

    try {
      const store = await cookies();
      const has = (n: string) => Object.keys(headers).some(k => k.toLowerCase() === n.toLowerCase());
      
      const token = store.get('auth_token')?.value;
      if (token && !has('authorization')) headers['Authorization'] = `Bearer ${token}`;

      const csrf = store.get('csrf_token')?.value;
      if (csrf && !has('x-csrf-token') && /POST|PUT|DELETE|PATCH/.test(options.method || 'GET')) {
        headers['X-CSRF-Token'] = csrf;
      }

      const cookieStr = store.getAll()
        .filter(c => /auth_token|refresh_token|session_id|csrf_token|\.AspNetCore\.Antiforgery/.test(c.name))
        .map(c => `${c.name.replace(/[^\x00-\x7F]/g, '')}=${c.value.replace(/[^\x00-\x7F]/g, '')}`)
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
      const err = new Error(`Invalid JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`) as ApiError;
      err.httpStatus = response.status;
      throw err;
    }
  }

  private extractErrorMessage(errBody: unknown, statusText: string): string {
    const body = errBody as Record<string, unknown> | null | undefined;
    
    // First check for specific error messages in the errors object (e.g., validation errors)
    if (body?.errors && typeof body.errors === 'object') {
      const errors = body.errors as Record<string, unknown>;
      // Check for General error first, then other error keys
      const errorKeys = ['General', ...Object.keys(errors).filter(k => k !== 'General')];
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
    
    // Fall back to standard error message fields
    const candidates = [body?.message, body?.error, body?.title, body?.detail, statusText];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
    }
    return 'An error occurred';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, requireAuth = true): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const skipAuth = !requireAuth || this.isPublicEndpoint(endpoint);

    try {
      const headers = await this.getAuthHeaders(options, skipAuth);
      const url = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
      
      const cleanHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([k, v]) => cleanHeaders[k] = String(v).replace(/[^\x00-\x7F]/g, ''));

      const response = await serverFetch(url, { cache: 'no-store', ...options, signal: controller.signal, headers: cleanHeaders });
      clearTimeout(timeoutId);

      const data = await this.parseResponseBody<T>(response);
      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = (data as { message?: string })?.message || 'Invalid credentials';
          return { success: false, statusCode: 401, error: skipAuth ? errorMsg : 'Unauthorized: Token expired or invalid' };
        }
        if (response.status === 403) return { success: false, statusCode: 403, error: 'Forbidden: Access denied' };
        return { success: false, statusCode: response.status, error: this.extractErrorMessage(data, response.statusText) };
      }
      return { success: true, statusCode: response.status, data: data as T };
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error as ApiError;
      if (err.name === 'AbortError') return { success: false, statusCode: 408, error: 'Request timeout' };
      return { success: false, ...(err.httpStatus ? { statusCode: err.httpStatus } : {}), error: err.message || 'Network error' };
    }
  }

  async get<T>(url: string, opt?: RequestInit, auth = true) { return this.request<T>(url, { ...opt, method: 'GET' }, auth); }
  async post<T>(url: string, body?: unknown, opt?: RequestInit, auth = true) { 
    return this.request<T>(url, { ...opt, method: 'POST', body: JSON.stringify(body) }, auth); 
  }
  async put<T>(url: string, body?: unknown, opt?: RequestInit, auth = true) { 
    return this.request<T>(url, { ...opt, method: 'PUT', body: JSON.stringify(body) }, auth); 
  }
  async delete<T>(url: string, opt?: RequestInit, auth = true) { return this.request<T>(url, { ...opt, method: 'DELETE' }, auth); }
}

export const apiClient = new ApiClient();