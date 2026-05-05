"use client"

import {
  Button,
  Input,
  useConfirm
} from "@/components/common"
import { Label } from "@/components/common/label";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { OldTaxesDetails, OldTaxItem, OldTaxYear, TaxationBreakdownFormProps } from "@/types/property-old-details.types";
import { saveOldTaxesDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action";
import { useLocale, useTranslations } from "next-intl";


export default function TaxationBreakdownForm({
  initialData = null,
}: TaxationBreakdownFormProps) {

  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("quickDataEntry.oldDetails.taxationBreakdown");
  const propertyId = Number(params.propertyId);

  const yearData = initialData?.taxYears?.[0];

  // Metadata State
  const [formData, setFormData] = useState({
    year: yearData ? String(yearData.year || "") : "",
    interest: yearData?.interest || 0,
    taxTotal: yearData?.taxTotal || 0,
    netTotal: yearData?.netTotal || 0,
    remark: yearData?.remark || "",
    financeYearId: yearData?.financeYearId || 0,
    yearCode: yearData?.yearCode || null,
    rVorCV: yearData?.rVorCV || "",
    rVorCVValue: yearData?.rVorCVValue || 0
  });

  // Dynamic Taxes State
  const [taxes, setTaxes] = useState<OldTaxItem[]>(yearData?.taxes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaxChange = (taxId: number, value: string) => {
    const numValue = Number(value) || 0;
    setTaxes(prev => {
      const updated = prev.map(t => t.taxId === taxId ? { ...t, taxAmount: numValue } : t);

      // Calculate totals
      const newTaxTotal = updated.reduce((acc, t) => acc + (t.taxAmount || 0), 0);
      setFormData(prevForm => ({
        ...prevForm,
        taxTotal: newTaxTotal,
        netTotal: newTaxTotal + (Number(prevForm.interest) || 0)
      }));

      return updated;
    });
  };

  const handleMetaChange = (key: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'interest') {
        updated.netTotal = (Number(updated.taxTotal) || 0) + (Number(value) || 0);
      }
      return updated;
    });
  };

  const handleSave = () => {
    confirm({
      title: t("saveAssessment"),
      description: t("saveConfirmDescription"),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const updatedTaxYears = [...(initialData?.taxYears || [])];
          const currentYearData: OldTaxYear = {
            financeYearId: formData.financeYearId,
            year: Number(formData.year) || 0,
            yearCode: formData.yearCode,
            rVorCV: formData.rVorCV,
            rVorCVValue: Number(formData.rVorCVValue) || 0,
            taxTotal: Number(formData.taxTotal) || 0,
            interest: Number(formData.interest) || 0,
            netTotal: Number(formData.netTotal) || 0,
            remark: formData.remark,
            taxes: taxes.map(t => ({
              taxId: t.taxId,
              taxName: t.taxName,
              taxAmount: Number(t.taxAmount) || 0
            }))
          };

          // Update existing year or add new one
          const existingIndex = updatedTaxYears.findIndex(y => 
            (y.financeYearId > 0 && y.financeYearId === formData.financeYearId) || 
            (y.year > 0 && y.year === Number(formData.year))
          );

          if (existingIndex > -1) {
            updatedTaxYears[existingIndex] = currentYearData;
          } else {
            updatedTaxYears.push(currentYearData);
          }

          const payload: OldTaxesDetails = {
            propertyId: propertyId,
            taxYears: updatedTaxYears
          };
          const result = await saveOldTaxesDetailsAction(propertyId, payload, locale);
          if (result.success) {
            toast.success(t("saveSuccess"));
            router.refresh();
          } else {
            toast.error(result.error || t("saveError"));
          }
        } catch (_error) {
          toast.error(t("unexpectedError"));
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

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
            value={formData.year}
            onChange={(e) => handleMetaChange('year', e.target.value)}
            placeholder={t("assessmentYear")}
            className="h-[46px] border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
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
              className="h-[46px] border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
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
            className="h-[46px] border-[#cbd5e1] bg-gray-50 cursor-not-allowed hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
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
            className="h-[46px] border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
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
            className="h-[46px] border-[#cbd5e1] bg-gray-50 cursor-not-allowed hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
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
            className="h-[46px] border-[#cbd5e1] hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 rounded-lg transition-all font-medium text-gray-900 px-4"
          />
        </div>
      </div>
      <div className="pt-2 mt-5 flex justify-end items-center">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-[17.5%] bg-[#2563eb] hover:bg-blue-700 text-white h-[46px] rounded-xl shadow-lg shadow-blue-900/10 font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95"
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
