"use client";

import React from "react";
import { MousePointerClick } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  PropertyStatsProps,
  PropertyStatus,
} from "@/types/property-search.types";
import { STAT_VISUALS } from "./stats/stat-visuals";
import { StatCard } from "./stats/StatCard";

export function PropertyStats({
  selectedStatus,
  onStatusClick,
  statsData,
  disabled = false,
  containerRef,
}: PropertyStatsProps): React.ReactElement {
  const t = useTranslations("propertySearch.stats");

  const getValue = React.useCallback(
    (label: PropertyStatus): string => {
      const stat = statsData.find((s) => s.label === label);
      return stat ? stat.value : "0";
    },
    [statsData]
  );

  return (
    <div ref={containerRef} className="space-y-1.5">
      <p className="inline-flex items-center gap-1 rounded-full border border-[#004c8c]/20 bg-[#004c8c]/5 px-2 py-0.5 text-[10px] font-medium text-[#004c8c]">
        <MousePointerClick
          className="h-3 w-3 shrink-0 text-[#005a9e]"
          aria-hidden
        />
        {t("filterHint")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAT_VISUALS.map((visual, index) => (
          <StatCard
            key={visual.label}
            visual={visual}
            count={getValue(visual.label)}
            index={index}
            selected={selectedStatus === visual.label}
            disabled={disabled}
            onClick={() => onStatusClick(visual.label)}
          />
        ))}
      </div>
    </div>
  );
}
