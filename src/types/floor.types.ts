import { PagedResponse } from "./common.types";

/* =====================================================
   EXPORT PagedResponse for use in other modules
===================================================== */
export type { PagedResponse } from "./common.types";

/* =====================================================
   FLOOR - FORM MODEL
   Used in UI forms (create/update)
===================================================== */
export interface FloorFormModel {
  id?: number; // optional for create
  floorCode: string;
  description: string;
  sequenceNo: number;
  isActive: boolean;
  updatedBy?: number;
}

/* =====================================================
   FLOOR - ENTITY MODEL (DB RESPONSE)
===================================================== */
export interface Floor {
  [key: string]: unknown;

  id: number;
  floorCode: string;
  description: string;
  sequenceNo: number;

  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/* =====================================================
   FLOOR - CREATE PAYLOAD (API)
===================================================== */
export interface FloorCreatePayload {
  floorCode: string;
  description: string;
  sequenceNo: number;
  isActive: boolean;
  createdBy?: number;
  createdDate?: string;
}

/* =====================================================
   FLOOR - LIST PROPS (UI TABLE)
===================================================== */
export interface FloorProps
  extends Omit<
    PagedResponse<Floor>,
    "items" | "hasPrevious" | "hasNext"
  > {
  data: Floor[];
  sortBy?: string;
  sortOrder?: string;
}

/* =====================================================
   SUBFLOOR - FORM MODEL
===================================================== */
export interface SubFloorFormModel {
  id?: number;
  subFloorCode: string;
  description: string;
  isActive: boolean;
  updatedBy?: number;
}

/* =====================================================
   SUBFLOOR - ENTITY MODEL
===================================================== */
export interface SubFloor {
  [key: string]: unknown;

  id: number;
  subFloorCode: string;
  description: string;

  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/* =====================================================
   SUBFLOOR - CREATE PAYLOAD
===================================================== */
export interface SubFloorCreatePayload {
  subFloorCode: string;
  description: string;
  isActive: boolean;
  createdBy?: number;
  createdDate?: string;
}

/* =====================================================
   SUBFLOOR - LIST PROPS
===================================================== */
export interface SubFloorProps
  extends Omit<
    PagedResponse<SubFloor>,
    "items" | "hasPrevious" | "hasNext"
  > {
  data: SubFloor[];
  sortBy?: string;
  sortOrder?: string;
}

/* =====================================================
   PAGINATED API RESPONSE (COMMON)
===================================================== */
export type FloorPagedResponse = PagedResponse<Floor>;
export type SubFloorPagedResponse = PagedResponse<SubFloor>;

/* =====================================================
   FLOOR MASTER - COMPONENT PROPS
===================================================== */
export interface FloorMasterProps {
  floorPaged: FloorPagedResponse;
  sortBy?: string;
  sortOrder?: string;
}

/* =====================================================
   SUBFLOOR MASTER - COMPONENT PROPS
===================================================== */
export interface SubFloorMasterProps {
  subFloorPaged: SubFloorPagedResponse;
  sortBy?: string;
  sortOrder?: string;
}

/* =====================================================
   FLOOR RANGE - TEMPLATE MODEL
===================================================== */
export interface FloorRangeTemplate {
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  floorCode: string;
  description: string;
  sequenceNo: number;
  maxFloorNo: number;
}

/* =====================================================
   FLOOR RANGE - API PAYLOAD
===================================================== */
export interface FloorRangePayload {
  rangeFrom: string;
  rangeTo: string;
  prefix: string;
  suffix: string;
  template: FloorRangeTemplate;
  startSequenceNo: number;
}

/* =====================================================
   FLOOR RANGE - FORM MODEL (UI)
===================================================== */
export interface FloorRangeFormModel {
  rangeFrom: number;
  rangeTo: number;
  prefix: string;
  suffix: string;
  floorCode: string;
  isActive: boolean;
  autoGenerateSubFloor: boolean;
}

/* =====================================================
   FLOOR RANGE - FIELDS PROPS (COMPONENT)
===================================================== */
export interface FloorRangeFieldsProps {
  formData: FloorRangeFormModel;
  errors: {
    rangeFrom?: string;
    rangeTo?: string;
    prefix?: string;
    suffix?: string;
    floorCode?: string;
  };
  showError: (field: keyof FloorRangeFormModel) => boolean;
  onChange: (field: keyof FloorRangeFormModel, value: string | number | boolean) => void;
  onBlur: (field: keyof FloorRangeFormModel) => void;
}