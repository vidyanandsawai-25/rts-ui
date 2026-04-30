'use server';

import { defaultOldDetails, type OldDetailsData, type WardData } from '@/types/ptis.types';
import type { ActionResult } from '@/types/common.types';
import { ptisService } from '@/lib/api/ptis.service';
export interface PtisInitialData {
  propertyId?: number;
  oldDetails: OldDetailsData;
  error?: string;
}

interface FetchPropertyDetailsData {
  propertyId: number;
  oldDetails: OldDetailsData;
}

function isWardData(data: unknown): data is WardData {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('wardID' in data || 'WardId' in data || 'wardId' in data)
  );
}

export async function fetchPropertyDetailsByFlowAction(
  wardNo: string,
  propertyNo: string,
  partitionNo: string,
  _preResolvedWardId?: number,
  propertyIdFromUrl?: number
): Promise<ActionResult<FetchPropertyDetailsData>> {
  // Validate propertyIdFromUrl: must be a positive integer
  let propertyId: number | undefined = 
    propertyIdFromUrl != null && Number.isInteger(propertyIdFromUrl) && propertyIdFromUrl > 0
      ? propertyIdFromUrl
      : undefined;

  try {

    if (!propertyId) {
      if (!wardNo || !propertyNo) {
        return { success: false, error: 'Ward No and Property No are required' };
      }

      const wardResult = await ptisService.getWardByNo(wardNo);
      if (!wardResult.success || !wardResult.data) {
        return { success: false, error: wardResult.error || 'Ward not found' };
      }
      if (!isWardData(wardResult.data)) {
        return { success: false, error: 'Invalid ward data format' };
      }
      const wardData = wardResult.data;
      const wardId = parseInt(wardData.wardID || wardData.WardId || wardData.wardId || '0');

      // Validate wardId is a finite positive integer
      if (!Number.isFinite(wardId) || wardId <= 0) {
        return { success: false, error: 'Invalid ward ID' };
      }

      const propertySearchResult = await ptisService.searchProperties({
        wardId,
        propertyNo,
        partitionNo,
      });

      if (
        !propertySearchResult.success ||
        !propertySearchResult.data ||
        propertySearchResult.data.length === 0
      ) {
        return { success: false, error: 'Property not found' };
      }

      let firstProperty = propertySearchResult.data[0];
      if (propertySearchResult.data.length > 1) {
        const targetPartition = partitionNo === '0' || !partitionNo ? null : partitionNo;
        const exactMatch = propertySearchResult.data.find((p) => {
          const pPart = p.partitionNo || null;
          if (!targetPartition) return !pPart || pPart === '0' || pPart === '';
          return pPart === targetPartition;
        });
        if (exactMatch) {
          firstProperty = exactMatch;
        }
      }

      const rawPropId = firstProperty.propertyId ?? firstProperty.id;
      propertyId = typeof rawPropId === 'string' ? parseInt(rawPropId, 10) : rawPropId;
    }

    if (!propertyId) {
      return { success: false, error: 'Property ID not found' };
    }

    const oldDetailsResult = await ptisService.getOldDetails(propertyId);
    let oldDetails = defaultOldDetails;
    let oldDetailsError: string | undefined;

    if (!oldDetailsResult.success) {
      oldDetailsError = oldDetailsResult.error || 'Failed to fetch old details';
    } else if (oldDetailsResult.data) {
      oldDetails = oldDetailsResult.data;
    }

    return {
      success: true,
      data: { propertyId, oldDetails },
      error: oldDetailsError,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      error: 'Failed to fetch property details: ' + errorMessage,
    };
  }
}

export async function getInitialData(
  wardNo?: string,
  propertyNo?: string,
  partitionNo?: string,
  propertyId?: number
): Promise<PtisInitialData> {
  // Short-circuit early if all identifiers are missing to avoid triggering validation errors on fresh load
  if (!wardNo && !propertyNo && !propertyId) {
    return { propertyId: undefined, oldDetails: defaultOldDetails };
  }

  try {
    const result = await fetchPropertyDetailsByFlowAction(
      wardNo || '',
      propertyNo || '',
      partitionNo || '',
      undefined,
      propertyId
    );

    if (result.success && result.data) {
      return {
        propertyId: result.data.propertyId,
        oldDetails: result.data.oldDetails,
        error: result.error,
      };
    }

    return { propertyId: undefined, oldDetails: defaultOldDetails, error: result.error };
  } catch (error: unknown) {
    return {
      propertyId: undefined,
      oldDetails: defaultOldDetails,
      error: error instanceof Error ? error.message : 'Failed to fetch initial data',
    };
  }
}
