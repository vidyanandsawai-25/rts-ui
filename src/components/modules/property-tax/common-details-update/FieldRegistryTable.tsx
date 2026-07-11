"use client";

import { useMemo } from "react";
import {
  MasterTable,
  Column,
  Select,
  SearchInput,
  ToggleSwitch
} from "@/components/common";
import { BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";
import { toast } from "sonner";

import { useFieldRegistryState } from "@/hooks/commonDetailsUpdate/useFieldRegistryState";

interface FieldRegistryTableProps {
  t: (key: string) => string;
  state: ReturnType<typeof useFieldRegistryState>;
}

export const FieldRegistryTable = ({ t, state }: FieldRegistryTableProps) => {
  const {
    fields, setFields,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    searchTerm, setSearchTerm,
    pageNumber, setPageNumber,
    pageSize, setPageSize,
    submitting
  } = state;

  const getFieldSubtitle = (item: BulkUpdateMaster) => {
    const categoryVal = item.category || (item as unknown as Record<string, unknown>).Category;
    if (categoryVal) return categoryVal as string;
    const name = item.updateName.toLowerCase();
    if (name.includes("number") || name.includes("id") || name.includes("upic")) return "Property Identity";
    if (name.includes("ward") || name.includes("sector") || name.includes("zone") || name.includes("node")) return "Location";
    if (name.includes("mobile") || name.includes("phone") || name.includes("email") || name.includes("owner")) return "Owner Contact";
    return item.description || "General Settings";
  };

  const categoryOptions = useMemo(() => [
    { label: t("fieldRegistry.filters.allCategories") || "All Categories", value: "all" },
    { label: "Property Identity", value: "Property Identity" },
    { label: "Location", value: "Location" },
    { label: "Owner Contact", value: "Owner Contact" },
    { label: "Owner Details", value: "Owner Details" },
    { label: "Occupier Details", value: "Occupier Details" },
    { label: "Building Details", value: "Building Details" },
    { label: "Assessment", value: "Assessment" },
    { label: "Tax Details", value: "Tax Details" },
    { label: "Collection", value: "Collection" },
    { label: "Notice", value: "Notice" },
  ], [t]);

  const statusOptions = useMemo(() => [
    { label: t("fieldRegistry.filters.all") || "All", value: "all" },
    { label: t("fieldRegistry.filters.active") || "Active", value: "active" },
    { label: t("fieldRegistry.filters.inactive") || "Inactive", value: "inactive" }
  ], [t]);

  const filteredFields = useMemo(() => {
    return fields.filter((f: BulkUpdateMaster) => {
      const matchesSearch = !searchTerm.trim() || 
        f.updateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.updateCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && f.isActive) ||
        (statusFilter === "inactive" && !f.isActive);
      const matchesCategory = categoryFilter === "all" || getFieldSubtitle(f) === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [fields, searchTerm, statusFilter, categoryFilter]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<Column<any>[]>(() => [
    {
      key: "updateName",
      label: t("fieldRegistry.table.fieldName"),
      render: (_, row) => (
        <span className="text-sm font-semibold text-slate-800 py-1 block">{row.updateName}</span>
      )
    },
    {
      key: "isActive",
      label: t("fieldRegistry.table.active"),
      align: "center",
      width: "120px",
      render: (_, row) => (
        <div className="flex justify-center">
          <ToggleSwitch
            checked={row.isActive}
            onChange={(checked) => {
              setFields((prev) => prev.map((f: BulkUpdateMaster) => (f.id === row.id || f.updateCode === row.updateCode) ? { ...f, isActive: checked } : f));
              toast.success(`${row.updateName} set to ${checked ? 'Active' : 'Inactive'}`);
            }}
            showPopup={false}
          />
        </div>
      )
    }
  ], [setFields, t]);

  const totalCount = filteredFields.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const pagedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredFields.slice(start, start + pageSize).map((f: BulkUpdateMaster) => f as unknown as Record<string, unknown>);
  }, [filteredFields, pageNumber, pageSize]);

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-80">
              <label className="block text-xs font-semibold text-[#1E3A8A] mb-1">{t("fieldRegistry.filters.category")}</label>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={categoryOptions} className="w-full" />
            </div>
            <div className="w-36">
              <label className="block text-xs font-semibold text-[#1E3A8A] mb-1">{t("fieldRegistry.filters.status")}</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} className="w-full" />
            </div>
          </div>
          <div className="w-72">
            <label className="block text-xs font-semibold text-[#1E3A8A] mb-1">&nbsp;</label>
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={t("fieldRegistry.filters.searchPlaceholder")} className="w-full" />
          </div>
        </div>
      </div>

      {/* MasterTable with pagination */}
      <MasterTable
        columns={tableColumns}
        data={pagedData}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPageNumber}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNumber(1);
        }}
        paginationConfig={{
          enabled: true,
          showPageSizeSelector: true
        }}
        emptyText={t("fieldRegistry.emptyState.title")}
        loading={submitting}
        maxBodyHeightClassName="max-h-[500px]"
      />
    </div>
  );
};
