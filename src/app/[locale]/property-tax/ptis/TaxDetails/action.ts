'use server';

import { getPtisMainTaxDetailsByPropertyId, getPtisMainTaxDetailsCvByPropertyId } from '@/lib/api/ptis/ptisMain-taxdetails/taxDetails.service';
import { validatePropertyId } from '@/lib/utils/ptis-normalization';
import { handleServerError } from '@/lib/utils/server-action-error-handler';
import { ActionResult } from '@/types/common.types';
import { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';

// Fetches tax details for rateable value tab using the /tax-details endpoint.
export async function getRateableTaxDetails(
  propertyId: string | number
): Promise<ActionResult<TaxDetailsData>> {
  try {
    const propertyIdNum = validatePropertyId(propertyId);
    if (!propertyIdNum) {
      return { success: false, error: 'Invalid property ID' };
    }

    const result = await getPtisMainTaxDetailsByPropertyId(propertyIdNum);

    return { success: true, data: result };
  } catch (error: unknown) {
    return handleServerError<TaxDetailsData>(error, 'fetching rateable tax details');
  }
}

/**
 * Server action for fetching Capital Tax Details.
 * 
 * Fetches tax details for capital value tab using the /tax-details-cv endpoint.
 */
export async function getCapitalTaxDetails(
  propertyId: string | number
): Promise<ActionResult<TaxDetailsData>> {
  try {
    const propertyIdNum = validatePropertyId(propertyId);
    if (!propertyIdNum) {
      return { success: false, error: 'Invalid property ID' };
    }
    const result = await getPtisMainTaxDetailsCvByPropertyId(propertyIdNum);
    return { success: true, data: result };
  } catch (error: unknown) {
    return handleServerError<TaxDetailsData>(error, 'fetching capital tax details');
  }
}
