/**
 * Reassessment Service
 * Provides API methods for fetching property reassessment details
 */

import { apiClient } from '@/services/api.service';
import type { ActionResult } from '@/types/common.types';
import type {
  ReassessmentApiResponse,
  ReassessmentData,
  ReassessmentParams,
  ReassessmentFloorDetail,
  MappedFloorDetail,
  ReassessmentTaxSummary,
  ReassessmentTaxRow,
  RetrospectiveTaxApiResponse,
  RetrospectiveTaxData,
  RetrospectiveTaxYear,
  MappedRetrospectiveColumn,
  MappedRetrospectiveRow,
} from '@/types/reassessment.types';
import { handleServerError } from '@/lib/utils/server-action-error-handler';

/**
 * Normalizes a floor detail from API response
 */
function normalizeFloorDetail(detail: ReassessmentFloorDetail): ReassessmentFloorDetail {
  return {
    ...detail,
    carpetAreaSqMeter: Number(detail.carpetAreaSqMeter ?? 0),
    carpetAreaSqFeet: Number(detail.carpetAreaSqFeet ?? 0),
    builtupAreaSqMeter: Number(detail.builtupAreaSqMeter ?? 0),
    builtupAreaSqFeet: Number(detail.builtupAreaSqFeet ?? 0),
    rentMonthly: detail.rentMonthly != null ? Number(detail.rentMonthly) : null,
    finalYearlyRent: detail.finalYearlyRent != null ? Number(detail.finalYearlyRent) : null,
    rateableValue: detail.rateableValue != null ? Number(detail.rateableValue) : null,
    annualRentalValue: detail.annualRentalValue != null ? Number(detail.annualRentalValue) : null,
    depreciation: detail.depreciation != null ? Number(detail.depreciation) : null,
    monthlyRate: detail.monthlyRate != null ? Number(detail.monthlyRate) : null,
    yearlyRate: detail.yearlyRate != null ? Number(detail.yearlyRate) : null,
    yearlyRent: detail.yearlyRent != null ? Number(detail.yearlyRent) : null,
  };
}

/**
 * Normalizes the reassessment data from API response
 */
function normalizeReassessmentData(data: ReassessmentData): ReassessmentData {
  return {
    ...data,
    propertyId: Number(data.propertyId ?? 0),
    propertyOldId: Number(data.propertyOldId ?? 0),
    photos: data.photos ?? [],
    newFloorDetails: (data.newFloorDetails ?? []).map(normalizeFloorDetail),
    oldFloorDetails: (data.oldFloorDetails ?? []).map(normalizeFloorDetail),
    taxSummary: (data.taxSummary ?? []).map((tax) => ({
      ...tax,
      taxId: Number(tax.taxId ?? 0),
      displayOrder: Number(tax.displayOrder ?? 0),
      oldAmount: Number(tax.oldAmount ?? 0),
      newAmount: Number(tax.newAmount ?? 0),
    })),
  };
}

/**
 * Maps floor details from API format to UI display format
 */
export function mapFloorDetailsToDisplay(
  floorDetails: ReassessmentFloorDetail[],
  type: 'OLD' | 'NEW'
): MappedFloorDetail[] {
  return floorDetails.map((detail) => ({
    floor: detail.floorCode,
    conYear: detail.constructionYear,
    asstYear: detail.assessmentYear,
    constType: detail.constructionCode,
    use: detail.description,
    carpetAreaSqFt: Math.round((detail.carpetAreaSqFeet ?? 0) * 100) / 100,
    carpetAreaSqM: Math.round((detail.carpetAreaSqMeter ?? 0) * 100) / 100,
    builtUpAreaSqFt: Math.round((detail.builtupAreaSqFeet ?? 0) * 100) / 100,
    builtUpAreaSqM: Math.round((detail.builtupAreaSqMeter ?? 0) * 100) / 100,
    rate: detail.monthlyRate ?? 0,
    renter: detail.isRenter && detail.renterName ? detail.renterName : 'Self Occupied',
    taxLiability: detail.taxLiability ?? '',
    rentMy: detail.rentMonthly ?? 0,
    rentalValue: detail.finalYearlyRent ?? detail.yearlyRent ?? 0,
    depreciation: detail.depreciation ?? 0,
    alv: detail.annualRentalValue ?? 0,
    mr: 0, // M&R - Maintenance & Repairs (calculated if needed)
    rv: detail.rateableValue ?? 0,
    // Status is determined by comparison logic (to be implemented)
    status: type === 'NEW' ? 'New' : undefined,
    bgClass: type === 'NEW' ? 'bg-rose-50 text-rose-800 border-rose-200' : undefined,
  }));
}

