import { apiClient } from '@/services/api.service';
import type { TaxDetailsResponse, TaxAmounts, TaxRow } from '@/types/taxDetails.types';
import type { ApiResponse } from '@/types/common.types';

/* ============================================================
   TAX DETAILS RV (Rateable Value) — SERVICE
   Base endpoint: /Property/{propertyId}/tax-details
============================================================ */

/**
 * Fetch tax details (RV) for a specific property.
 *
 * @param propertyId - The property ID to fetch tax details for.
 * @returns The full API response envelope containing tax amounts.
 *
 * @example
 * const res = await getTaxDetailsRVByPropertyId(549357);
 * const taxAmounts = res.data?.items?.taxAmounts;
 */
export async function getTaxDetailsRVByPropertyId(
  propertyId: string | number
): Promise<ApiResponse<TaxDetailsResponse>> {
  const endpoint = `/Property/${propertyId}/tax-details`;
  return apiClient.get<TaxDetailsResponse>(endpoint);
}

/**
 * Map API tax amounts to table row structure
 * @param taxes - Tax amounts from API response
 * @returns Array of TaxRow objects ready for display
 */
export function mapTaxAmountsToRows(taxes: TaxAmounts): TaxRow[] {
  // Create Amenities Tax row with mapped values
  const amenitiesRow: TaxRow = {
    taxType: "Amenities Tax",
    generalTax: taxes["General Tax"] || 0,
    stateEducationTax: taxes["State Education Tax"] || 0,
    stateEmploymentTax: taxes["State Employment Tax"] || 0,
    treeCess: taxes["Tree Cess"] || 0,
    specialWaterCess: taxes["Special Water Cess"] || 0,
    roadCess: taxes["Road Cess"] || 0,
    fireCess: taxes["Fire Cess"] || 0,
    lightCess: taxes["Light Cess"] || 0,
    waterBenefitCess: taxes["Water Benefit Cess"] || 0,
    sewageDisposalCess: taxes["Sewage Disposal Cess"] || 0,
    specialEducationTax: taxes["Special Education Tax"] || 0,
    sanitationCess: taxes["Sanitation Cess"] || 0,
    drainCess: taxes["Drain Cess"] || 0,
    waterBill: taxes["Water Bill"] || 0,
    bigBuilding: taxes["Big Building"] || 0,
    illegalConstructionPenalty: taxes["Illegal Construction Penalty"] || 0,
    userCharges: taxes["User Charges"] || 0,
    serviceTax: taxes["Service Tax"] || 0,
    oldPenaltyULB: taxes["Old Penalty of ULB"] || 0,
    runTimePenalty: taxes["Run Time Penalty"] || 0,
    totalTax: 0,
  };

  // Calculate total for amenities row
  amenitiesRow.totalTax =
    amenitiesRow.generalTax +
    amenitiesRow.stateEducationTax +
    amenitiesRow.stateEmploymentTax +
    amenitiesRow.treeCess +
    amenitiesRow.specialWaterCess +
    amenitiesRow.roadCess +
    amenitiesRow.fireCess +
    amenitiesRow.lightCess +
    amenitiesRow.waterBenefitCess +
    amenitiesRow.sewageDisposalCess +
    amenitiesRow.specialEducationTax +
    amenitiesRow.sanitationCess +
    amenitiesRow.drainCess +
    amenitiesRow.waterBill +
    amenitiesRow.bigBuilding +
    amenitiesRow.illegalConstructionPenalty +
    amenitiesRow.userCharges +
    amenitiesRow.serviceTax +
    amenitiesRow.oldPenaltyULB +
    amenitiesRow.runTimePenalty;

  // Empty Commercial Tax row
  const commercialRow: TaxRow = {
    taxType: "Commercial Tax",
    generalTax: 0,
    stateEducationTax: 0,
    stateEmploymentTax: 0,
    treeCess: 0,
    specialWaterCess: 0,
    roadCess: 0,
    fireCess: 0,
    lightCess: 0,
    waterBenefitCess: 0,
    sewageDisposalCess: 0,
    specialEducationTax: 0,
    sanitationCess: 0,
    drainCess: 0,
    waterBill: 0,
    bigBuilding: 0,
    illegalConstructionPenalty: 0,
    userCharges: 0,
    serviceTax: 0,
    oldPenaltyULB: 0,
    runTimePenalty: 0,
    totalTax: 0,
  };

  // Empty Residential Tax row
  const residentialRow: TaxRow = {
    taxType: "Residential Tax",
    generalTax: 0,
    stateEducationTax: 0,
    stateEmploymentTax: 0,
    treeCess: 0,
    specialWaterCess: 0,
    roadCess: 0,
    fireCess: 0,
    lightCess: 0,
    waterBenefitCess: 0,
    sewageDisposalCess: 0,
    specialEducationTax: 0,
    sanitationCess: 0,
    drainCess: 0,
    waterBill: 0,
    bigBuilding: 0,
    illegalConstructionPenalty: 0,
    userCharges: 0,
    serviceTax: 0,
    oldPenaltyULB: 0,
    runTimePenalty: 0,
    totalTax: 0,
  };

  const dataRows = [amenitiesRow, commercialRow, residentialRow];

  // Calculate totals row
  const totalRow: TaxRow = {
    taxType: "Total Tax",
    generalTax: dataRows.reduce((sum, row) => sum + row.generalTax, 0),
    stateEducationTax: dataRows.reduce((sum, row) => sum + row.stateEducationTax, 0),
    stateEmploymentTax: dataRows.reduce((sum, row) => sum + row.stateEmploymentTax, 0),
    treeCess: dataRows.reduce((sum, row) => sum + row.treeCess, 0),
    specialWaterCess: dataRows.reduce((sum, row) => sum + row.specialWaterCess, 0),
    roadCess: dataRows.reduce((sum, row) => sum + row.roadCess, 0),
    fireCess: dataRows.reduce((sum, row) => sum + row.fireCess, 0),
    lightCess: dataRows.reduce((sum, row) => sum + row.lightCess, 0),
    waterBenefitCess: dataRows.reduce((sum, row) => sum + row.waterBenefitCess, 0),
    sewageDisposalCess: dataRows.reduce((sum, row) => sum + row.sewageDisposalCess, 0),
    specialEducationTax: dataRows.reduce((sum, row) => sum + row.specialEducationTax, 0),
    sanitationCess: dataRows.reduce((sum, row) => sum + row.sanitationCess, 0),
    drainCess: dataRows.reduce((sum, row) => sum + row.drainCess, 0),
    waterBill: dataRows.reduce((sum, row) => sum + row.waterBill, 0),
    bigBuilding: dataRows.reduce((sum, row) => sum + row.bigBuilding, 0),
    illegalConstructionPenalty: dataRows.reduce((sum, row) => sum + row.illegalConstructionPenalty, 0),
    userCharges: dataRows.reduce((sum, row) => sum + row.userCharges, 0),
    serviceTax: dataRows.reduce((sum, row) => sum + row.serviceTax, 0),
    oldPenaltyULB: dataRows.reduce((sum, row) => sum + row.oldPenaltyULB, 0),
    runTimePenalty: dataRows.reduce((sum, row) => sum + row.runTimePenalty, 0),
    totalTax: dataRows.reduce((sum, row) => sum + row.totalTax, 0),
  };

  return [...dataRows, totalRow];
}

