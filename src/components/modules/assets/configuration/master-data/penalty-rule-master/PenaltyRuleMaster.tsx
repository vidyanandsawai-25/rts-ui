"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { PageContainer, SearchInput, Select } from "@/components/common";
import { MasterTable } from "@/components/common/MasterTable";
import { AddButton, EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { usePenaltyRuleMasterList } from "@/hooks/asset-masters/penalty-rule-master/usePenaltyRuleMasterList";
import { TEXT_SANITIZE } from "@/lib/utils/validation-rules";
import type { PenaltyRuleProps, PenaltyRule } from "@/types/asset-masters/penalty-rule-master.types";

export function PenaltyRuleMaster(props: PenaltyRuleProps) {
  const {
    router,
    locale,
    t,
    tCommon,
    isPending,
    search,
    setSearch,
    columns,
    changePage,
    changePageSize,
    handleDelete,
    start,
    end,
  } = usePenaltyRuleMasterList(props);

  const { data, pageNumber, pageSize, totalCount, totalPages } = props;

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
          renderActions={(row) => (
            <>
              <EditButton aria-label={t("edit")} onClick={() => router.push(`/${locale}/assets/configuration/master-data/penalty-rule-master/edit/${row.id}`)} />
              <DeleteButton aria-label={t("delete")} onClick={() => handleDelete(row)} />
            </>
          )}
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
