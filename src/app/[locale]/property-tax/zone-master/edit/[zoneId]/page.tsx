import ZoneMaster from "@/components/modules/property-tax/zone-master/ZoneMaster";
import { fetchZonesPagedAction, fetchWardsPagedAction, getZoneByIdAction } from "../../actions";
import { ZoneItem } from "@/types/zoneMaster.types";
import { WardItem } from "@/types/wardMaster.types";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import ZoneForm from "@/components/modules/property-tax/zone-master/zones/ZoneForm";
import { ConfirmProvider } from "@/components/common";
import React from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; zoneId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditZonePage({ params, searchParams }: PageProps): Promise<React.ReactElement> {
  noStore();

  const { zoneId } = await params;
  const sp = await searchParams;

  // =============================
  // 1️⃣ FETCH EDIT ZONE DATA (SSR)
  // =============================
  let editZoneData: ZoneItem | undefined;
  try {
    const editResult = await getZoneByIdAction(Number(zoneId));
    if (!editResult.success || !editResult.data) {
      notFound();
    }
    editZoneData = editResult.data as ZoneItem;
  } catch (_error) {
    notFound();
  }

  // =============================
  // 2️⃣ FETCH ZONES (BACKGROUND LIST)
  // =============================
  const zonePageNumber = Number(sp?.zonePage) || 1;
  const zonePageSize = Number(sp?.zonePageSize) || 10;
  const zoneSearchTerm = typeof sp?.q === "string" ? sp.q : undefined;

  let zones: ZoneItem[] = [];
  let zoneTotalCount = 0;
  let zoneTotalPages = 0;

  try {
    const zonesResult = await fetchZonesPagedAction(zonePageNumber, zonePageSize, zoneSearchTerm);
    zones = zonesResult.items || [];
    zoneTotalCount = zonesResult.totalCount || 0;
    zoneTotalPages = zonesResult.totalPages || Math.ceil(zoneTotalCount / zonePageSize);
  } catch {
    zones = [];
    zoneTotalCount = 0;
    zoneTotalPages = 0;
  }

  // =============================
  // 3️⃣ NORMALIZE WARD COUNT FROM ZONES RESPONSE
  // =============================
  zones = zones.map((z) => ({
    ...z,
    wardCount: z.wardCount ?? 0,
  }));

  // =============================
  // 4️⃣ USE EDIT ZONE AS SELECTED
  // =============================
  const selectedZoneId = editZoneData.id ?? null;

  // =============================
  // 5️⃣ FETCH WARDS FOR SELECTED ZONE
  // =============================
  const wardPageNumber = Number(sp?.wardPage) || 1;
  const wardPageSize = Number(sp?.wardPageSize) || 10;
  const wardSearchTerm = typeof sp?.wardQ === "string" ? sp.wardQ : undefined;

  let wards: WardItem[] = [];
  let wardTotalCount = 0;
  let wardTotalPages = 0;

  try {
    if (selectedZoneId !== null) {
      const wardsResult = await fetchWardsPagedAction(wardPageNumber, wardPageSize, wardSearchTerm, selectedZoneId);
      wards = wardsResult.items || [];
      wardTotalCount = wardsResult.totalCount || 0;
      wardTotalPages = wardsResult.totalPages || Math.ceil(wardTotalCount / wardPageSize);
    }
  } catch {
    wards = [];
    wardTotalCount = 0;
    wardTotalPages = 0;
  }

  // =============================
  // 6️⃣ DASHBOARD TOTALS
  // =============================
  let dashboardTotalZones = 0;
  let dashboardTotalWards = 0;

  try {
    const [zoneStats, wardStats] = await Promise.all([
      fetchZonesPagedAction(1, 1),
      fetchWardsPagedAction(1, 1, undefined, undefined),
    ]);
    dashboardTotalZones = zoneStats.totalCount || 0;
    dashboardTotalWards = wardStats.totalCount || 0;
  } catch {
    dashboardTotalZones = zoneTotalCount;
    dashboardTotalWards = wardTotalCount;
  }

  return (
    <ConfirmProvider>
      <div className="relative">
        {/* Render the Master List in Background */}
        <ZoneMaster
          zonePagination={{
            zones,
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
            selectedZone: editZoneData,
          }}
          editData={{
            initialEditZoneData: null,
            initialEditWardData: null,
          }}
          ssrData={{
            allWards: [],
            allZones: [],
            selectedWards: [],
          }}
        />
        
        {/* Render the Edit Drawer on Top - pass initialData for SSR */}
        <ZoneForm
          mode="edit"
          open={true}
          zoneId={String(zoneId)}
          zones={zones}
          existingZones={zones}
          initialData={editZoneData}
        />
      </div>
    </ConfirmProvider>
  );
}
