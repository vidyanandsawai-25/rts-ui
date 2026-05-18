export interface CombinePropertyItem {
  id: number;
  wardId: number;
  wardNo: string;
  propertyNo: string;
  fromProperty: string;
  toProperty: string;
  isActive: boolean;
  createdDate: string | null;
  updatedDate: string | null;
}

export interface CombinePropertyParams {
  taxZoneId?: number;
  wardId?: number;
  propertyNo?: string;
  partitionNo?: string;
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

export interface PropertyCombineDetails {
  propertyId: number;
  wardId: number;
  wardNo: string;
  propertyNo: string;
  partitionNo: string;
  oldPropertyNo: string;
  ownerName: string;
  occupierName: string;
  taxAmount: number;
  pendingAmount: number;
}

export interface PropertyCombineDetailsResponse {
  success: boolean;
  message: string;
  items: PropertyCombineDetails[];
  errors: string[] | null;
  correlationId: string | null;
}

export interface GetPropertyCombineDetailsParams {
  wardId: number;
  propertyNo: string;
  partitionNo: string;
}

export interface CombinePropertyPayload {
  mainPropertyId: number;
  combinePropertyIds: string; // Comma-separated IDs
  remark: string;
  createdBy: number;
}
