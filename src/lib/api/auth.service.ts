import { apiClient } from '@/services/api.service';
import type { AuthLoginApiBody, LogoutRequest, UlbConfigApiBody } from '@/types/login.types';
import { ApiResponse } from '@/types/common.types';

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
    return apiClient.post<AuthLoginApiBody>('/Auth/login', credentials);
  },

  async logout(sessionId: string, token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/Auth/logout', { sessionId } as LogoutRequest, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** GET `/UlbConfig` — council branding for login UI and cookies. */
  async getUlbConfig(): Promise<ApiResponse<UlbConfigApiBody>> {
    const res = await apiClient.get<unknown>('/UlbConfig');
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
