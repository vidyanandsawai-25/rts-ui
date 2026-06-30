"use client";

import React from "react";
import {
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  Map,
  MapPinned,
  ShieldCheck,
  FileText,
  ThumbsUp,
  BellRing,
  Scale,
  FileStack,
  Receipt,
  LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { PropertyStatsProps } from "@/types/property-search";

export function PropertyStats({
  containerRef,
  mainCards,
  workflowCards,
}: PropertyStatsProps): React.ReactElement {
  const t = useTranslations("propertySearch.stats");
  const tTypeFilter = useTranslations("propertySearch.form.options.typeFilter");

  const formatCount = (num?: number) => (num || 0).toLocaleString("en-IN");
  const formatDemand = (num?: number) => `₹${(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const prev = mainCards?.previouslyRegistered || { structureCount: 0, unitCount: 0, demand: 0 };
  const assessed = mainCards?.assessmentApproved?.assessed || { structureCount: 0, unitCount: 0, demand: 0 };
  const unassessed = mainCards?.assessmentApproved?.unassessed || { structureCount: 0, unitCount: 0, demand: 0 };
  const revenue = mainCards?.additionalRevenueGenerated || { structureCount: 0, unitCount: 0, demand: 0 };

  const getStage = (name: string) => workflowCards?.find(w => w.stageName === name) || { structureCount: 0, unitCount: 0 };

  const stageDefs: Array<{
    id: number;
    stageKey: "geoSequencing" | "internalSurvey" | "dataEntry" | "assessment" | "approvalByUlb" | "noticeDistribution" | "hearingAndAppeal" | "billDistribution" | "billGeneration";
    stageName: string;
    icon: LucideIcon;
    colorTheme: "indigo" | "blue" | "green" | "orange" | "red" | "purple";
  }> = [
    { id: 1, stageKey: "geoSequencing", stageName: "GeoSequencing", icon: Map, colorTheme: "indigo" },
    { id: 2, stageKey: "internalSurvey", stageName: "InternalSurvey", icon: MapPinned, colorTheme: "blue" },
    { id: 3, stageKey: "dataEntry", stageName: "DataEntry", icon: ShieldCheck, colorTheme: "green" },
    { id: 4, stageKey: "assessment", stageName: "Assessment", icon: FileText, colorTheme: "blue" },
    { id: 5, stageKey: "approvalByUlb", stageName: "ApprovalByULB", icon: ThumbsUp, colorTheme: "green" },
    { id: 6, stageKey: "noticeDistribution", stageName: "NoticeDistribution", icon: BellRing, colorTheme: "orange" },
    { id: 7, stageKey: "hearingAndAppeal", stageName: "HearingAndAppeal", icon: Scale, colorTheme: "red" },
    { id: 8, stageKey: "billDistribution", stageName: "BillDistribution", icon: FileStack, colorTheme: "purple" },
    { id: 9, stageKey: "billGeneration", stageName: "BillGeneration", icon: Receipt, colorTheme: "indigo" },
  ];

  return (
    <div ref={containerRef} className="space-y-1.5 p-0">
      {/* Top Row: Large Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-1.5">
        {/* Card 1 */}
        <div className="border border-indigo-200 bg-gradient-to-r from-indigo-100 to-purple-50/60 rounded-lg p-1.5 flex flex-col gap-1 shadow-sm min-w-[280px]">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md">
              <IndianRupee size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wide">
              {t("previouslyRegistered")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-0.5">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-semibold uppercase">
                {t("structure")}
              </span>
              <span className="text-base font-bold text-gray-900 leading-none mt-0.5">
                {formatCount(prev.structureCount)}
              </span>
            </div>
            <div className="flex flex-col border-l border-indigo-100 pl-2">
              <span className="text-[9px] text-gray-500 font-semibold uppercase">
                {t("unit")}
              </span>
              <span className="text-base font-bold text-gray-900 leading-none mt-0.5">
                {formatCount(prev.unitCount)}
              </span>
            </div>
            <div className="flex flex-col border-l border-indigo-100 pl-2">
              <span className="text-[9px] text-gray-500 font-semibold uppercase">
                {t("demand")}
              </span>
              <span className="text-base font-bold text-purple-600 leading-none mt-0.5">
                {formatDemand(prev.demand)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border border-green-200 bg-gradient-to-r from-green-100 to-emerald-50/60 rounded-lg p-1.5 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 text-green-600 p-1.5 rounded-md">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-green-800 uppercase tracking-wide">
              {t("assessmentApproved")}
            </span>
          </div>
          <div className="flex gap-2 mt-0.5 items-stretch">
            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">{t("assessed")}</span>
              <div className="grid grid-cols-[1fr_1fr_1.3fr] gap-1.5">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-semibold uppercase">
                    {t("structure")}
                  </span>
                  <span className="text-sm font-bold text-gray-900 leading-none mt-0.5">
                    {formatCount(assessed.structureCount)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-green-200 pl-2">
                  <span className="text-[9px] text-gray-500 font-semibold uppercase">
                    {t("units")}
                  </span>
                  <span className="text-sm font-bold text-gray-900 leading-none mt-0.5">
                    {formatCount(assessed.unitCount)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-green-200 pl-2">
                  <span className="text-[9px] text-gray-500 font-semibold uppercase">
                    {t("demand")}
                  </span>
                  <span className="text-sm font-bold text-green-600 leading-none mt-0.5">
                    {formatDemand(assessed.demand)}
                  </span>
                </div>
              </div>
            </div>
            <div className="border border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-50/60 rounded p-1 flex flex-col gap-0.5 flex-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wide">{t("unassessed")}</span>
              <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-1.5">
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 font-semibold uppercase">
                    {t("structure")}
                  </span>
                  <span className="text-sm font-bold text-gray-900 leading-none mt-0.5">
                    {formatCount(unassessed.structureCount)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-yellow-200 pl-1.5">
                  <span className="text-[8px] text-gray-500 font-semibold uppercase">
                    {t("units")}
                  </span>
                  <span className="text-sm font-bold text-gray-900 leading-none mt-0.5">
                    {formatCount(unassessed.unitCount)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-yellow-200 pl-1.5">
                  <span className="text-[8px] text-gray-500 font-semibold uppercase">
                    {t("demand")}
                  </span>
                  <span className="text-sm font-bold text-yellow-600 leading-none mt-0.5">
                    {formatDemand(unassessed.demand)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border border-teal-200 bg-gradient-to-r from-teal-100 to-cyan-50/60 rounded-lg p-1.5 flex flex-col gap-1 shadow-sm min-w-[280px]">
          <div className="flex items-center gap-2">
            <div className="bg-teal-100 text-teal-600 p-1.5 rounded-md">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wide">
              {t("additionalRevenue")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-0.5">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-semibold uppercase">
                {t("structure")}
              </span>
              <span className="text-base font-bold text-gray-900 leading-none mt-0.5">
                {formatCount(revenue.structureCount)}
              </span>
            </div>
            <div className="flex flex-col border-l border-teal-200 pl-2">
              <span className="text-[9px] text-gray-500 font-semibold uppercase">
                {t("unit")}
              </span>
              <span className="text-base font-bold text-gray-900 leading-none mt-0.5">
                {formatCount(revenue.unitCount)}
              </span>
            </div>
            <div className="flex flex-col border-l border-teal-200 pl-2">
              <span className="text-[9px] text-gray-500 font-semibold uppercase">
                {t("demand")}
              </span>
              <span className="text-base font-bold text-teal-600 leading-none mt-0.5">
                {formatDemand(revenue.demand)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Small Cards */}
      <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-1 hide-scrollbar">
        {stageDefs.map((def) => {
          const stage = getStage(def.stageName);
          return (
            <SmallCard
              key={def.id}
              title={tTypeFilter(def.stageKey)}
              icon={def.icon}
              structure={formatCount(stage.structureCount)}
              unit={formatCount(stage.unitCount)}
              colorTheme={def.colorTheme}
            />
          );
        })}
      </div>
    </div>
  );
}

function SmallCard({
  title,
  icon: Icon,
  structure,
  unit,
  colorTheme,
}: {
  title: string;
  icon: LucideIcon;
  structure: string;
  unit: string;
  colorTheme: "indigo" | "blue" | "green" | "orange" | "red" | "purple";
}) {
  const t = useTranslations("propertySearch.stats");
  const themes = {
    indigo: "border-indigo-200 bg-gradient-to-r from-indigo-100/90 to-purple-50/40",
    blue: "border-blue-200 bg-gradient-to-r from-blue-100/90 to-cyan-50/40",
    green: "border-green-200 bg-gradient-to-r from-green-100/90 to-emerald-50/40",
    orange: "border-orange-200 bg-gradient-to-r from-orange-100/90 to-amber-50/40",
    red: "border-red-200 bg-gradient-to-r from-red-100/90 to-rose-50/40",
    purple: "border-purple-200 bg-gradient-to-r from-purple-100/90 to-fuchsia-50/40",
  };
  const iconThemes = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };
  const titleThemes = {
    indigo: "text-indigo-900",
    blue: "text-blue-900",
    green: "text-green-900",
    orange: "text-orange-900",
    red: "text-red-900",
    purple: "text-purple-900",
  };
  const borderThemes = {
    indigo: "border-indigo-100",
    blue: "border-blue-100",
    green: "border-green-100",
    orange: "border-orange-100",
    red: "border-red-100",
    purple: "border-purple-100",
  };

  return (
    <div
      className={`flex-1 min-w-[140px] border rounded-lg p-1.5 flex flex-col gap-1 shadow-sm ${themes[colorTheme]}`}
    >
      <div className="flex items-center gap-1">
        <div className={`p-0.5 rounded-md shrink-0 ${iconThemes[colorTheme]}`}>
          <Icon size={14} />
        </div>
        <span
          className={`text-[10px] font-bold leading-tight truncate ${titleThemes[colorTheme]}`}
          title={title}
        >
          {title}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-0.5">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-500 font-semibold uppercase">
            {t("structure")}
          </span>
          <span className="text-sm font-bold text-gray-900 leading-none mt-0">
            {structure}
          </span>
        </div>
        <div
          className={`flex flex-col border-l pl-1.5 ${borderThemes[colorTheme]}`}
        >
          <span className="text-[8px] text-gray-500 font-semibold uppercase">
            {t("unit")}
          </span>
          <span className="text-sm font-bold text-gray-900 leading-none mt-0">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
