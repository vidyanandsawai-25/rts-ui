"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { TaxationMetaFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

/**
 * TaxationMetaFields Component
 * Renders assessment year and interest amount fields
 * Handles numeric validation for year input
 */
export function TaxationMetaFields({
  t,
  year,
  interest,
  onYearChange,
  onInterestChange,
  validationErrors
}: TaxationMetaFieldsProps) {
  return (
    <>
      {/* Assessment Year */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("assessmentYear")}
        </Label>
       
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          title="Enter a 4-digit year"
          value={year}
          onChange={(e) => onYearChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder={t("assessmentYear")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
        />
      </div>


      {/* Interest Amount */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("interestAmount")}
        </Label>
        <Input
          type="number"
          step="0.01"
          value={interest === 0 ? "" : interest}
          onChange={(e) => onInterestChange(e.target.value)}
          placeholder={t("interestAmount")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
        />
      </div>
    </>
  );
}
