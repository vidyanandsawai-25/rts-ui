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
  allFiltersSelected: boolean;
  existingRateFound: boolean;
  isCheckingRates: boolean;
  mode: "edit" | "delete" | "add";
  // Loading states
  isLoadingZones?: boolean;
  isLoadingUseGroups?: boolean;
  isLoadingAssessmentYears?: boolean;
  // Handlers
  onDropdownChange: (field: 'zone' | 'useGroup' | 'assessmentYear', value: string, label?: string) => void;
  onGenerateMatrix: () => void;
  onToggleMultipliers: () => void;
  onToggleCopyRates: () => void;
  // Lazy load handlers
  onLoadZones?: () => void;
  onLoadUseGroups?: () => void;
  onLoadAssessmentYears?: () => void;
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
  errors,
  allFiltersSelected,
  existingRateFound,
  isCheckingRates,
  mode,
  isLoadingZones,
  isLoadingUseGroups,
  isLoadingAssessmentYears,
  onDropdownChange,
  onGenerateMatrix,
  onToggleMultipliers,
  onToggleCopyRates,
  onLoadZones,
  onLoadUseGroups,
  onLoadAssessmentYears,
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
          onChange={(_name, value) => {
            const selectedOption = zoneOptions.find(opt => opt.value === value);
            onDropdownChange('zone', value, selectedOption?.label);
          }}
          onInputFocus={onLoadZones}
          isLoading={isLoadingZones}
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
          onChange={(_name, value) => {
            const selectedOption = useGroupOptions.find(opt => opt.value === value);
            onDropdownChange('useGroup', value, selectedOption?.label);
          }}
          onInputFocus={onLoadUseGroups}
          isLoading={isLoadingUseGroups}
          className={`text-black ${errors.useGroup ? 'border-red-500' : ''}`}
        />
        <ValidationMessage message={errors.useGroup} visible={!!errors.useGroup} />
      </div>

      {/* Assessment Year */}
      <div className="w-full md:flex-1 md:min-w-37.5 md:max-w-50">
        <Label htmlFor="assessment-year-select" className="text-sm font-medium text-black mb-1 flex items-center gap-1" required>
          <Calendar size={18} className="text-black" />
          {t('filters.assessmentYearRange')}
        </Label>
        <SearchSelect
          id="assessment-year-select"
          name="assessmentYear"
          label=""
          options={assessmentYears}
          placeholder={t('placeholders.selectAssessmentYearRange')}
          value={assessmentYear}
          onChange={(_name, value) => {
            const selectedOption = assessmentYears.find(opt => opt.value === value);
            onDropdownChange('assessmentYear', value, selectedOption?.label);
          }}
          onInputFocus={onLoadAssessmentYears}
          isLoading={isLoadingAssessmentYears}
          className={`text-black ${errors.assessmentYear ? 'border-red-500' : ''}`}
        />
        <ValidationMessage message={errors.assessmentYear} visible={!!errors.assessmentYear} />
      </div>

      {/* Action Buttons - only in add mode */}
      {mode === "add" && (
        <>
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

          {/* Copy Rates Toggle Button */}
          <IconButton
            icon={ClipboardCopy}
            variant="primary"
            title={existingRateFound ? t('messages.validationRatesAlreadyExist') : "Copy Rates"}
            disabled={!allFiltersSelected || existingRateFound || isCheckingRates}
            onClick={onToggleCopyRates}
          />
        </>
      )}
    </div>
  );
}
