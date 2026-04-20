export interface TaxZoneFormModel {
  taxZoneId?: number;
  taxZoneNo: string;
  taxZoneType: string;
  remark: string;
  isActive: boolean; // ✅ added
}

export interface TaxZone {
  taxZoneId: number;
  taxZoneNo: string;
  taxZoneType: string;
  remark: string;

  // optional if backend returns these
  createdDate?: string;
  updatedDate?: string | null;

  isActive: boolean; // ✅ backend field

  // optional for MasterTable status column (if your backend supports it later)
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
