"use client";

import { useState } from "react";
import { Sliders, ToggleLeft, ToggleRight, Edit2 } from "lucide-react";
import { Card, Drawer } from "@/components/common";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { mockCmsModules, type ModuleConfig } from "@/lib/mock/rts/cms";

export default function CmsModulesManager({ locale }: { locale: string }) {
  const lang = locale === "mr" ? "mr" : "en";
  const t = useTranslations("cms");
  const tCommon = useTranslations("common");

  const [modules, setModules] = useState<ModuleConfig[]>(mockCmsModules);
  const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null);

  // Edit fields states
  const [editName, setEditName] = useState("");
  const [editNameMr, setEditNameMr] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDescMr, setEditDescMr] = useState("");

  const handleToggleStatus = (key: string) => {
    setModules(prev =>
      prev.map(mod => {
        if (mod.key === key) {
          const nextStatus = mod.status === "Active" ? "Inactive" : "Active";
          toast.success(`${mod.name} set to ${nextStatus}!`);
          return { ...mod, status: nextStatus };
        }
        return mod;
      })
    );
  };

  const handleStartEdit = (mod: ModuleConfig) => {
    setEditingModule(mod);
    setEditName(mod.name);
    setEditNameMr(mod.nameMr);
    setEditDesc(mod.description);
    setEditDescMr(mod.descriptionMr);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;

    setModules(prev =>
      prev.map(mod => {
        if (mod.key === editingModule.key) {
          return {
            ...mod,
            name: editName,
            nameMr: editNameMr,
            description: editDesc,
            descriptionMr: editDescMr
          };
        }
        return mod;
      })
    );

    toast.success("Module configuration updated successfully!");
    setEditingModule(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t("modules.title")}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {t("modules.subtitle")}
          </p>
        </div>
      </div>

      {/* Modules List Grid wrapped in Card */}
      <Card className="p-0 border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] text-slate-600">
            <thead className="bg-[#4b70a6] text-white font-bold">
              <tr>
                <th className="p-3 w-48 border-r border-[#3d5a8a]">{t("modules.moduleKey")}</th>
                <th className="p-3 w-64 border-r border-[#3d5a8a]">{t("modules.name")} (EN / MR)</th>
                <th className="p-3 border-r border-[#3d5a8a]">{t("modules.description")}</th>
                <th className="p-3 text-center w-36 border-r border-[#3d5a8a]">{t("modules.status")}</th>
                <th className="p-3 text-center w-24">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map(mod => {
                const isActive = mod.status === "Active";
                return (
                  <tr key={mod.key} className="hover:bg-slate-50/30 transition">
                    <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#4b70a6]" />
                      <span className="uppercase text-[12px]">{mod.key}</span>
                    </td>
                    
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-700">{mod.name}</span>
                        <span className="text-[11px] text-slate-400 font-bold">{mod.nameMr}</span>
                      </div>
                    </td>

                    <td className="p-3 text-slate-500 max-w-sm truncate" title={lang === "en" ? mod.description : mod.descriptionMr}>
                      {lang === "en" ? mod.description : mod.descriptionMr}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(mod.key)}
                        className={`inline-flex items-center gap-1 transition ${
                          isActive ? "text-[#4b70a6]" : "text-slate-350"
                        }`}
                        title={isActive ? tCommon("status.inactive") : tCommon("status.active")}
                      >
                        {isActive ? (
                          <ToggleRight className="h-8 w-8" />
                        ) : (
                          <ToggleLeft className="h-8 w-8" />
                        )}
                        <span className="text-[11px] font-bold uppercase w-10">
                          {isActive ? tCommon("status.active") : tCommon("status.inactive")}
                        </span>
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleStartEdit(mod)}
                        className="inline-flex h-7 px-2 items-center gap-1 rounded-lg border border-slate-200 text-[#4b70a6] bg-slate-50/50 hover:bg-slate-50 transition text-[11px] font-bold"
                      >
                        <Edit2 className="h-3 w-3" />
                        {tCommon("buttons.edit")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Redesigned Sidebar Edit Module details Drawer */}
      <Drawer
        open={editingModule !== null}
        onClose={() => setEditingModule(null)}
        width="sm"
        title={
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#4b70a6]" />
            <span id="drawer-title" className="text-sm font-extrabold text-slate-800">
              {t("modules.editModule")}: {editingModule?.key.toUpperCase()}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-[13px] text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("modules.name")} (EN)</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase">{t("modules.nameMr")}</label>
              <input
                type="text"
                required
                value={editNameMr}
                onChange={e => setEditNameMr(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">{t("modules.description")} (EN)</label>
            <textarea
              required
              rows={2}
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">{t("modules.descMr")}</label>
            <textarea
              required
              rows={2}
              value={editDescMr}
              onChange={e => setEditDescMr(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5 focus:border-teal-500 focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => setEditingModule(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-650 transition"
            >
              {tCommon("buttons.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#4b70a6] text-white hover:bg-[#3d5e8c] text-xs font-bold transition"
            >
              {t("modules.saveModule")}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
