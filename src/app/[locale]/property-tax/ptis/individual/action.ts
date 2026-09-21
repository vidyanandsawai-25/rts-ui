'use server';

import { ApiResponse } from '@/types/common.types';
import {
  getIndividualQcTopSectionAction,
  patchIndividualPropertyAction,
} from '@/lib/api/ptis/individual';
import { getPropertyRuleLogs } from '@/lib/api/rule-engine/property-rule-log.service';
import { getDiscountDetails } from '@/lib/api/discount.service';
import type { PropertyRuleLogResponse } from '@/types/rule-engine';
import type { PropertyDiscountInfoResponseDto } from '@/types/discount.types';
import {
  getPtisMainTaxDetailsByPropertyId,
  getPtisMainTaxDetailsCvByPropertyId,
} from '@/lib/api/ptis/ptisMain-taxdetails/taxDetails.service';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import { getPropertyBasicDetails } from '@/lib/api/ptis/propertybasicdetails/property-basic-details.service';
import type { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import {
  getMappedNewProperties,
  getMappedOldProperties,
} from '@/lib/api/property-mapping/property-mapping.service';
import type {
  MappedNewPropertiesApiResponse,
  MappedNewPropertiesParams,
  MappedOldPropertiesApiResponse,
  MappedOldPropertiesParams,
} from '@/types/property-mapping';

// Re-export core individual property actions
export {
  getIndividualQcTopSectionAction,
  patchIndividualPropertyAction,
};

/**
 * Fetches discount details for an individual property.
 */
export async function fetchDiscountDetailsAction(
  propertyId: number | string
): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
  try {
    return await getDiscountDetails(String(propertyId));
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch discount details',
    };
  }
}

/**
 * Fetches rateable and capital tax details for an individual property.
 */
export async function fetchUnitTaxDetailsAction(
  propertyId: number | string
): Promise<{
  success: boolean;
  rateable?: TaxDetailsData;
  capital?: TaxDetailsData;
  error?: string;
}> {
  const numericId = Number(propertyId);
  if (!numericId || numericId <= 0) {
    return { success: false, error: 'Invalid property ID' };
  }
  try {
    const [rateable, capital] = await Promise.all([
      getPtisMainTaxDetailsByPropertyId(numericId).catch(() => undefined),
      getPtisMainTaxDetailsCvByPropertyId(numericId).catch(() => undefined),
    ]);
    return { success: true, rateable, capital };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tax details',
    };
  }
}

/**
 * Fetches property rule logs for audit/tax calculation verification.
 */
export async function fetchPropertyRuleLogsAction(
  propertyId: number,
  propertyDetailsId?: number,
  financeYear?: number
): Promise<{ success: boolean; data?: PropertyRuleLogResponse; error?: string }> {
  try {
    const data = await getPropertyRuleLogs(propertyId, propertyDetailsId, financeYear);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rule logs',
    };
  }
}

/**
 * Fetches quick data entry basic property details for the modal / preview.
 */
export async function fetchUnitQuickDataEntryAction(
  propertyId: number | string
): Promise<{ success: boolean; data?: PropertyBasicDetailsApiItem | null; error?: string }> {
  try {
    const numericId = Number(propertyId);
    if (!numericId || numericId <= 0) {
      return { success: false, error: 'Invalid property ID' };
    }
    const data = await getPropertyBasicDetails(numericId);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch quick entry details',
    };
  }
}

/**
 * Fetches mapped new properties.
 */
export async function fetchMappedNewPropertiesAction(
  params: MappedNewPropertiesParams
): Promise<{ success: boolean; data?: MappedNewPropertiesApiResponse | null; error?: string }> {
  try {
    const data = await getMappedNewProperties(params);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch mapped properties',
    };
  }
}

/**
 * Fetches mapped old properties.
 */
export async function fetchMappedOldPropertiesAction(
  params: MappedOldPropertiesParams
): Promise<{ success: boolean; data?: MappedOldPropertiesApiResponse | null; error?: string }> {
  try {
    const data = await getMappedOldProperties(params);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch mapped old properties',
    };
  }
}
