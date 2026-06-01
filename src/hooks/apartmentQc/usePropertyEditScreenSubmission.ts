import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import {
  updateBasicDetailsAction,
  updateFloorQCDetailsBulkAction,
  BasicDetailsUpdatePayload,
  FloorQCBulkUpdateItem,
} from "@/app/[locale]/property-tax/ptis/appartmentQC/action";
import type { ApartmentQCDetail } from "@/types/apartmentQC.types";
import { DrawerFormData, DrawerFloorDataRow, DrawerDropdownOption } from "./propertyEditScreenDrawer.types";

/**
 * Safely parse a string to integer, returning undefined if not a valid number
 */
function safeParseInt(value: string): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

interface UsePropertyEditScreenSubmissionArgs {
  propertyData?: ApartmentQCDetail | null;
  formData: DrawerFormData;
  floorData: DrawerFloorDataRow[];
  floorOptions: DrawerDropdownOption[];
  conTypeOptions: DrawerDropdownOption[];
  useTypeOptions: DrawerDropdownOption[];
  subTypeOptions: { value: string; label: string; typeOfUseId?: string }[];
  validateForm: () => boolean;
  validateFloorYears: () => string[];
  setIsSavingFloorQC: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook for handling form submission (basic details + floor QC)
 */
export function usePropertyEditScreenSubmission({
  propertyData,
  formData,
  floorData,
  floorOptions,
  conTypeOptions,
  useTypeOptions,
  subTypeOptions,
  validateForm,
  validateFloorYears,
  setIsSavingFloorQC,
}: UsePropertyEditScreenSubmissionArgs) {
  const [, startTransition] = useTransition();

  const handleSave = useCallback(async () => {
    if (!propertyData?.id) {
      toast.error("Property ID is missing");
      return;
    }

    // Validate basic details form
    if (!validateForm()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    // Validate floor QC years
    const yearErrors = validateFloorYears();
    if (yearErrors.length > 0) {
      toast.error(`Floor QC validation errors: ${yearErrors[0]}`);
      return;
    }

    startTransition(async () => {
      let basicDetailsSuccess = false;
      let floorQCSuccess = false;

      // 1. Save Basic Details
      const basicPayload: BasicDetailsUpdatePayload = {
        ownerName: formData.ownerName || undefined,
        occupierName: formData.occupierName || undefined,
        renterName: formData.renterName || undefined,
        propertyType: formData.propertyTypeId ? parseInt(formData.propertyTypeId, 10) : undefined,
        bhk: formData.bhk || undefined,
        mobileNo: formData.mobileNo || undefined,
        emailId: formData.emailId || undefined,
        wing: formData.wingName || undefined,
        flatOrShopNo: formData.flatOrShopNo || undefined,
        flatOrShopName: formData.flatOrShopName || undefined,
        oldPropertyNo: formData.oldPropertyNo || undefined,
        updatedBy: 1, // TODO: Replace with actual user ID from auth context
      };

      const basicResult = await updateBasicDetailsAction(propertyData.id, basicPayload);

      if (basicResult.success) {
        basicDetailsSuccess = true;
      } else {
        toast.error(basicResult.error || "Failed to update basic details");
      }

      // 2. Save Floor QC Data (if there are rows with pdnId)
      const rowsToUpdate = floorData.filter((row) => row.pdnId);

      if (rowsToUpdate.length > 0) {
        setIsSavingFloorQC(true);

        try {
          const floorQCItems: FloorQCBulkUpdateItem[] = rowsToUpdate.map((row) => {
            // Find dropdown options by matching label (name) or value (ID)
            const floorOption = floorOptions.find(
              (opt) => opt.label === row.floorId || opt.value === row.floorId
            );
            const conTypeOption = conTypeOptions.find(
              (opt) => opt.label === row.constructionTypeId || opt.value === row.constructionTypeId
            );
            const useTypeOption = useTypeOptions.find(
              (opt) => opt.label === row.typeOfUseId || opt.value === row.typeOfUseId
            );
            const subTypeOption = subTypeOptions.find(
              (opt) => opt.label === row.subTypeOfUseId || opt.value === row.subTypeOfUseId
            );

            // Safely parse IDs - only include if valid numeric IDs
            const floorId = floorOption ? safeParseInt(floorOption.value) : undefined;
            const constructionTypeId = conTypeOption ? safeParseInt(conTypeOption.value) : undefined;
            const typeOfUseId = useTypeOption ? safeParseInt(useTypeOption.value) : undefined;
            const subTypeOfUseId = subTypeOption ? safeParseInt(subTypeOption.value) : undefined;

            return {
              detailId: row.pdnId!,
              floorId,
              constructionTypeId,
              typeOfUseId,
              subTypeOfUseId,
              constructionYear: row.conYear || undefined,
              assessmentYear: row.asstYear || undefined,
              updatedBy: 1,
            };
          });

          const floorQCResult = await updateFloorQCDetailsBulkAction(propertyData.id, floorQCItems);

          if (floorQCResult.success) {
            floorQCSuccess = true;
          } else {
            toast.error(floorQCResult.error || "Failed to update floor QC details");
          }
        } catch (error) {
          console.error("[Floor QC] Failed to save rows:", error);
          toast.error("Failed to save floor QC details");
        } finally {
          setIsSavingFloorQC(false);
        }
      } else {
        floorQCSuccess = true;
      }

      // Show success message
      if (basicDetailsSuccess && floorQCSuccess) {
        toast.success("All changes saved successfully");
      } else if (basicDetailsSuccess) {
        toast.success("Basic details updated successfully");
      }
    });
  }, [
    propertyData,
    formData,
    floorData,
    floorOptions,
    conTypeOptions,
    useTypeOptions,
    subTypeOptions,
    validateForm,
    validateFloorYears,
    setIsSavingFloorQC,
  ]);

  return { handleSave };
}
