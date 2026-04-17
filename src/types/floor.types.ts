/* =====================================================
   PAGINATION - SHARED TYPE
   Used by floor and subfloor APIs for paginated responses
===================================================== */

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/* =====================================================
   FLOOR - FORM MODEL
===================================================== */

export interface FloorFormModel {
  floorCode: string;
  description: string;
  sequenceNo: number;
  isActive: boolean;
}

/* =====================================================
   FLOOR - ENTITY MODEL
===================================================== */

export interface Floor {
  floorId: number;
  floorCode: string;
  description: string;
  sequenceNo: number;

  createdDate: string;
  updatedDate: string | null;

  isActive: boolean;

  [key: string]: unknown;
}

export type FloorPagedResponse = PagedResponse<Floor>;

/* =====================================================
   SUBFLOOR - FORM MODEL
===================================================== */

export interface SubFloorFormModel {
  subFloorCode: string;
  description: string;
  subFloorPercentage?: number;
  isActive: boolean;
}

/* =====================================================
   SUBFLOOR - ENTITY MODEL
===================================================== */

export interface SubFloor {
  subFloorId: number;
  subFloorCode: string;
  description: string;
  subFloorPercentage: number;

  isActive: boolean;

  createdDate: string;
  updatedDate: string | null;

  [key: string]: unknown;
}

export type SubFloorPagedResponse = PagedResponse<SubFloor>;