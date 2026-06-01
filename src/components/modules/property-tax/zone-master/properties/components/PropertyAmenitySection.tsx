"use client";

import { Building2, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  ConfirmProvider,
  SearchSelect,
  ToggleSwitch,
} from "@/components/common";
import { Button } from "@/components/common/ActionButton";
import { useTranslations } from "next-intl";

import {
  usePropertyAmenityData,
  usePropertyAmenitySelection,
  usePropertyAmenityDelete,
} from "./hooks";
import { PropertyAmenityTable } from "./PropertyAmenityTable";

/* ─────────────────────────────────────────────
   Inner component (needs ConfirmProvider above)
───────────────────────────────────────────── */

function PropertyAmenitySectionInner({ propertyId }: { propertyId: string }) {
  const t = useTranslations("zoneMaster");

  // Data fetching hook
  const {
    wingsLoading,
    selectedSocietyDetailId,
    setSelectedSocietyDetailId,
    wingOptions,
    isAmenity,
    setIsAmenity,
    tableData,
    tableLoading,
    refreshTable,
    wings,
  } = usePropertyAmenityData({ propertyId });

  // Selection hook
  const {
    selectedRows,
    allSelected,
    someSelected,
    toggleSelectAll,
    toggleRow,
    resetSelection,
  } = usePropertyAmenitySelection({ tableData });

  // Delete handlers hook
  const { handleSingleDelete, handleBulkDelete } = usePropertyAmenityDelete({
    isAmenity,
    selectedRows,
    refreshTable,
    resetSelection,
    t,
  });

  return (
    <div className="space-y-4">
      {/* Wings section header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">{t("createProperty.wings")}</h4>
      </div>

      <div className="p-3 rounded-lg border border-blue-100 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            {t("createProperty.wingsAssociated")}
          </span>
        </div>

        {/* Wing dropdown */}
        {wingsLoading ? (
          <div className="h-10 rounded-md bg-gray-100 animate-pulse" />
        ) : wings.length === 0 ? (
          <p className="text-sm text-gray-500">{t("createProperty.noWingsAvailable")}</p>
        ) : (
          <SearchSelect
            id="wing-select"
            name="wingSelect"
            options={wingOptions}
            value={selectedSocietyDetailId?.toString() || ""}
            placeholder={t("createProperty.selectAWing")}
            onChange={(_, value) => {
              setSelectedSocietyDetailId(Number(value));
              setIsAmenity(false);
            }}
            isLoading={wingsLoading}
            noOptionsPlaceholder={t("createProperty.noWingsAvailable")}
          />
        )}

        {/* Toggle + table (shown only after a wing is selected) */}
        {selectedSocietyDetailId !== null && (
          <>
            {/* Properties / Amenities toggle */}
            <div className="flex items-center gap-3 pt-1">
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  !isAmenity ? "text-blue-700" : "text-gray-400"
                )}
              >
                {t("createProperty.properties")}
              </span>
              <ToggleSwitch
                checked={isAmenity}
                onChange={setIsAmenity}
                showPopup={false}
                activeLabel={t("createProperty.amenities")}
                inactiveLabel={t("createProperty.properties")}
              />
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isAmenity ? "text-blue-700" : "text-gray-400"
                )}
              >
                {t("createProperty.amenities")}
              </span>
            </div>

            {/* Table */}
            <PropertyAmenityTable
              tableData={tableData}
              tableLoading={tableLoading}
              isAmenity={isAmenity}
              selectedRows={selectedRows}
              allSelected={allSelected}
              someSelected={someSelected}
              toggleSelectAll={toggleSelectAll}
              toggleRow={toggleRow}
              onSingleDelete={handleSingleDelete}
              t={t}
            />

            {/* Bulk delete button */}
            {selectedRows.size > 0 && (
              <div className="pt-1">
                <Button
                  variant="danger"
                  onClick={handleBulkDelete}
                  disabled={tableLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("createProperty.deleteSelectedCount", { count: selectedRows.size })}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Public export – wraps inner with ConfirmProvider
───────────────────────────────────────────── */

export function PropertyAmenitySection({ propertyId }: { propertyId: string }) {
  return (
    <ConfirmProvider>
      <PropertyAmenitySectionInner propertyId={propertyId} />
    </ConfirmProvider>
  );
}
