import { fetchPropertyDetailsOnlyAction } from './actions';
import { defaultPropertyDetails } from '@/lib/constants/ptis.constants';
import type { PropertyDetailsData } from '@/types/ptis.types';

export async function getInitialData(
  wardNo?: string,
  propertyNo?: string,
  partitionNo?: string,
  wardId?: number,
  propertyId?: number
): Promise<{
  success: boolean;
  propertyId?: number;
  propertyDetails: PropertyDetailsData;
  error?: string;
}> {
  try {
    if (propertyId || (wardNo && propertyNo)) {
      const result = await fetchPropertyDetailsOnlyAction(
        wardNo || '',
        propertyNo || '',
        partitionNo || '',
        wardId,
        propertyId
      );
      if (result.success && result.data) {
        return {
          success: true,
          propertyId: result.data.propertyId,
          propertyDetails: {
            ...defaultPropertyDetails,
            ...result.data.details,
          },
        };
      }
      return {
        success: false,
        error: result.error,
        propertyDetails: defaultPropertyDetails,
      };
    }
    return {
      success: true,
      propertyId: undefined,
      propertyDetails: defaultPropertyDetails,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load initial property data',
      propertyDetails: defaultPropertyDetails,
    };
  }
}
