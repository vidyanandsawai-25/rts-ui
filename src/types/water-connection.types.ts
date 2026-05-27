import type { PagedResponse } from "./common.types";

export type { PagedResponse };

/* ============================================================
   TAP STATUS
============================================================ */
export interface TapStatus {
  [key: string]: unknown;
  waterConnectionStatusId: number;
  statusCode: string;
  statusName: string;
  isActive: boolean;
}

export interface TapStatusFormModel {
  waterConnectionStatusId?: number;
  statusCode?: string;
  statusName: string;
  isActive: boolean;
}

/* ============================================================
   TAP TYPE
============================================================ */
export interface TapType {
  [key: string]: unknown;
  waterConnectionTypeId: number;
  typeCode: string;
  typeName: string;
  isActive: boolean;
}

export interface TapTypeFormModel {
  waterConnectionTypeId?: number;
  typeCode: string;
  typeName: string;
  isActive: boolean;
}

/* ============================================================
   TAP SIZE
============================================================ */
export interface TapSize {
  [key: string]: unknown;
  waterConnectionSizeId: number;
  sizeName: string;
  unit: string;
  displayLabel: string;
  isActive: boolean;
}

export interface TapSizeFormModel {
  waterConnectionSizeId?: number;
  sizeName: string;
  unit: string;
  isActive: boolean;
}

/* ============================================================
   PAGE PROPS
============================================================ */
export interface TapStatusMasterProps {
  data: PagedResponse<TapStatus>;
}

export interface TapTypeMasterProps {
  data: PagedResponse<TapType>;
}

export interface TapSizeMasterProps {
  data: PagedResponse<TapSize>;
}
