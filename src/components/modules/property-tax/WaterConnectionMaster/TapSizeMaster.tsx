"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type { TapSize, TapSizeMasterProps } from "@/types/water-connection.types";
import { deleteTapSizeAction } from "@/app/[locale]/property-tax/water-connection-master/actions";
import { getTapSizeColumns } from "./tapSizeColumns";

export function TapSizeMaster({ data }: Readonly<TapSizeMasterProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("waterConnectionMaster.tapSize");
  const tCommon = useTranslations("common");

  const { confirm } = useConfirm();

  const { items, pageNumber, pageSize, totalCount, totalPages } = data;

  const currentSearchTerm = searchParams.get("q") ?? "";

  const buildUrl = useCallback(
    (page: number, size: number, searchTerm?: string) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));
      if (searchTerm) params.set("q", searchTerm);
      return `/${locale}/property-tax/water-connection-master/tap-size?${params.toString()}`;
    },
    [locale]
  );

  const columns = getTapSizeColumns(t);

  const changePage = (p: number) => {
    router.push(buildUrl(p, pageSize, currentSearchTerm));
  };

  const handleEdit = useCallback(
    (row: TapSize) => {
      router.push(
        `/${locale}/property-tax/water-connection-master/tap-size/edit/${row.waterConnectionSizeId}`
      );
    },
    [router, locale]
  );

  const handleDelete = useCallback(
    (row: TapSize) => {
      confirm({
        variant: "delete",
        title: row.displayLabel,
        description: t("confirm.deleteDescription"),
        meta: { name: row.displayLabel },
        onConfirm: async () => {
          const result = await deleteTapSizeAction(row.waterConnectionSizeId);
          if (result.success) {
            toast.success(t("messages.deleteSuccess"));
            router.refresh();
          } else {
            const msg =
              result.statusCode === 409
                ? t("messages.deleteInUse")
                : tCommon("errors.deleteError");
            toast.error(msg);
          }
        },
      });
    },
    [confirm, router, t, tCommon]
  );

  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  return (
    <MasterTable<TapSize>
      columns={columns}
      data={items}
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
            {tCommon("table.showing")} {start} {tCommon("table.to")} {end}{" "}
            {tCommon("table.of")} {totalCount}
          </span>
          <label htmlFor="tap-size-page-size" className="text-sm text-gray-700 mr-2">
            {tCommon("table.rowsPerPage")}
          </label>
          <select
            id="tap-size-page-size"
            aria-label={tCommon("table.rowsPerPage")}
            value={String(pageSize)}
            onChange={(e) =>
              router.push(buildUrl(1, Number(e.target.value), currentSearchTerm))
            }
            className="h-8 w-20 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {[10, 20, 30, 50].map((s) => (
              <option key={s} value={String(s)}>{s}</option>
            ))}
          </select>
        </div>
      }
      getRowKey={(row) => String(row.waterConnectionSizeId)}
    />
  );
}
