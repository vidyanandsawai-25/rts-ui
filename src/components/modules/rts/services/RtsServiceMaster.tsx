"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import TableHeader from "@/components/common/TableHeader";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput, Select } from "@/components/common";
import { RtsServiceApiItem } from "@/types/rts/service.types";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { deleteRtsServiceAction } from "@/app/[locale]/rts/services/action";
import { getRtsServiceColumns } from "./RtsServiceColumns";
import { useRtsServiceSearch } from "@/hooks/rts/services/useRtsServiceSearch";
import { useRtsServicePagination } from "@/hooks/rts/services/useRtsServicePagination";
import RtsServiceForm from "./RtsServiceForm";

interface RtsServiceMasterProps {
  data: RtsServiceApiItem[];
  departments: RtsDepartmentApiItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: string;
}

export function RtsServiceMaster({
  data,
  departments,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  sortBy,
  sortOrder,
}: RtsServiceMasterProps) {
  const router = useRouter();
  const t = useTranslations("serviceMaster");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<RtsServiceApiItem | null>(null);

  const { search, currentSearchTerm, handleSearchChange } = useRtsServiceSearch({
    pageSize,
    locale,
    sortBy,
    sortOrder,
    startTransition,
  });

  const { changePage, handlePageSizeChange, paginationInfo } = useRtsServicePagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    currentSearchTerm,
    sortBy,
    sortOrder,
    startTransition,
  });

  const handleSort = useCallback(
    (columnKey: string) => {
      let newSortOrder = "asc";
      if (sortBy === columnKey) {
        newSortOrder = sortOrder === "asc" ? "desc" : "asc";
      }
      const sp = new URLSearchParams();
      if (pageNumber > 1) sp.set("page", String(pageNumber));
      if (pageSize !== 10) sp.set("pageSize", String(pageSize));
      if (currentSearchTerm) sp.set("q", currentSearchTerm);
      sp.set("sortBy", columnKey);
      sp.set("sortOrder", newSortOrder);
      startTransition(() => {
        router.push(`/${locale}/rts/services?${sp.toString()}`);
      });
    },
    [sortBy, sortOrder, router, pageNumber, pageSize, currentSearchTerm, locale]
  );

  const columns = getRtsServiceColumns(t, tCommon, sortBy, sortOrder, handleSort);

  const handleAddClick = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (row: RtsServiceApiItem) => {
    setEditingService(row);
    setIsFormOpen(true);
  };

  const handleDeleteClick = useCallback(
    (row: RtsServiceApiItem) => {
      confirm({
        variant: "delete",
        title: `Delete RTS Service: ${row.serviceName}`,
        description: "Are you sure you want to delete this RTS Service? All dynamic fields for this service will also be dereferenced.",
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const result = await deleteRtsServiceAction(fd);
          if (result.success) {
            toast.success("RTS Service deleted successfully.");
            router.refresh();
          } else {
            toast.error(result.message || "Failed to delete RTS Service");
          }
        },
      });
    },
    [confirm, router]
  );

  const { start, end, total } = paginationInfo;

  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader
          title="RTS Service Master"
          subtitle="Define municipal services, SLA timelines, fees, and URL paths"
          icon={Sparkles}
          actionLabel="Add Service"
          onActionClick={handleAddClick}
          rightContent={
            <div className="flex w-full justify-end">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Search services..."
                className="mb-0 w-full text-gray-900 max-w-xs"
              />
            </div>
          }
        />

        <MasterTable<any>
          columns={columns}
          data={data}
          loading={isPending}
          height="lg"
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          renderActions={(row) => (
            <>
              <EditButton aria-label="Edit" onClick={() => handleEditClick(row)} />
              <DeleteButton aria-label="Delete" onClick={() => handleDeleteClick(row)} />
            </>
          )}
          actionLabel={tCommon("table.columns.actions")}
          paginationConfig={{ enabled: true, showPageSizeSelector: false }}
          footerLeftContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {start} {tCommon("table.to")} {end} {tCommon("table.of")} {total} {tCommon("table.entries")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                <Select
                  value={String(pageSize)}
                  onChange={(e: any) => handlePageSizeChange(e.target.value)}
                  options={[10, 20, 30, 40, 50].map((s) => ({
                    label: String(s),
                    value: String(s),
                  }))}
                  selectSize="sm"
                  className="w-20"
                  ariaLabel="Rows per page"
                />
              </div>
            </div>
          }
          getRowKey={(row) => String(row.id)}
        />

        {isFormOpen && (
          <RtsServiceForm
            editingService={editingService}
            departments={departments}
            onSuccess={() => {
              setIsFormOpen(false);
              router.refresh();
            }}
            onCancel={() => {
              setIsFormOpen(false);
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
