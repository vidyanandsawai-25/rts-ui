"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Landmark, Folder } from "lucide-react";
import { Badge, Button, Card, Drawer, MasterTable, SearchInput, useConfirm } from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { toast } from "sonner";
import {
  saveCmsDepartmentAction,
  updateCmsDepartmentAction,
  deleteCmsDepartmentAction,
  saveCmsServiceAction,
  updateCmsServiceAction,
  deleteCmsServiceAction
} from "@/app/[locale]/rts/actions";

interface MasterConfigProps {
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
}

type DepartmentRow = Record<string, unknown> & { id: string; srNo: number; name: string; status: string };
type ServiceRow = Record<string, unknown> & { id: string; srNo: number; name: string; departmentName: string; status: string };

export default function CmsMastersConfig({ masters }: MasterConfigProps) {
  const { confirm } = useConfirm();
  const t = useTranslations("rts");
  const [departments, setDepartments] = useState(masters.departments);
  const [services, setServices] = useState(masters.services);

  // Filter & Search states
  const [deptSearch, setDeptSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Pagination states
  const [deptPage, setDeptPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  // Reset page helpers
  const handleDeptSearchChange = (val: string) => {
    setDeptSearch(val);
    setDeptPage(1);
  };

  const handleServiceSearchChange = (val: string) => {
    setServiceSearch(val);
    setServicePage(1);
  };

  const handleSelectDept = (id: string | null) => {
    setSelectedDeptId(id);
    setServicePage(1);
  };

  const [isPending, startTransition] = useTransition();

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [drawerType, setDrawerType] = useState<"department" | "service">("department");
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; departmentId?: string } | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDeptId, setFormDeptId] = useState("");

  // Helpers to trigger drawers
  const openAddDepartment = () => {
    setDrawerType("department");
    setDrawerMode("add");
    setEditingItem(null);
    setFormName("");
    setFormDeptId("");
    setDrawerOpen(true);
  };

  const openAddService = () => {
    setDrawerType("service");
    setDrawerMode("add");
    setEditingItem(null);
    setFormName("");
    setFormDeptId(departments[0]?.id || "");
    setDrawerOpen(true);
  };

  const openEditDepartment = (dept: { id: string; name: string }) => {
    setDrawerType("department");
    setDrawerMode("edit");
    setEditingItem(dept);
    setFormName(dept.name);
    setFormDeptId("");
    setDrawerOpen(true);
  };

  const openEditService = (service: { id: string; name: string; departmentId: string }) => {
    setDrawerType("service");
    setDrawerMode("edit");
    setEditingItem(service);
    setFormName(service.name);
    setFormDeptId(service.departmentId);
    setDrawerOpen(true);
  };

  // Submit operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(t("masters.emptyNameError"));
      return;
    }

    startTransition(async () => {
      try {
        if (drawerType === "department") {
          if (drawerMode === "add") {
            const res = await saveCmsDepartmentAction(formName);
            if (res.success && res.department) {
              setDepartments(prev => [...prev, res.department!]);
              toast.success(t("masters.departmentAdded"));
            } else {
              toast.error(t("masters.departmentAddFailed"));
            }
          } else {
            // Edit
            if (!editingItem) return;
            const res = await updateCmsDepartmentAction(editingItem.id, formName);
            if (res.success && res.department) {
              setDepartments(prev => prev.map(d => d.id === editingItem.id ? res.department! : d));
              toast.success(t("masters.departmentUpdated"));
            } else {
              toast.error(t("masters.departmentUpdateFailed"));
            }
          }
        } else {
          // Service
          if (!formDeptId) {
            toast.error(t("masters.selectDepartmentError"));
            return;
          }
          if (drawerMode === "add") {
            const res = await saveCmsServiceAction(formName, formDeptId);
            if (res.success && res.service) {
              setServices(prev => [...prev, res.service!]);
              toast.success(t("masters.serviceAdded"));
            } else {
              toast.error(t("masters.serviceAddFailed"));
            }
          } else {
            // Edit
            if (!editingItem) return;
            const res = await updateCmsServiceAction(editingItem.id, formName, formDeptId);
            if (res.success && res.service) {
              setServices(prev => prev.map(s => s.id === editingItem.id ? res.service! : s));
              toast.success(t("masters.serviceUpdated"));
            } else {
              toast.error(t("masters.serviceUpdateFailed"));
            }
          }
        }
        setDrawerOpen(false);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("masters.unexpectedError")
        );
      }
    });
  };

  // Delete operations
  const handleDeleteDepartment = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: t("masters.deleteDepartment"),
      description: t("masters.confirmDeleteDept", { name }),
      onConfirm: () => {
        startTransition(async () => {
          try {
            const res = await deleteCmsDepartmentAction(id);
            if (res.success) {
              setDepartments(prev => prev.filter(d => d.id !== id));
              // Cascaded local delete for services
              setServices(prev => prev.filter(s => s.departmentId !== id));
              toast.success(t("masters.departmentDeleted"));
            } else {
              toast.error(t("masters.departmentDeleteFailed"));
            }
          } catch (error: unknown) {
            toast.error(
              error instanceof Error
                ? error.message
                : t("masters.departmentDeleteFailed")
            );
          }
        });
      }
    });
  };

  const handleDeleteService = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: t("masters.deleteService"),
      description: t("masters.confirmDeleteService", { name }),
      onConfirm: () => {
        startTransition(async () => {
          try {
            const res = await deleteCmsServiceAction(id);
            if (res.success) {
              setServices(prev => prev.filter(s => s.id !== id));
              toast.success(t("masters.serviceDeleted"));
            } else {
              toast.error(t("masters.serviceDeleteFailed"));
            }
          } catch (error: unknown) {
            toast.error(
              error instanceof Error
                ? error.message
                : t("masters.serviceDeleteFailed")
            );
          }
        });
      }
    });
  };

  // Filtered Lists
  const filteredDepartments = useMemo(() => {
    const query = deptSearch.toLocaleLowerCase().trim();
    return departments.filter(d =>
      d.name.toLocaleLowerCase().includes(query)
    );
  }, [departments, deptSearch]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const query = serviceSearch.toLocaleLowerCase().trim();
      const matchesSearch = s.name.toLocaleLowerCase().includes(query);
      const matchesDept = !selectedDeptId || s.departmentId === selectedDeptId;
      return matchesSearch && matchesDept;
    });
  }, [services, serviceSearch, selectedDeptId]);

  // Paginated Slices (12 rows max)
  const totalDeptPages = Math.ceil(filteredDepartments.length / 12) || 1;
  const paginatedDepartments = useMemo(() => {
    const start = (deptPage - 1) * 12;
    return filteredDepartments.slice(start, start + 12);
  }, [filteredDepartments, deptPage]);

  const totalServicePages = Math.ceil(filteredServices.length / 12) || 1;
  const paginatedServices = useMemo(() => {
    const start = (servicePage - 1) * 12;
    return filteredServices.slice(start, start + 12);
  }, [filteredServices, servicePage]);

  const deptMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach(d => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const departmentRows: DepartmentRow[] = paginatedDepartments.map((dept, index) => ({
    id: dept.id,
    srNo: (deptPage - 1) * 12 + index + 1,
    name: dept.name,
    status: "active",
  }));

  const serviceRows: ServiceRow[] = paginatedServices.map((service, index) => ({
    id: service.id,
    srNo: (servicePage - 1) * 12 + index + 1,
    name: service.name,
    departmentName:
      deptMap.get(service.departmentId) ||
      t("masters.unknownDepartment"),
    status: "active",
  }));

  const departmentColumns: Column<DepartmentRow>[] = [
    { key: "srNo", label: t("masters.srNo"), width: "64px", align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "font-bold text-slate-500 border-r border-slate-100" },
    { key: "name", label: t("masters.deptName"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "font-semibold text-slate-800 border-r border-slate-100" },
    { key: "status", label: t("masters.status"), width: "112px", align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: () => <Badge variant="success" size="sm">{t("masters.active")}</Badge> },
  ];

  const serviceColumns: Column<ServiceRow>[] = [
    { key: "srNo", label: t("masters.srNo"), width: "64px", align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "font-bold text-slate-500 border-r border-slate-100" },
    { key: "name", label: t("masters.serviceName"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "font-semibold text-slate-800 border-r border-slate-100" },
    { key: "departmentName", label: t("masters.deptName"), headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "font-medium text-slate-500 border-r border-slate-100" },
    { key: "status", label: t("masters.status"), width: "112px", align: "center", headerClassName: "border-r border-blue-300/60 text-white", cellClassName: "border-r border-slate-100", render: () => <Badge variant="success" size="sm">{t("masters.active")}</Badge> },
  ];

  const tableHeaderClass = "!bg-[#4b70a6] !from-[#4b70a6] !via-[#4b70a6] !to-[#4b70a6] hover:!from-[#4b70a6] hover:!via-[#4b70a6] hover:!to-[#4b70a6] [&_th]:!text-white";
  const tableClass = "border-collapse text-left text-sm [&_th:last-child]:border-l [&_th:last-child]:border-blue-300/60 [&_td:last-child]:border-l [&_td:last-child]:border-slate-100";
  const actionButtons = (onEdit: () => void, onDelete: () => void) => (
    <div className="flex justify-center gap-1.5" onClick={(event) => event.stopPropagation()}>
      <Button type="button" aria-label={t("masters.edit")} title={t("masters.edit")} variant="edit" size="sm" icon={Pencil} onClick={onEdit} className="size-10 px-0" />
      <Button type="button" aria-label={t("masters.delete")} title={t("masters.delete")} variant="delete" size="sm" icon={Trash2} onClick={onDelete} className="size-10 px-0" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Title & Header Actions Area */}
      <Card className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t("masters.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t("masters.addDept")}
            onClick={openAddDepartment}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            {t("masters.addDept")}
          </button>
          <button
            type="button"
            aria-label={t("masters.addService")}
            onClick={openAddService}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            {t("masters.addService")}
          </button>
        </div>
      </Card>



      {/* Tables layout in a 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Departments Card */}
        <Card className="p-4 border rounded-2xl border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-[#3d3d3d]">
              <Landmark className="h-4 w-4 text-[#4b70a6]" />
              {t("masters.registeredDepartmentsMaster")}
            </h2>

            <SearchInput value={deptSearch} onChange={handleDeptSearchChange} placeholder={t("masters.searchDepartments")} className="mb-0 w-full sm:w-64 [&_input]:py-1.5 [&_input]:text-xs" />
          </div>
          <MasterTable
            columns={departmentColumns}
            data={departmentRows}
            getRowKey={(row) => row.id}
            emptyText={t("masters.noDepartmentsRegistered")}
            actionLabel={t("masters.actions")}
            pageNumber={deptPage}
            pageSize={12}
            totalCount={filteredDepartments.length}
            totalPages={totalDeptPages}
            onPageChange={setDeptPage}
            paginationConfig={{ enabled: totalDeptPages > 1, showPageSizeSelector: false }}
            maxBodyHeightClassName="max-h-auto"
            theadClassName={tableHeaderClass}
            tableClassName={tableClass}
            containerClassName="gap-0"
            onRowClick={(row) => handleSelectDept(selectedDeptId === row.id ? null : row.id)}
            rowClassName={(row) => selectedDeptId === row.id ? "bg-blue-50/70" : ""}
            renderActions={(row) => actionButtons(() => openEditDepartment({ id: row.id, name: row.name }), () => handleDeleteDepartment(row.id, row.name))}
          />

        </Card>

        {/* 2. Services Card */}
        <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-[#3d3d3d]">
              <Folder className="h-4 w-4 text-[#4b70a6]" />
              {t("masters.registeredServicesMaster")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full sm:w-auto">
              {selectedDeptId && (
                <div className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-[#4b70a6]">
                  <span>{t("masters.filterActive")}</span>
                  <button
                    type="button"
                    aria-label={t("masters.clearDepartmentFilter")}
                    title={t("masters.clearDepartmentFilter")}
                    onClick={() => setSelectedDeptId(null)}
                    className="hover:text-blue-800 underline font-black"
                  >
                    {t("masters.clear")}
                  </button>
                </div>
              )}

              <SearchInput value={serviceSearch} onChange={handleServiceSearchChange} placeholder={t("masters.searchServices")} className="mb-0 w-full sm:w-64 [&_input]:py-1.5 [&_input]:text-xs" />
            </div>
          </div>
          <MasterTable
            columns={serviceColumns}
            data={serviceRows}
            getRowKey={(row) => row.id}
            emptyText={t("masters.noServicesRegistered")}
            actionLabel={t("masters.actions")}
            pageNumber={servicePage}
            pageSize={12}
            totalCount={filteredServices.length}
            totalPages={totalServicePages}
            onPageChange={setServicePage}
            paginationConfig={{ enabled: totalServicePages > 1, showPageSizeSelector: false }}
            maxBodyHeightClassName="max-h-auto"
            theadClassName={tableHeaderClass}
            tableClassName={tableClass}
            containerClassName="gap-0"
            renderActions={(row) => actionButtons(() => openEditService({ id: row.id, name: row.name, departmentId: filteredServices.find((service) => service.id === row.id)?.departmentId || "" }), () => handleDeleteService(row.id, row.name))}
          />
        </Card>
      </div>

      {/* Redesigned Sidebar Form Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="sm"
        title={
          <div className="flex items-center gap-2">
            {drawerType === "department" ? (
              <Landmark className="h-5 w-5 text-[#4b70a6]" />
            ) : (
              <Folder className="h-5 w-5 text-[#4b70a6]" />
            )}
            <span id="drawer-title" className="text-sm font-extrabold text-slate-800">
              {drawerMode === "add"
                ? (drawerType === "department" ? t("masters.registerNewDepartment") : t("masters.registerNewService"))
                : (drawerType === "department" ? t("masters.editDepartmentProfile") : t("masters.editServiceProfile"))}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px] text-slate-700">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">
              {drawerType === "department" ? t("masters.deptName") : t("masters.serviceName")}
            </label>
            <input
              type="text"
              required
              placeholder={drawerType === "department" ? t("masters.departmentNamePlaceholder") : t("masters.serviceNamePlaceholder")}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          {drawerType === "service" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("masters.department")}</label>
              <select
                required
                value={formDeptId}
                onChange={e => setFormDeptId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="">{t("masters.selectDepartmentPlaceholder")}</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-650 transition"
            >
              {t("masters.cancel")}
            </button>
            <button
              type="submit"
              aria-label={isPending ? t("masters.saving") : t("masters.saveChanges")}
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#4b70a6] text-white hover:bg-[#3d5e8c] text-xs font-bold transition flex items-center gap-1"
            >
              {isPending ? t("masters.saving") : t("masters.saveChanges")}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}