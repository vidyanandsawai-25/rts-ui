import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useConfirm } from "@/components/common";
import { OldTaxesDetails, OldTaxItem, OldTaxYear } from "@/types/OldDetails/property-old-details.types";
import { saveOldTaxesDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action";
import { propertyValidations } from "@/lib/utils/validation-schemas";

export function useTaxationBreakdownForm(initialData: OldTaxesDetails | null) {
  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("quickDataEntry.oldDetails.taxationBreakdown");
  const tValidation = useTranslations("quickDataEntry");
  const propertyId = Number(params.propertyId);

  const yearData = initialData?.taxYears?.[0];

  // Metadata State
  const [formData, setFormData] = useState({
    year: yearData ? String(yearData.year || "") : "",
    interest: yearData?.interest || 0,
    taxTotal: yearData?.taxTotal || 0,
    netTotal: yearData?.netTotal || 0,
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

  const validate = () => {
    // Use unified validation utility
    const yearError = propertyValidations.year("assessmentYear", tValidation)(formData.year);
    if (yearError) {
      toast.error(yearError);
      return false;
    }

    // Check range (1700-2026)
    const yearNum = Number(formData.year);
    if (isNaN(yearNum) || yearNum < 1700 || yearNum > 2026) {
      toast.error(tValidation('property.validation.assessmentYearRange') || 'Assessment year must be between 1700 and 2026');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    confirm({
      title: t("saveAssessment"),
      description: t("saveConfirmDescription"),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const updatedTaxYears = [...(initialData?.taxYears || [])];
          const currentYearData: OldTaxYear = {
            financeYearId: formData.financeYearId,
            year: Number(formData.year),
            yearCode: formData.yearCode,
            rVorCV: formData.rVorCV,
            rVorCVValue: Number(formData.rVorCVValue) || 0,
            taxTotal: Number(formData.taxTotal) || 0,
            interest: Number(formData.interest) || 0,
            netTotal: Number(formData.netTotal) || 0,
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

  const isTaxesChanged = taxes.some(t => {
    const orig = (yearData?.taxes || []).find(ot => ot.taxId === t.taxId);
    return (orig?.taxAmount || 0) !== (t.taxAmount || 0);
  });

  const isChanged =
    formData.year !== (yearData ? String(yearData.year || "") : "") ||
    Number(formData.interest || 0) !== (yearData?.interest || 0) ||
    formData.rVorCV !== (yearData?.rVorCV || "") ||
    Number(formData.rVorCVValue || 0) !== (yearData?.rVorCVValue || 0) ||
    isTaxesChanged;

  return {
    formData,
    taxes,
    isSubmitting,
    handleTaxChange,
    handleMetaChange,
    handleSave,
    isChanged,
    t,
    tValidation
  };
}
