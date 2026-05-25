"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { sanitizeAlphanumeric, sanitizeDecimal, preventInvalidNumericKeys } from "../utils/inputValidation";
import { AreaDetailsFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

/**
 * AreaDetailsFields Component
 * Renders area-related fields (plot area, plot number, construction area)
 * Handles decimal input validation for area measurements
 */
export function AreaDetailsFields({
  t,
  formData,
  onFieldChange
}: AreaDetailsFieldsProps) {
  return (
    <>
      {/* Old Plot Area */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.plotArea")}
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder={t("oldDetails.plotAreaPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldPlotArea}
          onChange={(e) => {
            const value = sanitizeDecimal(e.target.value);
            if (value !== '') {
              onFieldChange('oldPlotArea', value);
            }
          }}
          onKeyDown={preventInvalidNumericKeys}
        />
      </div>

      {/* Old Plot No */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.plotNo")}
        </Label>
        <Input
          placeholder={t("oldDetails.plotNoPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldPlotNo}
          maxLength={50}
          onChange={(e) => {
            const value = sanitizeAlphanumeric(e.target.value);
            if (value.trim() || value === '') {
              onFieldChange('oldPlotNo', value);
            }
          }}
        />
      </div>

      {/* Old Construction Area */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.constructionArea")}
        </Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder={t("oldDetails.constructionAreaPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldConstructionArea ?? ""}
          onChange={(e) => {
            const value = sanitizeDecimal(e.target.value);
            if (value !== '') {
              onFieldChange("oldConstructionArea", value);
            }
          }}
          onKeyDown={preventInvalidNumericKeys}
        />
      </div>
    </>
  );
}
