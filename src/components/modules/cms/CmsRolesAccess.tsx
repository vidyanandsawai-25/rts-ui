"use client";

import { useState } from "react";
import { Shield, Plus, Lock } from "lucide-react";
import { Card, useConfirm } from "@/components/common";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { mockCmsRoles, mockCmsRoleModules, type RoleAccess } from "@/lib/mock/rts/cms";

export default function CmsRolesAccess({ locale }: { locale: string }) {
  const lang = locale === "mr" ? "mr" : "en";
  const modules = mockCmsRoleModules;
  const { confirm } = useConfirm();
  const t = useTranslations("cms");
  const tCommon = useTranslations("common");

  const [rolesList, setRolesList] = useState<RoleAccess[]>(mockCmsRoles);
  const [newRoleName, setNewRoleName] = useState("");

  const handlePermissionToggle = (roleIndex: number, moduleKey: string, permissionType: "read" | "write") => {
    setRolesList(prev =>
      prev.map((role, idx) => {
        if (idx !== roleIndex) return role;
        const currentModPerm = role.permissions[moduleKey] || { read: false, write: false };
        
        const updatedPermissions = {
          ...role.permissions,
          [moduleKey]: {
            ...currentModPerm,
            [permissionType]: !currentModPerm[permissionType]
          }
        };

        return {
          ...role,
          permissions: updatedPermissions
        };
      })
    );
    toast.success("Role permissions updated successfully!");
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error("Please specify a role name.");
      return;
    }

    const defaultPerms: Record<string, { read: boolean; write: boolean }> = {};
    modules.forEach(m => {
      defaultPerms[m.key] = { read: true, write: false };
    });

    const newRole: RoleAccess = {
      roleName: newRoleName,
      roleNameMr: newRoleName,
      permissions: defaultPerms
    };

    setRolesList(prev => [...prev, newRole]);
    setNewRoleName("");
    toast.success("New role added to master registry.");
  };

  const handleDeleteRole = (index: number) => {
    confirm({
      variant: "delete",
      title: t("common.delete") + " " + t("roles.title"),
      description: t("roles.deleteRoleConfirm"),
      onConfirm: () => {
        setRolesList(prev => prev.filter((_, idx) => idx !== index));
        toast.success("Role deleted successfully.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t("roles.title")}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {t("roles.subtitle")}
          </p>
        </div>
      </div>

      {/* Add Custom Role form panel */}
      <Card className="p-3 border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleAddRole} className="flex flex-col gap-2.5 sm:flex-row sm:items-end max-w-lg">
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-bold text-[#3d3d3d] uppercase">{t("roles.newRoleName")}</label>
            <input
              type="text"
              placeholder="e.g. Account Officer"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-[13px] text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#4b70a6] px-4 py-1.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#3d5e8c]"
          >
            <Plus className="h-4 w-4" />
            {t("roles.addRole")}
          </button>
        </form>
      </Card>

      {/* Matrix Table wrapped in Card */}
      <Card className="p-0 border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] text-slate-600">
            <thead className="bg-[#4b70a6] text-white font-bold">
              <tr>
                <th className="p-3 w-48 border-r border-[#3d5a8a]">{t("roles.roleProfile")}</th>
                {modules.map(mod => (
                  <th key={mod.key} className="p-3 text-center w-40 border-r border-[#3d5a8a]">
                    {mod.label}
                  </th>
                ))}
                <th className="p-3 text-center w-24">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rolesList.map((role, roleIndex) => (
                <tr key={role.roleName} className="hover:bg-slate-50/30 transition">
                  <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#4b70a6]" />
                    <span>{lang === "en" ? role.roleName : role.roleNameMr}</span>
                  </td>
                  
                  {modules.map(mod => {
                    const perm = role.permissions[mod.key] || { read: false, write: false };
                    return (
                      <td key={mod.key} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={perm.read}
                              onChange={() => handlePermissionToggle(roleIndex, mod.key, "read")}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-[#4b70a6] focus:ring-[#4b70a6]"
                            />
                            <span className="text-[11px] text-slate-500 font-semibold">Read</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={perm.write}
                              onChange={() => handlePermissionToggle(roleIndex, mod.key, "write")}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-[#4b70a6] focus:ring-[#4b70a6]"
                            />
                            <span className="text-[11px] text-slate-500 font-semibold">Write</span>
                          </label>
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center">
                    {role.roleName === "Administrator" ? (
                      <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-0.5">
                        <Lock className="h-3 w-3" /> {t("roles.system")}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteRole(roleIndex)}
                        className="text-rose-600 hover:text-rose-800 transition font-bold text-[12px]"
                      >
                        {tCommon("buttons.delete")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
