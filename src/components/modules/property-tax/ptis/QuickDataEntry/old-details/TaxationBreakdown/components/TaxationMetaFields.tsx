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
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
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
          className="h-11.5 border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
        />
      </div>

       {/* Assessment Year
            <div className="space-y-1.5">
                <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                       {t("assessmentYear")} <span className="text-red-500">*</span>
                </Label>
                <Input
                    className="h-9 border-blue-100 focus:ring-blue-400"
                    placeholder="YYYY"
                    maxLength={4}
                    value={year || ''}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        onFieldChange('oldAssessmentYear', val);
                        // Validate year in real-time
                        validateYearFieid('oldAssessmentYear', val);
                    }}
                />
                {showError("oldAssessmentYear") && (
                    <span className="text-xs text-red-500">{errors.oldAssessmentYear}</span>
                )}
            </div> */}

      {/* Interest Amount */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("interestAmount")}
        </Label>
        <Input
          type="number"
          step="0.01"
          value={interest === 0 ? "" : interest}
          onChange={(e) => onInterestChange(e.target.value)}
          placeholder={t("interestAmount")}
          className={`h-11.5 hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4 ${
            validationErrors.interest ? 'border-red-500' : 'border-[#cbd5e1]'
          }`}
        />
        {validationErrors.interest && (
          <span className="text-xs text-red-500 ml-1">{validationErrors.interest}</span>
        )}
      </div>
    </>
  );
}
