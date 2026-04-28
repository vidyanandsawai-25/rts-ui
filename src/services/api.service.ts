/**
 * API Client Service
 * Centralized HTTP client for making API requests
 */

import 'server-only';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { ApiResponse } from '@/types/common.types';

const LOCAL_HTTPS_RE = /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

/** Reused for dev localhost relaxed TLS so connection pools are not recreated per request. */
let relaxedTlsDispatcher: import('undici').Dispatcher | undefined;

async function serverFetch(url: string, init: RequestInit): Promise<Response> {
  const useRelaxedTls =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    process.env.NTIS_STRICT_LOCAL_TLS !== '1' &&
    LOCAL_HTTPS_RE.test(url);

  if (useRelaxedTls) {
    const undici = await import('undici');
    if (!relaxedTlsDispatcher) {
      relaxedTlsDispatcher = new undici.Agent({ connect: { rejectUnauthorized: false } });
    }
    const res = await undici.fetch(url, {
      method: init.method,
      headers: init.headers,
      body: init.body === null ? undefined : init.body,
      signal: init.signal,
      dispatcher: relaxedTlsDispatcher,
    } as import('undici').RequestInit);
    return res as unknown as Response;
  }

  return fetch(url, { ...init });
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  // Public endpoints that don't require authorization
  private publicEndpoints: string[] = [
    '/Auth/login',
    '/Auth/verify-otp',
    '/Auth/verify-login-otp',
    '/Auth/forgot-password',
    '/Auth/reset-password',
    '/Auth/send-otp',
    '/Auth/resend-otp',
    '/Auth/refresh',
    '/Auth/ulb-config',
    '/Auth/validate-reset-token',
  ];

  constructor() {
    const config = getAppConfig();
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Check if endpoint is public (no auth required)
   */
  private isPublicEndpoint(endpoint: string): boolean {
    const normalizedEndpoint = endpoint.toLowerCase();
    return this.publicEndpoints.some(pe => 
      normalizedEndpoint.includes(pe.toLowerCase())
    );
  }

  /**
   * Get auth token from cookies (Server-side only)
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      return cookieStore.get('auth_token')?.value || null;
    } catch {
      // Not in server context or during build
      return null;
    }
  }

  /**
   * Get all cookies as a formatted string to forward to backend
   */
  private async getCookieString(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      if (allCookies.length === 0) return null;
      
      const allowedCookies = [
        'auth_token', 
        'refresh_token', 
        'session_id', 
        'csrf_token',
        '.AspNetCore.Antiforgery'
      ];
      
      const safeCookies = allCookies.filter(c => 
        allowedCookies.some(allowed => c.name.includes(allowed))
      );

      if (safeCookies.length === 0) return null;
      
      // Strict ASCII-only header encoding to prevent undici ByteString errors
      return safeCookies
        .map(c => {
          const cleanName = c.name.replace(/[^\x00-\x7F]/g, '');
          const cleanValue = c.value.replace(/[^\x00-\x7F]/g, '');
          return `${cleanName}=${cleanValue}`;
        })
        .join('; ');
    } catch {
      return null;
    }
  }

  /**
   * Get CSRF token from cookies (Server-side only)
   */
  private async getCsrfToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      return cookieStore.get('csrf_token')?.value || null;
    } catch {
      return null;
    }
  }

  /**
   * Checks if the Content-Type header indicates a JSON response.
   */
  private isJsonContentType(response: Response): boolean {
    const contentType = response.headers.get('Content-Type') ?? '';
    return contentType.includes('application/json');
  }

  /**
   * Safely parses the response body as JSON when appropriate.
   * Returns `undefined` for empty-body responses (e.g. 204 No Content)
   * or non-JSON responses instead of throwing errors.
   */
  private async parseResponseBody<T>(response: Response): Promise<T | undefined> {
    // 204 No Content – body is intentionally absent
    if (response.status === 204) {
      return undefined;
    }

    // Some servers send Content-Length: 0 with a non-204 success status
    const contentLength = response.headers.get('Content-Length');
    if (contentLength === '0') {
      return undefined;
    }

    // Read the raw text first to check if body is empty
    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined;
    }

    // For non-JSON Content-Type headers, handle based on response status
    if (!this.isJsonContentType(response)) {
      if (response.ok) {
        // Successful non-JSON response (e.g., plain text "OK" from DELETE)
        // Body already consumed above, just return undefined
        return undefined;
      }
      // Error response with non-JSON body – use text in error message
      const err = new Error(
        text.trim() || response.statusText || 'An error occurred'
      ) as Error & { httpStatus: number; rawText: string };
      err.httpStatus = response.status;
      err.rawText = text;
      throw err;
    }

    // Content-Type indicates JSON - attempt to parse
    try {
      return JSON.parse(text) as T;
    } catch {
      // JSON parsing failed. For successful responses (2xx), treat as non-JSON
      // and return undefined instead of failing the entire request.
      // This handles servers that incorrectly set Content-Type: application/json
      // for plain text responses (e.g., DELETE returning "OK" or "Deleted")
      if (response.ok) {
        // Success response but invalid JSON - treat as empty/non-JSON response
        return undefined;
      }
      
      // Error response with invalid JSON - throw error with details
      const err = new Error(
        `Invalid JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`
      ) as Error & { httpStatus: number };
      err.httpStatus = response.status;
      throw err;
    }
  }

  /**
   * Extracts a human-readable error message from a non-2xx response body.
   *
   * Priority order:
   *  1. `message`  – most REST APIs
   *  2. `error`    – Spring Boot, some Node frameworks
   *  3. `title`    – RFC 7807 Problem Details
   *  4. `detail`   – RFC 7807 Problem Details
   *  5. `response.statusText` – HTTP reason phrase (e.g. "Not Found")
   *  6. Generic fallback
   *
   * Each candidate is only used when it is a non-empty string.
   */
  private extractErrorMessage(
    errBody: Record<string, unknown> | undefined,
    statusText: string,
  ): string {
    const candidates = [
      errBody?.message,
      errBody?.error,
      errBody?.title,
      errBody?.detail,
      statusText,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim() !== '') {
        return candidate.trim();
      }
    }
    return 'An error occurred';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Check if this is a public endpoint that doesn't need auth
      const skipAuth = !requireAuth || this.isPublicEndpoint(endpoint);

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      };

      // Merge additional headers from options
      if (options.headers) {
        const additionalHeaders = options.headers as Record<string, string>;
        Object.assign(headers, additionalHeaders);
      }

      // Only add auth token for protected endpoints
      if (!skipAuth) {
        const token = await this.getAuthToken();
        const csrfToken = await this.getCsrfToken();
        const cookieString = await this.getCookieString();
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (cookieString) {
          headers['Cookie'] = cookieString;
        }

        // Add CSRF token for state-changing requests
        if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
          headers['X-CSRF-Token'] = csrfToken;
        }
      }

      const url = `${this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
      const response = await serverFetch(url, {
        ...options,
        signal: controller.signal,
        headers,
        cache: 'no-store', // SSR should not cache authenticated responses
      });

      clearTimeout(timeoutId);

      // Parse body safely – handles 204 No Content and other empty responses
      const data = await this.parseResponseBody<T>(response);

      if (!response.ok) {
        const errBody = data as Record<string, unknown> | undefined;

        // Handle 401 Unauthorized
        if (response.status === 401) {
          // For public endpoints (login, etc.), return the actual error from API
          if (skipAuth) {
            return {
              success: false,
              statusCode: 401,
              error: errBody?.message as string || 'Invalid credentials',
            };
          }
          // For protected endpoints, indicate token expiry
          return {
            success: false,
            statusCode: 401,
            error: 'Unauthorized: Token expired or invalid',
          };
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
          return {
            success: false,
            statusCode: 403,
            error: 'Forbidden: Access denied',
          };
        }

        return {
          success: false,
          statusCode: response.status,
          error: this.extractErrorMessage(errBody, response.statusText),
        };
      }

      return {
        success: true,
        statusCode: response.status,
        data: data as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          statusCode: 408,
          error: 'Request timeout',
        };
      }

      // Preserve the HTTP status when parseResponseBody throws for non-JSON bodies
      const httpStatus = (error as { httpStatus?: number }).httpStatus;
      return {
        success: false,
        ...(httpStatus !== undefined ? { statusCode: httpStatus } : {}),
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, requireAuth);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }, requireAuth);
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }, requireAuth);
  }

  async delete<T>(endpoint: string, options?: RequestInit, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, requireAuth);
  }
}

export const apiClient = new ApiClient();
