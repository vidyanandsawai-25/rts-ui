/**
 * API Client Service
 * Centralized HTTP client for making API requests
 */

import { getAppConfig } from '@/config/app.config';
import { ApiResponse } from '@/types/common.types';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    const config = getAppConfig();
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Safely parses the response body as JSON.
   * Returns `undefined` for empty-body responses (e.g. 204 No Content)
   * instead of throwing "Unexpected end of JSON input".
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

    // Read the raw text first; if it's empty, skip JSON.parse
    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined;
    }

    return JSON.parse(text) as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Parse body safely – handles 204 No Content and other empty responses
      const data = await this.parseResponseBody<T>(response);

      if (!response.ok) {
        const errBody = data as Record<string, unknown> | undefined;
        return {
          success: false,
          statusCode: response.status,
          error: (errBody?.message as string) || 'An error occurred',
        };
      }

      return {
        success: true,
        statusCode: response.status,
        data: data as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
