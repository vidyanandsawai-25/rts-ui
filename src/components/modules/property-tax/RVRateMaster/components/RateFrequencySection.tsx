"use client";

import { Calendar, CalendarDays } from "lucide-react";
import { DownloadButton, UploadButton } from "@/components/common/ActionButtons";
import { Tabs } from '@/components/common/Tabs';
import { Input } from "@/components/common";
import type { RefObject } from "react";

interface RateFrequencySectionProps {
  rateFrequency: "Monthly" | "Yearly";
  onRateFrequencyChange: (value: "Monthly" | "Yearly") => void;
  // Import/Export handlers (only for add mode)
  mode: "edit" | "delete" | "add";
  onDownloadTemplate: () => void;
  onUploadClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Disable state
  isDisabled: boolean;
  // Translations
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateFrequencySection({
  rateFrequency,
  onRateFrequencyChange,
  mode,
  onDownloadTemplate,
  onUploadClick,
  fileInputRef,
  onFileChange,
  isDisabled,
  t,
}: RateFrequencySectionProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-[#f8faff] border border-blue-200 rounded-xl px-2 md:px-3 py-1 gap-2 md:gap-0 shadow-md">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{t('sections.rateFrequency')}</span>
        </div>
        <Tabs
          value={rateFrequency}
          onChange={value => onRateFrequencyChange(value as "Monthly" | "Yearly")}
          variant="pills"
          size="sm"
          className="mb-0 w-fit"
          tabListClassName="gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-none mb-0 w-fit"
          items={[
            {
              value: "Monthly",
              label: <><CalendarDays size={18} /> {t('options.monthly')}</>,
              content: null,
              className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
            },
            {
              value: "Yearly",
              label: <><Calendar size={18} /> {t('options.yearly')}</>,
              content: null,
              className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
            },
          ]}
        />
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
