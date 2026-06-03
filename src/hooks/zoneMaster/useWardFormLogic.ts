import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getWardByIdAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { WardItem } from "@/types/wardMaster.types";
import { WardFormState, WardFormErrors } from "@/components/modules/property-tax/zone-master/wards/WardFormFields";
import { ZONE_WARD_NO_MAX_LENGTH, ZONE_WARD_NAME_MAX_LENGTH } from "@/components/modules/property-tax/zone-master/constants";
import { handleWardUpdate } from "@/components/modules/property-tax/zone-master/wards/wardHandlers";
import { POSITIVE_INTEGER_REGEX } from "@/lib/utils/validation-rules";

interface UseWardFormLogicProps {
  open: boolean;
  wardId: string;
  wards: WardItem[];
  initialData?: WardItem | null;
  onClose: () => void;
  onSuccess?: () => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function useWardFormLogic({
  open,
  wardId,
  wards,
  initialData,
  onClose,
  onSuccess,
  t,
}: UseWardFormLogicProps) {
  const [form, setForm] = useState<WardFormState>({
    wardNo: "",
    description: "",
    sequenceNo: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<WardFormErrors>({});
  const [originalData, setOriginalData] = useState<Partial<WardItem> | null>(null);
  const prevWardIdRef = useRef<string | null>(null);

  // Use SSR data if available, otherwise fetch from API
  useEffect(() => {
    if (!open || !wardId) {
      // Reset ward ID reference when dialog closes
      if (!open) {
        prevWardIdRef.current = null;
      }
      return;
    }

    // Skip if we've already loaded this ward
    if (prevWardIdRef.current === wardId) return;

    // Mark as loaded before making any state changes
    prevWardIdRef.current = wardId;

    // If SSR data is available and matches the wardId, use it directly
    if (initialData && String(initialData.id) === String(wardId)) {
      // Use a single batch update
      Promise.resolve().then(() => {
        setOriginalData(initialData);
        setForm({
          wardNo: initialData.wardNo,
          description: initialData.description || "",
          sequenceNo: initialData.sequenceNo?.toString() || "",
          isActive: initialData.isActive ?? true,
        });
      });
      return;
    }

    // Fallback: check if ward exists in wards array
    const wardFromList = wards.find(w => String(w.id) === String(wardId));
    if (wardFromList) {
      Promise.resolve().then(() => {
        setOriginalData(wardFromList);
        setForm({
          wardNo: wardFromList.wardNo,
          description: wardFromList.description || "",
          sequenceNo: wardFromList.sequenceNo?.toString() || "",
          isActive: wardFromList.isActive ?? true,
        });
      });
      return;
    }

    // Last resort: fetch from API (should rarely happen with proper SSR)
    const fetchWard = async () => {
      setFetching(true);
      try {
        const res = await getWardByIdAction(wardId);
        if (res.success && res.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = res.data as any;
          const ward: WardItem | null =
            (raw && (raw.wardNo || raw.WardNo || raw.id))
              ? {
                  id: raw.id ?? raw.Id ?? 0,
                  wardNo: raw.wardNo,
                  zoneId: raw.zoneId ?? 0,
                  description: raw.description ?? null,
                  sequenceNo: raw.sequenceNo ?? null,
                  isActive: typeof raw.isActive === "boolean" ? raw.isActive : true,
                  createdDate: raw.createdDate ?? "",
                  updatedDate: raw.updatedDate ?? null,
                }
              : (raw?.data ?? null);

          if (ward) {
            setOriginalData(ward);
            setForm({
              wardNo: ward.wardNo,
              description: ward.description || "",
              sequenceNo: ward.sequenceNo?.toString() || "",
              isActive: ward.isActive ?? true,
            });
          } else {
            toast.info(t("wardForm.loadError"));
            onClose();
          }
        } else {
          toast.info(res.error || t("wardForm.loadError"));
          onClose();
        }
      } catch (error) {
        toast.info(error instanceof Error ? error.message : t("wardForm.loadError"));
        onClose();
      } finally {
        setFetching(false);
      }
    };

    fetchWard();
  }, [open, wardId, initialData, wards, onClose, t]);

  const validate = (data: WardFormState) => {
    const newErrors: WardFormErrors = {};
    if (!data.wardNo?.trim()) newErrors.wardNo = t("validation.wardNoRequired");
    else if (data.wardNo.length > ZONE_WARD_NO_MAX_LENGTH) newErrors.wardNo = t("validation.wardNoMaxLength", { count: ZONE_WARD_NO_MAX_LENGTH });
    if (!data.description?.trim()) newErrors.description = t("validation.wardNameRequired");
    else if (data.description.length > ZONE_WARD_NAME_MAX_LENGTH) newErrors.description = t("validation.wardNameMaxLength", { count: ZONE_WARD_NAME_MAX_LENGTH });
    
    if (!data.sequenceNo) {
      newErrors.sequenceNo = t("validation.sequenceNoRequired");
    } else if (!POSITIVE_INTEGER_REGEX.test(data.sequenceNo.toString())) {
      newErrors.sequenceNo = t("validation.sequenceNoNumber");
    } else {
      const seqNum = parseInt(data.sequenceNo, 10);
      if (seqNum < 1 || seqNum > 999) {
        newErrors.sequenceNo = t("validation.sequenceNoRange");
      }
    }
    return newErrors;
  };

  const checkDuplicateWard = (wardNo: string, sequenceNo: string): boolean => {
    const currentWardId = originalData?.id;
    const wardNoValue = wardNo.trim().toUpperCase();
    const seqValue = sequenceNo ? parseInt(sequenceNo, 10) : null;

    const duplicateByNo = wards.find((ward) => {
      return ward.id !== currentWardId && ward.wardNo?.trim().toUpperCase() === wardNoValue;
    });

    if (duplicateByNo) {
      toast.error(
        t("messages.duplicateWardNo", { wardNo: duplicateByNo.wardNo })
      );
      return true;
    }

    if (seqValue !== null) {
      const duplicateBySeq = wards.find((ward) => {
        return ward.id !== currentWardId && ward.sequenceNo === seqValue;
      });

      if (duplicateBySeq) {
        toast.error(
          t("messages.duplicateSequenceNo", { seqNo: seqValue, wardNo: duplicateBySeq.wardNo })
        );
        return true;
      }
    }

    return false;
  };

  const handleSave = async (refreshRouter: () => void) => {
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const isDuplicate = checkDuplicateWard(form.wardNo, form.sequenceNo);
    if (isDuplicate) return;

    setLoading(true);
    const result = await handleWardUpdate({
      wardId: Number(wardId),
      wardData: {
        ...originalData,
        ...form,
        sequenceNo: Number(form.sequenceNo)
      },
      t: (key: string, values?: Record<string, unknown>) => t(key, values)
    });

    if (result.success) {
      onClose();
      refreshRouter();
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return {
    form,
    setForm,
    loading,
    fetching,
    errors,
    setErrors,
    handleSave,
  };
}
