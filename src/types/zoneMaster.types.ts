import { WardItem } from "@/types/wardMaster.types";

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

/* ------------------------------------------------------------------ */
/* ZONE MASTER CONTENT TYPES (merged from zoneMasterContent.types.ts) */
/* ------------------------------------------------------------------ */

/**
 * Pagination data for zones
 */
export interface ZonePaginationData {
  zones: ZoneItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  searchTerm?: string;
}

/**
 * Pagination data for wards
 */
export interface WardPaginationData {
  wards: WardItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  searchTerm?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalZones: number;
  totalWards: number;
}

/**
 * SSR data for LinkWard drawer
 */
export interface SSRData {
  allWards?: WardItem[];
  allZones?: ZoneItem[];
  selectedWards?: WardItem[];
  viewAllWards?: WardItem[];
  viewAllWardsTotalCount?: number;
  viewAllWardsTotalPages?: number;
}

/**
 * Edit mode initial data
 */
export interface EditData {
  initialEditZoneData?: ZoneItem | null;
  initialEditWardData?: WardItem | null;
}

/**
 * Current selection state
 */
export interface SelectionState {
  selectedZoneId: number | null;
  selectedZone?: ZoneItem | null;
}