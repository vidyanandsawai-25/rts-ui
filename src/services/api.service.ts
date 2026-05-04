/**
 * API Client Service
 * Centralized HTTP client for making API requests with SSR authentication support
 * SERVER-ONLY: This service can only be used in Server Components and Server Actions
 */

import 'server-only';
import { cookies } from 'next/headers';
import { appConfig } from '@/config/app.config';
import { ApiResponse } from '@/types/common.types';

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
    this.baseUrl = appConfig.api.baseUrl;
    this.timeout = appConfig.api.timeout;
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
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
          headers['X-CSRF-Token'] = csrfToken;
        }
      }

      const url = `${this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
        cache: 'no-store', // SSR should not cache authenticated responses
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // For public endpoints (login, etc.), return the actual error from API
        if (skipAuth) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errorData.message || 'Invalid credentials',
            statusCode: 401,
          };
        }
        // For protected endpoints, indicate token expiry
        return {
          success: false,
          error: 'Unauthorized: Token expired or invalid',
          statusCode: 401,
        };
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        return {
          success: false,
          error: 'Forbidden: Access denied',
          statusCode: 403,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          statusCode: 408,
        };
      }

      return {
        success: false,
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