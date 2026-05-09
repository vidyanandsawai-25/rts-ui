"use client";

import { Layers, Map } from "lucide-react";
import TableHeader from "@/components/common/TableHeader";
import { useTranslations } from "next-intl";
import ZoneList from "./zones/ZoneList";
import WardList from "./wards/WardList";
import ZoneForm from "./zones/ZoneForm";
import LinkWard from "./wards/LinkWard";
import CreateNewWard from "./wards/CreateNewWard";
import WardForm from "./wards/WardForm";
import { DashboardCard } from "@/components/common/DashboardCard";
import { useZoneContentState } from "@/hooks/zoneMaster/useZoneContentState";
import {
  ZonePaginationData,
  WardPaginationData,
  DashboardStats,
  SSRData,
  EditData,
  SelectionState,
} from "@/types/zoneMasterContent.types";

interface Props {
  zonePagination: ZonePaginationData;
  wardPagination: WardPaginationData;
  dashboardStats: DashboardStats;
  selection: SelectionState;
  editData?: EditData;
  ssrData?: SSRData;
}

export default function ZoneContent({
  zonePagination,
  wardPagination,
  dashboardStats,
  selection,
  editData = {},
  ssrData = {},
}: Props) {
  const t = useTranslations("zoneMaster");

  // Destructure for cleaner access
  const { zones, pageNumber: zonePageNumber, pageSize: zonePageSize, totalCount: zoneTotalCount, totalPages: zoneTotalPages, searchTerm: zoneSearchTerm } = zonePagination;
  const { wards, pageNumber: wardPageNumber, pageSize: wardPageSize, totalCount: wardTotalCount, totalPages: wardTotalPages, searchTerm: wardSearchTerm } = wardPagination;
  const { totalZones: dashboardTotalZones, totalWards: dashboardTotalWards } = dashboardStats;
  const { selectedZoneId, selectedZone } = selection;
  const { initialEditZoneData, initialEditWardData } = editData;
  const {
    allWards: ssrAllWards = [],
    allZones: ssrAllZones = [],
    selectedWards: ssrSelectedWards = [],
    viewAllWards: ssrViewAllWards = [],
    viewAllWardsTotalCount: ssrViewAllWardsTotalCount = 0,
    viewAllWardsTotalPages: ssrViewAllWardsTotalPages = 0,
  } = ssrData;

  // Use passed selectedZone, or fallback to finding in zones array
  const currentZone = selectedZone || zones.find(z => z.id === selectedZoneId);

  const {
    isDrawerClosing,
    isAddZoneOpen,
    isAddWardOpen,
    isCreateWardOpen,
    isEditWardOpen,
    isEditZoneOpen,
    editWardId,
    editZoneId,
    handleCloseDrawer,
    handleZoneSelect,
    refreshAfterUpdate,
  } = useZoneContentState();

  return (
    <>
      <div className="space-y-2 mb-0">
        <TableHeader
          title={t("title")}
          subtitle={t("description")}
          icon={Layers}
          rightContent={
            <div className="flex items-center gap-3">
              <DashboardCard
                label={t("totalZones")}
                value={dashboardTotalZones}
                icon={<Layers className="w-5 h-5 text-[#1A86E8]" />}
                className="min-w-[140px]"
              />
              <DashboardCard
                label={t("totalWards")}
                value={dashboardTotalWards}
                icon={<Map className="w-5 h-5 text-[#1A86E8]" />}
                className="min-w-[140px]"
              />
            </div>
          }
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border-2 border-[#1A86E8]/20 flex flex-col">
          <ZoneList
            zones={zones}
            pageNumber={zonePageNumber}
            pageSize={zonePageSize}
            totalCount={zoneTotalCount}
            totalPages={zoneTotalPages}
            searchTerm={zoneSearchTerm}
            selectedZoneId={selectedZoneId}
            onZoneSelect={handleZoneSelect}
          />
        </div>

        <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border-2 border-[#1A86E8]/20 flex flex-col">
          <WardList
            wards={wards}
            pageNumber={wardPageNumber}
            pageSize={wardPageSize}
            totalCount={wardTotalCount}
            totalPages={wardTotalPages}
            searchTerm={wardSearchTerm}
            selectedZoneId={selectedZoneId}
            zones={zones}
            currentZone={currentZone}
          />
        </div>
      </div>

      {/* =========================
          🔥 DRAWERS (PROPER CONTROL)
         ========================= */}

      <ZoneForm
        mode="add"
        open={isAddZoneOpen}
        onClose={handleCloseDrawer}
        onSuccess={refreshAfterUpdate}
        existingZones={zones}
      />

      <LinkWard
        open={isAddWardOpen && !isDrawerClosing}
        onClose={handleCloseDrawer}
        onSuccess={refreshAfterUpdate}
        zones={zones}
        selectedZoneId={selectedZoneId}
        ssrAllWards={ssrAllWards}
        ssrAllZones={ssrAllZones}
        ssrSelectedWards={ssrSelectedWards}
        ssrViewAllWards={ssrViewAllWards}
        ssrViewAllWardsTotalCount={ssrViewAllWardsTotalCount}
        ssrViewAllWardsTotalPages={ssrViewAllWardsTotalPages}
      />

      <CreateNewWard
        open={isCreateWardOpen}
        onClose={handleCloseDrawer}
        onSuccess={refreshAfterUpdate}
        currentZone={currentZone}
        existingWards={wards}
      />

      {isEditWardOpen && editWardId && (
        <WardForm
          mode="edit"
          open={isEditWardOpen}
          wardId={editWardId}
          wards={wards}
          onClose={handleCloseDrawer}
          onSuccess={refreshAfterUpdate}
          initialData={initialEditWardData}
        />
      )}

      {isEditZoneOpen && editZoneId && (
        <ZoneForm
          mode="edit"
          open={isEditZoneOpen}
          zoneId={editZoneId}
          zones={zones}
          existingZones={zones} 
          onClose={handleCloseDrawer}
          onUpdate={refreshAfterUpdate}
          initialData={initialEditZoneData}
        />
      )}
    </>
  );
}