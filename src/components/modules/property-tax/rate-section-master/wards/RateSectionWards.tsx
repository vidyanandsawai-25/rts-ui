"use client";

import { useMemo } from "react";
import { Map } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchInput, Checkbox, Select } from "@/components/common";
import { PrevPageButton, NextPageButton } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Label } from "@/components/common/label";
import { RateSectionWardsProps } from "@/types/rateSectionMaster.types";

const PAGE_SIZE_OPTIONS = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "50", value: "50" }
];

export default function RateSectionWards({
  filteredSelected,
  selectedSearch,
  selectedPage,
  selectedPageSize,
  selectedWardsTotalCount,
  checkedSelected,
  selectedZoneNo,
  selectedZoneName,
  onSearch,
  onToggle,
  onPageChange,
  onPageSizeChange
}: RateSectionWardsProps) {
  const t = useTranslations("rateSectionMaster");

  const totalSelectedPages = Math.ceil(filteredSelected.length / selectedPageSize) || 1;

  const paginatedSelected = useMemo(() => {
    const start = (selectedPage - 1) * selectedPageSize;
    const end = start + selectedPageSize;
    return filteredSelected.slice(start, end);
  }, [filteredSelected, selectedPage, selectedPageSize]);

  return (
    <div className="flex-1 flex flex-col rounded-xl overflow-visible bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-md border-2 border-purple-200/50 shadow-lg">
      <div className="bg-gradient-to-r from-[#1A86E8] via-[#1A86E8] to-[#1A86E8] px-4 py-3 font-semibold text-sm text-[#fff] shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {t('wards.wardsInRateSection')}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/20 text-white border border-white/30">
              {selectedWardsTotalCount}
            </span>
          </span>
          <StatusBadge
            variant="info"
            label={
              selectedZoneName && selectedZoneName !== selectedZoneNo
                ? `${selectedZoneNo} - ${selectedZoneName}`
                : selectedZoneNo || ""
            }
          />
        </div>
      </div>

      <div className="px-4 py-2 bg-white/40 border-b border-purple-100/50">
        <SearchInput
          className="w-full rounded-sm  border-gray-300 mb-0"
          value={selectedSearch}
          onChange={onSearch}
          placeholder={t("wards.searchSelected")}
        />
      </div>

      <div className="overflow-y-auto p-3 space-y-2 flex-1">
        {paginatedSelected.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
            <Map size={40} className="text-gray-300 mb-3" />
            <p className="text-sm">{t("wards.emptyState")}</p>
          </div>
        )}

        {paginatedSelected.map(w => (
          <Label
            key={w}
            className="flex items-center gap-3 px-4 py-1 backdrop-purple-sm rounded-lg transition-all duration-200 border group cursor-pointer bg-white/60 border-purple-100/50 hover:bg-white/80 hover:border-purple-300/50 hover:shadow-md"
          >
            <Checkbox
              checked={checkedSelected.has(w)}
              onCheckedChange={() => onToggle(w)}
            />
            <span className="text-sm font-medium text-gray-700">
              {w}
            </span>
          </Label>
        ))}
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-white/40 border-t border-purple-100/50">
        <div className="flex items-center gap-2">
          <Select
            options={PAGE_SIZE_OPTIONS}
            value={String(selectedPageSize)}
            onChange={(val) => onPageSizeChange(Number(val))}
            selectSize="sm"
            className="w-18"
          />
        </div>
        <div className="flex items-center gap-1">
          <PrevPageButton
            onClick={() => onPageChange(Math.max(1, selectedPage - 1))}
            disabled={selectedPage <= 1}
            aria-label={t("pagination.previous")}
          />
          <span className="text-xs text-gray-600">
            {selectedPage} / {totalSelectedPages}
          </span>
          <NextPageButton
            onClick={() => onPageChange(Math.min(totalSelectedPages, selectedPage + 1))}
            disabled={selectedPage >= totalSelectedPages}
            aria-label={t("pagination.next")}
          />
        </div>
      </div>
    </div>
  );
}
