import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { PartitionFormState, PartitionFormErrors } from "@/types/partition-form.types";
import { ZonePropertyItem } from "@/types/zoneProperty.types";
import { Floor } from "@/types/floor.types";

interface UsePartitionFormValidationProps {
  selectedProperty: ZonePropertyItem | null;
  allProperties: ZonePropertyItem[];
  floors: Floor[];
}

export function usePartitionFormValidation({
  selectedProperty,
  allProperties,
  floors,
}: UsePartitionFormValidationProps) {
  const t = useTranslations("zoneMaster");

  // Calculate max partition number for the selected property
  const calculateMaxPartition = useCallback((): number => {
    if (!selectedProperty) return 0;
    
    // Get all partitions for this property
    const existingPartitions = allProperties.filter(
      (p) => p.propertyNo === selectedProperty.propertyNo && p.partitionNo && p.partitionNo !== "0"
    );

    // Find max numeric partition
    const numericPartitions = existingPartitions
      .map((p) => parseInt(p.partitionNo || "0", 10))
      .filter((n) => !isNaN(n));

    return numericPartitions.length > 0 ? Math.max(...numericPartitions) : 0;
  }, [selectedProperty, allProperties]);

  // Validate form
  const validate = useCallback((data: PartitionFormState): { valid: boolean; errors: PartitionFormErrors } => {
    const newErrors: PartitionFormErrors = {};

    if (!data.mainPropertyId) {
      newErrors.mainPropertyId = t("partitionForm.validation.mainPropertyRequired");
    }

    // Validate based on partition type
    if (data.partitionType === "wing" && data.createNewWing) {
      // Validate wing-specific fields
      if (!data.wingLetter?.trim()) {
        newErrors.wingLetter = t("partitionForm.validation.wingLetterRequired");
      }
      if (!data.fromFloor?.trim()) {
        newErrors.fromFloor = t("partitionForm.validation.fromFloorRequired");
      }
      if (!data.toFloor?.trim()) {
        newErrors.toFloor = t("partitionForm.validation.toFloorRequired");
      }
      if (!data.noOfFlatOnOneFloor?.trim()) {
        newErrors.noOfFlatOnOneFloor = t("partitionForm.validation.noOfFlatOnOneFloorRequired");
      }
      if (!data.flatStart?.trim()) {
        newErrors.flatStart = t("partitionForm.validation.flatStartRequired");
      }
      if (!data.incrementedBy?.trim()) {
        newErrors.incrementedBy = t("partitionForm.validation.incrementedByRequired");
      }
      if (!data.generationType?.trim()) {
        newErrors.generationType = t("partitionForm.validation.generationTypeRequired");
      }
      
      // Check if toFloor is greater than or equal to fromFloor using floor indices
      if (data.fromFloor && data.toFloor && floors.length > 0) {
        const fromFloorIndex = floors.findIndex(f => f.floorCode === data.fromFloor);
        const toFloorIndex = floors.findIndex(f => f.floorCode === data.toFloor);
        
        if (fromFloorIndex !== -1 && toFloorIndex !== -1 && toFloorIndex < fromFloorIndex) {
          newErrors.toFloor = t("partitionForm.validation.toFloorMustBeGreaterOrEqual");
        }
      }
      
      // Validate positive numbers
      const numericFields = [
        { value: data.noOfFlatOnOneFloor, key: 'noOfFlatOnOneFloor' },
        { value: data.flatStart, key: 'flatStart' },
        { value: data.incrementedBy, key: 'incrementedBy' }
      ];
      
      numericFields.forEach(({ value, key }) => {
        if (value && isNaN(parseInt(value, 10))) {
          newErrors[key as keyof PartitionFormErrors] = t("partitionForm.validation.mustBeNumber");
        }
      });
    } else {
      // Validate partition fields for Non-Apartment Categories
      if (!data.fromPartition?.trim()) {
        newErrors.fromPartition = t("partitionForm.validation.fromPartitionRequired");
      }
      if (!data.toPartition?.trim()) {
        newErrors.toPartition = t("partitionForm.validation.toPartitionRequired");
      }

      // Validate numeric values
      const fromPartition = parseInt(data.fromPartition, 10);
      const toPartition = parseInt(data.toPartition, 10);
      
      if (data.fromPartition && isNaN(fromPartition)) {
        newErrors.fromPartition = t("partitionForm.validation.mustBeNumber");
      }
      if (data.toPartition && isNaN(toPartition)) {
        newErrors.toPartition = t("partitionForm.validation.mustBeNumber");
      }
      
      // Validate from <= to
      if (!isNaN(fromPartition) && !isNaN(toPartition) && fromPartition > toPartition) {
        newErrors.toPartition = t("partitionForm.validation.toPartitionMustBeGreaterOrEqual");
      }

      // Check for duplicate partitions in the range
      if (selectedProperty && !isNaN(fromPartition) && !isNaN(toPartition)) {
        const existingPartitions = allProperties.filter(
          (p) => p.propertyNo === selectedProperty.propertyNo && p.partitionNo && p.partitionNo !== "0"
        );
        const existingPartitionNums = existingPartitions.map(p => parseInt(p.partitionNo || "0", 10));
        
        for (let i = fromPartition; i <= toPartition; i++) {
          if (existingPartitionNums.includes(i)) {
            newErrors.fromPartition = t("partitionForm.validation.duplicatePartition", { partition: i });
            break;
          }
        }
      }
    }

    return {
      valid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }, [selectedProperty, allProperties, floors, t]);

  return {
    calculateMaxPartition,
    validate,
  };
}
