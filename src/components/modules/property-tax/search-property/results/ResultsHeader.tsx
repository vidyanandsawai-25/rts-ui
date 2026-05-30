"use client";

import { useTranslations } from "next-intl";
import { FileSpreadsheet } from "lucide-react";
import { Badge, Button } from "@/components/common";
import type { PropertyStatus } from "@/types/property-search.types";

interface ResultsHeaderProps {
  selectedStatus: PropertyStatus | null;
  isSearchActive: boolean;
  totalCount: number;
  exportDisabled: boolean;
  onExport: () => void;
}

const STATUS_I18N_KEY: Record<PropertyStatus, string> = {
  "Register Property": "registerProperty",
  "Geo-Sequencing": "geoSequencing",
  Survey: "survey",
  "Data Processing": "dataProcessing",
  "Quality Analysis": "qualityAnalysis",
  "Assessment Completed": "assessmentCompleted",
};

export function ResultsHeader({
  selectedStatus,
  isSearchActive,
  totalCount,
  exportDisabled,
  onExport,
}: ResultsHeaderProps) {
  const t = useTranslations("propertySearch.results");
  const tStats = useTranslations("propertySearch.stats");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 leading-tight">
          {t("title")}
          {selectedStatus && (
            <span className="ml-1.5 text-xs font-normal text-gray-500">
              ({t("statusLabel")}: {tStats(STATUS_I18N_KEY[selectedStatus])})
            </span>
          )}
          {isSearchActive && (
            <span className="ml-1.5 text-xs font-medium text-[#004c8c]">
              ({t("searchActive")})
            </span>
          )}
          <span className="ml-2 text-xs font-normal text-gray-500 inline-flex items-center gap-1">
            · {t("totalRecords")}:
            <Badge variant="secondary" size="sm">
              {totalCount}
            </Badge>
          </span>
        </h3>
      </div>
      <Button
        variant="success"
        size="sm"
        icon={FileSpreadsheet}
        className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 shadow-sm cursor-pointer disabled:cursor-not-allowed"
        onClick={onExport}
        disabled={exportDisabled}
      >
        {tCommon("actions.exportExcel")}
      </Button>
    </div>
  );
}
