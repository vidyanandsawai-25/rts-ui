import { unstable_noStore as noStore } from "next/cache";
import ZoneMaster from "@/components/modules/property-tax/zone-master/ZoneMaster";
import { fetchZonesPagedAction, fetchWardsPagedAction, getZoneByIdAction, getAllWardsForLinkAction, getAllZonesForLinkAction, getWardByIdAction, getWardsPagedWithSearchAction } from "./actions";
import { ZoneItem } from "@/types/zoneMaster.types";
import { WardItem } from "@/types/wardMaster.types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    zonePage?: string;
    zonePageSize?: string;
    q?: string;
    wardPage?: string;
    wardPageSize?: string;
    wardQ?: string;
    zoneId?: string;
    editZone?: string;
    editWard?: string;
    linkWard?: string;
    availablewardq?: string;
    viewwardq?: string;
    viewwardpage?: string;
    viewwardpagesize?: string;
  }>;
}

/** Pagination constraints */
const MIN_PAGE = 1;
const MAX_PAGE = 10_000;
const MIN_PAGE_SIZE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Sanitizes and clamps pagination parameters.
 * Prevents malformed values from crashing the page.
 */
function sanitizeParams(raw: Awaited<PageProps["searchParams"]>) {
  const clampPage = (value: string | undefined): number => {
    const parsed = parseInt(value ?? "", 10);
    return Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, MIN_PAGE), MAX_PAGE)
      : MIN_PAGE;
  };

  const clampPageSize = (value: string | undefined): number => {
    const parsed = parseInt(value ?? "", 10);
    return Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  };

  return {
    zonePageNumber: clampPage(raw.zonePage),
    zonePageSize: clampPageSize(raw.zonePageSize),
    zoneSearchTerm: raw.q?.trim() || undefined,
    wardPageNumber: clampPage(raw.wardPage),
    wardPageSize: clampPageSize(raw.wardPageSize),
    wardSearchTerm: raw.wardQ?.trim() || undefined,
    zoneId: raw.zoneId?.trim(),
    editZone: raw.editZone?.trim(),
    editWard: raw.editWard?.trim(),
    linkWard: raw.linkWard?.trim(),
    availableWardSearchTerm: raw.availablewardq?.trim() || undefined,
    viewWardSearchTerm: raw.viewwardq?.trim() || undefined,
    viewWardPage: clampPage(raw.viewwardpage),
    viewWardPageSize: clampPageSize(raw.viewwardpagesize),
  };
}

