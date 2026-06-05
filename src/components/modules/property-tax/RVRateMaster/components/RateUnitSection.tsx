"use client";

import { Ruler, Square } from "lucide-react";
import { Tabs } from '@/components/common/Tabs';

interface RateUnitSectionProps {
  rateUnit: "SqMeter" | "SqFeet";
  onRateUnitChange: (value: "SqMeter" | "SqFeet") => void;
  mode: "edit" | "delete" | "add";
  // Whether unit is locked by policy configuration (tabs become non-editable)
  isUnitLocked?: boolean;
  // Translations
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function RateUnitSection({
  rateUnit,
  onRateUnitChange,
  mode,
  isUnitLocked = false,
  t,
}: RateUnitSectionProps) {
  // In edit/delete mode, unit is always read-only (determined by existing data)
  // In add mode, it's locked only if policy configuration is set
  const isReadOnly = mode === "edit" || mode === "delete" || isUnitLocked;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Ruler size={18} className="text-blue-600" />
        <span className="text-sm font-medium text-blue-600">{t('sections.rateUnit')}</span>
      </div>
      <Tabs
        value={rateUnit}
        onChange={value => !isReadOnly && onRateUnitChange(value as "SqMeter" | "SqFeet")}
        variant="pills"
        size="sm"
        className="mb-0 w-fit"
        tabListClassName={`gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-none mb-0 w-fit ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
        items={[
          {
            value: "SqMeter",
            label: <><Square size={18} /> {t('options.sqMeter')}</>,
            content: null,
            disabled: isReadOnly && rateUnit !== "SqMeter",
            className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
          },
          {
            value: "SqFeet",
            label: <><Ruler size={18} /> {t('options.sqFeet')}</>,
            content: null,
            disabled: isReadOnly && rateUnit !== "SqFeet",
            className: "!px-4 !py-1 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1 min-w-[90px]",
          },
        ]}
      />
    </div>
  );
}