/**
 * Calculate total RV from all tax values
 * @param taxes - Tax amounts from API response
 * @returns Total RV value
 */
export function calculateTotalRV(taxes: TaxAmounts): number {
  const allTaxValues = Object.values(taxes);
  return allTaxValues.reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Convenience wrapper that fetches and maps tax details (RV) to table rows.
 * Returns empty array and zero totals on failure.
 *
 * @param propertyId - The property ID to fetch tax details for.
 * @returns Object containing taxRows array, totalRV, and totalTax values.
 */
export async function getTaxDetailsRVForTable(
  propertyId: string | number
): Promise<{ taxRows: TaxRow[]; totalRV: number; totalTax: number }> {
  try {
    const response = await getTaxDetailsRVByPropertyId(propertyId);

    if (!response.success || !response.data?.items?.taxAmounts) {
      console.warn('[taxDetailsRV.service] API returned failure:', response.error);
      return { taxRows: [], totalRV: 0, totalTax: 0 };
    }

    const taxes = response.data.items.taxAmounts;
    const taxRows = mapTaxAmountsToRows(taxes);
    const totalRV = calculateTotalRV(taxes);
    const totalTax = taxRows.find(row => row.taxType === "Total Tax")?.totalTax || 0;

    return { taxRows, totalRV, totalTax };
  } catch (err) {
    console.error('[taxDetailsRV.service] Unexpected error:', err);
    return { taxRows: [], totalRV: 0, totalTax: 0 };
  }
}
