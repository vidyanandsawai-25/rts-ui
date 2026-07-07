"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { PageContainer, SearchInput, Select, useToast } from "@/components/common";
import { MasterTable } from "@/components/common/MasterTable";
import { AddButton, EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type { PenaltyRuleProps, PenaltyRule } from "@/types/asset-masters/penalty-rule-master.types";
import { getPenaltyRuleMasterColumns } from "./PenaltyRuleMasterColumns";
import { deletePenaltyRuleAction } from "@/app/[locale]/assets/configuration/master-data/penalty-rule-master/action";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { TEXT_SANITIZE } from "@/lib/utils/validation-rules";

export function PenaltyRuleMaster({ data, pageNumber, pageSize, totalCount, totalPages, sortBy, sortOrder, searchTerm }: PenaltyRuleProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("penaltyRuleMaster");
  const tCommon = useTranslations("common");
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [search, setSearch] = React.useState(searchTerm ?? "");
  const [prevSearchTerm, setPrevSearchTerm] = React.useState(searchTerm);

  if (searchTerm !== prevSearchTerm) {
    setSearch(searchTerm ?? "");
    setPrevSearchTerm(searchTerm);
  }

  const pathname = usePathname();
  const isSubRoute = pathname !== `/${locale}/assets/configuration/master-data/penalty-rule-master`.replace(/\/+/g, "/");

  useSearchNavigation({
    search,
    currentSearchTerm: searchTerm ?? "",
    pageSize,
    locale,
    sortBy,
    sortOrder,
    basePath: "/assets/configuration/master-data/penalty-rule-master",
    startTransition: isSubRoute ? () => {} : startTransition,
  });

  const buildUrl = React.useCallback(
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
      if (searchTerm?.trim()) params.set("q", searchTerm.trim());
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder) params.set("sortOrder", newSortOrder);

      return `/${locale}/assets/configuration/master-data/penalty-rule-master?${params.toString()}`;
    },
    [locale]
  );

  const handleSort = React.useCallback((columnKey: string) => {
    startTransition(() => {
      const nextOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc";
      router.push(buildUrl(pageNumber, pageSize, search, columnKey, nextOrder));
    });
  }, [sortBy, sortOrder, pageNumber, pageSize, search, buildUrl, router]);

  const columns = React.useMemo(() => getPenaltyRuleMasterColumns({
    t,
    tCommon,
    sortBy,
    sortOrder,
    onSort: handleSort,
  }), [t, tCommon, sortBy, sortOrder, handleSort]);

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

  const handleDelete = React.useCallback((row: PenaltyRule) => {
    confirm({
      variant: "delete",
      title: `${t("penaltyCode")}: ${row.penaltyCode}`,
      description: `${t("deleteConfirm")}`,
      meta: {
        name: row.penaltyName,
      },
      onConfirm: async () => {
        const fd = new FormData();
        fd.append("id", String(row.id));
        const res = await deletePenaltyRuleAction(fd);
        if (res?.success) {
          toast.success(t("form.messages.deleteSuccess"));
          startTransition(() => router.refresh());
        } else {
          toast.error(res?.message || tCommon("errors.deleteError"));
        }
      },
    });
  }, [confirm, router, t, tCommon, toast]);

  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-slate-700" />
            <div>
              <div className="text-lg font-semibold text-slate-900">{t("title")}</div>
              <div className="text-sm text-slate-500">{t("subtitle")}</div>
            </div>
          </div>
          <div className="flex w-full max-w-xl items-center gap-3">
            <SearchInput
              value={search}
              onChange={(value) => setSearch(value.replace(TEXT_SANITIZE, ""))}
              placeholder={t("searchPlaceholder")}
              className="mb-0 w-full"
            />
            <AddButton label={t("add")} onClick={() => router.push(`/${locale}/assets/configuration/master-data/penalty-rule-master/add`)} />
          </div>
        </div>
        <MasterTable<PenaltyRule>
          columns={columns}
          data={data}
          loading={isPending}
          height="lg"
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          renderActions={(row) => <><EditButton aria-label={t("edit")} onClick={() => router.push(`/${locale}/assets/configuration/master-data/penalty-rule-master/edit/${row.id}`)} /><DeleteButton aria-label={t("delete")} onClick={() => handleDelete(row)} /></>}
          actionLabel={t("actions")}
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
