"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Map } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { WardFormFields, WardFormState, WardFormErrors } from "./WardFormFields";
import { CancelButton, SaveButton, ToggleSwitch, Input, ValidationMessage } from "@/components/common";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ZoneItem } from "@/types/zoneMaster.types";
import { WardItem } from "@/types/wardMaster.types";
import { ZONE_WARD_NO_MAX_LENGTH, ZONE_WARD_NAME_MAX_LENGTH } from "../constants";
import { handleWardCreate, handleWardBulkCreate } from "./wardHandlers";
import { isAllZeros } from "@/lib/utils/validation-rules";

// Max length for bulk fields
const BULK_PREFIX_MAX_LENGTH = 10;
const BULK_RANGE_MAX_LENGTH = 10;

const INITIAL: WardFormState = {
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

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newWardNo: string) => void;
  currentZone?: ZoneItem | null;
  existingWards?: WardItem[];
}

export default function CreateNewWard({ open, onClose, onSuccess, currentZone, existingWards = [] }: Props) {
  const t = useTranslations("zoneMaster");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize bulk mode from URL
  const bulkMode = searchParams.get("createWardMode") === "bulk";

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<WardFormErrors>({});
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

  // Validate single ward form
  const validate = (data: WardFormState) => {
    const newErrors: WardFormErrors = {};
    if (!data.wardNo?.trim()) newErrors.wardNo = t("validation.wardNoRequired");
    else if (data.wardNo.length > ZONE_WARD_NO_MAX_LENGTH) newErrors.wardNo = t("validation.wardNoMaxLength", { count: ZONE_WARD_NO_MAX_LENGTH });
    else if (isAllZeros(data.wardNo)) newErrors.wardNo = t("validation.wardNoAllZeros");
    if (!data.description?.trim()) newErrors.description = t("validation.wardNameRequired");
    else if (data.description.length > ZONE_WARD_NAME_MAX_LENGTH) newErrors.description = t("validation.wardNameMaxLength", { count: ZONE_WARD_NAME_MAX_LENGTH });
    else if (isAllZeros(data.description)) newErrors.description = t("validation.wardNameAllZeros");
    return newErrors;
  };

  // Validate bulk ward form
  const validateBulk = (prefix: string, rangeFrom: string, rangeTo: string) => {
    const newErrors: BulkFormErrors = {};
    
    // Prefix validation
    if (!prefix?.trim()) {
      newErrors.prefix = t("wardBulk.errorPrefixRequired");
    } else if (prefix.length > BULK_PREFIX_MAX_LENGTH) {
      newErrors.prefix = t("wardBulk.errorPrefixMaxLength", { count: BULK_PREFIX_MAX_LENGTH });
    }
    
    // Range From validation
    if (!rangeFrom?.trim()) {
      newErrors.rangeFrom = t("wardBulk.errorRangeFromRequired");
    } else if (rangeFrom.length > BULK_RANGE_MAX_LENGTH) {
      newErrors.rangeFrom = t("wardBulk.errorRangeFromMaxLength", { count: BULK_RANGE_MAX_LENGTH });
    }
    
    // Range To validation
    if (!rangeTo?.trim()) {
      newErrors.rangeTo = t("wardBulk.errorRangeToRequired");
    } else if (rangeTo.length > BULK_RANGE_MAX_LENGTH) {
      newErrors.rangeTo = t("wardBulk.errorRangeToMaxLength", { count: BULK_RANGE_MAX_LENGTH });
    }
    
    // Check order (from <= to) if both are numeric
    if (rangeFrom?.trim() && rangeTo?.trim() && !newErrors.rangeFrom && !newErrors.rangeTo) {
      const fromNum = parseInt(rangeFrom, 10);
      const toNum = parseInt(rangeTo, 10);
      if (!isNaN(fromNum) && !isNaN(toNum) && fromNum > toNum) {
        newErrors.rangeTo = t("wardBulk.errorOrder");
      }
    }
    
    return newErrors;
  };

  // Check if any ward in bulk range already exists
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

      // Validate bulk fields
      const bulkValidationErrors = validateBulk(prefix, from, to);
      if (Object.keys(bulkValidationErrors).length > 0) {
        setBulkErrors(bulkValidationErrors);
        return;
      }

      // Check for duplicate ward numbers before creating
      const duplicateWardNo = checkBulkDuplicates(prefix, from, to);
      if (duplicateWardNo) {
        toast.error(t("createWardMessages.duplicateWard", { wardNo: duplicateWardNo }));
        return;
      }

      setBulkErrors({});
      setLoading(true);

      try {
        const result = await handleWardBulkCreate({
          prefix,
          from,
          to,
          zoneId: currentZone.id,
          isActive: form.isActive,
          t: (key: string, values?: Record<string, unknown>) => t(key, values as never)
        });

        if (result.success) {
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
      const result = await handleWardCreate({
        wardNo: form.wardNo,
        description: form.description,
        sequenceNo: form.sequenceNo ? Number(form.sequenceNo) : undefined,
        isActive: form.isActive,
        zoneId: currentZone.id,
        t: (key: string, values?: Record<string, unknown>) => t(key, values as never)
      });

      if (result.success) {
        handleClose();
        if (onSuccess) onSuccess(form.wardNo);
      } else if (result.isDuplicate) {
        setErrors({ wardNo: t("messages.duplicateWardNo", { wardNo: form.wardNo }) });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("createWardMessages.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Map size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {t("wardList.createWard")}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {t("wardList.createWardSubtitle")}
            </div>
          </div>
        </div>
      }
      width="md"
      footer={
        <>
          <CancelButton onClick={handleClose} disabled={loading} />
          <SaveButton
            onClick={handleSave}
            isLoading={loading}
            label={loading ? t("actions.saving") : t("actions.save")}
          />
        </>
      }
    >
      <div className="space-y-6 bg-[#F8FAFF] p-5 h-full overflow-y-auto">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {t("wardBulk.title")}
            </div>
            <div className="text-xs text-slate-500">
              {t("wardBulk.subtitle")}
            </div>
          </div>
          <ToggleSwitch
            checked={bulkMode}
            onChange={handleBulkToggle}
            showPopup={false}
            activeLabel={t("wardBulk.toggleOn")}
            inactiveLabel={t("wardBulk.toggleOff")}
          />
        </div>

        {bulkMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {t("wardBulk.prefix")}
                </div>
                <Input
                  placeholder={t("wardBulk.placeholders.prefix")}
                  disabled={loading}
                  value={bulkPrefix}
                  required
                  onChange={(e) => {
                    setBulkPrefix(e.target.value);
                    if (bulkErrors.prefix) setBulkErrors((prev) => ({ ...prev, prefix: undefined }));
                  }}
                />
                {bulkErrors.prefix && (
                  <ValidationMessage message={bulkErrors.prefix} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {t("wardBulk.rangeFrom")}
                </div>
                <Input
                  placeholder={t("wardBulk.placeholders.rangeFrom")}
                  disabled={loading}
                  value={bulkFrom}
                  onChange={(e) => {
                    setBulkFrom(e.target.value);
                    if (bulkErrors.rangeFrom) setBulkErrors((prev) => ({ ...prev, rangeFrom: undefined }));
                  }}
                />
                {bulkErrors.rangeFrom && (
                  <ValidationMessage message={bulkErrors.rangeFrom} />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {t("wardBulk.rangeTo")}
                </div>
                <Input
                  placeholder={t("wardBulk.placeholders.rangeTo")}
                  disabled={loading}
                  value={bulkTo}
                  onChange={(e) => {
                    setBulkTo(e.target.value);
                    if (bulkErrors.rangeTo) setBulkErrors((prev) => ({ ...prev, rangeTo: undefined }));
                  }}
                />
                {bulkErrors.rangeTo && (
                  <ValidationMessage message={bulkErrors.rangeTo} />
                )}
              </div>
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
              {t("wardBulk.helperRangeInfo", {
                example: `${bulkPrefix || "prefix"}${bulkFrom || "40"} to ${bulkPrefix || "prefix"}${bulkTo || "44"}`
              })}
            </div>

            <WardFormFields
              data={form}
              onChange={setForm}
              mode="add"
              disabled={loading}
              errors={errors}
              showSequence={false}
              showBasicFields={false}
              showActiveStatus={false}
            />
          </div>
        ) : (
          <WardFormFields
            data={form}
            onChange={setForm}
            mode="add"
            disabled={loading}
            errors={errors}
            showSequence={false}
            showActiveStatus={false}
          />
        )}
      </div>
    </Drawer>
  );
}
