"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/common";
import type { TariffWorkbench } from "@/types/waterBill/tariffWorkbench.types";
import { DateUtils } from "@/lib/utils/date-helpers";

interface TariffWorkbenchDetailViewProps {
  records: TariffWorkbench[];
}

export function TariffWorkbenchDetailView({
  records,
}: TariffWorkbenchDetailViewProps) {
  const t = useTranslations("tariffWorkbench.detailView");
  const tForm = useTranslations("tariffWorkbench.form");
  const tHeader = useTranslations("tariffWorkbench");

  const [selectedId, setSelectedId] = useState<number | null>(
    records.length > 0 ? records[0].id : null
  );

  const selectedTariff =
    records.find((r) => r.id === selectedId) || records[0] || null;

  const formatVersion = (versionNo?: number | null) => {
    if (typeof versionNo === "number" && Number.isFinite(versionNo) && versionNo > 0) {
      return `v${versionNo}`;
    }
    return "-";
  };

  const getLocalizedConnectionType = (name?: string | null) => {
    if (!name || typeof name !== "string" || !name.trim()) return "-";
    const lower = name.trim().toLowerCase();
    let res = name;
    if (lower === "residential" || lower === "res") res = tForm("connectionType.residential");
    else if (lower === "commercial" || lower === "com") res = tForm("connectionType.commercial");
    else if (lower === "industrial" || lower === "ind") res = tForm("connectionType.industrial");
    else if (lower === "government" || lower === "gov") res = tForm("connectionType.government");
    else if (lower === "institutional" || lower === "inst") res = tForm("connectionType.institutional");
    if (!res || res.includes("connectionType")) return name;
    return res;
  };

  const getLocalizedConnectionCategory = (category?: string | null) => {
    if (!category || typeof category !== "string" || !category.trim()) return "-";
    const lower = category.trim().toLowerCase();
    let res = category;
    if (lower === "regular") res = tForm("connectionCategory.regular");
    else if (lower === "annual") res = tForm("connectionCategory.annual");
    else if (lower === "flat" || lower === "flat rate" || lower === "flatrate") res = tForm("connectionCategory.flatRate");
    else if (lower === "slab" || lower === "slab metered" || lower === "slabmetered") res = tForm("connectionCategory.slabMetered");
    if (!res || res.includes("connectionCategory")) return category;
    return res;
  };

  const getLocalizedBillingMethod = (method?: string | null) => {
    if (!method || typeof method !== "string" || !method.trim()) return "-";
    const lower = method.trim().toLowerCase();
    let res = method;
    if (lower === "metered") res = tForm("billingMethod.metered");
    else if (lower === "flat") res = tForm("billingMethod.flat");
    else if (lower === "slab") res = tForm("billingMethod.slab");
    else if (lower === "flat rate" || lower === "flatrate") res = tForm("billingMethod.flatRate");
    else if (lower === "slab metered" || lower === "slabmetered") res = tForm("billingMethod.slabMetered");
    else if (lower === "annual") res = tForm("billingMethod.annual");
    if (!res || res.includes("billingMethod")) return method;
    return res;
  };

  const formatDateDisplay = (dateStr?: string | null) => {
    if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return "-";
    const formatted = DateUtils.formatToDDMMYYYY(dateStr);
    return formatted || "-";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Sidebar: Tariff List Cards */}
      <div className="lg:col-span-4 space-y-3">
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {records.slice(0, 5).map((item) => {
            const isSelected = (selectedTariff?.id ?? selectedId) === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all h-auto block ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-semibold text-blue-800">
                    {item.tariffCode}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatVersion(item.versionNo)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 truncate w-full text-left">
                  {item.tariffName}
                </div>
                <div className="text-xs text-slate-500 mt-1 w-full text-left">
                  {getLocalizedConnectionType(item.connectionTypeName)} ·{" "}
                  {getLocalizedConnectionCategory(item.connectionCategoryName)} ·{" "}
                  {getLocalizedBillingMethod(item.billingMethod)}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Tariff Detail Card */}
      <div className="lg:col-span-8 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
        {selectedTariff ? (
          <>
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full inline-block ${selectedTariff.status === "Published" ? "bg-emerald-500" : selectedTariff.status === "Draft" ? "bg-amber-500" : "bg-slate-400"}`} />
                {selectedTariff.status === "Published"
                  ? t("publishedTariffConfig")
                  : selectedTariff.status === "Draft"
                  ? t("draftTariffConfig")
                  : tHeader("userManual.tariffConfigTitle").toUpperCase()}
              </div>
              <div className="flex items-center justify-between mt-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedTariff.tariffName}
                </h3>
                {selectedTariff.status ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    selectedTariff.status === "Published"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selectedTariff.status === "Draft"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}>
                    {selectedTariff.status === "Published"
                      ? t("statusPublished")
                      : selectedTariff.status === "Draft"
                      ? t("statusDraft")
                      : selectedTariff.status}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("financialYear")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{selectedTariff.financialYearCode || "-"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("connectionType")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{getLocalizedConnectionType(selectedTariff.connectionTypeName)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("category")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{getLocalizedConnectionCategory(selectedTariff.connectionCategoryName)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("billingMethod")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{getLocalizedBillingMethod(selectedTariff.billingMethod)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("effectiveFrom")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{formatDateDisplay(selectedTariff.effectiveFrom)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("effectiveTo")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{formatDateDisplay(selectedTariff.effectiveTo)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("version")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{formatVersion(selectedTariff.versionNo)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t("slabs")}</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{selectedTariff.slabsCount != null ? selectedTariff.slabsCount : "-"}</div>
              </div>
            </div>

            {/* Safe Publishing Pattern Note */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
              <div className="font-bold text-slate-800">{t("safePublishingTitle")}</div>
              <div className="text-slate-500 text-[11px]">
                {t("safePublishingDesc")}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
