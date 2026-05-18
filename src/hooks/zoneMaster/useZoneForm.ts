import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getZoneByIdAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { ZoneItem } from "@/types/zoneMaster.types";
import { ZoneFormState, ZoneFormErrors } from "@/components/modules/property-tax/zone-master/zones/ZoneFormFields";
import { ZONE_WARD_NO_MAX_LENGTH, ZONE_WARD_NAME_MAX_LENGTH } from "@/components/modules/property-tax/zone-master/constants";
import { isAllZeros } from "@/lib/utils/validation-rules";

const INITIAL: ZoneFormState = {
  zoneNo: "",
  descriptionEnglish: "",
  description: "",
  isActive: true,
};

interface UseZoneFormProps {
  mode: "add" | "edit";
  open: boolean;
  zoneId?: string;
  initialData?: ZoneItem | null;
  zones?: ZoneItem[];
  existingZones: ZoneItem[];
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function useZoneForm({
  mode,
  open,
  zoneId,
  initialData,
  zones,
  existingZones,
  t,
}: UseZoneFormProps) {
  // Initialize form state
  const getInitialFormState = (): ZoneFormState => {
    if (mode === "edit" && initialData && zoneId && String(initialData.id) === String(zoneId)) {
      return {
        zoneNo: initialData.zoneNo,
        descriptionEnglish: "",
        description: initialData.description || "",
        isActive: initialData.isActive,
      };
    }
    return INITIAL;
  };

  const [form, setForm] = useState<ZoneFormState>(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<ZoneFormErrors>({});

  // Track if we've already fetched to prevent duplicate calls
  const hasFetchedRef = useRef(false);

  // Fetch zone details for edit mode - ONLY if SSR data not available
  useEffect(() => {
    if (mode !== "edit" || !open) return;
    
    // Skip fetch if we already have valid SSR data (compare by zoneId)
    if (initialData && zoneId && String(initialData.id) === String(zoneId)) {
      // SSR data is available and matches - no client fetch needed
      return;
    }
    
    // Skip if already fetched
    if (hasFetchedRef.current) {
      return;
    }
    
    const fetchZoneDetails = async () => {
      if (!zoneId) return;

      hasFetchedRef.current = true;
      setFetching(true);
      try {
        const res = await getZoneByIdAction(zoneId);

        if (res.success && res.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawData = res.data as any;
          const zone = rawData.zoneNo ? rawData : rawData.data;

          if (zone) {
            setForm({
              zoneNo: zone.zoneNo,
              descriptionEnglish: zone.descriptionEnglish || "",
              description: zone.description || "",
              isActive: zone.isActive,
            });
          } else {
            toast.error(t("messages.loadError"));
          }
        } else {
          // Fallback to zones prop if fetch fails
          const zone = zones?.find((z) => String(z.id) === String(zoneId));
          if (zone) {
            setForm({
              zoneNo: zone.zoneNo,
              descriptionEnglish: "",
              description: zone.description || "",
              isActive: zone.isActive,
            });
          } else {
            toast.error(res.error || t("messages.loadError"));
          }
        }
      } catch (error) {
        // TODO: Integrate with error monitoring service (e.g., Sentry) before production
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[useZoneForm] Failed to fetch zone details:", { zoneId, error: errorMessage });
        toast.error(t("messages.loadError"));
      } finally {
        setFetching(false);
      }
    };

    fetchZoneDetails();
  }, [mode, open, initialData, zoneId, zones, t]);
  
  // Reset the fetch ref when drawer closes
  useEffect(() => {
    if (!open) {
      hasFetchedRef.current = false;
    }
  }, [open]);

  // Validation logic
  const validate = (data: ZoneFormState) => {
    const newErrors: ZoneFormErrors = {};
    if (!data.zoneNo?.trim()) newErrors.zoneNo = t("validation.zoneNoRequired");
    else if (isAllZeros(data.zoneNo)) newErrors.zoneNo = t("validation.zoneNoAllZeros");
    else if (data.zoneNo.length > ZONE_WARD_NO_MAX_LENGTH) newErrors.zoneNo = t("validation.zoneNoMaxLength", { count: ZONE_WARD_NO_MAX_LENGTH });
    if (!data.description?.trim()) newErrors.description = t("validation.nameRegRequired");
    else if (isAllZeros(data.description)) newErrors.description = t("validation.zoneNameAllZeros");
    else if (data.description.length > ZONE_WARD_NAME_MAX_LENGTH) newErrors.description = t("validation.zoneNameMaxLength", { count: ZONE_WARD_NAME_MAX_LENGTH });
    return newErrors;
  };

  const checkDuplicateZone = (zoneNo: string, zoneName: string, currentZoneId?: number) => {
    const zoneNoValue = zoneNo.trim().toUpperCase();
    const nameValue = zoneName.trim().toLowerCase();

    // Check duplicate zone number (excluding current record in edit mode)
    const duplicateByNo = existingZones.find((zone) => {
      if (mode === "edit" && currentZoneId !== undefined && zone.id === currentZoneId) return false;
      return zone.zoneNo?.trim().toUpperCase() === zoneNoValue;
    });

    if (duplicateByNo) {
      toast.error(
        t("messages.duplicateZone", { name: duplicateByNo.description || duplicateByNo.zoneNo })
      );
      return true;
    }

    // Check duplicate zone name (excluding current record in edit mode)
    const duplicateByName = existingZones.find((zone) => {
      if (mode === "edit" && currentZoneId !== undefined && zone.id === currentZoneId) return false;
      return zone.description?.trim().toLowerCase() === nameValue;
    });

    if (duplicateByName) {
      toast.error(
        t("messages.duplicateZoneName", { name: duplicateByName.description || duplicateByName.zoneNo })
      );
      return true;
    }

    return false;
  };

  const resetForm = () => {
    setForm(INITIAL);
    setErrors({});
  };

  const handleBlur = (fieldName: keyof ZoneFormState) => {
    const fieldErrors = validate(form);
    setErrors((prev) => {
      const newErrors = { ...prev };
      const fieldErrorKey = fieldName as keyof ZoneFormErrors;
      
      // Update or clear the specific field error
      if (fieldErrors[fieldErrorKey]) {
        newErrors[fieldErrorKey] = fieldErrors[fieldErrorKey];
      } else {
        delete newErrors[fieldErrorKey];
      }
      
      return newErrors;
    });
  };

  return {
    form,
    setForm,
    loading,
    setLoading,
    fetching,
    errors,
    setErrors,
    validate,
    checkDuplicateZone,
    resetForm,
    handleBlur,
    INITIAL,
  };
}
