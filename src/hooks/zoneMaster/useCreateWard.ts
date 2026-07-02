import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { WardItem } from "@/types/wardMaster.types";
import { ZoneItem } from "@/types/zoneMaster.types";
import { createWardAction, createWardRangeAction } from "@/app/[locale]/property-tax/zone-master/actions";
import { ZONE_WARD_NO_MAX_LENGTH, ZONE_WARD_NAME_MAX_LENGTH } from "@/components/modules/property-tax/zone-master/constants";
import { isAllZeros, POSITIVE_INTEGER_REGEX } from "@/lib/utils/validation-rules";

const BULK_PREFIX_MAX_LENGTH = 10;
const BULK_RANGE_MAX_LENGTH = 10;

const INITIAL = {
  wardNo: "",
  description: "",
  sequenceNo: "",
  isActive: true,
};

interface BulkFormErrors {
  prefix?: string;
  rangeFrom?: string;
  rangeTo?: string;
}

interface UseCreateWardProps {
  currentZone?: ZoneItem | null;
  existingWards?: WardItem[];
  onClose: () => void;
  onSuccess?: (newWardNo: string) => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export function useCreateWard({
  currentZone,
  existingWards = [],
  onClose,
  onSuccess,
  t,
}: UseCreateWardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const bulkMode = searchParams.get("createWardMode") === "bulk";

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof INITIAL, string>>>({});
  const [bulkErrors, setBulkErrors] = useState<BulkFormErrors>({});
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [bulkPrefix, setBulkPrefix] = useState("");

  const handleBulkToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("createWardMode", "bulk");
    } else {
      params.delete("createWardMode");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const validate = (data: typeof INITIAL) => {
    const newErrors: Partial<Record<keyof typeof INITIAL, string>> = {};
    if (!data.wardNo?.trim()) newErrors.wardNo = t("validation.wardNoRequired");
    else if (data.wardNo.length > ZONE_WARD_NO_MAX_LENGTH) newErrors.wardNo = t("validation.wardNoMaxLength", { count: ZONE_WARD_NO_MAX_LENGTH });
    else if (isAllZeros(data.wardNo)) newErrors.wardNo = t("validation.wardNoAllZeros");
    if (!data.description?.trim()) newErrors.description = t("validation.wardNameRequired");
    else if (data.description.length > ZONE_WARD_NAME_MAX_LENGTH) newErrors.description = t("validation.wardNameMaxLength", { count: ZONE_WARD_NAME_MAX_LENGTH });
    else if (isAllZeros(data.description)) newErrors.description = t("validation.wardNameAllZeros");
    
    if (data.sequenceNo) {
      if (!POSITIVE_INTEGER_REGEX.test(data.sequenceNo)) {
        newErrors.sequenceNo = t("validation.sequenceNoNumber");
      } else {
        const seqNum = parseInt(data.sequenceNo, 10);
        if (seqNum < 1 || seqNum > 999) {
          newErrors.sequenceNo = t("validation.sequenceNoRange");
        }
      }
    }
    
    return newErrors;
  };

  const validateBulk = (prefix: string, rangeFrom: string, rangeTo: string) => {
    const newErrors: BulkFormErrors = {};
    
    if (!prefix?.trim()) {
      newErrors.prefix = t("wardBulk.errorPrefixRequired");
    } else if (prefix.length > BULK_PREFIX_MAX_LENGTH) {
      newErrors.prefix = t("wardBulk.errorPrefixMaxLength", { count: BULK_PREFIX_MAX_LENGTH });
    }
    
    if (!rangeFrom?.trim()) {
      newErrors.rangeFrom = t("wardBulk.errorRangeFromRequired");
    } else if (rangeFrom.length > BULK_RANGE_MAX_LENGTH) {
      newErrors.rangeFrom = t("wardBulk.errorRangeFromMaxLength", { count: BULK_RANGE_MAX_LENGTH });
    }
    
    if (!rangeTo?.trim()) {
      newErrors.rangeTo = t("wardBulk.errorRangeToRequired");
    } else if (rangeTo.length > BULK_RANGE_MAX_LENGTH) {
      newErrors.rangeTo = t("wardBulk.errorRangeToMaxLength", { count: BULK_RANGE_MAX_LENGTH });
    }
    
    if (rangeFrom?.trim() && rangeTo?.trim() && !newErrors.rangeFrom && !newErrors.rangeTo) {
      const fromNum = parseInt(rangeFrom, 10);
      const toNum = parseInt(rangeTo, 10);
      if (!isNaN(fromNum) && !isNaN(toNum) && fromNum > toNum) {
        newErrors.rangeTo = t("wardBulk.errorOrder");
      }
    }
    
    return newErrors;
  };

  const checkBulkDuplicates = (prefix: string, from: string, to: string): string | null => {
    const fromNum = parseInt(from, 10);
    const toNum = parseInt(to, 10);
    
    if (isNaN(fromNum) || isNaN(toNum)) return null;
    
    const existingWardNos = new Set(
      existingWards.map((w) => w.wardNo?.trim().toUpperCase())
    );
    
    for (let i = fromNum; i <= toNum; i++) {
      const generatedWardNo = `${prefix}${i}`.toUpperCase();
      if (existingWardNos.has(generatedWardNo)) {
        return generatedWardNo;
      }
    }
    
    return null;
  };

  const checkDuplicateWard = (wardNo: string) => {
    const wardNoValue = wardNo.trim().toUpperCase();

    const duplicate = existingWards.find((ward) => {
      return ward.wardNo?.trim().toUpperCase() === wardNoValue;
    });

    if (duplicate) {
      toast.error(
        t("createWardMessages.duplicateWard", { wardNo: duplicate.wardNo })
      );
      return true;
    }

    return false;
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    setBulkErrors({});
    setBulkFrom("");
    setBulkTo("");
    setBulkPrefix("");
    onClose();
  };

  const handleSave = async () => {
    if (!currentZone || !currentZone.id) {
      toast.warning(t("createWardMessages.selectZoneBeforeCreate"));
      return;
    }

    if (bulkMode) {
      const prefix = bulkPrefix.trim();
      const from = bulkFrom.trim();
      const to = bulkTo.trim();

      const bulkValidationErrors = validateBulk(prefix, from, to);
      if (Object.keys(bulkValidationErrors).length > 0) {
        setBulkErrors(bulkValidationErrors);
        return;
      }

      const duplicateWardNo = checkBulkDuplicates(prefix, from, to);
      if (duplicateWardNo) {
        toast.error(t("createWardMessages.duplicateWard", { wardNo: duplicateWardNo }));
        return;
      }

      setBulkErrors({});
      setLoading(true);

      try {
        const result = await createWardRangeAction(
          from,
          to,
          prefix,
          currentZone.id,
          form.isActive
        );

        if (!result.success) {
          const errorMsg = result.error || t("createWardMessages.bulkCreateError");
          const wardNoMatch = errorMsg.match(/([A-Z0-9]+)\s+(already|exist|duplicate)/i);
          if (wardNoMatch && wardNoMatch[1]) {
            toast.error(t("createWardMessages.duplicateWard", { wardNo: wardNoMatch[1] }));
          } else {
            toast.error(errorMsg);
          }
        } else {
          toast.success(
            t("createWardMessages.bulkCreateSuccess", {
              count: result.count || 0,
              from: prefix + from,
              to: prefix + to,
            })
          );
          handleClose();
          if (onSuccess) {
            onSuccess(prefix + to);
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("createWardMessages.unexpectedError"));
      } finally {
        setLoading(false);
      }
      return;
    }

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (checkDuplicateWard(form.wardNo)) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await createWardAction({
        wardNo: form.wardNo,
        description: form.description,
        sequenceNo: form.sequenceNo ? Number(form.sequenceNo) : undefined,
        isActive: form.isActive,
        zoneId: currentZone.id,
      });

      if (result.success) {
        toast.success(t("createWardMessages.singleCreateSuccess", { name: form.wardNo }));
        handleClose();
        if (onSuccess) onSuccess(form.wardNo);
      } else {
        const errorMsg = result.error || "";
        if (errorMsg.includes("already exists") || errorMsg.includes("duplicate")) {
          setErrors({ wardNo: t("messages.duplicateWardNo", { wardNo: form.wardNo }) });
        } else {
          toast.error(errorMsg || t("createWardMessages.createError"));
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("createWardMessages.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkMode,
    form,
    setForm,
    loading,
    errors,
    bulkErrors,
    bulkFrom,
    setBulkFrom,
    bulkTo,
    setBulkTo,
    bulkPrefix,
    setBulkPrefix,
    handleBulkToggle,
    handleClose,
    handleSave,
    setBulkErrors,
  };
}
