import { WardItem } from "@/types/wardMaster.types";
import { ZoneItem } from "@/types/zoneMaster.types";

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
