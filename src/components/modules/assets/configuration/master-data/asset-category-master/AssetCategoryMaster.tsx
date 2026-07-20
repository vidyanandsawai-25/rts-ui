"use client";

import { useMemo, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MasterTable, type Column } from "@/components/common/MasterTable";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useTranslations, useLocale } from "next-intl";
import { getAssetCategoryColumns } from "./AssetCategoryColumn";
import type { SortDirection } from "@/components/common/SortableColumnHeader";
import { deleteAssetCategoryAction } from "@/app/[locale]/assets/configuration/master-data/asset-category/actions";
import type { AssetCategory, AssetCategoryMasterProps, AssetCategoryTableRow } from "@/types/asset-masters/asset-category.types";


export default function AssetCategoryMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  search = "",
}: AssetCategoryMasterProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const t = useTranslations("asset.configuration.masterData.form");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const base = `/${locale}/assets/configuration/master-data/asset-category`;

  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sortBy") || "categoryName";
  const sortOrder = (searchParams.get("sortOrder") as SortDirection) || "asc";

  const handleSort = useCallback((field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("sortOrder", newOrder);
    startTransition(() => {
      router.push(`${base}?${params.toString()}`);
    });
  }, [sortBy, sortOrder, searchParams, router, base]);

  const columns = useMemo(() => getAssetCategoryColumns(t, tCommon, sortBy, sortOrder, handleSort), [t, tCommon, sortBy, sortOrder, handleSort]);

  const changePage = useCallback((p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${base}?${params.toString()}`);
    });
  }, [searchParams, pageSize, search, base, router]);

  const changePageSize = useCallback((size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("pageSize", String(size));
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${base}?${params.toString()}`);
    });
  }, [searchParams, search, base, router]);

  const handleDelete = useCallback((row: AssetCategory) => {
    confirm({
      variant: "delete",
      meta: {
        name: row.categoryName,
      },
      onConfirm: async () => {
        try {
          const fd = new FormData();
          fd.append("id", String(row.id));
          fd.append("locale", locale);
          const result = await deleteAssetCategoryAction(fd);

          if (!result.ok) {
            toast.error(result.error || tCommon("errors.deleteError"));
            return;
          }

          toast.success(tCommon("messages.deleteSuccess"));
          startTransition(() => router.refresh());
        } catch {
          toast.error(tCommon("errors.deleteError"));
        }
      },
    });
  }, [confirm, locale, tCommon, router]);

  return (
    <div className="space-y-6">
      <MasterTable<AssetCategoryTableRow>
        columns={columns as Column<AssetCategoryTableRow>[]}
        data={data as AssetCategoryTableRow[]}
        loading={isPending}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
        paginationConfig={{ enabled: true, showPageSizeSelector: true }}
        renderActions={(row) => (
          <>
            <EditButton
              aria-label={tCommon("table.actions.edit")}
              onClick={() => router.push(`${base}/edit/${row.id}`)}
            />
            <DeleteButton
              aria-label={tCommon("table.actions.delete")}
              onClick={() => handleDelete(row)}
            />
          </>
        )}
        actionLabel={tCommon("table.columns.actions")}
        getRowKey={(row) => String(row.id)}
      />
    </div>
  );
}
