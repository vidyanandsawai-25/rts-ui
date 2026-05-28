"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { TaxationSummaryFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

/**
 * TaxationSummaryFields Component
 * Renders read-only summary fields (aggregate tax sum and net payable total)
 * These are calculated fields that display totals
 */
export function TaxationSummaryFields({
  t,
  taxTotal,
  netTotal,
  validationErrors
}: TaxationSummaryFieldsProps) {
  return (
    <>
      {/* Aggregate Tax Sum */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("aggregateTaxSum")}
        </Label>
        <Input
          readOnly
          type="number"
          value={taxTotal === 0 ? "" : taxTotal}
          placeholder={t("aggregateTaxSum")}
          className="h-9 text-sm bg-gray-50 cursor-not-allowed border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
        />
      </div>

      {/* Net Payable Total */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("netPayableTotal")}
        </Label>
        <Input
          readOnly
          type="number"
          value={netTotal === 0 ? "" : netTotal}
          placeholder={t("netPayableTotal")}
          className="h-9 text-sm bg-gray-50 cursor-not-allowed border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
        />
      </div>
    </>
  );
}
