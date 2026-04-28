"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BuildingIcon, Building2, CheckCircle2, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  MasterTable, 
  EditButton, 
  DeleteButton, 
  TableHeader, 
  useConfirm, 
  PageContainer, 
  SearchInput, 
  Select 
} from "@/components/common";
import type { Office, OfficeProps } from "@/types/office.types";
import { deleteOfficeAction } from "@/app/[locale]/configuration-settings/office-master/action";
import { getOfficeColumns } from "./OfficeColumns";
import { useOfficeSearch } from "@/hooks/useOfficeSearch";
import { useOfficePagination } from "@/hooks/useOfficePagination";

export function OfficeMaster({
  data, pageNumber, pageSize, totalCount, totalPages, sortBy, sortOrder, type, status
}: OfficeProps): React.ReactElement {
  const router = useRouter();
  const t = useTranslations("office"); 
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { confirm } = useConfirm();
  const [isPending, startTransition] = React.useTransition();

  const { search, currentSearchTerm, handleSearchChange, selectedType,
    handleTypeChange,
    selectedStatus,
    handleStatusChange,
  } = useOfficeSearch({
    pageSize,
    locale,
    sortBy,
    sortOrder,
    startTransition,
    type,
    status,
  });
  /* ================= PAGINATION ================= */
  const { buildUrl, changePage, handlePageSizeChange, paginationInfo } = useOfficePagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    currentSearchTerm,
    sortBy,
    sortOrder,
    startTransition,
    type: selectedType,
    status: selectedStatus,
  });

  const handleSort = useCallback(
    (columnKey: string) => {
      let newSortOrder = "asc";
      if (sortBy === columnKey) {
        newSortOrder = sortOrder === "asc" ? "desc" : "asc";
      }
      startTransition(() => {
        router.push(buildUrl(1, pageSize, currentSearchTerm, columnKey, newSortOrder));
      });
    },
    [sortBy, sortOrder, router, buildUrl, pageSize, currentSearchTerm]
  );

  const columns = getOfficeColumns(t, tCommon, sortBy, sortOrder, handleSort);

  const handleEdit = useCallback(
    (row: Office) => {
      startTransition(() => {
        router.push(`/${locale}/configuration-settings/office-master/edit/${row.officeId}`);
      });
    },
    [router, locale]
  );

  const handleDelete = useCallback(
    (row: Office) => {
      confirm({
        variant: "delete",
        title: `${t("list.table.officeCode") || "Code"}: ${row.officeCode}`,
        description: `${t("delete.confirmDescription") || "Are you sure you want to delete?"}`,
        meta: { name: row.officeName },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("officeId", String(row.officeId));
          const result = await deleteOfficeAction(fd);
          if (result.success) {
            toast.success(t("success.deleted", { code: row.officeCode }) || "Deleted successfully");
            startTransition(() => { router.refresh(); });
          } else {
            let errorMessage = tCommon("errors.deleteError");
            if (result.statusCode === 409) errorMessage = t("apiErrors.inUse") || "Record in use";
            else if (result.statusCode === 400) errorMessage = t("apiErrors.validationError") || "Validation error";
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, router, t, tCommon]
  );

  const { start, end, total } = paginationInfo;
  const activeCount = data.filter((o) => o.isActive).length;
  const inactiveCount = data.filter((o) => !o.isActive).length;

  const stats = [
    {
      label: t('stats.total') || 'Total',
      value: totalCount,
      icon: Building2,
      bgColor: 'bg-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accentColor: 'bg-blue-500',
    },
    {
      label: `${t('stats.active') || 'Active'} (${tCommon('table.onThisPage') || 'on this page'})`,
      value: activeCount,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      accentColor: 'bg-emerald-500',
    },
    {
      label: `${t('stats.inactive') || 'Inactive'} (${tCommon('table.onThisPage') || 'on this page'})`,
      value: inactiveCount,
      icon: BuildingIcon,
      bgColor: 'bg-violet-100',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      accentColor: 'bg-violet-500',
    },
    {
      label: t('stats.records') || 'Total Records',
      value: totalCount,
      icon: Globe2,
      bgColor: 'bg-pink-100',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      accentColor: 'bg-pink-500',
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader
          title={t("list.title") || "Office Master"}
          subtitle={t("list.subtitle") || "Manage office branches"}
          icon={BuildingIcon}
          actionLabel={t("list.buttons.add") || "Add Office"}
          onActionClick={() => {
            startTransition(() => {
              router.push(`/${locale}/configuration-settings/office-master/add`);
            });
          }}
          rightContent={
            <div className="flex w-full justify-end">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={t("list.filters.search") || "Search Office..."}
                className="mb-0 w-80 text-gray-900"
              />
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="relative flex items-center justify-between p-4">
                  <div className="z-10">
                    <p className="mb-1 text-xs font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div
                    className={`z-10 rounded-xl p-3 shadow-md transition-transform group-hover:scale-110 ${stat.iconBg} ${stat.iconColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div
                    className={`absolute -bottom-6 -right-6 h-20 w-20 rounded-tl-full opacity-60 transition-all group-hover:h-24 group-hover:w-24 ${stat.bgColor}`}
                  />
                  <div className={`absolute left-0 top-0 h-full w-1.5 ${stat.accentColor}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table Filter Toolbar */}
        <div className="flex items-center justify-between gap-3 rounded-t-xl border-x border-t border-blue-100 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Select
              value={selectedType}
              onChange={handleTypeChange}
              options={[
                { label: "All Types", value: "" },
                { label: "Main Office", value: "Main Office" },
                { label: "Zonal Office", value: "Zonal Office" },
                { label: "Department Office", value: "Department Office" },
                { label: "Ward Office", value: "Ward Office" },
                { label: "Sub Office", value: "Sub Office" },
                { label: "Head Office", value: "Head Office" },
              ]}
              placeholder="Filter by Type"
              className="w-48"
              selectSize="sm"
            />
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              options={[
                { label: "All Status", value: "" },
                { label: tCommon("status.active"), value: "true" },
                { label: tCommon("status.inactive"), value: "false" },
              ]}
              placeholder="Status"
              className="w-36"
              selectSize="sm"
            />
          </div>
          <div className="text-sm font-medium text-blue-900/60">
            {total} {tCommon("messages.recordsFound") || "Records Found"}
          </div>
        </div>

        <MasterTable<Office>
          columns={columns} data={data} loading={isPending} height="lg"
          pageNumber={pageNumber} pageSize={pageSize} totalCount={totalCount} totalPages={totalPages}
          onPageChange={changePage}
          renderActions={(row) => (
            <>
              <EditButton aria-label={tCommon("table.actions.edit")} onClick={() => handleEdit(row)} />
              <DeleteButton aria-label={tCommon("table.actions.delete")} onClick={() => handleDelete(row)} />
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
                  value={String(pageSize)} onChange={handlePageSizeChange}
                  options={[10, 20, 30, 40, 50].map((s) => ({ label: String(s), value: String(s) }))}
                  selectSize="sm" className="w-20" ariaLabel="Rows per page"
                />
              </div>
            </div>
          }
          getRowKey={(row) => String(row.officeId)}
        />
      </div>
    </PageContainer>
  );
}