/**
 * Transforms tax summary into dynamic tax rows for table display
 * Creates rows for: Old Taxes, Additional Revenue, Total Tax
 */
export function mapTaxSummaryToRows(taxSummary: ReassessmentTaxSummary[]): {
  columns: { key: string; label: string; displayOrder: number }[];
  rows: ReassessmentTaxRow[];
} {
  // Filter out TaxTotal from individual columns (it will be shown as Total Tax column)
  const taxHeads = taxSummary
    .filter((tax) => tax.taxName !== 'TaxTotal')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const totalTax = taxSummary.find((tax) => tax.taxName === 'TaxTotal');

  // Build dynamic columns
  const columns = taxHeads.map((tax) => ({
    key: tax.taxName.replace(/\s+/g, ''),
    label: `${tax.taxName} (₹)`,
    displayOrder: tax.displayOrder,
  }));

  // Build rows
  const oldTaxes: { [key: string]: number } = {};
  const newTaxes: { [key: string]: number } = {};

  taxHeads.forEach((tax) => {
    const key = tax.taxName.replace(/\s+/g, '');
    oldTaxes[key] = tax.oldAmount;
    newTaxes[key] = tax.newAmount;
  });

  // Calculate additional revenue (new - old) for each tax
  const additionalTaxes: { [key: string]: number } = {};
  taxHeads.forEach((tax) => {
    const key = tax.taxName.replace(/\s+/g, '');
    additionalTaxes[key] = tax.newAmount - tax.oldAmount;
  });

  const rows: ReassessmentTaxRow[] = [
    {
      rowType: 'old',
      label: 'Old Taxes',
      taxes: oldTaxes,
      totalTax: totalTax?.oldAmount ?? 0,
    },
    {
      rowType: 'additional',
      label: 'New Taxes',
      taxes: newTaxes,
      totalTax: totalTax?.newAmount ?? 0,
    },
    {
      rowType: 'total',
      label: 'Total Tax',
      taxes: newTaxes,
      totalTax: totalTax?.newAmount ?? 0,
    },
  ];

  return { columns, rows };
}

function normalizeRetrospectiveTaxYear(year: RetrospectiveTaxYear): RetrospectiveTaxYear {
  return {
    ...year,
    pendingYearId: Number(year.pendingYearId ?? 0),
    year: Number(year.year ?? 0),
    days: Number(year.days ?? 0),
    amounts: Array.isArray(year.amounts) ? year.amounts.map((value) => Number(value ?? 0)) : [],
    total: Number(year.total ?? 0),
  };
}

function normalizeRetrospectiveTaxData(data: RetrospectiveTaxData): RetrospectiveTaxData {
  return {
    ...data,
    propertyId: Number(data.propertyId ?? 0),
    taxHeadNames: Array.isArray(data.taxHeadNames) ? data.taxHeadNames : [],
    years: Array.isArray(data.years) ? data.years.map(normalizeRetrospectiveTaxYear) : [],
  };
}

