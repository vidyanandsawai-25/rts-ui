"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import TableHeader from "@/components/common/TableHeader";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput, Select } from "@/components/common";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { deleteRtsDepartmentAction } from "@/app/[locale]/rts/departments/action";
import { getRtsDepartmentColumns } from "./RtsDepartmentColumns";
import { useRtsDepartmentSearch } from "@/hooks/rts/departments/useRtsDepartmentSearch";
import { useRtsDepartmentPagination } from "@/hooks/rts/departments/useRtsDepartmentPagination";
import RtsDepartmentForm from "./RtsDepartmentForm";

interface RtsDepartmentMasterProps {
  data: RtsDepartmentApiItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: string;
}

export function RtsDepartmentMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  sortBy,
  sortOrder,
}: RtsDepartmentMasterProps) {
  const router = useRouter();
  const t = useTranslations("departmentMaster");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<RtsDepartmentApiItem | null>(null);

  const { search, currentSearchTerm, handleSearchChange } = useRtsDepartmentSearch({
    pageSize,
    locale,
    sortBy,
    sortOrder,
    startTransition,
  });

  const { changePage, handlePageSizeChange, paginationInfo } = useRtsDepartmentPagination({
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
        router.push(`/${locale}/rts/departments?${sp.toString()}`);
      });
    },
    [sortBy, sortOrder, router, pageNumber, pageSize, currentSearchTerm, locale]
  );

  const columns = getRtsDepartmentColumns(t, tCommon, sortBy, sortOrder, handleSort);

  const handleAddClick = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (row: RtsDepartmentApiItem) => {
    setEditingDepartment(row);
    setIsFormOpen(true);
  };

  const handleDeleteClick = useCallback(
    (row: RtsDepartmentApiItem) => {
      confirm({
        variant: "delete",
        title: `Delete RTS Department: ${row.departmentName}`,
        description: "Are you sure you want to delete this RTS Department? This action cannot be undone.",
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const result = await deleteRtsDepartmentAction(fd);
          if (result.success) {
            toast.success("RTS Department deleted successfully.");
            router.refresh();
          } else {
            toast.error(result.message || "Failed to delete RTS Department");
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
          title="RTS Department Master"
          subtitle="Manage departments under the Right to Service Act and configure dynamic forms"
          icon={Building2}
          actionLabel="Add Department"
          onActionClick={handleAddClick}
          rightContent={
            <div className="flex w-full justify-end">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Search departments..."
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
                  onChange={(e) => handlePageSizeChange(e.target.value)}
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
          <RtsDepartmentForm
            editingDepartment={editingDepartment}
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
