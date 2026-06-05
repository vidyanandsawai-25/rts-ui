"use client";

import { Calendar, CalendarDays, Ruler, Square } from "lucide-react";
import { DownloadButton, UploadButton } from "@/components/common/ActionButtons";
import { Tabs } from '@/components/common/Tabs';
import { Input } from "@/components/common";
import { toast } from "sonner";
import type { RefObject } from "react";

interface RateFrequencySectionProps {
  rateFrequency: "Monthly" | "Yearly";
  onRateFrequencyChange: (value: "Monthly" | "Yearly") => void;
  // Rate unit props
  rateUnit: "SqMeter" | "SqFeet";
  onRateUnitChange: (value: "SqMeter" | "SqFeet") => void;
  // Import/Export handlers (only for add mode)
  mode: "edit" | "delete" | "add";
  onDownloadTemplate: () => void;
  onUploadClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Disable state
  isDisabled: boolean;
  // Whether frequency is locked by policy configuration (tabs become non-editable)
  isFrequencyLocked?: boolean;
  // Whether unit is locked by policy configuration (tabs become non-editable)
  isUnitLocked?: boolean;
  // Translations
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateFrequencySection({
  rateFrequency,
  onRateFrequencyChange,
  rateUnit,
  onRateUnitChange,
  mode,
  onDownloadTemplate,
  onUploadClick,
  fileInputRef,
  onFileChange,
  isDisabled,
  isFrequencyLocked = false,
  isUnitLocked = false,
  t,
}: RateFrequencySectionProps) {
  // In edit/delete mode, frequency and unit are always read-only (determined by existing data)
  // In add mode, they're locked only if policy configuration is set
  const isFrequencyReadOnly = mode === "edit" || mode === "delete" || isFrequencyLocked;
  const isUnitReadOnly = mode === "edit" || mode === "delete" || isUnitLocked;
  
  // Handle click on locked frequency tabs - show toast message
  const handleFrequencyTabClick = (value: "Monthly" | "Yearly") => {
    if (isFrequencyReadOnly && value !== rateFrequency) {
      toast.error(t('messages.cannotChangeConfiguredValue'));
      return;
    }
    onRateFrequencyChange(value);
  };
  
  // Handle click on locked unit tabs - show toast message
  const handleUnitTabClick = (value: "SqMeter" | "SqFeet") => {
    if (isUnitReadOnly && value !== rateUnit) {
      toast.error(t('messages.cannotChangeConfiguredValue'));
      return;
    }
    onRateUnitChange(value);
  };
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-[#f8faff] border border-blue-200 rounded-xl px-2 md:px-3 py-1 gap-2 md:gap-0 shadow-md">
      <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
        {/* Rate Frequency */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{t('sections.rateFrequency')}</span>
          </div>
          <Tabs
            value={rateFrequency}
            onChange={value => handleFrequencyTabClick(value as "Monthly" | "Yearly")}
            variant="pills"
            size="sm"
            className="mb-0 w-fit"
            tabListClassName={`gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-none mb-0 w-fit ${isFrequencyReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
            items={[
              {
                value: "Monthly",
                label: <><CalendarDays size={18} /> {t('options.monthly')}</>,
                content: null,
                disabled: false,
                className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
              },
              {
                value: "Yearly",
                label: <><Calendar size={18} /> {t('options.yearly')}</>,
                content: null,
                disabled: false,
                className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
              },
            ]}
          />
        </div>

        {/* Rate Unit */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{t('sections.rateUnit')}</span>
          </div>
          <Tabs
            value={rateUnit}
            onChange={value => handleUnitTabClick(value as "SqMeter" | "SqFeet")}
            variant="pills"
            size="sm"
            className="mb-0 w-fit"
            tabListClassName={`gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-none mb-0 w-fit ${isUnitReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
            items={[
              {
                value: "SqMeter",
                label: <><Square size={18} /> {t('options.sqMeter')}</>,
                content: null,
                disabled: false,
                className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
              },
              {
                value: "SqFeet",
                label: <><Ruler size={18} /> {t('options.sqFeet')}</>,
                content: null,
                disabled: false,
                className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
              },
            ]}
          />
        </div>
      </div>
      
      {/* Quick Import Section - Only for Add Mode */}
      {mode === "add" && (
        <div className="flex items-center gap-1 w-full md:w-auto justify-end">
          <span className="text-sm font-medium text-blue-600">{t('sections.quickImport')}</span>
          <DownloadButton
            type="button"
            onClick={onDownloadTemplate}
            disabled={isDisabled}
            title="Download Excel Template"
            label={t('buttons.downloadTemplate')}
          />
          <UploadButton
            type="button"
            onClick={onUploadClick}
            disabled={isDisabled}
            title="Upload Excel File"
            label={t('buttons.uploadExcel')}
          />
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
