"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Shield, Mail, Phone, Users, Trash, Edit2 } from "lucide-react";
import { Card, Drawer, useConfirm } from "@/components/common";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createCmsUserAction } from "@/app/[locale]/rts/actions";
import type { CmsOfficer } from "@/lib/mock/rts/cms";

interface UserMgmtProps {
  officers: CmsOfficer[];
  departments: Array<{ id: string; name: string }>;
}

export default function CmsUserMgmt({ officers, departments }: UserMgmtProps) {
  const { confirm } = useConfirm();
  const t = useTranslations("cms");
  const tCommon = useTranslations("common");
  const [officersList, setOfficersList] = useState<CmsOfficer[]>(officers);
  const [selectedDeptId, setSelectedDeptId] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Drawer control states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<CmsOfficer | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmpId, setFormEmpId] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formRole, setFormRole] = useState("Junior Clerk");
  const [formEmail, setFormEmail] = useState("");
  const [formMobile, setFormMobile] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormEmpId("");
    setFormDeptId("");
    setFormDesignation("");
    setFormRole("Junior Clerk");
    setFormEmail("");
    setFormMobile("");
    setEditingOfficer(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleStartEdit = (officer: CmsOfficer) => {
    setEditingOfficer(officer);
    setFormName(officer.name);
    setFormEmpId(officer.employeeId);
    setFormDeptId(officer.departmentId);
    setFormDesignation(officer.designation);
    setFormRole(officer.role);
    setFormEmail(officer.email);
    setFormMobile(officer.mobile);
    setIsDrawerOpen(true);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmpId || !formDeptId || !formDesignation || !formEmail || !formMobile) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    const deptObj = departments.find(d => d.id === formDeptId);
    const deptName = deptObj ? deptObj.name : "NOC";

    if (editingOfficer) {
      // Editing Mode
      setOfficersList(prev =>
        prev.map(o =>
          o.id === editingOfficer.id
            ? {
                ...o,
                name: formName,
                employeeId: formEmpId,
                departmentId: formDeptId,
                departmentName: deptName,
                designation: formDesignation,
                role: formRole,
                email: formEmail,
                mobile: formMobile
              }
            : o
        )
      );
      toast.success("User registry record updated successfully!");
      setIsDrawerOpen(false);
      resetForm();
    } else {
      // Creating Mode
      startTransition(async () => {
        try {
          const res = await createCmsUserAction({
            name: formName,
            employeeId: formEmpId,
            departmentId: formDeptId,
            departmentName: deptName,
            designation: formDesignation,
            role: formRole,
            email: formEmail,
            mobile: formMobile
          });

          if (res.success && res.officer) {
            setOfficersList(prev => [...prev, res.officer as CmsOfficer]);
            toast.success("New user created successfully!");
            setIsDrawerOpen(false);
            resetForm();
          }
        } catch (err) {
          toast.error("Failed to create user registry record.");
        }
      });
    }
  };

  // Toggle local status simulation
  const [activeStatuses, setActiveStatuses] = useState<Record<string, boolean>>({});
  const toggleUserStatus = (id: string) => {
    setActiveStatuses(prev => ({
      ...prev,
      [id]: prev[id] === false ? true : false
    }));
    toast.success("User status toggled successfully!");
  };

  const filteredOfficers = officersList.filter(o => {
    const deptMatch = selectedDeptId === "All" || o.departmentId === selectedDeptId;
    const q = searchTerm.toLowerCase().trim();
    const textMatch =
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.employeeId.toLowerCase().includes(q) ||
      o.designation.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q);

    return deptMatch && textMatch;
  });

  return (
    <div className="space-y-4">
      {/* Title Header with Add Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{t("users.title")}</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">{t("users.subtitle")}</p>
        </div>
        <div>
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            {t("users.addUser")}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel wrapped in Common Card Component */}
      <Card className="p-3 border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("common.search")}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder={t("users.searchPlaceholder")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-[13px] text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("users.deptFilter")}</label>
            <select
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-[13px] text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none"
            >
              <option value="All">{t("users.allDepartments")}</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* User Registry List Table wrapped in Common Card */}
      <Card className="p-0 border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] text-slate-600">
            <thead className="bg-[#4b70a6] text-white font-bold">
              <tr>
                <th className="p-3 border-r border-[#3d5a8a]">{t("users.empId")}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{t("users.officerName")}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{t("users.department")}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{t("users.designation")}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{t("users.email")} / {t("users.mobile")}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{t("users.role")}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{t("users.status")}</th>
                <th className="p-3 text-center">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                    {t("users.noOfficers")}
                  </td>
                </tr>
              ) : (
                filteredOfficers.map(officer => {
                  const isActive = activeStatuses[officer.id] !== false;
                  return (
                    <tr key={officer.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-800">{officer.employeeId}</td>
                      <td className="p-3 font-semibold text-slate-700">{officer.name}</td>
                      <td className="p-3 text-slate-500">{officer.departmentName}</td>
                      <td className="p-3 font-medium text-slate-600">{officer.designation}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5 text-slate-450">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {officer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {officer.mobile}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-750">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-[#4b70a6]" />
                          <span>{officer.role}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleUserStatus(officer.id)}
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold border transition ${
                            isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(officer)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-[#4b70a6] bg-slate-50/50 hover:bg-slate-50 transition"
                            title="Edit User"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              confirm({
                                variant: "delete",
                                title: tCommon("buttons.delete") + " " + t("users.role"),
                                description: t("users.removeUserConfirm"),
                                onConfirm: () => {
                                  setOfficersList(prev => prev.filter(o => o.id !== officer.id));
                                  toast.success("User registry record removed.");
                                }
                              });
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 transition"
                            title={tCommon("buttons.delete")}
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
      </Card>

      {/* Redesigned Sidebar Form Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width="sm"
        title={
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#4b70a6]" />
            <span id="drawer-title" className="text-sm font-extrabold text-slate-800">
              {editingOfficer ? "Edit Officer Profile" : "Register New Officer"}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px] text-slate-700">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kulkarni"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Employee ID</label>
              <input
                type="text"
                required
                placeholder="EMP-2026-999"
                value={formEmpId}
                onChange={e => setFormEmpId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Designation</label>
              <input
                type="text"
                required
                placeholder="e.g. Deputy Commissioner"
                value={formDesignation}
                onChange={e => setFormDesignation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Role</label>
              <select
                value={formRole}
                onChange={e => setFormRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              >
                <option value="Junior Clerk">Junior Clerk</option>
                <option value="Senior Clerk">Senior Clerk</option>
                <option value="Inspector">Inspector</option>
                <option value="Engineer">Engineer</option>
                <option value="Department Officer">Department Officer</option>
                <option value="Department Head">Department Head</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Email Address</label>
              <input
                type="email"
                required
                placeholder="officer@ulb.gov.in"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Mobile Number</label>
              <input
                type="text"
                required
                placeholder="9998887770"
                value={formMobile}
                onChange={e => setFormMobile(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-650 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#4b70a6] text-white hover:bg-[#3d5e8c] text-xs font-bold transition flex items-center gap-1"
            >
              {isPending ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
