"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/common/PageContainer";
import { MasterTable } from "@/components/common/MasterTable";
import { SearchInput } from "@/components/common/SearchInput";
import { DeleteButton, EditButton } from "@/components/common/ActionButtons";
import { ChargeHeadForm } from "./ChargeHeadForm";
import { ChargeHeadsHeader } from "./ChargeHeadsHeader";
import { ChargeHeadUserManualModal } from "./ChargeHeadUserManualModal";
import { useChargeHeads } from "@/hooks/water-bill/charge-heads/useChargeHeads";
import type { ChargeHead, ChargeHeadsProps } from "@/types/waterBill/chargeHeads.types";

export type { ChargeHeadsProps };

export function ChargeHeads(props: ChargeHeadsProps) {
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const t = useTranslations("chargeHeads");
  const tCommon = useTranslations("common");
  const { drawer = null, initialEditingData = null } = props;

  const {
    search,
    records,
    columns,
    isPending,
    isSubmitting,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    activeDrawer,
    editingData,
    handleSearchChange,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormClose,
    handleFormSubmit,
  } = useChargeHeads(props);

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Top Title & Add Button Header */}
        <ChargeHeadsHeader
          onAdd={handleAdd}
          onOpenUserManual={() => setIsUserManualOpen(true)}
        />

        {/* Master Table Section */}
        <div className="pt-1 space-y-3">
          <MasterTable<ChargeHead>
            columns={columns}
            data={records}
            loading={isPending}
            maxBodyHeightClassName="h-[calc(100vh-260px)] min-h-[300px]"
            getRowKey={(row, idx) =>
              row?.id !== undefined && row?.id !== null && String(row.id) !== "undefined"
                ? `${row.id}-${row.code || idx}`
                : row?.code
                  ? `${row.code}-${idx}`
                  : `charge-head-${idx}`
            }
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
                  placeholder={tCommon("actions.search")}
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
            actionLabel={t("table.actions")}
          />
        </div>
      </div>

      {/* Add / Edit Form Drawer */}
      <ChargeHeadForm
        open={activeDrawer !== null || drawer !== null}
        initialData={editingData || initialEditingData}
        isSubmitting={isSubmitting}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      {/* User Manual Modal */}
      <ChargeHeadUserManualModal
        open={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />
    </PageContainer>
  );
}
