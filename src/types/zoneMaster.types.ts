export interface ZoneItem {
  id: number;
  zoneNo: string;
  description: string | null;
  sequenceNo: number | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  wardCount?: number;
}

export interface ZoneListResponse {
  items: ZoneItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ZoneMutationResponse<T = ZoneItem | null> {
  success: boolean;
  message: string | null;
  items: T | null;
  errors: string[] | string | null;
}

export interface CreateZonePayload {
  zoneNo: string;
  description: string;
  sequenceNo?: number;
  isActive: boolean;
  createdBy: number;
}

export interface UpdateZonePayload {
  zoneNo: string;
  description: string;
  sequenceNo?: number;
  isActive: boolean;
  updatedBy: number;
}