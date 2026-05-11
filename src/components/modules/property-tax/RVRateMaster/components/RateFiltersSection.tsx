"use client";

import { MapPin, Calendar, Users, TrendingUp, Plus, ClipboardCopy } from "lucide-react";
import { SearchSelect } from "@/components/common/SearchSelect";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { IconButton } from "@/components/common/ActionButtons";
import { Label } from "@/components/common/label";
import type { ISelectOption } from "@/types/RVRateMaster";

interface RateFiltersSectionProps {
  // Filter values
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  // Options
  zoneOptions: ISelectOption[];
  useGroupOptions: ISelectOption[];
  assessmentYears: ISelectOption[];
  assessmentYearRanges?: Array<{
    label: string;
    value: string;
    fromYear: string | number;
    toYear: string | number;
  }>;
  // Errors
  errors: {
    zone: string;
    useGroup: string;
    assessmentYear: string;
  };
  // State flags
  isEditMode: boolean;
  allFiltersSelected: boolean;
  existingRateFound: boolean;
  isCheckingRates: boolean;
  mode: "edit" | "delete" | "add";
  // Handlers
  onDropdownChange: (field: 'zone' | 'useGroup' | 'assessmentYear', value: string) => void;
  onGenerateMatrix: () => void;
  onToggleMultipliers: () => void;
  onToggleCopyRates: () => void;
  // Translations
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateFiltersSection({
  selectedZone,
  selectedUseGroup,
  assessmentYear,
  zoneOptions,
  useGroupOptions,
  assessmentYears,
  assessmentYearRanges,
  errors,
  isEditMode,
  allFiltersSelected,
  existingRateFound,
  isCheckingRates,
  mode,
  onDropdownChange,
  onGenerateMatrix,
  onToggleMultipliers,
  onToggleCopyRates,
  t,
}: RateFiltersSectionProps) {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-2 items-stretch md:items-end mb-2">
      {/* Rate Section */}
      <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
        <Label htmlFor="zone-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1" required>
          <MapPin size={18} className="text-black" />
          {t('filters.rateSection')}
        </Label>
        <SearchSelect
          id="zone-select"
          name="zone"
          label=""
          options={zoneOptions}
          placeholder={t('placeholders.selectRateSection')}
          value={selectedZone}
          onChange={(_name, value) => onDropdownChange('zone', value)}
          className={`text-black ${errors.zone ? 'border-red-500' : ''}`}
        />
        <ValidationMessage message={errors.zone} visible={!!errors.zone} />
      </div>

      {/* Use Group */}
      <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
        <Label htmlFor="useGroup-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1" required>
          <Users size={18} className="text-black" />
          {t('filters.typeOfUseGroup')}
        </Label>
        <SearchSelect
          id="useGroup-select"
          name="useGroup"
          label=""
          options={useGroupOptions}
          placeholder={t('placeholders.selectUseGroup')}
          value={selectedUseGroup}
          onChange={(_name, value) => onDropdownChange('useGroup', value)}
          className={`text-black ${errors.useGroup ? 'border-red-500' : ''}`}
        />
        <ValidationMessage message={errors.useGroup} visible={!!errors.useGroup} />
      </div>

      {/* Assessment Year - Conditional rendering based on edit/add mode */}
      {isEditMode ? (
        // Edit Mode: Show only the assessment year dropdown
        <div className="flex flex-col md:flex-row w-full md:flex-1 md:min-w-45 gap-1 items-stretch md:items-end">
          <div className="flex w-full items-end gap-2">
            <div className="w-full md:flex-1 md:min-w-45 md:max-w-50">
              <Label htmlFor="assessment-year-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1">
                <Calendar size={18} className="text-black" />
                {t('filters.assessmentYearRange')}
              </Label>
              <SearchSelect
                id="assessment-year-select"
                name="assessmentYear"
                label=""
                options={assessmentYears}
                placeholder={t('placeholders.selectAssessmentYear')}
                value={assessmentYear}
                onChange={(_name, value) => onDropdownChange('assessmentYear', value)}
                className={`text-black ${errors.assessmentYear ? 'border-red-500' : ''}`}
              />
              <ValidationMessage message={errors.assessmentYear} visible={!!errors.assessmentYear} />
            </div>
          </div>
        </div>
      ) : (
        // Add Mode: Show assessment year range dropdown with action buttons
        <div className="flex flex-col md:flex-row w-full md:flex-1 md:min-w-87.5 gap-2 items-stretch md:items-end">
          <div className="w-full md:min-w-45 flex items-end gap-2">
            <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
              <Label htmlFor="assessment-year-range-select" className="text-sm font-medium text-black mb-2 flex items-center gap-1.5" required>
                <Calendar size={18} className="text-black" />
                {t('filters.assessmentYearRange')}
              </Label>
              <SearchSelect
                id="assessment-year-range-select"
                name="assessmentYearRange"
                label=""
                options={assessmentYearRanges?.map((range) => ({
                  label: range.label,
                  value: range.value,
                })) ?? []}
                placeholder={t('placeholders.selectAssessmentYearRange')}
                value={assessmentYear}
                onChange={(_name, value) => onDropdownChange('assessmentYear', value)}
                className={`text-black ${errors.assessmentYear ? 'border-red-500' : ''}`}
              />
              <ValidationMessage message={errors.assessmentYear} visible={!!errors.assessmentYear} />
            </div>
            
            {/* Multiplier Button */}
            <IconButton
              icon={TrendingUp}
              variant="primary"
              title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Use Group Multipliers"}
              disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
              onClick={onToggleMultipliers}
            />
            
            {/* Generate Matrix Button */}
            <IconButton
              icon={Plus}
              variant="primary"
              title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Generate Rate Matrix"}
              disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
              onClick={onGenerateMatrix}
            />

            {/* Copy Rates Toggle Button - only in add mode */}
            {mode === "add" && (
              <IconButton
                icon={ClipboardCopy}
                variant="primary"
                title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Copy Rates"}
                disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
                onClick={onToggleCopyRates}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
