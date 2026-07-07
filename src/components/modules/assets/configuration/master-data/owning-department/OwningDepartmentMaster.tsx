"use client";

import React, { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PageContainer, Select, useToast } from "@/components/common";
import { MasterTable } from "@/components/common/MasterTable";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useTranslations, useLocale } from "next-intl";
import { getColumns } from "./OwningDepartmentColumns";
import { deleteOwningDepartmentAction } from "@/app/[locale]/assets/configuration/master-data/owning-department/action";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { OwningDepartmentHeader } from "./OwningDepartmentHeader";
import type { OwningDepartment, OwningDepartmentMasterProps } from "@/types/asset-masters/owning-department.types";

export function OwningDepartmentMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  sortBy,
  sortOrder,
  searchTerm = "",
}: OwningDepartmentMasterProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const t = useTranslations("owningDepartment");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const toast = useToast();
  const [isPending, startTransition] = React.useTransition();

  const [search, setSearch] = React.useState(searchTerm ?? "");
  const [prevSearchTerm, setPrevSearchTerm] = React.useState(searchTerm);

  if (searchTerm !== prevSearchTerm) {
    setSearch(searchTerm ?? "");
    setPrevSearchTerm(searchTerm);
  }

  const pathname = usePathname();
  const isSubRoute = pathname !== `/${locale}/assets/configuration/master-data/owning-department`.replace(/\/+/g, "/");

  useSearchNavigation({
    search,
    currentSearchTerm: searchTerm ?? "",
    pageSize,
    locale,
    sortBy,
    sortOrder,
    basePath: "/assets/configuration/master-data/owning-department",
    startTransition: isSubRoute ? () => {} : startTransition,
  });

  const buildUrl = React.useCallback(
    (
      page: number,
      size: number,
      searchTermVal?: string,
      newSortBy?: string,
      newSortOrder?: string
    ) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));
      if (searchTermVal?.trim()) params.set("q", searchTermVal.trim());
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder) params.set("sortOrder", newSortOrder);

      return `/${locale}/assets/configuration/master-data/owning-department?${params.toString()}`;
    },
    [locale]
  );

  const handleSort = React.useCallback((columnKey: string) => {
    startTransition(() => {
      const nextOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc";
      router.push(buildUrl(pageNumber, pageSize, search, columnKey, nextOrder));
    });
  }, [sortBy, sortOrder, pageNumber, pageSize, search, buildUrl, router]);

  const columns = useMemo(
    () =>
      getColumns({
        t,
        tCommon,
        sortBy,
        sortOrder,
        onSort: handleSort,
      }),
    [t, tCommon, sortBy, sortOrder, handleSort]
  );

  const changePage = React.useCallback((p: number) => {
    startTransition(() => {
      router.push(buildUrl(p, pageSize, search, sortBy, sortOrder));
    });
  }, [pageSize, search, sortBy, sortOrder, buildUrl, router]);

  const changePageSize = React.useCallback((size: number) => {
    startTransition(() => {
      router.push(buildUrl(1, size, search, sortBy, sortOrder));
    });
  }, [search, sortBy, sortOrder, buildUrl, router]);

  const handleDelete = React.useCallback((row: OwningDepartment) => {
    confirm({
      variant: "delete",
      title: `${t("title")}: ${row.owningDepartmentName}`,
      description: t("form.messages.deleteConfirm"),
      meta: {
        name: row.owningDepartmentName,
      },
      onConfirm: async () => {
        try {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const res = await deleteOwningDepartmentAction(fd);
          if (res.success) {
            toast.success(t("form.messages.deleteSuccess") || tCommon("messages.deleteSuccess"));
            startTransition(() => router.refresh());
          } else {
            toast.error(res.message || tCommon("messages.deleteError"));
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : tCommon("messages.deleteError"));
        }
      },
    });
  }, [confirm, router, t, tCommon, toast]);

  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  return (
    <PageContainer>
      <div className="space-y-4">
        <OwningDepartmentHeader
          search={search}
          setSearch={setSearch}
          locale={locale}
          t={t}
        />

        <MasterTable<OwningDepartment>
          columns={columns}
          data={data || []}
          loading={isPending}
          height="lg"
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          renderActions={(row) => (
            <>
              <EditButton
                aria-label={t("edit")}
                onClick={() => router.push(`/${locale}/assets/configuration/master-data/owning-department/edit/${row.id}`)}
              />
              <DeleteButton aria-label={t("delete")} onClick={() => handleDelete(row)} />
            </>
          )}
          actionLabel={t("columns.actions") || t("actions")}
          paginationConfig={{ enabled: true, showPageSizeSelector: false }}
          footerLeftContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {start} {tCommon("table.to")} {end} {tCommon("table.of")} {totalCount} {tCommon("table.entries")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                <Select
                  value={String(pageSize)}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    changePageSize(Number(e.target.value));
                  }}
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
    </PageContainer>
  );
}
