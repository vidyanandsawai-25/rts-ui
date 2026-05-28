"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { DynamicTaxFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

/**
 * DynamicTaxFields Component
 * Renders dynamic tax input fields based on available tax types
 * Each tax type gets its own input field for amount entry
 */
export function DynamicTaxFields({  
  taxes,
  onTaxChange,
  validationErrors
}: DynamicTaxFieldsProps) {
  // Return null when no tax data - warning is shown at the top of the form
  if (!taxes || taxes.length === 0) {
    return null;
  }

  return (
    <>
      {taxes.map((tax) => {
        const errorKey = `tax_${tax.taxId}`;
        const hasError = !!validationErrors[errorKey];
        return (
          <div key={tax.taxId} className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {tax.taxName}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={tax.taxAmount === 0 ? "" : tax.taxAmount}
              onChange={(e) => onTaxChange(tax.taxId, e.target.value)}
              placeholder={tax.taxName}
              className={`h-11.5 hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4 ${
                hasError ? 'border-red-500' : 'border-[#cbd5e1]'
              }`}
            />
            {hasError && (
              <span className="text-xs text-red-500 ml-1">{validationErrors[errorKey]}</span>
            )}
          </div>
        );
      })}
    </>
  );
}
