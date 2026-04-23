import { authService } from './auth.service';
import type { UlbConfigApiBody } from '@/types/login.types';
import type { UlbMaster } from '@/types/master.types';

/**
 * Maps ULB config API response to master data (login branding).
 */
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

/**
 * Fetches council branding for the login page (GET `/UlbConfig` via `authService`).
 * On failure, returns `undefined` so the page can still render (same contract as
 * construction’s service layer, but with graceful degradation instead of throwing).
 */
export async function getUlbConfigForLogin(): Promise<UlbMaster | undefined> {
  try {
    const res = await authService.getUlbConfig();
    if (!res.success || !res.data) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[getUlbConfigForLogin] ULB config unavailable:',
          res.error || 'no data',
          '(dev: self-signed https is allowed for 127.0.0.1/localhost unless NTIS_STRICT_LOCAL_TLS=1; try SERVER_API_BASE_URL=http://…; verify GET …/UlbConfig)'
        );
      }
      return undefined;
    }
    return mapUlbConfigApiToMaster(res.data);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getUlbConfigForLogin] ULB config threw:', e);
    }
    return undefined;
  }
}
