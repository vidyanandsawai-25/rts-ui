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
  netTotal
}: TaxationSummaryFieldsProps) {
  return (
    <>
      {/* Aggregate Tax Sum */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("aggregateTaxSum")}
        </Label>
        <Input
          readOnly
          type="number"
          value={taxTotal === 0 ? "" : taxTotal}
          placeholder={t("aggregateTaxSum")}
          className="h-11.5 border-[#cbd5e1] bg-gray-50 cursor-not-allowed hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
        />
      </div>

      {/* Net Payable Total */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 ml-1">
          {t("netPayableTotal")}
        </Label>
        <Input
          readOnly
          type="number"
          value={netTotal === 0 ? "" : netTotal}
          placeholder={t("netPayableTotal")}
          className="h-11.5 border-[#cbd5e1] bg-gray-50 cursor-not-allowed hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
        />
      </div>
    </>
  );
}
