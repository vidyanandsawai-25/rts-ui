export interface WingItem {
  id: number;
  wingNo: string;
  sequenceNo: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface WingListResponse {
  items: WingItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface WingMutationResponse<T = WingItem | null> {
  success: boolean;
  message: string | null;
  items: T | null;
  errors: string[] | string | null;
}

export interface CreateWingPayload {
  wingNo: string;
  sequenceNo?: number;
  isActive: boolean;
  createdBy?: number;
}

export interface UpdateWingPayload {
  wingNo: string;
  sequenceNo?: number;
  isActive: boolean;
  updatedBy: number;
}
