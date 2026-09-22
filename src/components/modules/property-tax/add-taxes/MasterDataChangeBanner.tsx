"use client";

import React from "react";
import { RefreshCw, ChevronRight } from "lucide-react";
import type { MasterDataChangeSummary } from "@/types/addTaxes.types";

interface MasterDataChangeBannerProps {
  summary: MasterDataChangeSummary | null;
  onViewProperties: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

/**
 * Banner shown on the Add Taxes screen when the SQL Server CDC pipeline has
 * flagged already-taxed properties as potentially needing recalculation
 * because a related master data record (e.g. Rate Master) changed.
 *
 * Renders nothing when there is no summary or nothing is flagged.
 */
export const MasterDataChangeBanner: React.FC<MasterDataChangeBannerProps> = ({
  summary,
  onViewProperties,
  t,
}) => {
  if (!summary || !summary.affectedCount || summary.affectedCount <= 0) return null;

  const remarkSummary = summary.remarkSummary || t("masterDataChange.defaultRemark");

  return (
    <div
      className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-2">
        <RefreshCw size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-blue-900">
            {t("masterDataChange.banner", {
              remarkSummary,
              count: summary.affectedCount,
            })}
          </p>
          <button
            type="button"
            onClick={onViewProperties}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold
                        bg-blue-100 text-blue-800 border border-blue-300
                        hover:bg-blue-200 hover:border-blue-400 hover:text-blue-900
                        active:bg-blue-300
                        cursor-pointer transition-all duration-150
                        focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-shrink-0"
          >
            {t("masterDataChange.viewProperties")}
            <ChevronRight size={10} className="opacity-60 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterDataChangeBanner;
