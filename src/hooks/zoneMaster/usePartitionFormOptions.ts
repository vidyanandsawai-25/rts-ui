import { useMemo } from "react";
import { ZonePropertyItem } from "@/types/zoneProperty.types";
import { SocietyDetailItem } from "@/types/societyDetails.types";
import { WingItem } from "@/types/wing.types";
import { Floor } from "@/types/floor.types";
import { PartitionFormState } from "@/types/partition-form.types";

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

  // From Floor options (all active floors)
  const fromFloorOptions = useMemo(() => {
    return floors.map((floor) => ({
      value: floor.floorCode,
      label: `${floor.floorCode} - ${floor.description}`,
    }));
  }, [floors]);

  // To Floor options (filtered based on From Floor selection)
  const toFloorOptions = useMemo(() => {
    if (!form.fromFloor || floors.length === 0) {
      return [];
    }

    const fromFloorIndex = floors.findIndex((floor) => floor.floorCode === form.fromFloor);
    
    if (fromFloorIndex === -1) {
      return [];
    }

    return floors
      .slice(fromFloorIndex)
      .map((floor) => ({
        value: floor.floorCode,
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
