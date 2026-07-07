export interface RawGstMaster {
  id?: number; Id?: number;
  taxCode?: string; TaxCode?: string;
  taxName?: string; TaxName?: string;
  taxPercentage?: number; TaxPercentage?: number;
  effectiveFromDate?: string | null; EffectiveFromDate?: string | null;
  effectiveToDate?: string | null; EffectiveToDate?: string | null;
  isActive?: boolean; IsActive?: boolean;
  createdDate?: string | null; CreatedDate?: string | null;
  updatedDate?: string | null; UpdatedDate?: string | null;
  createdBy?: number | null; CreatedBy?: number | null;
  updatedBy?: number | null; UpdatedBy?: number | null;
}

export interface GstMaster {
  [key: string]: unknown;
  id: number;
  taxCode: string;
  taxName: string;
  taxPercentage: number;
  isActive: boolean;
  effectiveFromDate?: string | null;
  effectiveToDate?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}

export interface GstMasterFormModel {
  id?: number | null;
  taxCode: string;
  taxName: string;
  taxPercentage: number | string;
  effectiveFromDate?: string;
  effectiveToDate?: string;
  isActive: boolean;
  createdBy?: number;
  updatedBy?: number;
}

export interface GstMasterProps {
  data: GstMaster[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
}
