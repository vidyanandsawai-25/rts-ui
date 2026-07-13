import { useState } from "react";
import { toast } from "sonner";
import { createBulkBuildingPropertiesAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { BuildingStructureItem } from "@/types/zone-master/properties/building-structure.types";
import { BulkPropertyItem } from "@/types/zone-master/properties/property-bulk.types";
import { parseBulkPropertyErrors } from "@/lib/utils/bulk-property-errors";

interface UseBuildingGenerationProps {
  buildingData: BuildingStructureItem[];
  propertyNo?: string;
  taxZoneId?: number;
  wardId?: number;
  propertyTypeId?: number;
  categoryId?: number;
  societyDetailId?: number;
  onGenerateSuccess?: () => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function useBuildingGeneration({
  buildingData,
  propertyNo,
  taxZoneId,
  wardId,
  propertyTypeId,
  categoryId,
  societyDetailId,
  onGenerateSuccess,
  t,
}: UseBuildingGenerationProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    // Validate required configuration
    if (!taxZoneId || !wardId || !societyDetailId) {
      toast.error(t("partitionForm.wing.generate.errors.genericError"));
      return;
    }

    // Validate property type and category from selected property
    if (!propertyTypeId) {
      toast.error(t("partitionForm.wing.generate.propertyTypeRequired"));
      return;
    }
    if (!categoryId) {
      toast.error(t("partitionForm.wing.generate.categoryRequired"));
      return;
    }

    // Build payload from building data using selected property's type and category
    const payload: BulkPropertyItem[] = buildingData.map((item) => ({
      taxZoneId,
      wardId,
      propertyNo: propertyNo || "",
      propertyTypeId,
      categoryId,
      partitionNo: item.partitionNo || item.flatNo,
      flatOrShopNo: item.flatNo,
      flatOrShopNoEnglish: null,
      address: null,
      addressEnglish: null,
      location: null,
      locationEnglish: null,
      societyDetailId,
      propertyFloorId: item.propertyFloorId,
      createdBy: 0,
      createdDate: new Date().toISOString(),
    }));

    setGenerating(true);

    try {
      const result = await createBulkBuildingPropertiesAction(payload);

      if (result.data) {
        if (result.data.allSucceeded) {
          toast.success(t("partitionForm.wing.generate.success", { count: result.data.successCount }));
          onGenerateSuccess?.();
        } else {
          const errorMessages = result.data.errors || [];
          const parsedErrors = parseBulkPropertyErrors(errorMessages, t, result.data.failedCount);

          const toastFn = parsedErrors.severity === "warning" ? toast.warning : toast.error;
          toastFn(parsedErrors.title, {
            description: parsedErrors.messages.join("\n"),
            duration: 8000,
          });
        }
      } else {
        const errorMessages = result.error ? [result.error] : [];
        const parsedErrors = parseBulkPropertyErrors(errorMessages, t);

        const toastFn = parsedErrors.severity === "warning" ? toast.warning : toast.error;
        toastFn(parsedErrors.title, {
          description: parsedErrors.messages.join("\n"),
          duration: 8000,
        });
      }
    } catch (_error) {
      toast.error(t("partitionForm.wing.generate.errors.title"), {
        description: t("partitionForm.wing.generate.errors.genericError"),
        duration: 6000,
      });
    } finally {
      setGenerating(false);
    }
  };

  const canGenerate = !!(
    taxZoneId &&
    wardId &&
    societyDetailId &&
    propertyTypeId &&
    categoryId &&
    buildingData.length > 0
  );

  return {
    generating,
    handleGenerate,
    canGenerate,
  };
}
