"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type { TapType, TapTypeMasterProps } from "@/types/water-connection.types";
import { deleteTapTypeAction } from "@/app/[locale]/property-tax/water-connection-master/actions";
import { getTapTypeColumns } from "./tapTypeColumns";

export function TapTypeMaster({ data }: Readonly<TapTypeMasterProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("waterConnectionMaster.tapType");
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
      return `/${locale}/property-tax/water-connection-master/tap-type?${params.toString()}`;
    },
    [locale]
  );

  const columns = getTapTypeColumns(t);

  const changePage = (p: number) => {
    router.push(buildUrl(p, pageSize, currentSearchTerm));
  };

  const handleEdit = useCallback(
    (row: TapType) => {
      router.push(
        `/${locale}/property-tax/water-connection-master/tap-type/edit/${row.waterConnectionTypeId}`
      );
    },
    [router, locale]
  );

  const handleDelete = useCallback(
    (row: TapType) => {
      confirm({
        variant: "delete",
        title: `${t("table.typeCode")}: ${row.typeCode}`,
        description: t("confirm.deleteDescription"),
        meta: { name: row.typeName },
        onConfirm: async () => {
          const result = await deleteTapTypeAction(row.waterConnectionTypeId);
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
    <MasterTable<TapType>
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
          <select
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
      getRowKey={(row) => String(row.waterConnectionTypeId)}
    />
  );
}
