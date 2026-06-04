import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/components/common";
import { PropertyOldDetailsApiItem } from "@/types/OldDetails/property-old-details.types";
import { updatePropertyOldDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/old-taxation/action";
import { 
  sanitizePlotArea, 
  sanitizePropertyPartitionNo, 
  sanitizeZoneName, 
  sanitizeWardNo, 
  sanitizeEgovNo,
  sanitizePlotNo
} from "@/lib/utils/input-sanitization";

export function useOldTaxationForm(propertyOldDetails: PropertyOldDetailsApiItem | null) {
  const t = useTranslations('quickDataEntry');
  const { confirm } = useConfirm();
  const params = useParams();
  const propertyId = Number(params.propertyId);
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    oldZoneNo: propertyOldDetails?.oldZoneNo ?? "",
    oldWardNo: propertyOldDetails?.oldWardNo ?? "",
    oldPropertyNo: propertyOldDetails?.oldPropertyNo ?? "",
    oldPartitionNo: propertyOldDetails?.oldPartitionNo ?? "",
    oldEgovNo: propertyOldDetails?.oldEgovNo ?? "",
    oldPlotArea: propertyOldDetails?.oldPlotArea && propertyOldDetails.oldPlotArea !== 0 ? propertyOldDetails.oldPlotArea.toString() : "",
    oldPlotNo: propertyOldDetails?.oldPlotNo ?? "",
    oldCarpetAreaSqFeet: propertyOldDetails?.oldCarpetAreaSqFeet ?? 0,
    oldConstructionArea: propertyOldDetails?.oldConstructionArea && propertyOldDetails.oldConstructionArea !== 0 ? propertyOldDetails.oldConstructionArea.toString() : "",
    oldRV: propertyOldDetails?.oldRV && propertyOldDetails.oldRV !== 0 ? propertyOldDetails.oldRV.toString() : "",
    oldALV: propertyOldDetails?.oldALV && propertyOldDetails.oldALV !== 0 ? propertyOldDetails.oldALV.toString() : "",
    oldGeneralTax: propertyOldDetails?.oldGeneralTax && propertyOldDetails.oldGeneralTax !== 0 ? propertyOldDetails.oldGeneralTax.toString() : "",
    oldTotalTax: propertyOldDetails?.oldTotalTax ?? 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  /**
   * Helper to determine if an error should be shown for a specific field
   */
  const showError = useCallback((_field: string, isValid: boolean) => {
    return attemptedSubmit && !isValid;
  }, [attemptedSubmit]);

  const handleUpdate = () => {
    // Validate required fields
    const isZoneValid = formData.oldZoneNo.trim().length > 0;
    const isWardValid = formData.oldWardNo.trim().length > 0;
    const isPropertyValid = formData.oldPropertyNo.trim().length > 0;

    setAttemptedSubmit(true);

    if (!isZoneValid || !isWardValid || !isPropertyValid) {
      toast.error(t("oldDetails.validation.fillRequiredFields"));
      return;
    }

    confirm({
      title: t("property.updateConfirmTitle"),
      description: t("property.updateConfirmText"),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const payload = {
            ...(propertyOldDetails ?? {}),
            ...formData,
            oldPlotArea: Number(formData.oldPlotArea) || 0,
            oldConstructionArea: Number(formData.oldConstructionArea) || 0,
            oldRV: Number(formData.oldRV) || 0,
            oldALV: Number(formData.oldALV) || 0,
            oldGeneralTax: Number(formData.oldGeneralTax) || 0,
          };
          const result = await updatePropertyOldDetailsAction(propertyId, payload, locale);
          if (result.success) {
            toast.success(t("oldDetails.oldTaxation.updateSuccess"));
          } else {
            toast.error(result.error || t("oldDetails.oldTaxation.updateError"));
          }
        } catch (_error) {
          toast.error(t("oldDetails.oldTaxation.updateError"));
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleInputChange = (key: keyof typeof formData, value: string | number) => {
    let sanitizedValue = value;
    
    // Apply sanitization based on field type
    if (typeof value === 'string') {
      let tempValue = value;
      // Strip leading zeros for numeric/area/tax fields
      if (['oldPlotArea', 'oldConstructionArea', 'oldRV', 'oldALV', 'oldGeneralTax'].includes(key)) {
        tempValue = value.replace(/^0+(?=\d)/, '');
      }

      if (key === 'oldPlotArea') {
        sanitizedValue = sanitizePlotArea(tempValue);
      } else if (key === 'oldPropertyNo' || key === 'oldPartitionNo') {
        sanitizedValue = sanitizePropertyPartitionNo(tempValue);
      } else if (key === 'oldZoneNo') {
        sanitizedValue = sanitizeZoneName(tempValue);
      } else if (key === 'oldWardNo') {
        sanitizedValue = sanitizeWardNo(tempValue);
      } else if (key === 'oldEgovNo') {
        sanitizedValue = sanitizeEgovNo(tempValue);
      } else if (key === 'oldPlotNo') {
        sanitizedValue = sanitizePlotNo(tempValue);
      } else if (key === 'oldConstructionArea' || key === 'oldRV' || key === 'oldALV' || key === 'oldGeneralTax') {        
         sanitizedValue = sanitizePlotArea(tempValue);
      }
    }    
    setFormData(prev => ({ ...prev, [key]: sanitizedValue }));
  };

  const isChanged = 
    formData.oldZoneNo !== (propertyOldDetails?.oldZoneNo ?? "") ||
    formData.oldWardNo !== (propertyOldDetails?.oldWardNo ?? "") ||
    formData.oldPropertyNo !== (propertyOldDetails?.oldPropertyNo ?? "") ||
    formData.oldPartitionNo !== (propertyOldDetails?.oldPartitionNo ?? "") ||
    formData.oldEgovNo !== (propertyOldDetails?.oldEgovNo ?? "") ||
    (formData.oldPlotArea || "0") !== (propertyOldDetails?.oldPlotArea?.toString() ?? "0") ||
    formData.oldPlotNo !== (propertyOldDetails?.oldPlotNo ?? "") ||
    formData.oldCarpetAreaSqFeet !== (propertyOldDetails?.oldCarpetAreaSqFeet ?? 0) ||
    (formData.oldConstructionArea || "0") !== (propertyOldDetails?.oldConstructionArea?.toString() ?? "0") ||
    (formData.oldRV || "0") !== (propertyOldDetails?.oldRV?.toString() ?? "0") ||
    (formData.oldALV || "0") !== (propertyOldDetails?.oldALV?.toString() ?? "0") ||
    (formData.oldGeneralTax || "0") !== (propertyOldDetails?.oldGeneralTax?.toString() ?? "0") ||
    formData.oldTotalTax !== (propertyOldDetails?.oldTotalTax ?? 0);

  return {
    formData,
    isSubmitting,
    attemptedSubmit,
    showError,
    handleUpdate,
    handleInputChange,
    isChanged,
    t
  };
}