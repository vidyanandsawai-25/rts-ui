"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import type { Mouja, MoujaProps } from "@/types/mouja.types";
import { deleteMoujaAction } from "@/app/[locale]/property-tax/rate-master/moujamaster/action";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { SearchInput, Select } from "@/components/common";
import { getMoujaColumns } from "./MoujaColumns";
import { useMoujaSearch } from "@/hooks/moujamaster/useMoujaSearch";
import { useMoujaPagination } from "@/hooks/moujamaster/useMoujaPagination";

/* ================= PAGE ================= */
export function MoujaMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  sortBy,
  sortOrder,
}: MoujaProps): React.ReactElement {
  const router = useRouter();
  /* ===== TRANSLATIONS ===== */
  const t = useTranslations("mouja.moujaMaster");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { confirm } = useConfirm();
  const [isPending, startTransition] = React.useTransition();
  /* ================= SEARCH ================= */
  const { search, currentSearchTerm, handleSearchChange } = useMoujaSearch({
    pageSize,
    locale,
    sortBy,
    sortOrder,
    startTransition,
  });
  /* ================= PAGINATION ================= */
  const { buildUrl, changePage, handlePageSizeChange, paginationInfo } = useMoujaPagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    currentSearchTerm,
    sortBy,
    sortOrder,
    startTransition,
  });
  /* ================= TABLE COLUMNS ================= */
  const handleSort = useCallback(
    (columnKey: string) => {
      // Toggle sort order: if same column, toggle; if different column, default to asc
      let newSortOrder = "asc";
      if (sortBy === columnKey) {
        newSortOrder = sortOrder === "asc" ? "desc" : "asc";
      }
      startTransition(() => {
        router.push(buildUrl(1, pageSize, currentSearchTerm, columnKey, newSortOrder));
      });
    },
    [sortBy, sortOrder, router, buildUrl, pageSize, currentSearchTerm, startTransition]
  );

  const columns = getMoujaColumns(t, tCommon, sortBy, sortOrder, handleSort);

  const handleEdit = useCallback(
    (row: Mouja) => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/rate-master/moujamaster/edit/${row.id}`);
      });
    },
    [router, locale]
  );

  const handleDelete = useCallback(
    (row: Mouja) => {
      confirm({
        variant: "delete",
        title: `${t("list.table.moujaNo")}: ${row.moujaNo}`,
        description: `${t("delete.confirmDescription")}`,
        meta: {
          name: row.moujaName,
        },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const result = await deleteMoujaAction(fd);
          if (result.success) {
            toast.success(
              t("success.deleted", { code: row.moujaNo })
            );
            startTransition(() => {
              router.refresh();
            });
          } else {
            // Show appropriate error message based on status code
            let errorMessage = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              // Record linked with another record or in use
              errorMessage = t("apiErrors.inUse");
            } else if (result.statusCode === 400) {
              // Bad request / validation error
              errorMessage = t("apiErrors.validationError");
            } else if (result.statusCode === 404) {
              errorMessage = t("apiErrors.notFound");
            } else if (result.message) {
              errorMessage = result.message;
            }
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, router, t, tCommon]
  );
  /* ================= UI ================= */
  const { start, end, total } = paginationInfo;
  return (
    <div className="space-y-4">
      <MasterTable<Mouja>
        columns={columns}
        data={data}
        loading={isPending}
        height="lg"
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={changePage}
        headerExtra={
          <div className="flex items-center justify-end gap-3 ml-auto">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder={t("list.filters.search") || "Search Mouja..."}
              className="mb-0 w-full max-w-xs text-gray-900"
            />
            <button
              onClick={() => {
                startTransition(() => {
                  router.push(`/${locale}/property-tax/rate-master/moujamaster/add`);
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            >
              <MapPin size={16} />
              {t("list.buttons.add")}
            </button>
          </div>
        }
          renderActions={(row) => (
            <>
              <EditButton
                aria-label={tCommon("table.actions.edit")}
                onClick={() => handleEdit(row)}
              />
              <DeleteButton
                aria-label={tCommon("table.actions.delete")}
                onClick={() => handleDelete(row)}
              />
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
                  ariaLabel={tCommon("table.rowsPerPage") || "Rows per page"}
                />
              </div>
            </div>
          }
          getRowKey={(row) => String(row.id)}
        />
    </div>
  );
}
