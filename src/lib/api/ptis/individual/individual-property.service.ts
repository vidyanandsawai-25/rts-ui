import { apiClient } from '@/services/api.service';
import type {
  IndividualPropertyDto,
  IndividualPropertyApiResponse,
  IndividualPatchPayload,
} from '@/types/property-tax/individual';

export async function fetchIndividualQcTopSection(
  propertyId: number | string
): Promise<{ success: boolean; data?: IndividualPropertyDto; error?: string }> {
  try {
    const endpoint = `/Property/${encodeURIComponent(propertyId)}/individual`;
    const response = await apiClient.get<IndividualPropertyApiResponse>(endpoint, {
      cache: 'no-store',
    });

    if (response.success && response.data && response.data.success !== false) {
      const data = response.data.items || (response.data as unknown as IndividualPropertyDto);
      return {
        success: true,
        data,
      };
    }

    // Try alternate lowercase path if needed
    const lowerEndpoint = `/property/${encodeURIComponent(propertyId)}/individual`;
    const lowerResponse = await apiClient.get<IndividualPropertyApiResponse>(lowerEndpoint, {
      cache: 'no-store',
    });

    if (lowerResponse.success && lowerResponse.data && lowerResponse.data.success !== false) {
      const data = lowerResponse.data.items || (lowerResponse.data as unknown as IndividualPropertyDto);
      return {
        success: true,
        data,
      };
    }

    return {
      success: false,
      error: response.error || lowerResponse.error || 'Unable to retrieve individual property details. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred while fetching individual property details.',
    };
  }
}

export async function patchIndividualProperty(
  propertyId: number | string,
  payload: IndividualPatchPayload
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const endpoint = `/Property/${encodeURIComponent(propertyId)}/individual`;
    const response = await apiClient.patch<{ success?: boolean; message?: string; items?: unknown }>(
      endpoint,
      payload
    );

    if (response.success && response.data?.success !== false) {
      return {
        success: true,
        data: response.data,
      };
    }

    // Fallback: try root /Property/{id} endpoint if specific individual patch not found
    const rootEndpoint = `/Property/${encodeURIComponent(propertyId)}`;
    const rootResponse = await apiClient.patch<{ success?: boolean; message?: string; items?: unknown }>(
      rootEndpoint,
      payload
    );

    if (rootResponse.success && rootResponse.data?.success !== false) {
      return {
        success: true,
        data: rootResponse.data,
      };
    }

    return {
      success: false,
      error: response.error || rootResponse.error || 'Failed to update property details. Please try again.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred while updating property details.',
    };
  }
}
