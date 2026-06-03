import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useConfirm } from "@/components/common";
import { OldTaxesDetails, OldTaxItem, OldTaxYear, YearMaster } from "@/types/OldDetails/property-old-details.types";
import { saveOldTaxesDetailsAction, applyOldTaxesDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action";

export function useTaxationBreakdownForm(
  initialData: OldTaxesDetails | null,
  yearOptions: YearMaster[] = []
) {
  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("quickDataEntry.oldDetails.taxationBreakdown");
  const tValidation = useTranslations("quickDataEntry");
  const tCommon = useTranslations("common");
  const propertyId = Number(params.propertyId);

  // Default Tax List Template (with 0 amounts)
  const defaultTaxList = useMemo(() => {
    const templateYear = initialData?.taxYears?.find(y => y.taxes && y.taxes.length > 0);
    if (templateYear) {
      return templateYear.taxes.map(t => ({
        taxId: t.taxId,
        taxName: t.taxName,
        taxAmount: 0
      }));
    }
    return [];
  }, [initialData]);

  const initialYearId = useMemo(() => {
    if (initialData?.taxYears?.[0]?.financeYearId) {
      return String(initialData.taxYears[0].financeYearId);
    }
    const firstYear = initialData?.taxYears?.[0];
    if (firstYear) {
      const match = yearOptions.find(yo => yo.year === firstYear.year || yo.yearCode === firstYear.yearCode);
      if (match) return String(match.id);
    }
    return yearOptions[0]?.id ? String(yearOptions[0].id) : "";
  }, [initialData, yearOptions]);

  // Validation State (defined first to be accessible by setSelectedYearId)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(() => {
    const initialErrors: Record<string, string> = {};
    const selectedYear = yearOptions.find(y => String(y.id) === initialYearId);
    const currentYear = new Date().getFullYear();
    if (selectedYear && selectedYear.year > currentYear) {
      initialErrors.yearMaster = tValidation('property.validation.futureYearNotAllowed') || 'Cannot select a year after the current year';
    }
    return initialErrors;
  });

  // Selected Year Master ID state
  const [selectedYearId, setSelectedYearIdState] = useState<string>(initialYearId);
  const [prevInitialYearId, setPrevInitialYearId] = useState<string>(initialYearId);

  // Sync selectedYearId when initialYearId changes (render-phase state adjustment)
  if (initialYearId !== prevInitialYearId) {
    setPrevInitialYearId(initialYearId);
    setSelectedYearIdState(initialYearId);
    setValidationErrors(prev => {
      const copy = { ...prev };
      delete copy.yearMaster;
      return copy;
    });
  }

  const setSelectedYearId = (val: string) => {
    setSelectedYearIdState(val);
    const selectedYear = yearOptions.find(y => String(y.id) === val);
    const currentYear = new Date().getFullYear();
    if (selectedYear && selectedYear.year > currentYear) {
      setValidationErrors(prev => ({
        ...prev,
        yearMaster: tValidation('property.validation.futureYearNotAllowed') || 'Cannot select a year after the current year'
      }));
    } else {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy.yearMaster;
        return copy;
      });
    }
  };



  const activeYearMaster = useMemo(() => {
    return yearOptions.find(y => String(y.id) === selectedYearId);
  }, [yearOptions, selectedYearId]);

  const activeTaxYear = useMemo(() => {
    if (!activeYearMaster) return initialData?.taxYears?.[0] || null;
    return initialData?.taxYears?.find(y =>
      y.financeYearId === activeYearMaster.id ||
      y.year === activeYearMaster.year ||
      y.yearCode === activeYearMaster.yearCode
    ) || null;
  }, [initialData, activeYearMaster]);

  // Dynamic Taxes State
  const [prevActiveTaxYear, setPrevActiveTaxYear] = useState<OldTaxYear | null>(activeTaxYear);
  const [taxes, setTaxes] = useState<OldTaxItem[]>(() => {
    return activeTaxYear?.taxes || defaultTaxList;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync taxes when activeTaxYear changes (render-phase state adjustment)
  if (activeTaxYear !== prevActiveTaxYear) {
    setPrevActiveTaxYear(activeTaxYear);
    setTaxes(activeTaxYear?.taxes || defaultTaxList);
  }

  // Dynamic Taxes State

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

    // Ensure a Year is selected
    if (!selectedYearId) {
      toast.error('Please select a Year Master');
      return false;
    }

    return true;
  };

  const saveTaxes = (taxesList: OldTaxItem[], isPost: boolean = false, onSuccess?: () => void) => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error(tValidation('property.validation.fixErrors'));
      return;
    }

    if (!taxesList || taxesList.length === 0) {
      toast.error(t('noTaxDataAvailable') || 'No tax data available');
      return;
    }

    const hasNegative = taxesList.some(t => t.taxAmount < 0);
    if (hasNegative) {
      toast.error(tValidation('property.validation.negativeNotAllowed') || 'Negative values are not allowed');
      return;
    }

    if (!selectedYearId) {
      toast.error('Please select a Year Master');
      return;
    }

    confirm({
      title: t("saveAssessment"),
      description: t("saveConfirmDescription"),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const currentYearData: OldTaxYear = {
            financeYearId: activeYearMaster?.id || activeTaxYear?.financeYearId || 0,
            year: activeYearMaster?.year || activeTaxYear?.year || 0,
            yearCode: activeYearMaster?.yearCode || activeTaxYear?.yearCode || null,
            taxes: taxesList.map(t => ({
              taxId: t.taxId,
              taxName: t.taxName,
              taxAmount: Number(t.taxAmount) || 0
            }))
          };

          const payload: OldTaxesDetails = {
            propertyId: propertyId,
            taxYears: [currentYearData]
          };
        
          const result = isPost
            ? await applyOldTaxesDetailsAction(propertyId, payload, locale)
            : await saveOldTaxesDetailsAction(propertyId, payload, locale);
          if (result.success) {
            toast.success(t("saveSuccess"));
            onSuccess?.();
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

  const handleSave = () => {
    if (!validate()) return;
    saveTaxes(taxes);
  };

  const isTaxesChanged = taxes.some(t => {
    const orig = (activeTaxYear?.taxes || defaultTaxList).find(ot => ot.taxId === t.taxId);
    return (orig?.taxAmount || 0) !== (t.taxAmount || 0);
  });

  const isYearChanged = selectedYearId !== initialYearId;
  const isChanged = isTaxesChanged || isYearChanged;

  const hasTaxData = taxes && taxes.length > 0;

  const hasAppliedTaxes = useMemo(() => {
    return !!(activeTaxYear?.taxes && activeTaxYear.taxes.length > 0);
  }, [activeTaxYear]);

  return {
    taxes,
    selectedYearId,
    setSelectedYearId,
    isSubmitting,
    handleTaxChange,
    handleSave,
    saveTaxes,
    isChanged,
    hasTaxData,
    hasAppliedTaxes,
    activeTaxYear,
    validationErrors,
    t,
    tValidation,
    tCommon
  };
}