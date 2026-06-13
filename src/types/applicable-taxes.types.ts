

export interface AssessmentYearRangeItem {
  id: number;
  fromYear: number;
  toYear: number;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
}

export interface TypeOfUseGroupItem {
  id: number;
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: string;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface ApplicableTaxesPageProps {
  asseYearsResponse: PagedResponse<AssessmentYearRangeItem> | null;
  useGroupsResponse: PagedResponse<TypeOfUseGroupItem> | null;
  valuationTab: string;
}

export type TaxApplicabilityItem = {
  taxId: number;
  taxHead: string;
  taxCode: string;
  calculationType: string | null;
  taxPercentage: number;
  taxAmount: number;
  isApplicable: boolean;
  isActive: boolean;
} & Record<string, unknown>;


export interface TaxApplicabilityData {
  propertyId: number;
  financialYearId: number;
  typeOfUseGroupId: number;
  applicableCount: number;
  exemptedCount: number;
  applicableTaxes: TaxApplicabilityItem[];
  exemptedTaxes: TaxApplicabilityItem[];
}

export interface TaxApplicabilityWrapper {
  success: boolean;
  message: string;
  items: TaxApplicabilityData;
  errors: unknown;
  correlationId: string | null;
}

export interface ApplicableTaxesProps {
  asseYearsResponse: PagedResponse<AssessmentYearRangeItem> | null;
  useGroupsResponse: PagedResponse<TypeOfUseGroupItem> | null;
  valuationTab: string;
  taxApplicabilityResponse: TaxApplicabilityItem[] | null;
  applicableCount: number;
  exemptedCount: number;
}

export interface TabNavigationProps {
  applicableCount: number;
  exemptedCount: number;
}