/**
 * Represents a single tax amount entry
 */
export interface TaxAmountItem {
  taxName: string;
  taxAmount: number;
}

/**
 * Represents a policy with tax amounts array and total
 */
export interface TaxPolicy {
  policyCode: string;
  taxAmounts: TaxAmountItem[];
  taxTotal: number;
}

/**
 * Represents the tax details data for a property (actual API response structure)
 */
export interface TaxDetailsData {
  propertyId: number;
  policies: TaxPolicy[];
}

/**
 * Dual tax details for both capital and rateable values
 */
export interface DualTaxDetailsData {
  capital?: {
    success: boolean;
    data?: TaxDetailsData;
    error?: string;
  };
  rateable?: {
    success: boolean;
    data?: TaxDetailsData;
    error?: string;
  };
}

/**
 * Tax details API response wrapper
 * Complete response structure from /tax-details and /tax-details-cv endpoints
 */
export interface PtisMainTaxDetailsApiResponse {
  success: boolean;
  message: string;
  items?: TaxDetailsData;
  errors: string[] | null;
  correlationId: string | null;
  statusCode?: number;
  data?: {
    success: boolean;
    message: string;
    items: TaxDetailsData;
    errors: string[] | null;
    correlationId: string | null;
  };
}

/**
 * Legacy tax details response types (deprecated)
 * @deprecated Use PtisMainTaxDetailsApiResponse instead
 */
export interface TaxDetailsResponse {
  success: boolean;
  message: string;
  items: {
    propertyId: number;
    policies: Array<{
      policyCode: string;
      taxAmounts: Record<string, number>;
    }>;
  };
  errors: null | string | string[];
}

export interface TaxData {
  id: number;
  taxes: string;
  labelKey?: string;
  totalTax: string;
  [key: string]: string | number | undefined;
}

export type TaxRow = TaxData & { [key: string]: unknown };