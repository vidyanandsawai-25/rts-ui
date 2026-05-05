"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SearchInput, Checkbox, Select } from "@/components/common";
import { PrevPageButton, NextPageButton } from "@/components/common/ActionButtons";
import { Label } from "@/components/common/label";
import { AvailableWardsProps } from "@/types/rateSectionMaster.types";

const PAGE_SIZE_OPTIONS = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "50", value: "50" }
];

export default function AvailableWards({
  allAvailableWards,
  wardAssignments,
  selectedWards,
  availableSearch,
  availablePage,
  availablePageSize,
  checkedAvailable,
  loading,
  onSearch,
  onToggle,
  onPageChange,
  onPageSizeChange
}: AvailableWardsProps) {
  const t = useTranslations("rateSectionMaster");

  const unassignedWards = useMemo(() => {
    let filtered = allAvailableWards.filter(ward =>
      !wardAssignments[ward.wardNo] && !selectedWards.includes(ward.wardNo)
    );

    if (availableSearch) {
      const q = availableSearch.toLowerCase();
      filtered = filtered.filter(ward =>
        ward.wardNo.toLowerCase().includes(q) ||
        (ward.name && ward.name.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [allAvailableWards, wardAssignments, selectedWards, availableSearch]);

  const paginatedUnassignedWards = useMemo(() => {
    const start = (availablePage - 1) * availablePageSize;
    const end = start + availablePageSize;
    return unassignedWards.slice(start, end);
  }, [unassignedWards, availablePage, availablePageSize]);

  const totalUnassignedCount = unassignedWards.length;
  const totalUnassignedPages = Math.ceil(totalUnassignedCount / availablePageSize) || 1;

  return (
    <>
      <div className="px-4 py-2 bg-white/40 border-b border-blue-100/50">
        <SearchInput
          className="w-full rounded-sm border-gray-300 mb-0"
          value={availableSearch}
          onChange={onSearch}
          placeholder={t("wards.searchAvailable")}
        />
      </div>

      <div className="overflow-y-auto p-2 space-y-2 flex-1">
        {paginatedUnassignedWards.map(w => {
          const isSelfSelected = checkedAvailable.has(w.wardNo);

          return (
            <Label
              key={w.wardNo}
              className="flex items-center gap-3 px-4 py-1 backdrop-blur-sm rounded-lg transition-all duration-200 border group cursor-pointer bg-white/60 border-blue-100/50 hover:bg-white/80 hover:border-blue-300/50 hover:shadow-md"
            >
              <Checkbox
                checked={isSelfSelected}
                onCheckedChange={() => onToggle(w.wardNo)}
              />
              <span className="text-sm font-medium transition-colors text-gray-700 group-hover:text-blue-700">
                {w.wardNo}
              </span>
            </Label>
          );
        })}
        {paginatedUnassignedWards.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            {t("wards.noAvailableWards")}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-white/40 border-t border-blue-100/50">
        <div className="flex items-center gap-2">
          <Select
            options={PAGE_SIZE_OPTIONS}
            value={String(availablePageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            selectSize="sm"
            className="w-18"
          />
        </div>
        <div className="flex items-center gap-1">
          <PrevPageButton
            onClick={() => onPageChange(Math.max(1, availablePage - 1))}
            disabled={availablePage <= 1 || loading}
            aria-label={t("pagination.previous")}
          />
          <span className="text-xs text-gray-600">
            {availablePage} / {totalUnassignedPages}
          </span>
          <NextPageButton
            onClick={() => onPageChange(Math.min(totalUnassignedPages, availablePage + 1))}
            disabled={availablePage >= totalUnassignedPages || loading}
            aria-label={t("pagination.next")}
          />
        </div>
      </div>
    </>
  );
}
