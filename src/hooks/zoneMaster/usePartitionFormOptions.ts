import { useMemo } from "react";
import { ZonePropertyItem } from "@/types/zone-master/properties/zoneProperty.types";
import { SocietyDetailItem } from "@/types/zone-master/properties/societyDetails.types";
import { WingItem } from "@/types/zone-master/properties/wing.types";
import { Floor } from "@/types/floor.types";
import { PartitionFormState } from "@/types/zone-master/properties/partition-form.types";

interface UsePartitionFormOptionsProps {
  allProperties: ZonePropertyItem[];
  societyDetails: SocietyDetailItem[];
  wings: WingItem[];
  floors: Floor[];
  form: PartitionFormState;
  categoryMap?: Map<number, string>;
}

export function usePartitionFormOptions({
  allProperties,
  societyDetails,
  wings,
  floors,
  form,
  categoryMap,
}: UsePartitionFormOptionsProps) {
  // Show only properties without partition number
  const propertyOptions = useMemo(() => {
    return allProperties
      .filter((property) => !property.partitionNo || property.partitionNo === "0")
      .map((property) => {
        let categoryName: string | null = null;
        if (property.categoryId && categoryMap) {
          categoryName = categoryMap.get(property.categoryId) || null;
        }
        const label = categoryName
          ? `${property.propertyNo} - ${categoryName}`
          : property.propertyNo;
        return {
          value: String(property.id),
          label,
        };
      });
  }, [allProperties, categoryMap]);

  // Wing options for Select dropdown
  const wingOptions = useMemo(() => {
    const uniqueWings = new Map<number, { wingNo: string; wingName: string }>();
    
    societyDetails.forEach((item) => {
      if (!uniqueWings.has(item.wingId)) {
        const wing = wings.find(w => w.id === item.wingId);
        if (wing) {
          uniqueWings.set(item.wingId, {
            wingNo: wing.wingNo,
            wingName: item.wingName
          });
        }
      }
    });
    
    return Array.from(uniqueWings.values())
      .map((wing) => ({
        value: wing.wingNo,
        label: `${wing.wingNo} - ${wing.wingName}`,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [wings, societyDetails]);

  // Generation Type static options
  const generationTypeOptions = [
    { value: "V", label: "V - Vertical" },
    { value: "H", label: "H - Horizontal" },
    { value: "VC", label: "VC - Vertical Custom" },
    { value: "HC", label: "HC - Horizontal Custom" },
  ];

  // From Floor options (all active floors, sorted by ID)
  const fromFloorOptions = useMemo(() => {
    // Sort floors by ID to ensure proper ordering
    const sortedFloors = [...floors].sort((a, b) => a.id - b.id);
    
    return sortedFloors.map((floor) => ({
      value: String(floor.id),
      label: `${floor.floorCode} - ${floor.description}`,
    }));
  }, [floors]);

  // To Floor options (filtered based on From Floor selection, sorted by ID)
  const toFloorOptions = useMemo(() => {
    if (!form.fromFloor || floors.length === 0) {
      return [];
    }

    // Parse the selected floor ID
    const selectedFromFloorId = parseInt(form.fromFloor, 10);
    if (isNaN(selectedFromFloorId)) {
      return [];
    }

    // Sort floors by ID
    const sortedFloors = [...floors].sort((a, b) => a.id - b.id);
    
    // Filter floors: only show floors with ID >= selected fromFloor ID
    return sortedFloors
      .filter((floor) => floor.id >= selectedFromFloorId)
      .map((floor) => ({
        value: String(floor.id),
        label: `${floor.floorCode} - ${floor.description}`,
      }));
  }, [floors, form.fromFloor]);

  return {
    propertyOptions,
    wingOptions,
    generationTypeOptions,
    fromFloorOptions,
    toFloorOptions,
  };
}
