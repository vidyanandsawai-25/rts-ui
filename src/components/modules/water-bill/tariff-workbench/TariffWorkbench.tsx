"use client";

import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { MasterTable } from "@/components/common/MasterTable";
import { SearchInput } from "@/components/common/SearchInput";
import { DeleteButton, EditButton } from "@/components/common/ActionButtons";
import { TariffForm } from "./TariffForm";
import { TariffWorkbenchHeader } from "./TariffWorkbenchHeader";
import { TariffWorkbenchDetailView } from "./TariffWorkbenchDetailView";
import { TariffWorkbenchUserManualModal } from "./TariffWorkbenchUserManualModal";
import { useTariffWorkbench } from "@/hooks/water-bill/tariff-workbench";
import type {
  TariffWorkbench,
  TariffWorkbenchProps,
} from "@/types/waterBill/tariffWorkbench.types";

export type { TariffWorkbenchProps };

export function TariffWorkbench(props: TariffWorkbenchProps) {
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);

  const {
    drawer = null,
    initialEditingData = null,
  } = props;

  const {
    t,
    tCommon,
    search,
    records,
    columns,
    isPending,
    isSubmitting,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    handleSearchChange,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormClose,
    handleFormSubmit,
  } = useTariffWorkbench(props);

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Top Title & Action Buttons Header */}
        <TariffWorkbenchHeader
          t={t}
          onAdd={handleAdd}
          onOpenUserManual={() => setIsUserManualOpen(true)}
        />

        {/* Top Tariff Workbench Detail View */}
        {records.length > 0 && (
          <TariffWorkbenchDetailView
            records={records}
          />
        )}

        {/* Master Table with Search & Action Buttons */}
        <div className="pt-1 space-y-3">
          <MasterTable<TariffWorkbench>
            columns={columns}
            data={records}
            loading={isPending}
            maxBodyHeightClassName="max-h-[450px]"
            getRowKey={(row) => String(row.id)}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            paginationConfig={{ enabled: true, showPageSizeSelector: true }}
            pageSizeOptions={[5, 10, 20, 50]}
            headerExtra={
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <SearchInput
                  value={search}
                  onChange={handleSearchChange}
                  onEnter={handleSearchSubmit}
                  placeholder={t("searchPlaceholder")}
                  className="mb-0 w-80 text-gray-900"
                />
              </div>
            }
            renderActions={(row) => (
              <div className="flex items-center gap-1 justify-center">
                <EditButton
                  aria-label={tCommon("table.actions.edit")}
                  onClick={() => handleEdit(row)}
                />
                <DeleteButton
                  aria-label={tCommon("table.actions.delete")}
                  onClick={() => handleDelete(row)}
                />
              </div>
            )}
            actionLabel={tCommon("table.columns.actions")}
          />
        </div>
      </div>

      {/* Add / Edit Form Drawer */}
      <TariffForm
        open={drawer !== null}
        initialData={initialEditingData}
        isSubmitting={isSubmitting}
        financialYearOptions={props.financialYearOptions}
        connectionTypeOptions={props.connectionTypeOptions}
        connectionCategoryOptions={props.connectionCategoryOptions}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* User Manual Modal */}
      <TariffWorkbenchUserManualModal
        open={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />
    </PageContainer>
  );
}
