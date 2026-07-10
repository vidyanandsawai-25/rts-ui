"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Edit2, Trash, Landmark, Folder, Search } from "lucide-react";
import { Card, Drawer, useConfirm } from "@/components/common";
import { toast } from "sonner";
import {
  saveCmsDepartmentAction,
  updateCmsDepartmentAction,
  deleteCmsDepartmentAction,
  saveCmsServiceAction,
  updateCmsServiceAction,
  deleteCmsServiceAction
} from "@/app/[locale]/cms/actions";

interface MasterConfigProps {
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
}

export default function CmsMastersConfig({ masters }: MasterConfigProps) {
  const { confirm } = useConfirm();
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
      toast.error("Name cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        if (drawerType === "department") {
          if (drawerMode === "add") {
            const res = await saveCmsDepartmentAction(formName);
            if (res.success && res.department) {
              setDepartments(prev => [...prev, res.department!]);
              toast.success("Department added successfully!");
            } else {
              toast.error("Failed to add department");
            }
          } else {
            // Edit
            if (!editingItem) return;
            const res = await updateCmsDepartmentAction(editingItem.id, formName);
            if (res.success && res.department) {
              setDepartments(prev => prev.map(d => d.id === editingItem.id ? res.department! : d));
              toast.success("Department updated successfully!");
            } else {
              toast.error("Failed to update department");
            }
          }
        } else {
          // Service
          if (!formDeptId) {
            toast.error("Please select a department");
            return;
          }
          if (drawerMode === "add") {
            const res = await saveCmsServiceAction(formName, formDeptId);
            if (res.success && res.service) {
              setServices(prev => [...prev, res.service!]);
              toast.success("Service added successfully!");
            } else {
              toast.error("Failed to add service");
            }
          } else {
            // Edit
            if (!editingItem) return;
            const res = await updateCmsServiceAction(editingItem.id, formName, formDeptId);
            if (res.success && res.service) {
              setServices(prev => prev.map(s => s.id === editingItem.id ? res.service! : s));
              toast.success("Service updated successfully!");
            } else {
              toast.error("Failed to update service");
            }
          }
        }
        setDrawerOpen(false);
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred");
      }
    });
  };

  // Delete operations
  const handleDeleteDepartment = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: "Delete Department",
      description: `Are you sure you want to delete department "${name}"? All associated services will also be removed.`,
      onConfirm: () => {
        startTransition(async () => {
          try {
            const res = await deleteCmsDepartmentAction(id);
            if (res.success) {
              setDepartments(prev => prev.filter(d => d.id !== id));
              // Cascaded local delete for services
              setServices(prev => prev.filter(s => s.departmentId !== id));
              toast.success("Department and its services deleted!");
            } else {
              toast.error("Failed to delete department");
            }
          } catch (err: any) {
            toast.error(err.message || "Error deleting department");
          }
        });
      }
    });
  };

  const handleDeleteService = (id: string, name: string) => {
    confirm({
      variant: "delete",
      title: "Delete Service",
      description: `Are you sure you want to delete service "${name}"?`,
      onConfirm: () => {
        startTransition(async () => {
          try {
            const res = await deleteCmsServiceAction(id);
            if (res.success) {
              setServices(prev => prev.filter(s => s.id !== id));
              toast.success("Service deleted successfully!");
            } else {
              toast.error("Failed to delete service");
            }
          } catch (err: any) {
            toast.error(err.message || "Error deleting service");
          }
        });
      }
    });
  };

  // Filtered Lists
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase().trim()));
  }, [departments, deptSearch]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(serviceSearch.toLowerCase().trim());
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

  return (
    <div className="space-y-4">
      {/* Title & Header Actions Area */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            CMS Masters Config
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Configure municipal departments and registered citizen services globally
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddDepartment}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            Registered Depts
          </button>
          <button
            onClick={openAddService}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            Registered Services
          </button>
        </div>
      </div>



      {/* Tables layout in a 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Departments Card */}
        <Card className="p-4 border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-[#3d3d3d]">
              <Landmark className="h-4 w-4 text-[#4b70a6]" />
              Registered Departments Master
            </h2>
            
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search departments..."
                value={deptSearch}
                onChange={e => handleDeptSearchChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-[12px] font-semibold text-slate-800 placeholder-slate-450 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] text-slate-600">
              <thead className="bg-[#4b70a6] text-white font-bold">
                <tr>
                  <th className="p-3 w-16 text-center border-r border-[#3d5a8a]">Sr. No.</th>
                  <th className="p-3 border-r border-[#3d5a8a]">Department Name</th>
                  <th className="p-3 w-28 text-center border-r border-[#3d5a8a]">Status</th>
                  <th className="p-3 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-semibold">
                      No departments registered.
                    </td>
                  </tr>
                ) : (
                  paginatedDepartments.map((dept, index) => {
                    const isSelected = selectedDeptId === dept.id;
                    return (
                      <tr
                        key={dept.id}
                        onClick={() => handleSelectDept(isSelected ? null : dept.id)}
                        className={`cursor-pointer transition border-l-4 ${
                          isSelected
                            ? "bg-blue-50/70 border-l-[#4b70a6] text-[#4b70a6] font-bold"
                            : "border-l-transparent hover:bg-slate-50/50"
                        }`}
                      >
                        <td className="p-3 text-center font-bold text-slate-500">{(deptPage - 1) * 12 + index + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{dept.name}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">
                            Active
                          </span>
                        </td>
                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDepartment(dept);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-[#4b70a6] bg-slate-50/50 hover:bg-slate-50 transition"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDepartment(dept.id, dept.name);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-rose-650 bg-rose-50/50 hover:bg-rose-100 transition"
                              title="Delete"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Department Pagination controls */}
          {totalDeptPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-[12px] text-slate-500 font-medium">
              <span>Showing {(deptPage - 1) * 12 + 1} - {Math.min(deptPage * 12, filteredDepartments.length)} of {filteredDepartments.length}</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={deptPage === 1}
                  onClick={() => setDeptPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={deptPage === totalDeptPages}
                  onClick={() => setDeptPage(prev => Math.min(prev + 1, totalDeptPages))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* 2. Services Card */}
        <Card className="p-4 border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-[#3d3d3d]">
              <Folder className="h-4 w-4 text-[#4b70a6]" />
              Registered Services Master
            </h2>

            <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full sm:w-auto">
              {selectedDeptId && (
                <div className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-[#4b70a6]">
                  <span>Filter Active</span>
                  <button
                    onClick={() => setSelectedDeptId(null)}
                    className="hover:text-blue-800 underline font-black"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={e => handleServiceSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-[12px] font-semibold text-slate-800 placeholder-slate-450 focus:border-teal-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] text-slate-600">
              <thead className="bg-[#4b70a6] text-white font-bold">
                <tr>
                  <th className="p-3 w-16 text-center border-r border-[#3d5a8a]">Sr. No.</th>
                  <th className="p-3 border-r border-[#3d5a8a]">Service Name</th>
                  <th className="p-3 border-r border-[#3d5a8a]">Department Name</th>
                  <th className="p-3 w-28 text-center border-r border-[#3d5a8a]">Status</th>
                  <th className="p-3 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                      No services registered.
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service, index) => (
                    <tr key={service.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 text-center font-bold text-slate-500">{(servicePage - 1) * 12 + index + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{service.name}</td>
                      <td className="p-3 text-slate-500 font-medium">{deptMap.get(service.departmentId) || service.departmentId}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200">
                          Active
                        </span>
                      </td>
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditService(service);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-[#4b70a6] bg-slate-50/50 hover:bg-slate-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteService(service.id, service.name);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-rose-655 bg-rose-50/50 hover:bg-rose-100 transition"
                            title="Delete"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Service Pagination controls */}
          {totalServicePages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-[12px] text-slate-500 font-medium">
              <span>Showing {(servicePage - 1) * 12 + 1} - {Math.min(servicePage * 12, filteredServices.length)} of {filteredServices.length}</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={servicePage === 1}
                  onClick={() => setServicePage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={servicePage === totalServicePages}
                  onClick={() => setServicePage(prev => Math.min(prev + 1, totalServicePages))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
                ? `Register New ${drawerType === "department" ? "Department" : "Service"}`
                : `Edit ${drawerType === "department" ? "Department" : "Service"} Profile`}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px] text-slate-700">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">
              {drawerType === "department" ? "Department Name" : "Service Name"}
            </label>
            <input
              type="text"
              required
              placeholder={drawerType === "department" ? "e.g. Health Department" : "e.g. Water Connection License"}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          {drawerType === "service" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Department</label>
              <select
                required
                value={formDeptId}
                onChange={e => setFormDeptId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="">Select dept...</option>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#4b70a6] text-white hover:bg-[#3d5e8c] text-xs font-bold transition flex items-center gap-1"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
