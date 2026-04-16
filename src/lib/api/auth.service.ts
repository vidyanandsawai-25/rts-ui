import { getAppConfig } from '@/config/app.config';
import type { AuthLoginApiBody, LogoutRequest, UlbConfigApiBody } from '@/types/login.types';
import { ApiResponse } from '@/types/common.types';

// ---------------------------------------------------------------------------
// Server-side auth / ULB calls (Next.js server actions, RSC)
//
// Plain fetch in api.service.ts fails on local ASP.NET HTTPS (self-signed cert).
// Auth endpoints use this layer: SERVER_API_BASE_URL + relaxed TLS for localhost in dev.
// ---------------------------------------------------------------------------

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function getAuthApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    const override = process.env.SERVER_API_BASE_URL?.trim();
    if (override) return trimTrailingSlash(override);
  }
  return trimTrailingSlash(getAppConfig().api.baseUrl);
}

const LOCAL_HTTPS_RE = /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

async function authServerFetch(url: string, init: RequestInit): Promise<Response> {
  const useRelaxedTls =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    process.env.NTIS_STRICT_LOCAL_TLS !== '1' &&
    LOCAL_HTTPS_RE.test(url);

  if (useRelaxedTls) {
    const undici = await import('undici');
    const agent = new undici.Agent({ connect: { rejectUnauthorized: false } });
    const res = await undici.fetch(url, {
      method: init.method,
      headers: init.headers,
      body: init.body === null ? undefined : init.body,
      signal: init.signal,
      dispatcher: agent,
    } as import('undici').RequestInit);
    return res as unknown as Response;
  }

  return fetch(url, { ...init, cache: 'no-store' });
}

async function authJsonRequest<T>(
  method: 'GET' | 'POST',
  endpoint: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  const timeout = getAppConfig().api.timeout;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const baseUrl = getAuthApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  try {
    const response = await authServerFetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...extraHeaders,
      },
      body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: unknown;
    if (text.trim()) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        return { success: false, error: 'Invalid JSON from API' };
      }
    } else {
      data = undefined;
    }

    if (!response.ok) {
      const msg =
        data && typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message?: unknown }).message)
          : undefined;
      return {
        success: false,
        error: msg || 'An error occurred',
      };
    }

    return {
      success: true,
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

function readUlbField(obj: Record<string, unknown>, camel: string, pascal: string): unknown {
  if (Object.prototype.hasOwnProperty.call(obj, camel) && obj[camel] != null) return obj[camel];
  if (Object.prototype.hasOwnProperty.call(obj, pascal) && obj[pascal] != null) return obj[pascal];
  return undefined;
}

function ulbStr(v: unknown): string {
  return v == null ? '' : String(v);
}

/** Accepts flat camelCase, flat PascalCase (.NET Newtonsoft), or wrapped `{ data }` / `{ result }`. */
function parseUlbConfigPayload(data: unknown): UlbConfigApiBody | null {
  if (data === null || data === undefined || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  let o: Record<string, unknown> = data as Record<string, unknown>;

  const unwrap = (key: string) => {
    const inner = o[key];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const rec = inner as Record<string, unknown>;
      if (rec.ulbId !== undefined || rec.UlbId !== undefined) {
        o = rec;
      }
    }
  };
  unwrap('data');
  unwrap('result');
  unwrap('value');

  const ulbIdRaw = readUlbField(o, 'ulbId', 'UlbId');
  const ulbId = typeof ulbIdRaw === 'number' ? ulbIdRaw : Number(ulbIdRaw);
  if (!Number.isFinite(ulbId) || ulbId < 1) {
    return null;
  }

  return {
    ulbId,
    ulbCode: ulbStr(readUlbField(o, 'ulbCode', 'UlbCode')),
    ulbName: ulbStr(readUlbField(o, 'ulbName', 'UlbName')),
    ulbNameLocal: (readUlbField(o, 'ulbNameLocal', 'UlbNameLocal') as string | null | undefined) ?? null,
    ulbLogo: (readUlbField(o, 'ulbLogo', 'UlbLogo') as string | null | undefined) ?? null,
    emailId: (readUlbField(o, 'emailId', 'EmailId') as string | null | undefined) ?? null,
    mobileNo: (readUlbField(o, 'mobileNo', 'MobileNo') as string | null | undefined) ?? null,
    websiteUrl: (readUlbField(o, 'websiteUrl', 'WebsiteUrl') as string | null | undefined) ?? null,
    ulbAddress: (readUlbField(o, 'ulbAddress', 'UlbAddress') as string | null | undefined) ?? null,
    state: (readUlbField(o, 'state', 'State') as string | null | undefined) ?? null,
    district: (readUlbField(o, 'district', 'District') as string | null | undefined) ?? null,
  };
}

export const authService = {
  /**
   * POST `/Auth/login` — body `{ username, password }` (JSON camelCase).
   * `ApiResponse.data` is the parsed JSON body (includes nested `success`, `token`, …).
   */
  async validateCredentials(credentials: {
    username: string;
    password: string;
  }): Promise<ApiResponse<AuthLoginApiBody>> {
    return authJsonRequest<AuthLoginApiBody>('POST', '/Auth/login', credentials);
  },

  async logout(sessionId: string, token: string): Promise<ApiResponse<void>> {
    return authJsonRequest<void>('POST', '/Auth/logout', { sessionId } as LogoutRequest, {
      Authorization: `Bearer ${token}`,
    });
  },

  /** GET `/UlbConfig` — council branding for login UI and cookies. */
  async getUlbConfig(): Promise<ApiResponse<UlbConfigApiBody>> {
    const res = await authJsonRequest<unknown>('GET', '/UlbConfig');
    if (!res.success || res.data === undefined) {
      return { success: false, error: res.error };
    }
    const parsed = parseUlbConfigPayload(res.data);
    if (!parsed) {
      return {
        success: false,
        error: 'ULB response shape not recognized (expected ulbId, ulbName, …)',
      };
    }
    return { success: true, data: parsed };
  },
};
