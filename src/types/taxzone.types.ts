export interface TaxZoneFormModel {
  taxZoneId?: number;
  taxZoneNo: string;
  taxZoneType: string;
  remark: string;
  isActive: boolean; // ✅ added
}

export interface TaxZone extends Record<string, unknown> {
  taxZoneId: number;
  taxZoneNo: string;
  taxZoneType: string;
  remark: string;
  createdDate?: string;
  updatedDate?: string | null;
  isActive: boolean;
  status?: boolean;
}

export interface TaxZoneMasterProps {
  data: TaxZone[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
