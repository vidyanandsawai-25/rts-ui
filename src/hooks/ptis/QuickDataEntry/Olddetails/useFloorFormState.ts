import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FloorInformationFormData, OldFloorDetail } from "@/types/property-old-details.types";

/**
 * Hook to manage the state of the Floor Information Form.
 * Handles form data, editing, resetting, and URL sync for type-of-use.
 */
export function useFloorFormState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FloorInformationFormData>({
    id: undefined,
    oldFloorId: "",
    oldSubFloorId: "",
    oldConstructionYear: "",
    oldConstructionTypeId: "",
    oldTypeOfUseId: "",
    oldSubTypeOfUseId: "",
    oldCarpetAreaSqFeet: ""
  });

  /**
   * Handles Type of Use change and updates sub-type options via URL query params.
   */
  const handleUseTypeChange = useCallback((val: string | number, isEditBinding = false) => {
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
      const queryString = urlParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  /**
   * Pre-fills form data for editing an existing record.
   */
  const handleEdit = useCallback((row: OldFloorDetail) => {
    setFormData({
      id: row.id,
      oldFloorId: String(row.oldFloorId),
      oldSubFloorId: row.oldSubFloorId ? String(row.oldSubFloorId) : "",
      oldConstructionYear: row.oldConstructionYear,
      oldConstructionTypeId: String(row.oldConstructionTypeId),
      oldTypeOfUseId: row.oldTypeOfUseId ? String(row.oldTypeOfUseId) : "",
      oldSubTypeOfUseId: row.oldSubTypeOfUseId ? String(row.oldSubTypeOfUseId) : "",
      oldCarpetAreaSqFeet: String(row.oldCarpetAreaSqFeet)
    });

    if (row.oldTypeOfUseId !== undefined && row.oldTypeOfUseId !== null) {
      handleUseTypeChange(row.oldTypeOfUseId, true);
    }

    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handleUseTypeChange]);

  /**
   * Resets the form to initial empty state.
   */
  const handleReset = useCallback(() => {
    setFormData({
      id: undefined,
      oldFloorId: "",
      oldSubFloorId: "",
      oldConstructionYear: "",
      oldConstructionTypeId: "",
      oldTypeOfUseId: "",
      oldSubTypeOfUseId: "",
      oldCarpetAreaSqFeet: ""
    });

    const currentParam = searchParams.get('typeOfUseId');
    if (currentParam) {
      const urlParams = new URLSearchParams(searchParams);
      urlParams.delete('typeOfUseId');
      const queryString = urlParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  return {
    formData,
    setFormData,
    handleUseTypeChange,
    handleEdit,
    handleReset
  };
}
