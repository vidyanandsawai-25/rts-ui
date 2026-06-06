"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { PageContainer, LockButton, UnlockButton } from "@/components/common";
import TableHeader from "@/components/common/TableHeader";
import { MasterTable } from "@/components/common/MasterTable";
import { WardItem } from "@/types/wardMaster.types";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/lockunlock.types";
import { useSearchParams } from "next/navigation";
import { useLockUnlockMaster, PaginationState } from "@/hooks/lockunlock/useLockUnlockMaster";
import { TableModal } from "./TableModal";
import { useTranslations } from "next-intl";
import { ScreenSelectionCard } from "./ScreenSelectionCard";
// import { SelectProperty } from "./Selectproperty";

export interface LockUnlockMasterProps {
  wards: WardItem[];
  dropdownProperties?: { label: string; value: string }[];
  screens?: LockedScreen[];
  initialProperties?: LockUnlockPropertyItem[];
  initialPagination?: PaginationState;
}

export default function LockUnlockMaster({
  wards,
  dropdownProperties = [],
  screens = [],
  initialProperties = [],
  initialPagination,
}: LockUnlockMasterProps): React.ReactElement {
  const searchParams = useSearchParams();
  const t = useTranslations("lockUnlock");

  const {
    formData,
    selectedScreenIds,
    setSelectedScreenIds,
    showResults,
    properties,
    selectedPropertyIds,
    editModal,
    setEditModal,
    isPending,
    propertyOptions,
    pagination,
    handleSelectChange,
    handleClearAll,
    handleShow,
    handleSaveIndividualLock,
    handleBulkAction,
    handlePageChange,
    handlePageSizeChange,
    columns,
  } = useLockUnlockMaster({
    wardIdFromUrl: searchParams.get("wardId") || "",
    screens,
    dropdownProperties,
    initialProperties,
    initialPagination,
  });

  // Map Wards to options format for SearchSelect
  const wardOptions = (wards || []).map((w) => ({
    label: w.wardNo,
    value: String(w.id),
  }));

  return (
    <PageContainer>
      <div className="space-y-6">
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={ShieldAlert}
        />
        <SelectProperty
          formData={formData}
          handleSelectChange={handleSelectChange}
          wardOptions={wardOptions}
          propertyOptions={propertyOptions}
          handleShow={handleShow}
          handleClearAll={handleClearAll}
          isPending={isPending}
        />

        <ScreenSelectionCard
          screens={screens}
          selectedScreenIds={selectedScreenIds}
          setSelectedScreenIds={setSelectedScreenIds}
        />

        {showResults ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <MasterTable<LockUnlockPropertyItem>
              columns={columns}
              data={properties}
              height="md"
              getRowKey={(row: LockUnlockPropertyItem) => row.propertyId}
              pageNumber={pagination.pageNumber}
              pageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              paginationConfig={{ enabled: true, showPageSizeSelector: true }}
              headerTitle={t("resultsTable.title", { count: selectedPropertyIds.length })}
              headerExtra={
                <div className="flex items-center gap-3 justify-end w-full">
                  <LockButton
                    size="sm"
                    label={t("resultsTable.lockButton")}
                    disabled={selectedPropertyIds.length === 0 || selectedScreenIds.length === 0 || isPending}
                    onClick={() => handleBulkAction("lock")}
                  />
                  <UnlockButton
                    size="sm"
                    label={t("resultsTable.unlockButton")}
                    disabled={selectedPropertyIds.length === 0 || selectedScreenIds.length === 0 || isPending}
                    onClick={() => handleBulkAction("unlock")}
                  />
                </div>
              }
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-slate-400 text-center gap-2">
            <ShieldAlert className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">
              {t("resultsTable.placeholderText")}
            </p>
          </div>
        )}
      </div>

      <TableModal
        editModal={editModal}
        setEditModal={setEditModal}
        screens={screens}
        handleSaveIndividualLock={handleSaveIndividualLock}
        isPending={isPending}
      />
    </PageContainer>
  );
}
