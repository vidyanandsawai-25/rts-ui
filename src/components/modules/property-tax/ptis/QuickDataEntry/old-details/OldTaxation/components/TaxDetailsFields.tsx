"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { sanitizeTaxDecimal, preventInvalidNumericKeys, isValidDecimalField } from "../utils/inputValidation";
import { TaxDetailsFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

/**
 * TaxDetailsFields Component
 * Renders tax-related fields (RV, ALV, property tax, total tax)
 * Handles decimal input validation for tax amounts
 */
export function TaxDetailsFields({
  t,
  formData,
  showError,
  onFieldChange
}: TaxDetailsFieldsProps) {
  return (
    <>
      {/* Old RV */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.rv")}<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          required
          type="text"
          inputMode="decimal"
          placeholder={t("oldDetails.rvPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldRV || ""}
          onChange={(e) => {
            const value = sanitizeTaxDecimal(e.target.value);
            if (value !== '' || e.target.value === '') {
              onFieldChange('oldRV', value);
            }
          }}
          onKeyDown={preventInvalidNumericKeys}
        />
        {showError('oldRV', isValidDecimalField(formData.oldRV)) && (
          <span className="text-xs text-red-500">{t('oldDetails.validation.rvRequired')}</span>
        )}
      </div>

      {/* Old ALV */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.alv")}<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          required
          type="text"
          inputMode="decimal"
          placeholder={t("oldDetails.alvPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldALV || ""}
          onChange={(e) => {
            const value = sanitizeTaxDecimal(e.target.value);
            if (value !== '' || e.target.value === '') {
              onFieldChange('oldALV', value);
            }
          }}
          onKeyDown={preventInvalidNumericKeys}
        />
        {showError('oldALV', isValidDecimalField(formData.oldALV)) && (
          <span className="text-xs text-red-500">{t('oldDetails.validation.alvRequired')}</span>
        )}
      </div>

      {/* Old Property Tax */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.propertyTax")}<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          required
          type="text"
          inputMode="decimal"
          placeholder={t("oldDetails.propertyTaxPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldGeneralTax || ""}
          onChange={(e) => {
            const value = sanitizeTaxDecimal(e.target.value);
            if (value !== '' || e.target.value === '') {
              onFieldChange('oldGeneralTax', value);
            }
          }}
          onKeyDown={preventInvalidNumericKeys}
        />
        {showError('oldGeneralTax', isValidDecimalField(formData.oldGeneralTax)) && (
          <span className="text-xs text-red-500">{t('oldDetails.validation.propertyTaxRequired')}</span>
        )}
      </div>

      {/* Old Total Tax - Read Only */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("oldDetails.totalTax")}
        </Label>
        <Input
          readOnly
          type="text"
          inputMode="decimal"
          placeholder={t("oldDetails.totalTaxPlaceholder")}
          className="h-9 text-sm border-blue-200 bg-gray-50 cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldTotalTax}
        />
      </div>
    </>
  );
}
