export interface LockedScreen {
  id: number;
  screenCode: string;
  screenName: string;
  screenNameLocal: string;
  displayOrder: number;
}

export interface LockUnlockPropertyItem extends Record<string, unknown> {
  propertyId: number;
  wardId: number;
  wardNo: string;
  propertyNo: string;
  partitionNo: string;
  isLocked: boolean;
  lockedScreens: number[];
}

export interface LockUnlockPropertiesResponse {
  items: LockUnlockPropertyItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface LockUnlockPropertiesQueryParams {
  WardId?: number;
  FromPropertyNo?: string;
  ToPropertyNo?: string;
  Search?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortOrder?: string;
  FilterLogic?: number;
}

export interface BulkLockUnlockPayload {
  propertyIds: number[];
  screenIds: number[];
  action: "lock" | "unlock";
}
