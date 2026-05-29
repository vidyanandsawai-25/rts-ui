import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useConfirm } from "@/components/common";
import { OldTaxesDetails, OldTaxItem, OldTaxYear } from "@/types/OldDetails/property-old-details.types";
import { saveOldTaxesDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action";

export function useTaxationBreakdownForm(initialData: OldTaxesDetails | null) {
  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("quickDataEntry.oldDetails.taxationBreakdown");
  const tValidation = useTranslations("quickDataEntry");
  const propertyId = Number(params.propertyId);

  const yearData = initialData?.taxYears?.[0];

  // Dynamic Taxes State
  const [taxes, setTaxes] = useState<OldTaxItem[]>(yearData?.taxes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleTaxChange = (taxId: number, value: string) => {
    const numValue = Number(value) || 0;
    const updatedTaxes = taxes.map(t => t.taxId === taxId ? { ...t, taxAmount: numValue } : t);

    setTaxes(updatedTaxes);

    if (numValue < 0) {
      setValidationErrors(prev => ({
        ...prev,
        [`tax_${taxId}`]: tValidation('property.validation.negativeNotAllowed')
      }));
    } else {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[`tax_${taxId}`];
        return copy;
      });
    }
  };

  const validate = () => {
    // Check validationErrors object
    if (Object.keys(validationErrors).length > 0) {
      toast.error(tValidation('property.validation.fixErrors'));
      return false;
    }

    // Check if taxes data is available
    if (!taxes || taxes.length === 0) {
      toast.error(t('noTaxDataAvailable') || 'No tax data available');
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
          const newTaxTotal = taxes.reduce((acc, t) => acc + (t.taxAmount || 0), 0);
          const newNetTotal = newTaxTotal + (Number(yearData?.interest) || 0);

          const currentYearData: OldTaxYear = {
            financeYearId: yearData?.financeYearId || 0,
            year: Number(yearData?.year || 0),
            yearCode: yearData?.yearCode || null,
            rVorCV: yearData?.rVorCV || "",
            rVorCVValue: Number(yearData?.rVorCVValue) || 0,
            taxTotal: newTaxTotal,
            interest: Number(yearData?.interest) || 0,
            netTotal: newNetTotal,
            taxes: taxes.map(t => ({
              taxId: t.taxId,
              taxName: t.taxName,
              taxAmount: Number(t.taxAmount) || 0
            }))
          };

          // Update existing year or add new one
          const existingIndex = updatedTaxYears.findIndex(y =>
            (y.financeYearId > 0 && y.financeYearId === (yearData?.financeYearId || 0)) ||
            (y.year > 0 && y.year === Number(yearData?.year || 0))
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

  const isChanged = isTaxesChanged;

  const hasTaxData = taxes && taxes.length > 0;

  return {
    taxes,
    isSubmitting,
    handleTaxChange,
    handleSave,
    isChanged,
    hasTaxData,
    validationErrors,
    t,
    tValidation
  };
}
