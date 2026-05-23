"use client"

import {
  Button,
  Input,
} from "@/components/common"
import { Label } from "@/components/common/label";
import { Save } from "lucide-react";
import { TaxationBreakdownFormProps } from "@/types/property-old-details.types";
import { useTaxationBreakdownForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useTaxationBreakdownForm";

export default function TaxationBreakdownForm({
  initialData = null,
}: TaxationBreakdownFormProps) {

  const {
    formData,
    taxes,
    isSubmitting,
    handleTaxChange,
    handleMetaChange,
    handleSave,
    isChanged,
    t
  } = useTaxationBreakdownForm(initialData);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-blue-800 mb-8">
        {t("title")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-5 items-end">
        {/* Assessment Year */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">{t("assessmentYear")}</Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            title="Enter a 4-digit year"
            value={formData.year}
            onChange={(e) => handleMetaChange('year', e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder={t("assessmentYear")}
            className="h-11.5 border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>

        {/* Dynamic Taxes */}
        {taxes.map((tax) => (
          <div key={tax.taxId} className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">{tax.taxName}</Label>
            <Input
              type="number"
              value={tax.taxAmount === 0 ? "" : tax.taxAmount}
              onChange={(e) => handleTaxChange(tax.taxId, e.target.value)}
              placeholder={tax.taxName}
              className="h-11.5 border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
            />
          </div>
        ))}

        {/* Aggregate Tax Sum */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">{t("aggregateTaxSum")}</Label>
          <Input
            readOnly
            type="number"
            value={formData.taxTotal === 0 ? "" : formData.taxTotal}
            placeholder={t("aggregateTaxSum")}
            className="h-11.5 border-[#cbd5e1] bg-gray-50 cursor-not-allowed hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>

        {/* Interest Amount */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">{t("interestAmount")}</Label>
          <Input
            type="number"
            value={formData.interest === 0 ? "" : formData.interest}
            onChange={(e) => handleMetaChange('interest', e.target.value)}
            placeholder={t("interestAmount")}
            className="h-11.5 border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>

        {/* Net Payable Total */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">{t("netPayableTotal")}</Label>
          <Input
            readOnly
            type="number"
            value={formData.netTotal === 0 ? "" : formData.netTotal}
            placeholder={t("netPayableTotal")}
            className="h-11.5 border-[#cbd5e1] bg-gray-50 cursor-not-allowed hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">{t("remarks")}</Label>
          <Input
            type="text"
            value={formData.remark}
            onChange={(e) => handleMetaChange('remark', e.target.value)}
            placeholder={t("remarks")}
            className="h-11.5 border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>
      </div>
      <div className="pt-2 mt-5 flex justify-end items-center">
        <Button
          onClick={handleSave}
          disabled={isSubmitting || !isChanged}
          className="w-[17.5%] bg-[#2563eb] hover:bg-blue-700 text-white h-11.5 rounded-xl shadow-lg shadow-blue-900/10 font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95"
        >
          <div className="flex gap-2 text-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? t("saving") : t("update")}
          </div>
        </Button>
      </div>
    </div>
  );
}
