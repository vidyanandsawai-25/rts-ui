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
      title: `${t("table.columns.officeCode")}: ${row.officeCode}`,
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
      label: t("stats.totalOffices"),
      value: totalCount,
      icon: BuildingIcon,
      bgColor: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-600"
    },
    {
      label: t("stats.headOffices"),
      value: data.filter(o => o.type === "Head Office").length,
      icon: Building2,
      bgColor: "bg-purple-500",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-600"
    },
    {
      label: t("stats.activeOffices"),
      value: data.filter(o => o.isActive).length,
      icon: CheckCircle2,
      bgColor: "bg-green-500",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      accentColor: "bg-green-600"
    },
    {
      label: t("stats.regionalOffices"),
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
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <AddButton 
          label={t("actions.addOffice")}
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
                value={currentSearchTerm}
                placeholder={t("table.searchPlaceholder")}
                className="md:w-72"
              />
              <div className="flex items-center gap-2 ml-auto">
                <Select
                  value={selectedType}
                  onChange={handleTypeChange}
                  options={[
                    { label: t("filters.allTypes"), value: "" },
                    { label: "Head Office", value: "Head Office" },
                    { label: "Regional Office", value: "Regional Office" },
                    { label: "Branch Office", value: "Branch Office" },
                  ]}
                  className="w-48"
                  placeholder={t("filters.type")}
                />
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  options={[
                    { label: t("filters.allStatus"), value: "" },
                    { label: tCommon("status.active"), value: "true" },
                    { label: tCommon("status.inactive"), value: "false" },
                  ]}
                  className="w-40"
                  placeholder={t("filters.status")}
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
