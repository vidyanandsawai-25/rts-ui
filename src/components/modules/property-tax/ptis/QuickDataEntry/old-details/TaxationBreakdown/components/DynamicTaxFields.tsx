"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { DynamicTaxFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

// Only numbers allowed, decimal not allowed
const ONLY_NUMBER_SANITIZE = /[^0-9]/g;

const handleNumberChange = (value: string) => {
  return value.replace(ONLY_NUMBER_SANITIZE, "");
};

/**
 * DynamicTaxFields Component
 * Renders dynamic tax input fields based on available tax types
 * Each tax type gets its own input field for amount entry
 */
export function DynamicTaxFields({  
  taxes,
  onTaxChange,  
}: DynamicTaxFieldsProps) {
  // Return null when no tax data - warning is shown at the top of the form
  if (!taxes || taxes.length === 0) {
    return null;
  }

  return (
    <>
      {taxes.map((tax) => {
        return (
          <div key={tax.taxId} className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              {tax.taxName}
            </Label>
            <Input
              type="text"
              value={tax.taxAmount === 0 ? "" : tax.taxAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Sanitize to only numbers (no decimals, no negative)
                const sanitized = handleNumberChange(value);
                
                // Validate max 15 digits
                if (sanitized.length > 10) return;
                
                onTaxChange(tax.taxId, sanitized);
              }}
              placeholder={tax.taxName}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
            />
          </div>
        );
      })}
    </>
  );
}
