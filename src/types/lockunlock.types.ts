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
  lockedScreens: Array<number | LockedScreen>;
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
  ZoneId?: number;
  WardId?: number;
  FromPropertyNo?: string;
  ToPropertyNo?: string;
  PropertyFrom?: string;
  PropertyTo?: string;
  SearchCategory?: number;
  PropertyNo?: string;
  PartitionNo?: string;
  Search?: string;
  SearchPartitionNo?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortOrder?: string;
  FilterLogic?: number;
}

export interface BulkLockUnlockFilters {
  searchCategory?: number;
  zoneId?: number;
  wardId?: number;
  fromProperty?: string;
  toProperty?: string;
  propertyNo?: string;
  partitionNo?: string;
  search?: string;
}

export interface BulkLockUnlockPayload {
  propertyIds?: number[];
  screenIds: number[];
  action: "lock" | "unlock";
  selectAll?: boolean;
  excludedPropertyIds?: number[];
  filters?: BulkLockUnlockFilters;
}

export interface BulkByCategoryScope {
  searchCategory: number;
  zoneId?: number;
  wardId?: number;
  propertyNo?: string;
  partitionNo?: string;
  propertyFrom?: string;
  propertyTo?: string;
}

export interface BulkLockUnlockByCategoryPayload {
  scope: BulkByCategoryScope;
  screenIds: number[];
  action: string;
}