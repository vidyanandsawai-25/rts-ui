"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { Select } from "@/components/common";

import type { Floor, FloorMasterProps } from "@/types/floor.types";

import { deleteFloorAction } from "@/app/[locale]/property-tax/floormaster/actions";
import { floorColumns } from "./floorColumns";

/* ================= MAIN ================= */
export default function FloorMaster({
  floorPaged,
  sortBy,
  sortOrder,
}: Readonly<FloorMasterProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("floor.floor");
  const tCommon = useTranslations("common");

  const { confirm } = useConfirm();

  const {
    items: data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  } = floorPaged;

  const currentSearchTerm = searchParams.get("q") || "";

  /* ================= URL BUILDER ================= */
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

      return `/${locale}/property-tax/floormaster/floor?${params.toString()}`;
    },
    [locale]
  );

  const columns = floorColumns(t);

  /* ================= PAGINATION ================= */
  const changePage = (p: number) => {
    router.push(buildUrl(p, pageSize, currentSearchTerm, sortBy, sortOrder));
  };

  /* ================= EDIT ================= */
  const handleEdit = useCallback(
    (row: Floor) => {
      router.push(`/${locale}/property-tax/floormaster/floor/edit/${row.id}`);
    },
    [router, locale]
  );

  /* ================= DELETE ================= */
  const handleDelete = useCallback(
    (row: Floor) => {
      confirm({
        variant: "delete",
        title: `${t("table.columns.floorCode")}: ${row.floorCode}`,
        description: t("delete.confirmDescription"),
        meta: { name: row.description },

        onConfirm: async () => {
          const result = await deleteFloorAction(row.id);

          if (result.success) {
            toast.success(t("messages.deleteSuccess"));
            router.refresh();
          } else {
            let msg = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              msg = t("messages.deleteInUse");
            } else if (result.statusCode === 404) {
              msg = tCommon("errors.notFound");
            } else if (result.messageKey) {
              // Translate i18n key from server
              msg = t(result.messageKey);
            } else if (result.message) {
              // Display raw error message from API
              msg = result.message;
            }

            toast.error(msg);
          }
        },
      });
    },
    [confirm, router, t, tCommon]
  );

  /* ================= FOOTER ================= */
  const start =
    totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  /* ================= UI ================= */
  return (
    <MasterTable<Floor>
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
              <EditButton onClick={() => handleEdit(row)} />
              <DeleteButton onClick={() => handleDelete(row)} />
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
                onChange={(val) =>
                  router.push(
                    buildUrl(1, Number(val), currentSearchTerm, sortBy, sortOrder)
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

      getRowKey={(row) => String(row.id)}
    />
  );
}