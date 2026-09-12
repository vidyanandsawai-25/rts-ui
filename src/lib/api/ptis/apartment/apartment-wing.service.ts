import { apiClient } from '@/services/api.service';
import { handleApiResponse } from '@/lib/utils/api';
import { getTranslations } from 'next-intl/server';
import { WingWiseDetailsItems, WingWiseDetailsResponse } from '@/types/property-tax/apartment';

export async function getWingWiseDetails(
  wardId: string | number,
  propertyNo: string
): Promise<WingWiseDetailsItems | null> {
  const cleanWardId = wardId !== undefined && wardId !== null ? wardId.toString().trim() : '';
  const cleanPropertyNo = propertyNo ? propertyNo.trim() : '';

  if (!cleanWardId && !cleanPropertyNo) {
    return null;
  }

  const params = new URLSearchParams();
  if (cleanWardId) {
    params.append('WardId', cleanWardId);
  }
  if (cleanPropertyNo) {
    params.append('PropertyNo', cleanPropertyNo);
  }

  const url = `/ApartmentQC/wing-wise-details?${params.toString()}`;
  const response = await apiClient.get<WingWiseDetailsResponse>(url);
  const t = await getTranslations('ptisRedesign');

  const responseData = handleApiResponse(response, t('errors.fetchWingWiseDetails') || 'Failed to fetch wing wise details');
  return responseData.items ?? null;
}

export interface UpdateApartmentQcWingDetailsPayload {
  wingName?: string | null;
  managerName?: string | null;
  managerNameEnglish?: string | null;
  managerMobileNo?: string | null;
  managerEmailId?: string | null;
  secretaryName?: string | null;
  secretaryNameEnglish?: string | null;
  secretaryMobileNo?: string | null;
  secretaryEmailId?: string | null;
}

export async function updateApartmentQcWingDetails(
  wingDetailId: number,
  payload: UpdateApartmentQcWingDetailsPayload
) {
  const url = `/ApartmentQC/wing-details/${wingDetailId}`;
  return await apiClient.patch<Record<string, unknown>>(url, payload);
}
