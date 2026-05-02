"use client";

import React, { useCallback, useTransition } from "react";
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
  AddButton,
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
import { cn } from "@/lib/utils/cn";

export function OfficeMaster({
  data, pageNumber, pageSize, totalCount, totalPages, sortBy, sortOrder, type, status
}: OfficeProps): React.ReactElement {
  const router = useRouter();
  const t = useTranslations("office");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const {
    search,
    currentSearchTerm,
    handleSearchChange,
    selectedType,
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
    status
  });

  const {
    buildUrl,
    changePage,
    handlePageSizeChange,
    paginationInfo
  } = useOfficePagination({
    totalCount,
    pageNumber,
    pageSize,
    locale,
    sortBy,
    sortOrder,
    currentSearchTerm,
    startTransition,
    type: selectedType,
    status: selectedStatus
  });

  const handleEdit = useCallback((row: Office) => {
    router.push(`/${locale}/configuration-settings/office-master/edit/${row.officeId}`);
  }, [router, locale]);

  const handleDelete = useCallback((row: Office) => {
    confirm({
      variant: "delete",
      title: `${t("list.table.officeCode")}: ${row.officeCode}`,
      description: t("delete.confirmDescription"),
      meta: { name: row.officeName },
      onConfirm: async () => {
        const formData = new FormData();
        formData.append("officeId", String(row.officeId));
        const result = await deleteOfficeAction(formData);
        if (result.success) {
          toast.success(t("success.deleted"));
          router.refresh();
        } else {
          toast.error(result.message || tCommon("errors.deleteError"));
        }
      },
    });
  }, [confirm, router, t, tCommon]);

  const onSort = useCallback((key: string) => {
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    startTransition(() => {
      router.push(buildUrl(1, pageSize, currentSearchTerm, key, newOrder, selectedType, selectedStatus));
    });
  }, [sortBy, sortOrder, buildUrl, pageSize, currentSearchTerm, selectedType, selectedStatus, router]);

  const columns = getOfficeColumns(t, tCommon, sortBy, sortOrder, onSort);

  const stats = [
    {
      label: t("stats.total"),
      value: totalCount,
      icon: BuildingIcon,
      bgColor: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-600"
    },
    {
      label: t("stats.headOffices"),
      subLabel: tCommon("table.onThisPage"),
      value: data.filter(o => o.type === "Head Office").length,
      icon: Building2,
      bgColor: "bg-purple-500",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-600"
    },
    {
      label: t("stats.activeOffices"),
      subLabel: tCommon("table.onThisPage"),
      value: data.filter(o => o.isActive).length,
      icon: CheckCircle2,
      bgColor: "bg-green-500",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      accentColor: "bg-green-600"
    },
    {
      label: t("stats.regionalOffices"),
      subLabel: tCommon("table.onThisPage"),
      value: data.filter(o => o.type === "Regional Office").length,
      icon: Globe2,
      bgColor: "bg-orange-500",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      accentColor: "bg-orange-600"
    }
  ];

  return (
    <PageContainer
      title={t("list.title")}
      subtitle={t("list.subtitle")}
      actions={
        <AddButton 
          label={t("list.buttons.add")}
          onClick={() => router.push(`/${locale}/configuration-settings/office-master/add`)} 
        />
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-none bg-white shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                        {"subLabel" in stat && (
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {stat.subLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                        stat.iconBg,
                        stat.iconColor
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className={cn(
                    "absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-[0.03] transition-all duration-500 group-hover:scale-150",
                    stat.bgColor
                  )} />
                  <div className={cn(
                    "absolute top-0 left-0 h-full w-1.5 transition-all duration-300",
                    stat.accentColor
                  )} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <MasterTable<Office>
          columns={columns}
          data={data}
          loading={isPending}
          height="lg"
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          onPageSizeChange={(size) => handlePageSizeChange(String(size))}
          actionLabel={tCommon("table.columns.actions")}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          headerExtra={
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <SearchInput
                onChange={handleSearchChange}
                value={search}
                placeholder={t("list.filters.search")}
                className="md:w-72"
              />
              <div className="flex items-center gap-2 ml-auto">
                <Select
                  value={selectedType}
                  onChange={handleTypeChange}
                  options={[
                    { label: t("list.filters.allTypes"), value: "" },
                    { label: t("form.fields.type.options.mainOffice") || "Main Office", value: "Main Office" },
                    { label: t("form.fields.type.options.zonalOffice") || "Zonal Office", value: "Zonal Office" },
                    { label: t("form.fields.type.options.departmentOffice") || "Department Office", value: "Department Office" },
                    { label: t("form.fields.type.options.wardOffice") || "Ward Office", value: "Ward Office" },
                    { label: t("form.fields.type.options.subOffice") || "Sub Office", value: "Sub Office" },
                    { label: t("form.fields.type.options.headOffice") || "Head Office", value: "Head Office" },
                    { label: t("form.fields.type.options.regionalOffice") || "Regional Office", value: "Regional Office" },
                    { label: t("form.fields.type.options.branchOffice") || "Branch Office", value: "Branch Office" },
                  ]}
                  className="min-w-[180px]"
                  placeholder={t("list.filters.type")}
                />
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  options={[
                    { label: t("list.filters.allStatus"), value: "" },
                    { label: tCommon("status.active"), value: "true" },
                    { label: tCommon("status.inactive"), value: "false" },
                  ]}
                  className="min-w-[150px]"
                  placeholder={t("list.filters.status")}
                />
              </div>
            </div>
          }
          renderActions={(row) => (
            <>
              <EditButton onClick={() => handleEdit(row)} />
              <DeleteButton onClick={() => handleDelete(row)} />
            </>
          )}
          footerLeftContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {paginationInfo.start} {tCommon("table.to")} {paginationInfo.end} {tCommon("table.of")} {totalCount}
              </span>
            </div>
          }
          getRowKey={(row) => String(row.officeId)}
        />
      </div>
    </PageContainer>
  );
}
