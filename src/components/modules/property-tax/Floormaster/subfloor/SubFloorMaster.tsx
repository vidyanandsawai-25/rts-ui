"use client";

import {
  useCallback,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import { toast } from "sonner";
import { Select } from "@/components/common/select";
import { MasterTable } from "@/components/common/MasterTable";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { DeleteButton, EditButton } from "@/components/common";

import type {
  SubFloor,
  SubFloorMasterProps,
} from "@/types/floor.types";

import { deleteSubFloorAction } from "@/app/[locale]/property-tax/floormaster/actions";
import { subFloorColumns } from "./subFloorColumns";

/* ============================================================
   COMPONENT
============================================================ */

export default function SubFloorMaster({
  subFloorPaged,
  sortBy,
  sortOrder,
}: Readonly<SubFloorMasterProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("floor.subfloor");
  const tCommon = useTranslations("common");

  const { confirm } = useConfirm();

  const {
    items: data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  } = subFloorPaged;

  const currentSearchTerm = searchParams.get("q") ?? "";

  /* ============================================================
     URL BUILDER
  ============================================================ */

  const buildUrl = useCallback(
    (
      page: number,
      size: number,
      searchTerm?: string,
      newSortBy?: string,
      newSortOrder?: string
    ) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));

      if (searchTerm) params.set("q", searchTerm);
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder) params.set("sortOrder", newSortOrder);

      return `/${locale}/property-tax/floormaster/subfloor?${params.toString()}`;
    },
    [locale]
  );

  /* ============================================================
     SORTING
  ============================================================ */

  const handleSort = useCallback(
    (columnKey: string) => {
      let newSortOrder: string = "asc";

      // Toggle sort order if clicking the same column
      if (sortBy === columnKey) {
        if (sortOrder === "asc") {
          newSortOrder = "desc";
        } else if (sortOrder === "desc") {
          // Reset to no sorting
          router.push(buildUrl(1, pageSize, currentSearchTerm));
          return;
        }
      }

      router.push(buildUrl(1, pageSize, currentSearchTerm, columnKey, newSortOrder));
    },
    [sortBy, sortOrder, router, buildUrl, pageSize, currentSearchTerm]
  );

  /* ============================================================
     PAGINATION
  ============================================================ */

  const changePage = useCallback(
    (page: number) => {
      router.push(
        buildUrl(page, pageSize, currentSearchTerm, sortBy, sortOrder)
      );
    },
    [router, pageSize, currentSearchTerm, sortBy, sortOrder, buildUrl]
  );

  /* ============================================================
     FOOTER
  ============================================================ */
  const start =
    totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = useCallback(
    (row: SubFloor) => {
      confirm({
        variant: "delete",
        title: t("delete.confirmTitle", {
          id: row.id,
        }),
        description: t("delete.confirmDescription"),
        meta: {
          id: row.id,
          name: row.description
        },
        onConfirm: async () => {
          const result = await deleteSubFloorAction(row.id);
          if (result.success) {
            toast.success(t("messages.deleteSuccess"));
            router.refresh();
          } else {
            let msg = t("messages.deleteFailed");

            // Check for i18n key first, then raw message
            if (result.messageKey) {
              msg = t(result.messageKey);
            } else if (result.message) {
              msg = result.message;
            }

            toast.error(msg);
          }
        },
      });
    },
    [t, confirm, router]
  );

  /* ============================================================
     TABLE COLUMNS
  ============================================================ */

  const columns = subFloorColumns(t, tCommon, sortBy, sortOrder, handleSort);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <MasterTable<SubFloor>
      columns={columns}
      data={data}
      loading={false}
      height="lg"

      pageNumber={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      onPageChange={changePage}

      renderActions={(row) => (
        <>
          <EditButton
            onClick={() =>
              router.push(
                `/${locale}/property-tax/floormaster/subfloor/edit/${row.id}`
              )
            }
          />
          <DeleteButton
            onClick={() => handleDelete(row)}
          />
        </>
      )}

      actionLabel={tCommon("table.columns.actions")}

      paginationConfig={{ enabled: true, showPageSizeSelector: false }}

      footerLeftContent={
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {tCommon("table.showing")} {start} {tCommon("table.to")} {end} {tCommon("table.of")} {totalCount}
          </span>

          <Select
            value={String(pageSize)}
            onChange={(e) =>
              router.push(
                buildUrl(1, Number(e.target.value), currentSearchTerm, sortBy, sortOrder)
              )
            }
            options={[10, 20, 30, 50].map((s) => ({
              label: String(s),
              value: String(s),
            }))}
            selectSize="sm"
            className="w-20"
          />
        </div>
      }

      getRowKey={(row) => row.id}
    />
  );
}