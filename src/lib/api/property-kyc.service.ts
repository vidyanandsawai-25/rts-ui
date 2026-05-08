import { apiClient } from '@/services/api.service';
import { OwnerTypeApiItem, OwnerTypeApiResponse } from '@/types/property-basic-details.types';
import { KycDetails, KycResponse } from '@/types/property-kyc.types';
import { handleApiResponse } from '@/lib/utils/api';

// Error message constants (matching i18n keys in quickDataEntry.kyc.errors)
// These messages are used in API responses and can be translated client-side
const KYC_ERROR_MESSAGES = {
  FETCH_OWNER_TYPES: 'Failed to fetch owner types',
  LOAD_KYC_DETAILS: 'Failed to load property KYC details',
  UPDATE_KYC_DETAILS: 'Failed to update property KYC details',
  INVALID_PROPERTY_ID: 'Invalid property ID provided',
  OWNER_NAME_REQUIRED: 'Owner name is required',
} as const;

/* ---------------- OWNER TYPE MASTER ---------------- */
export async function getOwnerTypes(pageSize: number = -1): Promise<OwnerTypeApiItem[]> {
  const response = await apiClient.get<OwnerTypeApiResponse | OwnerTypeApiItem[]>(
    `/OwnerType?PageSize=${pageSize}`
  );

  // Use standard error handling so failures propagate
  const data = handleApiResponse(response, KYC_ERROR_MESSAGES.FETCH_OWNER_TYPES);

  if (Array.isArray(data)) return data;
  return (data as OwnerTypeApiResponse).items ?? [];
}

/* ---------------- KYC DETAILS ---------------- */
export async function getPropertyKycById(propertyId: number): Promise<KycResponse> {
  if (!propertyId || propertyId <= 0) {
    throw new Error(KYC_ERROR_MESSAGES.INVALID_PROPERTY_ID);
  }
  const response = await apiClient.get<KycResponse>(`/Property/${propertyId}/kyc-details`);
  return handleApiResponse(response, KYC_ERROR_MESSAGES.LOAD_KYC_DETAILS);
}

/* ---------------- UPDATE KYC DETAILS ---------------- */
export async function updatePropertyKyc(
  propertyId: number,
  payload: KycDetails
): Promise<KycResponse> {
  if (!propertyId || propertyId <= 0) {
    throw new Error(KYC_ERROR_MESSAGES.INVALID_PROPERTY_ID);
  }
  if (!payload.ownerName?.trim()) {
    throw new Error(KYC_ERROR_MESSAGES.OWNER_NAME_REQUIRED);
  }
  const response = await apiClient.put<KycResponse>(
    `/Property/${propertyId}/kyc-details`,
    payload
  );
  return handleApiResponse(response, KYC_ERROR_MESSAGES.UPDATE_KYC_DETAILS);
}
