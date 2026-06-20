"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { PageContainer, LockButton, UnlockButton, SearchButton, Card } from "@/components/common";
import TableHeader from "@/components/common/TableHeader";
import { MasterTable } from "@/components/common/MasterTable";
import { SearchInput } from "@/components/common/SearchInput";
import { WardItem } from "@/types/wardMaster.types";
import { LockedScreen, LockUnlockPropertyItem } from "@/types/lockunlock.types";
import { useSearchParams } from "next/navigation";
import { useLockUnlockMaster, PaginationState } from "@/hooks/lockunlock/useLockUnlockMaster";
import { TableModal } from "./TableModal";
import { useTranslations } from "next-intl";
import { PropertySelectionCard } from "./PropertySelectionCard";
import { ScreenSelectionCard } from "./ScreenSelectionCard";

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
    isAllPropertiesSelected,
    editModal,
    setEditModal,
    isPending,
    propertyOptions,
    toPropertyOptions,
    isLoadingProperties,
    propertySearchTerm,
    handlePropertySearch,
    handleSearchButtonClick,
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
    <div className="space-y-2">
      <TableHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={ShieldAlert}
      />
      
      <div className="grid grid-cols-12 gap-2 items-stretch">
  {/* Left Panel */}
  <div className="col-span-5 flex flex-col gap-2 h-full">
    <Card className="rounded-xl shadow-lg border border-[#1A86E8]/20 overflow-visible h-full flex flex-col gap-4 p-4 bg-white">
      <PropertySelectionCard
        formData={formData}
        handleSelectChange={handleSelectChange}
        wardOptions={wardOptions}
        propertyOptions={propertyOptions}
        toPropertyOptions={toPropertyOptions}
        handleShow={handleShow}
        handleClearAll={handleClearAll}
        isPending={isPending}
        isLoadingProperties={isLoadingProperties}
      />
      <ScreenSelectionCard
        screens={screens}
        selectedScreenIds={selectedScreenIds}
        setSelectedScreenIds={setSelectedScreenIds}
      />
    </Card>
  </div>

  {/* Right Panel */}
  <div className="col-span-7 flex h-full">
    <div className="flex-1">
      {showResults ? (
        <div className="h-full animate-in fade-in slide-in-bottom-up-2 duration-200">
          <MasterTable<LockUnlockPropertyItem>
            columns={columns}
            data={properties}
            height="md"
            getRowKey={(row) => row.propertyId}
            pageNumber={pagination.pageNumber}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            paginationConfig={{
              enabled: true,
              showPageSizeSelector: true,
            }}
            //headerTitle={t("resultsTable.propertyMasterTitle")}
            headerExtra={
              <div className="flex items-center gap-3 w-full justify-end">
                <SearchInput
                  value={propertySearchTerm}
                  onChange={handlePropertySearch}
                  placeholder={t(
                    "resultsTable.searchPropertyPlaceholder"
                  )}
                  className="!mb-0 w-118"
                />

                <SearchButton
                  size="sm"
                  label={t("resultsTable.searchButton")}
                  onClick={handleSearchButtonClick}
                />

                <LockButton
                  size="sm"
                  label={t("resultsTable.lockButton")}
                  disabled={
                    (!isAllPropertiesSelected && selectedPropertyIds.length === 0) ||
                    selectedScreenIds.length === 0 ||
                    isPending
                  }
                  onClick={() => handleBulkAction("lock")}
                />

                <UnlockButton
                  size="sm"
                  label={t("resultsTable.unlockButton")}
                  disabled={
                    (!isAllPropertiesSelected && selectedPropertyIds.length === 0) ||
                    selectedScreenIds.length === 0 ||
                    isPending
                  }
                  onClick={() => handleBulkAction("unlock")}
                />
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-slate-300 rounded-xl bg-slate-50/50 text-slate-400 text-center gap-2">
          <ShieldAlert className="w-8 h-8 text-slate-300" />

          <p className="text-xs font-semibold text-slate-500">
            {t("resultsTable.placeholderText")}
          </p>
        </div>
      )}
    </div>
  </div>
</div>

      <TableModal
        editModal={editModal}
        setEditModal={setEditModal}
        screens={screens}
        handleSaveIndividualLock={handleSaveIndividualLock}
        isPending={isPending}
      />
    </div>
  </PageContainer>
);
}
