"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/common";
import { SelectAllButton, ClearButton } from "@/components/common/ActionButtons";
import { Checkbox } from "@/components/common/checkbox";
import { cn } from "@/lib/utils/cn";
import type { UseType } from "@/types/typeOfUse.types";

interface TypeOfUseSectionProps {
  typeOfUseList: UseType[];
  selectedTypeOfUseIds: Set<number>;
  onToggle: (touId: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => string;
}

export const TypeOfUseSection = ({
  typeOfUseList,
  selectedTypeOfUseIds,
  onToggle,
  onSelectAll,
  onClearAll,
  t,
}: TypeOfUseSectionProps) => {
  // --- Search & filter state (SSR-safe, no useEffect) ---
  const [touSearchTerm, setTouSearchTerm] = useState("");
  const [selectedTouType, setSelectedTouType] = useState<string>("ALL");

  // Compute unique type options from the list
  const touTypeOptions = useMemo(() => {
    const types = new Set(typeOfUseList.map(item => item.type).filter(Boolean));
    return ["ALL", ...Array.from(types)];
  }, [typeOfUseList]);

  // Filtered list based on search and type filter
  const filteredTypeOfUseList = useMemo(() => {
    return typeOfUseList.filter((item) => {
      const matchesSearch =
        !touSearchTerm ||
        item.description.toLowerCase().includes(touSearchTerm.toLowerCase()) ||
        item.typeOfUseCode.toLowerCase().includes(touSearchTerm.toLowerCase());

      const matchesType =
        selectedTouType === "ALL" || item.type === selectedTouType;

      return matchesSearch && matchesType;
    });
  }, [typeOfUseList, touSearchTerm, selectedTouType]);

  return (
    <div className="flex flex-col h-full min-h-[300px] max-h-[750px] md:min-h-[400px] lg:min-h-[500px] overflow-y-auto">
      <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 flex flex-col h-full">

        {/* Header */}
        <div className="p-4 border-b border-[#DCEAFF] bg-white/50 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">
              {t("form.typeOfUseSection.title")}
            </label>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {t("form.typeOfUseSection.selected", { count: selectedTypeOfUseIds.size })}
            </span>
          </div>

          <div className="flex gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("form.typeOfUseSection.search")}
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  type="text"
                  placeholder={t("form.typeOfUseSection.searchPlaceholder")}
                  value={touSearchTerm}
                  onChange={(e) => setTouSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-gray-700"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t("form.typeOfUseSection.typeLabel")}
              </label>
              <Select
                value={selectedTouType}
                placeholder={t("form.typeOfUseSection.allTypes")}
                options={touTypeOptions.map((type) => ({
                  label: type === "ALL" ? t("form.typeOfUseSection.allTypes") : type,
                  value: type,
                }))}
                onChange={(_, value) => setSelectedTouType(value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <SelectAllButton
              onClick={onSelectAll}
              label={t("form.typeOfUseSection.selectAll")}
              size="xs"
              className="flex-1"
            />
            <ClearButton
              onClick={onClearAll}
              label={t("form.typeOfUseSection.clear")}
              size="xs"
              className="flex-1"
            />
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {typeOfUseList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-sm">{t("form.typeOfUseSection.noItems")}</span>
            </div>
          ) : filteredTypeOfUseList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-sm">{t("form.typeOfUseSection.noMatches")}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTypeOfUseList.map((item) => {
                const isChecked = selectedTypeOfUseIds.has(item.typeOfUseId);
                return (
                  <label
                    key={item.typeOfUseId}
                    onClick={() => onToggle(item.typeOfUseId)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border shadow-sm",
                      isChecked
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-white hover:border-blue-200 border-gray-200"
                    )}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggle(item.typeOfUseId)}
                        aria-label={item.typeOfUseCode}
                        className={isChecked ? 'data-[state=checked]:text-blue-600' : ''}
                      />
                    </div>

                    {/* ID Badge */}
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide shrink-0",
                      isChecked
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {item.typeOfUseCode}
                    </span>

                    {/* Description */}
                    <span className={cn(
                      "text-sm truncate min-w-0 flex-1",
                      isChecked ? "text-gray-900 font-medium" : "text-gray-600"
                    )}>
                      {item.description}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-[#DCEAFF] bg-white/50 text-center shrink-0">
          <p className="text-[10px] text-gray-400">
            {t("form.typeOfUseSection.hint")}
          </p>
        </div>
      </div>
    </div>
  );
};
