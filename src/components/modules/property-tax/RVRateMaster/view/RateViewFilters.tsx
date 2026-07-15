"use client";

import { MapPin, Calendar, Users } from "lucide-react";
import { SearchSelect } from "@/components/common";
import type { ISelectOption } from "@/types/RVRateMaster";

interface RateViewFiltersProps {
  zones: ISelectOption[];
  assessmentYears: ISelectOption[];
  useGroupsFiltered: ISelectOption[];
  selectedZone: string;
  selectedYear: string;
  selectedUseGroup: string;
  onZoneChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onUseGroupChange: (value: string) => void;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  disabled?: boolean;
  isOpenPlot?: boolean;
}

export function RateViewFilters({
  zones,
  assessmentYears,
  useGroupsFiltered,
  selectedZone,
  selectedYear,
  selectedUseGroup,
  onZoneChange,
  onYearChange,
  onUseGroupChange,
  t,
  disabled = false,
  isOpenPlot = false,
}: RateViewFiltersProps) {
  return (
    <div className={`grid grid-cols-1 ${isOpenPlot ? 'md:grid-cols-2 w-[500px]' : 'md:grid-cols-3 w-200'} gap-1.5`}>
      {/* Rate Section */}
      <div className="flex flex-col gap-1">
        <label htmlFor="zone-select" className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          {t('filters.rateSection')}
        </label>
        <SearchSelect
          id="zone-select"
          name="zone"
          label=""
          options={zones}
          value={selectedZone}
          onChange={(_name, value) => onZoneChange(value)}
          className="h-7 w-10 text-xs"
          disabled={disabled}
        />
      </div>

      {/* Assessment Year */}
      <div className="flex flex-col gap-1">
        <label htmlFor="year-select" className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          {t('filters.assessmentYear')}
        </label>
        <SearchSelect
          id="year-select"
          name="year"
          label=""
          options={assessmentYears}
          value={selectedYear}
          onChange={(_name, value) => onYearChange(value)}
          className="h-7 w-20 text-xs"
          disabled={disabled}
        />
      </div>

      {/* Use Group */}
      {!isOpenPlot && (
        <div className="flex flex-col gap-1">
          <label htmlFor="useGroup-select" className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            {t('filters.typeOfUseGroup')}
          </label>
          <SearchSelect
            id="useGroup-select"
            name="useGroup"
            label=""
            options={useGroupsFiltered}
            value={selectedUseGroup ?? ""}
            onChange={(_name, value) => onUseGroupChange(value)}
            className="h-7 text-xs"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
