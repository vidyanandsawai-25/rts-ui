import { authService } from './auth.service';
import { logger } from '@/lib/utils/logger';
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
    ulbBackground: raw.ulbBackground ?? undefined,
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
  const defaultUlb: UlbMaster = {
    id: 1,
    ulbCode: "ULB",
    ulbName: "Municipal Corporation",
    ulbNameLocal: "महानगरपालिका",
    ulbTypeId: 1,
    isActive: true,
    ulbLogo: "/images/councilLogo/logo.png",
    email: "support@ulb.gov.in",
    phoneNo: "18002689959",
    websiteUrl: "https://ulb.gov.in",
    ulbAddress: "Municipal Corporation Administrative Building",
  };

  try {
    const res = await authService.getUlbConfig();
    if (!res.success || !res.data) {
      logger.debug('ULB config unavailable for login branding', { success: res.success });
      return defaultUlb;
    }
    const apiUlb = mapUlbConfigApiToMaster(res.data);
    return {
      ...defaultUlb,
      ...apiUlb,
      ulbName: apiUlb.ulbName || defaultUlb.ulbName,
      ulbNameLocal: apiUlb.ulbNameLocal || defaultUlb.ulbNameLocal,
      ulbLogo: apiUlb.ulbLogo || defaultUlb.ulbLogo,
      email: apiUlb.email || defaultUlb.email,
      phoneNo: apiUlb.phoneNo || defaultUlb.phoneNo,
      websiteUrl: apiUlb.websiteUrl || defaultUlb.websiteUrl,
      ulbAddress: apiUlb.ulbAddress || defaultUlb.ulbAddress,
    };
  } catch (error) {
    logger.warn('Failed to load ULB config for login branding', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return defaultUlb;
  }
}
