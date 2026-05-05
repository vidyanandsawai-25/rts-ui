import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  SaveOldFloorDetailsAction,
  UpdateOldFloorDetailsAction,
  DeleteOldFloorDetailsAction
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/floor-information/action";
import { SubTypeOfUse, OldFloorDetail } from "@/types/property-old-details.types";
import { hasErrors } from "@/lib/utils/validation";
import { validateFloorInformationForm } from "@/lib/utils/validateFloorInformationForm";

interface UseFloorInformationFormProps {
  propertyId: number;
  locale: string;
  initialSubUseTypeOptions: SubTypeOfUse[];
}

/**
 * Custom hook to manage Floor Information Form state and logic.
 * Handles form data, type-of-use changes, editing, resetting, saving, and deleting.
 */
export function useFloorInformationForm({
  propertyId,
  locale,
  initialSubUseTypeOptions
}: UseFloorInformationFormProps) {
  const t = useTranslations('quickDataEntry');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Form State
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    oldFloorId: "" as string | number,
    oldSubFloorId: "" as string | number,
    oldConstructionYear: "",
    oldConstructionTypeId: "" as string | number,
    oldTypeOfUseId: "" as string | number,
    oldSubTypeOfUseId: "" as string | number,
    oldCarpetAreaSqFeet: "",
    markedForDeletion: false
  });

  const [subUseTypeOptions, setSubUseTypeOptions] = useState<SubTypeOfUse[]>(initialSubUseTypeOptions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  // Sync initial sub-use types when they change via server-side props
  useEffect(() => {
    setSubUseTypeOptions(initialSubUseTypeOptions);
  }, [initialSubUseTypeOptions]);

  /**
   * Handles Type of Use change and updates sub-type options via URL query params.
   */
  const handleUseTypeChange = async (val: string | number, isEditBinding = false) => {
    const useTypeId = val ? String(val) : "";

    setFormData(prev => ({
      ...prev,
      oldTypeOfUseId: useTypeId,
      oldSubTypeOfUseId: isEditBinding ? prev.oldSubTypeOfUseId : ""
    }));

    // Only update URL if the value has changed
    const currentParam = searchParams.get('typeOfUseId') || "";
    if (currentParam !== useTypeId) {
      const urlParams = new URLSearchParams(searchParams);
      if (useTypeId) {
        urlParams.set('typeOfUseId', useTypeId);
      } else {
        urlParams.delete('typeOfUseId');
      }
      router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
    }
  };

  /**
   * Pre-fills form data for editing an existing record.
   */
  const handleEdit = (row: OldFloorDetail) => {
    setFormData({
      id: row.id,
      oldFloorId: String(row.oldFloorId),
      oldSubFloorId: row.oldSubFloorId ? String(row.oldSubFloorId) : "",
      oldConstructionYear: row.oldConstructionYear,
      oldConstructionTypeId: String(row.oldConstructionTypeId),
      oldTypeOfUseId: row.oldTypeOfUseId ? String(row.oldTypeOfUseId) : "",
      oldSubTypeOfUseId: row.oldSubTypeOfUseId ? String(row.oldSubTypeOfUseId) : "",
      oldCarpetAreaSqFeet: String(row.oldCarpetAreaSqFeet),
      markedForDeletion: row.markedForDeletion
    });

    if (row.oldTypeOfUseId !== undefined && row.oldTypeOfUseId !== null) {
      handleUseTypeChange(row.oldTypeOfUseId, true);
    }

    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Resets the form to initial empty state.
   */
  const handleReset = () => {
    setFormData({
      id: undefined,
      oldFloorId: "",
      oldSubFloorId: "",
      oldConstructionYear: "",
      oldConstructionTypeId: "",
      oldTypeOfUseId: "",
      oldSubTypeOfUseId: "",
      oldCarpetAreaSqFeet: "",
      markedForDeletion: false
    });
    setErrors({});
    setShowErrors(false);

    const currentParam = searchParams.get('typeOfUseId');
    if (currentParam) {
      const urlParams = new URLSearchParams(searchParams);
      urlParams.delete('typeOfUseId');
      router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
    }
  };

  /**
   * Validates and saves (Create or Update) floor detail record.
   */
  const handleSave = async () => {
    const newErrors = validateFloorInformationForm(formData, t);

    setErrors(newErrors);
    setShowErrors(true);

    if (hasErrors(newErrors)) {
      toast.error(t('floor.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        propertyId: propertyId,
        oldFloorId: Number(formData.oldFloorId),
        oldSubFloorId: formData.oldSubFloorId ? Number(formData.oldSubFloorId) : null,
        oldConstructionTypeId: Number(formData.oldConstructionTypeId),
        oldTypeOfUseId: Number(formData.oldTypeOfUseId),
        oldSubTypeOfUseId: formData.oldSubTypeOfUseId ? Number(formData.oldSubTypeOfUseId) : null,
        oldCarpetAreaSqFeet: Number(formData.oldCarpetAreaSqFeet) || 0,
        oldConstructionYear: formData.oldConstructionYear.toString()
      };

      let result;
      if (formData.id) {
        console.log("Update data");

        result = await UpdateOldFloorDetailsAction(propertyId, formData.id, payload, locale);
      } else {
        console.log("Add data");

        result = await SaveOldFloorDetailsAction(propertyId, payload, locale);
      }

      if (result.success) {
        toast.success(formData.id ? t('oldDetails.floorInformation.updateSuccess') : t('oldDetails.floorInformation.saveSuccess'));
        handleReset();
      } else {
        toast.error(result.error || t('oldDetails.floorInformation.saveError'));
      }
    } catch (_error) {
      toast.error(t('oldDetails.floorInformation.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deletes an existing floor detail record.
   */
  const handleDelete = async (id: number) => {
    try {
      const result = await DeleteOldFloorDetailsAction(propertyId, id, locale);
      if (result.success) {
        toast.success(t('oldDetails.floorInformation.deleteSuccess'));
      } else {
        toast.error(result.error || t('oldDetails.floorInformation.deleteError'));
      }
    } catch (_error) {
      toast.error(t('oldDetails.floorInformation.unexpectedError'));
    }
  };

  return {
    formData,
    setFormData,
    subUseTypeOptions,
    isSubmitting,
    errors,
    showError: (field: string) => showErrors && !!errors[field],
    handleUseTypeChange,
    handleEdit,
    handleReset,
    handleSave,
    handleDelete
  };
}
