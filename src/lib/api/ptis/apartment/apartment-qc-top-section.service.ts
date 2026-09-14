import { apiClient } from '@/services/api.service';
import type {
  ApartmentQcTopSectionDto,
  ApartmentQcTopSectionResponse,
} from '@/types/property-tax/apartment';

export type { ApartmentQcTopSectionDto, ApartmentQcTopSectionResponse };

export interface UpdateApartmentQcTopSectionPayload {
  ownerName: string;
  ownerNameEnglish: string;
  occupierName: string;
  occupierNameEnglish: string;
  mobileNo: string;
  builderMobileNo?: string;
  alternateMobileNo: string;
  emailId: string;
  address: string;
  societyAddressEnglish?: string;
  pinCode: string;
  plotNo: string;
  surveyNo: string;
  moujaId: number | null;
  taxZoneId: number | null;
  categoryId: number | null;
  propertyTypeId: number | null;
  aadharNo: string;
  ownerTypeId: number | null;
  societyName: string;
  societyNameEnglish: string;
  secretaryName: string;
  secretaryNameEnglish: string;
  secretaryMobileNo: string;
  secretaryEmailId: string;
  managerName: string;
  managerNameEnglish: string;
  managerMobileNo: string;
  managerEmailId: string;
  secretaryTargetWingDetailIds: number[];
  managerTargetWingDetailIds: number[];
}

export interface UpdateApartmentQcTopSectionResponse {
  success: boolean;
  message?: string;
  items?: unknown;
  totalCount?: number | null;
  errors?: unknown;
  correlationId?: string | null;
}

export async function fetchApartmentQcTopSection(
  propertyId: number | string
): Promise<{ success: boolean; data?: ApartmentQcTopSectionDto; error?: string }> {
  try {
    const queryEndpoint = `/ApartmentQC/top-section?propertyId=${encodeURIComponent(propertyId)}`;
    const response = await apiClient.get<ApartmentQcTopSectionResponse>(queryEndpoint, {
      cache: 'no-store',
    });

    if (response.success && response.data) {
      const topSectionData =
        response.data.items || response.data.data || (response.data as unknown as ApartmentQcTopSectionDto);
      return {
        success: true,
        data: topSectionData,
      };
    }

    const pathEndpoint = `/ApartmentQC/top-section/${encodeURIComponent(propertyId)}`;
    const pathResponse = await apiClient.get<ApartmentQcTopSectionResponse>(pathEndpoint, {
      cache: 'no-store',
    });

    if (pathResponse.success && pathResponse.data) {
      const topSectionData =
        pathResponse.data.items || pathResponse.data.data || (pathResponse.data as unknown as ApartmentQcTopSectionDto);
      return {
        success: true,
        data: topSectionData,
      };
    }

    return {
      success: false,
      error: response.error || pathResponse.error || 'Unable to retrieve apartment top-section details. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'A network issue occurred while loading apartment details. Please check your connection.',
    };
  }
}

export async function patchApartmentQcTopSection(
  propertyId: number | string,
  payload: UpdateApartmentQcTopSectionPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const endpoint = `/ApartmentQC/top-section/${encodeURIComponent(propertyId)}`;
    const response = await apiClient.patch<UpdateApartmentQcTopSectionResponse>(endpoint, payload);

    if (response.success) {
      return {
        success: true,
        message: response.data?.message || 'Apartment details updated successfully.',
      };
    }

    return {
      success: false,
      error: response.error || response.message || 'Unable to save apartment details. Please review your inputs and try again.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'A network issue occurred while saving apartment details. Please check your connection.',
    };
  }
}

export interface FetchApartmentQcCertificateGridParams {
  propertyId?: number | string | null;
  upic?: string | null;
  ward?: number | string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  wingDetailsId?: number | string | null;
  societyId?: number | string | null;
}

export async function fetchApartmentQcCertificateGrid(
  params: FetchApartmentQcCertificateGridParams | number | string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    let endpoint = '/ApartmentQC/certificate-grid';
    if (typeof params === 'object' && params !== null) {
      const searchParams = new URLSearchParams();
      if (params.propertyId) searchParams.append('propertyId', String(params.propertyId));
      if (params.upic) searchParams.append('upic', String(params.upic));
      if (params.ward) searchParams.append('ward', String(params.ward));
      if (params.propertyNo) searchParams.append('propertyNo', String(params.propertyNo));
      if (params.partitionNo) searchParams.append('partitionNo', String(params.partitionNo));
      if (params.wingDetailsId) searchParams.append('wingDetailsId', String(params.wingDetailsId));
      if (params.societyId) searchParams.append('societyId', String(params.societyId));

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    } else if (params) {
      endpoint += `?propertyId=${encodeURIComponent(params)}`;
    }

    const response = await apiClient.get<unknown>(endpoint, {
      cache: 'no-store',
    });

    if (response.success && response.data) {
      const res = response.data as Record<string, unknown>;
      return {
        success: true,
        data: res.items || res.data || response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Unable to retrieve apartment certificate grid details. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'A network issue occurred while loading certificate grid details. Please check your connection.',
    };
  }
}