export default async function ZoneMasterPage(props: PageProps) {
  noStore();

  const params = await props.searchParams;
  const sanitized = sanitizeParams(params);
  
  const zonePageNumber = sanitized.zonePageNumber;
  const zonePageSize = sanitized.zonePageSize;
  const zoneSearchTerm = sanitized.zoneSearchTerm;

  const wardPageNumber = sanitized.wardPageNumber;
  const wardPageSize = sanitized.wardPageSize;
  const wardSearchTerm = sanitized.wardSearchTerm;

const parsedZoneId = sanitized.zoneId ? Number(sanitized.zoneId) : NaN;
	let selectedZoneId: number | null =
		Number.isFinite(parsedZoneId) && parsedZoneId > 0 ? parsedZoneId : null;

  // Drawer detection
  const isLinkWardOpen = sanitized.linkWard !== undefined;
  const editZoneId = sanitized.editZone ? Number(sanitized.editZone) : null;
  const isEditZoneOpen = editZoneId !== null && editZoneId > 0;
  const editWardId = sanitized.editWard ? Number(sanitized.editWard) : null;
  const isEditWardOpen = editWardId !== null && editWardId > 0;

  // Link Ward Search & Pagination params
  const availableWardSearchTerm = sanitized.availableWardSearchTerm;
  const viewWardSearchTerm = sanitized.viewWardSearchTerm;
  const viewWardPage = sanitized.viewWardPage;
  const viewWardPageSize = sanitized.viewWardPageSize;

  // Fetch zones
  const zonesResult = await fetchZonesPagedAction(
    zonePageNumber,
    zonePageSize,
    zoneSearchTerm
  );

  const zones: ZoneItem[] = zonesResult.items || [];
  const zoneTotalCount = zonesResult.totalCount || 0;
  const zoneTotalPages =
    zonesResult.totalPages || 
    Math.ceil(zoneTotalCount / zonePageSize);

// Fetch all zones for LinkWard drawer (reuse in SSR prefetch)
	let allZones: ZoneItem[] = zones;

  // Default selected zone to first zone if none selected
  if (selectedZoneId === null && zones.length > 0) {
    selectedZoneId = zones[0].id ?? null;
  }

  // Fetch selected zone if not in current page
  let selectedZone: ZoneItem | null = null;
  if (selectedZoneId !== null) {
    selectedZone = zones.find(z => z.id === selectedZoneId) || null;
    
    if (!selectedZone) {
      const zoneResult = await getZoneByIdAction(selectedZoneId);
      if (zoneResult.success && zoneResult.data) {
        selectedZone = zoneResult.data as ZoneItem;
      }
    }
  }

  // Fetch wards for selected zone
  let wards: WardItem[] = [];
  let wardTotalCount = 0;
  let wardTotalPages = 0;

  if (selectedZoneId !== null) {
    const wardsResult = await fetchWardsPagedAction(
      wardPageNumber,
      wardPageSize,
      wardSearchTerm,
      selectedZoneId
    );

    wards = wardsResult.items || [];
    wardTotalCount = wardsResult.totalCount || 0;
    wardTotalPages =
      wardsResult.totalPages ||
      Math.ceil(wardTotalCount / wardPageSize);
  }

  // Dashboard totals
  const [zoneStats, wardStats] = await Promise.all([
    fetchZonesPagedAction(1, 1),
    fetchWardsPagedAction(1, 1, undefined, undefined),
  ]);

  const dashboardTotalZones = zoneStats.totalCount || 0;
  const dashboardTotalWards = wardStats.totalCount || 0;

  // SSR data for Edit Zone drawer
  let initialEditZoneData: ZoneItem | null = null;

  if (isEditZoneOpen && editZoneId) {
    const zoneInCurrentPage = zones.find(z => z.id === editZoneId);
    if (zoneInCurrentPage) {
      initialEditZoneData = zoneInCurrentPage;
    } else {
      const zoneResult = await getZoneByIdAction(editZoneId);
      if (zoneResult.success && zoneResult.data) {
        initialEditZoneData = zoneResult.data as ZoneItem;
      }
    }
  }

  // SSR data for Edit Ward drawer
  let initialEditWardData: WardItem | null = null;

  if (isEditWardOpen && editWardId) {
    const wardInCurrentPage = wards.find(w => w.id === editWardId);
    if (wardInCurrentPage) {
      initialEditWardData = wardInCurrentPage;
    } else {
      const wardResult = await getWardByIdAction(editWardId);
      if (wardResult.success && wardResult.data) {
        initialEditWardData = wardResult.data as WardItem;
      }
    }
  }

  // SSR data for LinkWard drawer
  let ssrAllWards: WardItem[] = [];
  let ssrAllZones: ZoneItem[] = [];
  let ssrSelectedWards: WardItem[] = [];
  let ssrViewAllWards: WardItem[] = [];
  let ssrViewAllWardsTotalCount = 0;
  let ssrViewAllWardsTotalPages = 0;

  if (isLinkWardOpen) {
    const [allWardsResult, allZonesResult, viewAllWardsResult] = await Promise.all([
      getAllWardsForLinkAction(availableWardSearchTerm),
      getAllZonesForLinkAction(),
      getWardsPagedWithSearchAction(viewWardPage, viewWardPageSize, viewWardSearchTerm),
    ]);

    if (allWardsResult.success && allWardsResult.data) {
      ssrAllWards = allWardsResult.data;
    }

    if (allZonesResult.success && allZonesResult.data) {
      ssrAllZones = allZonesResult.data;
      allZones = allZonesResult.data;
    }

    if (viewAllWardsResult.success && viewAllWardsResult.data) {
      ssrViewAllWards = viewAllWardsResult.data;
      ssrViewAllWardsTotalCount = viewAllWardsResult.totalCount || viewAllWardsResult.data.length;
      ssrViewAllWardsTotalPages = viewAllWardsResult.totalPages || 0;
    }

    if (selectedZoneId !== null) {
      ssrSelectedWards = ssrAllWards.filter(w => w.zoneId === selectedZoneId);
    }
  }

  return (
      <ZoneMaster
        zonePagination={{
          zones: isLinkWardOpen ? allZones : zones,
          pageNumber: zonePageNumber,
          pageSize: zonePageSize,
          totalCount: zoneTotalCount,
          totalPages: zoneTotalPages,
          searchTerm: zoneSearchTerm,
        }}
        wardPagination={{
          wards,
          pageNumber: wardPageNumber,
          pageSize: wardPageSize,
          totalCount: wardTotalCount,
          totalPages: wardTotalPages,
          searchTerm: wardSearchTerm,
        }}
        dashboardStats={{
          totalZones: dashboardTotalZones,
          totalWards: dashboardTotalWards,
        }}
        selection={{
          selectedZoneId,
          selectedZone,
        }}
        editData={{
          initialEditZoneData,
          initialEditWardData,
        }}
        ssrData={{
          allWards: ssrAllWards,
          allZones: ssrAllZones,
          selectedWards: ssrSelectedWards,
          viewAllWards: ssrViewAllWards,
          viewAllWardsTotalCount: ssrViewAllWardsTotalCount,
          viewAllWardsTotalPages: ssrViewAllWardsTotalPages,
        }}
      />
  );
}