function toTaxKey(taxHeadName: string): string {
  return taxHeadName.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Maps retrospective API data to a dynamic table model.
 * Excludes TaxTotal from dynamic columns because total is rendered in a dedicated Total column.
 */
export function mapRetrospectiveToTable(data: RetrospectiveTaxData): {
  columns: MappedRetrospectiveColumn[];
  rows: MappedRetrospectiveRow[];
} {
  const taxTotalIndex = data.taxHeadNames.findIndex((name) => name === 'TaxTotal');
  
  const columns = data.taxHeadNames
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name !== 'TaxTotal')
    .map((item) => ({
      key: toTaxKey(item.name),
      label: item.name,
      displayOrder: item.index,
    }));

  const rows: MappedRetrospectiveRow[] = data.years.map((year) => {
    const row: MappedRetrospectiveRow = {
      pendingYearId: year.pendingYearId,
      financeYear: year.financeYear,
      days: year.days,
      total: taxTotalIndex >= 0 ? Number(year.amounts[taxTotalIndex] ?? 0) : year.total,
    };

    columns.forEach((column) => {
      const columnIndex = data.taxHeadNames.findIndex((name) => toTaxKey(name) === column.key);
      row[column.key] = columnIndex >= 0 ? Number(year.amounts[columnIndex] ?? 0) : 0;
    });

    return row;
  });

  return { columns, rows };
}

/**
 * Builds the query string for reassessment API
 */
function buildReassessmentQueryString(params: ReassessmentParams): string {
  const queryParts: string[] = [];
  
  queryParts.push(`WardId=${params.wardId}`);
  queryParts.push(`PropertyNo=${encodeURIComponent(params.propertyNo)}`);
  
  if (params.partitionNo && params.partitionNo !== '0') {
    queryParts.push(`PartitionNo=${encodeURIComponent(params.partitionNo)}`);
  }
  
  return queryParts.join('&');
}

/**
 * Fetches property reassessment details from the API
 * 
 * Endpoint: GET /api/PropertyReassessment?WardId={wardId}&PropertyNo={propertyNo}&PartitionNo={partitionNo}
 * 
 * @param params - Parameters containing wardId, propertyNo, and optional partitionNo
 * @returns Promise containing reassessment data or error
 */
export async function getPropertyReassessment(
  params: ReassessmentParams
): Promise<ActionResult<ReassessmentData>> {
  try {
    // Validate required parameters
    if (!params.wardId || params.wardId <= 0) {
      return { success: false, error: 'Valid Ward ID is required' };
    }

    if (!params.propertyNo || params.propertyNo.trim() === '') {
      return { success: false, error: 'Property Number is required' };
    }

    const queryString = buildReassessmentQueryString(params);
    const endpoint = `/PropertyReassessment?${queryString}`;

    const response = await apiClient.get<ReassessmentApiResponse>(endpoint, {
      cache: 'no-store',
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to fetch reassessment data',
        statusCode: response.statusCode,
      };
    }

    const apiData = response.data;
    
    if (!apiData?.success || !apiData.items) {
      return {
        success: false,
        error: apiData?.message || 'No reassessment data found',
        statusCode: response.statusCode,
      };
    }

    return {
      success: true,
      data: normalizeReassessmentData(apiData.items),
      message: apiData.message,
    };
  } catch (error: unknown) {
    return handleServerError(error, 'fetching property reassessment');
  }
}

/**
 * Fetches retrospective tax details from the API.
 *
 * Endpoint: GET /api/RetrospectiveTax?WardId={wardId}&PropertyNo={propertyNo}&PartitionNo={partitionNo}
 */
export async function getRetrospectiveTaxDetails(
  params: ReassessmentParams
): Promise<ActionResult<RetrospectiveTaxData>> {
  try {
    if (!params.wardId || params.wardId <= 0) {
      return { success: false, error: 'Valid Ward ID is required' };
    }

    if (!params.propertyNo || params.propertyNo.trim() === '') {
      return { success: false, error: 'Property Number is required' };
    }

    const queryString = buildReassessmentQueryString(params);
    const endpoint = `/RetrospectiveTax?${queryString}`;

    const response = await apiClient.get<RetrospectiveTaxApiResponse>(endpoint, {
      cache: 'no-store',
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to fetch retrospective tax details',
        statusCode: response.statusCode,
      };
    }

    const apiData = response.data;
    if (!apiData?.success || !apiData.items) {
      return {
        success: false,
        error: apiData?.message || 'No retrospective tax data found',
        statusCode: response.statusCode,
      };
    }

    return {
      success: true,
      data: normalizeRetrospectiveTaxData(apiData.items),
      message: apiData.message,
    };
  } catch (error: unknown) {
    return handleServerError(error, 'fetching retrospective tax details');
  }
}
