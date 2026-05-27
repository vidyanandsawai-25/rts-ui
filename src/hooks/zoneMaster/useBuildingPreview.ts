import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PartitionFormState } from "@/types/zone-master/properties/partition-form.types";
import { WardItem } from "@/types/wardMaster.types";
import { ZonePropertyItem } from "@/types/zone-master/properties/zoneProperty.types";
import { WingItem } from "@/types/zone-master/properties/wing.types";
import { Floor } from "@/types/floor.types";
import { BuildingStructureItem } from "@/types/zone-master/properties/building-structure.types";
import { generateBuildingStructureAction } from "@/app/[locale]/property-tax/zone-master/actions";

interface UseBuildingPreviewProps {
  form: PartitionFormState;
  selectedWard: WardItem | null;
  selectedProperty: ZonePropertyItem | null;
  wings: WingItem[];
  floors: Floor[];
  setLoadingPreview: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewData: React.Dispatch<React.SetStateAction<BuildingStructureItem[]>>;
}

export function useBuildingPreview({
  form,
  selectedWard,
  selectedProperty,
  wings,
  floors,
  setLoadingPreview,
  setShowPreview,
  setPreviewData,
}: UseBuildingPreviewProps) {
  const t = useTranslations("zoneMaster");

  const handlePreviewBuilding = useCallback(async () => {
    const missingFields: string[] = [];
    
    if (!selectedWard?.id) missingFields.push("Ward");
    if (!selectedProperty?.propertyNo) missingFields.push("Property");
    if (!form.wingLetter?.trim()) missingFields.push("Wing Letter");
    if (!form.fromFloor?.trim()) missingFields.push("From Floor");
    if (!form.toFloor?.trim()) missingFields.push("To Floor");
    if (!form.noOfFlatOnOneFloor?.trim()) missingFields.push("No. of Flats on One Floor");
    if (!form.flatStart?.trim()) missingFields.push("Flat Start");
    if (!form.incrementedBy?.trim()) missingFields.push("Incremented By");
    if (!form.generationType?.trim()) missingFields.push("Generation Type");

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Convert floor IDs to floor data
    const fromFloorId = parseInt(form.fromFloor, 10);
    const toFloorId = parseInt(form.toFloor, 10);
    
    if (isNaN(fromFloorId) || isNaN(toFloorId)) {
      toast.error("Invalid floor selection");
      setLoadingPreview(false);
      return;
    }
    
    const fromFloorData = floors.find(f => f.id === fromFloorId);
    const toFloorData = floors.find(f => f.id === toFloorId);

    if (!fromFloorData) {
      toast.error("Invalid From Floor selection. Please select a valid floor.");
      return;
    }
    if (!toFloorData) {
      toast.error("Invalid To Floor selection. Please select a valid floor.");
      return;
    }
    
    const fromFloorIndex = floors.findIndex(f => f.id === fromFloorId);
    const toFloorIndex = floors.findIndex(f => f.id === toFloorId);
    
    if (toFloorIndex < fromFloorIndex) {
      toast.error("To Floor must be greater than or equal to From Floor");
      return;
    }

    const noOfFlatOnOneFloor = parseInt(form.noOfFlatOnOneFloor, 10);
    const flatStart = parseInt(form.flatStart, 10);
    const incrementedBy = parseInt(form.incrementedBy, 10);

    if (isNaN(noOfFlatOnOneFloor) || noOfFlatOnOneFloor <= 0) {
      toast.error("No. of Flats on One Floor must be a valid positive number");
      return;
    }
    if (isNaN(flatStart) || flatStart < 0) {
      toast.error("Flat Start must be a valid non-negative number");
      return;
    }
    if (isNaN(incrementedBy) || incrementedBy <= 0) {
      toast.error("Incremented By must be a valid positive number");
      return;
    }

    const selectedWing = wings.find(w => w.wingNo === form.wingLetter);
    if (!selectedWing) {
      toast.error("Invalid wing selection. Please select a valid wing.");
      return;
    }

    setLoadingPreview(true);
    setShowPreview(true);

    try {
      const payload = {
        wardId: selectedWard!.id,
        propertyNo: selectedProperty!.propertyNo,
        wingId: selectedWing.id,
        fromFloor: fromFloorData.floorCode,
        toFloor: toFloorData.floorCode,
        noOfFlatOnOneFloor,
        flatStart,
        incrementedBy,
        prifix: form.prefix?.trim() || undefined,
        generationType: form.generationType.trim(),
      };

      const result = await generateBuildingStructureAction(payload);
      
      
      if (result.success && result.data) {
        setPreviewData(result.data);
        toast.success(t("partitionForm.preview.success"));
      } else {
        toast.error(result.error || t("partitionForm.preview.error"));
        setPreviewData([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate preview";
      toast.error(errorMessage);
      setPreviewData([]);
    } finally {
      setLoadingPreview(false);
    }
  }, [form, selectedWard, selectedProperty, wings, floors, setLoadingPreview, setShowPreview, setPreviewData, t]);

  return {
    handlePreviewBuilding,
  };
}
