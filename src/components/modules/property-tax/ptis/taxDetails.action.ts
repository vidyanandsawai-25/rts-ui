"use server";

import { getTaxDetailsRVForTable } from '@/lib/api/taxDetailsRV.service';
import { getTaxDetailsForTable } from '@/lib/api/taxDetailsCV.service';
import { TaxRow } from '@/types/taxDetails.types';

/**
 * Server action to fetch and map tax details (RV) to table rows.
 */
export async function getTaxDetailsRVAction(propertyId: string | number): Promise<{
  taxRows: TaxRow[];
  totalRV: number;
  totalTax: number;
}> {
  return getTaxDetailsRVForTable(propertyId);
}

/**
 * Server action to fetch and map tax details (CV) to table rows.
 */
export async function getTaxDetailsCVAction(propertyId: string | number): Promise<{
  taxRows: TaxRow[];
  totalRV: number;
  totalTax: number;
}> {
  return getTaxDetailsForTable(propertyId);
}
