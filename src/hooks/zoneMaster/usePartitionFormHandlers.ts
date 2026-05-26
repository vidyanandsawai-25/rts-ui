import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PartitionFormState, PartitionFormErrors } from "@/types/zone-master/properties/partition-form.types";
import { Floor } from "@/types/floor.types";

interface UsePartitionFormHandlersProps {
  form: PartitionFormState;
  setForm: React.Dispatch<React.SetStateAction<PartitionFormState>>;
  errors: PartitionFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>;
  floors: Floor[];
}

export function usePartitionFormHandlers({
  form,
  setForm,
  errors,
  setErrors,
  floors,
}: UsePartitionFormHandlersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle property selection - SSR approach: Update URL parameter
  const handlePropertySelect = useCallback((_e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    const propertyId = value ? parseInt(value, 10) : null;
    
    // Update URL with propertyId parameter for SSR
    const params = new URLSearchParams(searchParams.toString());
    if (propertyId) {
      params.set("partitionPropertyId", String(propertyId));
    } else {
      params.delete("partitionPropertyId");
    }
    router.push(`${pathname}?${params.toString()}`);
    
    // Also update local form state for immediate UI feedback
    setForm({ ...form, mainPropertyId: propertyId });
    setErrors({ ...errors, mainPropertyId: undefined });
  }, [form, errors, router, pathname, searchParams, setForm, setErrors]);

  // Handle From Floor selection
  const handleFromFloorChange = useCallback((_e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setForm((prev) => {
      const newForm = { ...prev, fromFloor: value };
      
      // If To Floor is now invalid (less than new From Floor), reset it
      if (prev.toFloor) {
        const fromFloorIndex = floors.findIndex((floor) => floor.floorCode === value);
        const toFloorIndex = floors.findIndex((floor) => floor.floorCode === prev.toFloor);
        
        if (fromFloorIndex !== -1 && toFloorIndex !== -1 && toFloorIndex < fromFloorIndex) {
          newForm.toFloor = "";
        }
      }
      
      return newForm;
    });
    setErrors({ ...errors, fromFloor: undefined, toFloor: undefined });
  }, [floors, errors, setForm, setErrors]);

  // Handle To Floor selection
  const handleToFloorChange = useCallback((_e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setForm({ ...form, toFloor: value });
    setErrors({ ...errors, toFloor: undefined });
  }, [form, errors, setForm, setErrors]);

  return {
    handlePropertySelect,
    handleFromFloorChange,
    handleToFloorChange,
  };
}
