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
  onTaxChange
}: DynamicTaxFieldsProps) {
  return (
    <>
      {taxes.map((tax) => (
        <div key={tax.taxId} className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">
            {tax.taxName}
          </Label>
          <Input
            type="number"
            value={tax.taxAmount === 0 ? "" : tax.taxAmount}
            onChange={(e) => onTaxChange(tax.taxId, e.target.value)}
            placeholder={tax.taxName}
            className="h-11.5 border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>
      ))}
    </>
  );
}
