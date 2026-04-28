
export interface ConstructionType {
  constructionId: number;
  constructionCode: string;
}

export interface DepreciationRow {
  id: number;
  constructionTypeId: number;
  minYear: number;
  maxYear: number;
  rate: number;
  yearRangeRVId: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

// Paginated response for depreciation records
export interface DepreciationPagedResponse {
  items: DepreciationRow[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// UI types for depreciation master components
export type RangeRow = {
  id: string;
  min: number;
  max: number;
  label: string;
};