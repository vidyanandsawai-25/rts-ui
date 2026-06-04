import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/common";
import {
  deleteOldFloorDetailsAction,
  saveOldFloorDetailsAction,
  updateOldFloorDetailsAction,
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/floor-information/action";
import { SaveOldFloorDetailPayload, FloorInformationFormData } from "@/types/OldDetails/property-old-details.types";
/**
 * Maps FloorInformationFormData to SaveOldFloorDetailPayload for API calls.
 * Ensures numeric fields are correctly parsed and optional fields are handled.
 */
function mapFloorFormToPayload(
  propertyId: number,
  formData: FloorInformationFormData
): SaveOldFloorDetailPayload {
  // Use the calculated values directly from formData (already computed in the form)
  const carpetAreaSqMeter = Number(formData.oldAreaSqMeter) || 0;
  const carpetAreaSqFeet = Number(formData.oldCarpetAreaSqFeet) || 0;
  const builtupAreaSqFeet = Number(formData.oldBuiltupAreaSqFeet) || 0;
  const builtupAreaSqMeter = Number(formData.oldBuiltupAreaSqMeter) || 0;

  return {
    propertyId: propertyId,
    oldFloorId: Number(formData.oldFloorId),
    oldSubFloorId: formData.oldSubFloorId ? Number(formData.oldSubFloorId) : null,
    oldConstructionYear: String(formData.oldConstructionYear),
    oldAssessmentYear: formData.oldAssessmentYear ? String(formData.oldAssessmentYear) : undefined,
    oldConstructionTypeId: Number(formData.oldConstructionTypeId),
    oldTypeOfUseId: Number(formData.oldTypeOfUseId),
    oldSubTypeOfUseId: formData.oldSubTypeOfUseId ? Number(formData.oldSubTypeOfUseId) : null,
    oldCarpetAreaSqMeter: carpetAreaSqMeter,
    oldCarpetAreaSqFeet: carpetAreaSqFeet,
    oldBuiltupAreaSqMeter: builtupAreaSqMeter,
    oldBuiltupAreaSqFeet: builtupAreaSqFeet,
  };
}


/**
 * Hook to handle API operations for Floor Information.
 * Handles saving, updating, and deleting floor records.
 */
export function useFloorFormApi(propertyId: number, locale: string) {
  const t = useTranslations('quickDataEntry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();

  /**
   * Saves or updates a floor detail record.
   * @param formData The current form data.
   * @param onSuccess Callback executed upon successful API response.
   */
  const handleSave = useCallback(async (formData: FloorInformationFormData, onSuccess: () => void) => {
    const isEdit = !!formData.id;
    
    confirm({
      title: isEdit ? t('floor.updateConfirmTitle') : t('floor.addConfirmTitle'),
      description: isEdit ? t('floor.updateConfirmText') : t('floor.addConfirmText'),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const payload = mapFloorFormToPayload(propertyId, formData);

          let result;
          if (isEdit) {
            result = await updateOldFloorDetailsAction(propertyId, formData.id!, payload, locale);
          } else {
            result = await saveOldFloorDetailsAction(propertyId, payload, locale);
          }

          if (result.success) {
            toast.success(isEdit ? t('oldDetails.floorInformation.updateSuccess') : t('oldDetails.floorInformation.saveSuccess'));
            onSuccess();
            router.refresh(); // Refresh data so MasterTable updates immediately
          } else {
            toast.error(result.error || t('oldDetails.floorInformation.saveError'));
          }
        } catch (_error) {
          toast.error(t('oldDetails.floorInformation.unexpectedError'));
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  }, [propertyId, locale, t, router, confirm]);

  /**
   * Deletes a floor detail record.
   * @param id The record ID to delete.
   * @returns Promise resolving to true if successful, false otherwise.
   */
  const handleDelete = useCallback(async (id: number) => {
    try {
      const result = await deleteOldFloorDetailsAction(propertyId, id, locale);
      if (result.success) {
        toast.success(t('oldDetails.floorInformation.deleteSuccess'));
        router.refresh();
      } else {
        toast.error(result.error || t('oldDetails.floorInformation.deleteError'));
      }
    } catch (_error) {
      toast.error(t('oldDetails.floorInformation.unexpectedError'));
    }
  }, [propertyId, locale, t, router]);

  return {
    isSubmitting,
    handleSave,
    handleDelete
  };
}
