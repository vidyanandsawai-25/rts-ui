
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ListTree } from "lucide-react";

import type { UseSubType, UseType } from "@/types/typeOfUse.types";

import { Input } from "@/components/common/Input";

import {
  createSubType,
  updateSubType,
} from "@/app/[locale]/property-tax/typeofusemaster/actions";

import { CheckCircle2 } from "lucide-react";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, ValidationMessage } from "@/components/common";
import { validateForm } from '@/lib/utils/validation-helpers';
import { DESCRIPTION_REGEX, DESCRIPTION_SANITIZE } from '@/lib/utils/validation-rules';
import type { Validator } from '@/lib/utils/validation-helpers';

interface Props {
  id: string | null;
  initialData?: UseSubType | null; // Server-side fetched data for edit mode
  typeInfo?: UseType | null; // Server-side fetched type info
  allSubTypes?: UseSubType[]; // Server-side fetched subtypes for duplicate check
}

type FieldErrors = {
  typeId?: string;
  description?: string;
  searchSequence?: string;
};

export default function UseSubTypeForm({ id, initialData, typeInfo: typeInfoProp = null, allSubTypes: allSubTypesProp = [] }: Props) {
  const t = useTranslations("typeofusemaster");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(id);

  const queryTypeId = Number(searchParams.get("typeId") || 0);

  const [typeInfo] = useState<UseType | null>(typeInfoProp);
  const [allSubTypes] = useState<UseSubType[]>(allSubTypesProp);

  const [formData, setFormData] = useState<UseSubType>(
    initialData || {
      subTypeOfUseId: 0,
      typeOfUseId: queryTypeId,
      description: "",
      searchSequence: 0,
      isActive: true,
      status: "Active",
    }
  );

  const isActive = formData.isActive ?? true;

  const handleStatusToggle = () => {
    setFormData((p) => ({
      ...p,
      isActive: !p.isActive,
      status: p.isActive ? "Inactive" : "Active",
    }));
  };

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Sanitization helper using common validation patterns
  const sanitizeDescription = (value: string, maxLength: number = 100): string => {
    return value.replace(DESCRIPTION_SANITIZE, '').slice(0, maxLength);
  };

  // Duplicate check helper
  const normalize = (v: string) => v.trim().toLowerCase();

  const isDuplicateDescription = (desc: string): boolean => {
    const d = normalize(desc);
    if (!d) return false;
    return allSubTypes.some((s) => {
      if (isEdit && s.subTypeOfUseId === formData.subTypeOfUseId) return false;
      return normalize(s.description ?? '') === d;
    });
  };

  // Validation schema using common validation patterns
  const validationSchema: Record<string, Validator> = {
    typeOfUseId: (value: unknown) => {
      const typeId = Number(value);
      if (!typeId) return t('messages.typeMissing');
      return undefined;
    },
    
    description: (value: unknown) => {
      const desc = String(value ?? '').trim();
      
      if (!desc) return t('messages.subTypeNameRequired');
      if (desc.length > 100) return t('messages.subTypeNameLabel') + ' ' + t('messages.maxLength', { count: 100 });
      if (!DESCRIPTION_REGEX.test(desc)) return t('messages.subTypeNameLabel') + ' ' + t('messages.allowedChars');
      if (isDuplicateDescription(desc)) return t('messages.duplicateSubTypeName');
      
      return undefined;
    },
    
    searchSequence: (value: unknown) => {
      const seq = Number(value);
      if (!Number.isFinite(seq) || seq < 0) {
        return t('messages.searchSequenceLabel') + ' ' + t('messages.sequenceNonNegative');
      }
      return undefined;
    }
  };

  const showError = (field: keyof FieldErrors) =>
    (submittedOnce || touched[field as string]) && !!errors[field];

  const markTouched = (name: keyof FieldErrors) =>
    setTouched((p) => ({ ...p, [name]: true }));

  const setField = <K extends keyof UseSubType>(key: K, value: UseSubType[K]) => {
    setFormData((p) => {
      let nextValue: UseSubType[K] = value;

      if (key === "description" && typeof value === "string")
        nextValue = sanitizeDescription(value, 100) as UseSubType[K];

      const next = { ...p, [key]: nextValue };

      const validationErrors = validateForm(next, validationSchema);
      setErrors({
        typeId: validationErrors.typeOfUseId,
        description: validationErrors.description,
        searchSequence: validationErrors.searchSequence
      });

      return next;
    });
  };

  const typeLabel = useMemo(() => typeInfo?.description || "", [typeInfo]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    setTouched({
      typeId: true,
      description: true,
      searchSequence: true,
    });

    const validationErrors = validateForm(formData, validationSchema);
    setErrors({
      typeId: validationErrors.typeOfUseId,
      description: validationErrors.description,
      searchSequence: validationErrors.searchSequence
    });

    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isEdit) {
        await updateSubType({
          id: Number(formData.subTypeOfUseId),
          typeId: Number(formData.typeOfUseId),
          description: formData.description,
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t("messages.subTypeUpdated"));
      } else {
        await createSubType({
          typeId: Number(formData.typeOfUseId),
          description: formData.description,
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t("messages.subTypeCreated"));
      }

      router.back();
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || "";

      if (
        errorMsg.includes("409") ||
        errorMsg.toLowerCase().includes("duplicate") ||
        errorMsg.includes("same details already")
      ) {
        setErrors((prev) => ({
          ...prev,
          description: t("messages.duplicateSubTypeName"),
        }));
        setTouched((prev) => ({ ...prev, description: true }));
      } else {
        toast.error(errorMsg || t("messages.saveFailed"));
      }
    }
  };

  return (
    <Drawer
      open
      onClose={() => router.back()}
      className="border-l-4 border-[#4F6A94]"
      width="md"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <ListTree size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("subtype.edit") : t("subtype.add")}
            </div>
            <div className="text-sm text-slate-500">
              {typeLabel
                ? t("subtype.forType", {
                    type: typeLabel,
                    defaultValue: `For Type: ${typeLabel}`,
                  })
                : t("subtype.addSubtitle", {
                    defaultValue: "Create a new Sub-Type",
                  })}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            label={t("buttons.cancel")}
            onClick={() => router.back()}
          />
          <SaveButton
            label={
              isEdit
                ? t("buttons.edit", { defaultValue: "Update" })
                : t("buttons.save")
            }
            type="submit"
            form="use-subtype-form"
          />
        </>
      }
    >
      <form
        id="use-subtype-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F8FAFF] p-5"
      >
        {/* Show error if typeOfUseId is missing */}
        {errors.typeId && (
          <div className="flex items-center gap-2 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            <span>{errors.typeId}</span>
          </div>
        )}
        {isEdit && (
          <input
            type="hidden"
            name="subTypeOfUseId"
            value={formData.subTypeOfUseId}
          />
        )}
        <input
          type="hidden"
          name="typeOfUseId"
          value={formData.typeOfUseId}
        />

        {/* ================= ACTIVE STATUS (EDIT ONLY) ================= */}
        {isEdit && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {t("subtype.fields.status")}
                  </div>
                  <div className="text-sm text-slate-500">
                    {t("subtype.title")}{" "}
                    {t("status.isCurrently", {
                      defaultValue: "is currently",
                    })}{" "}
                    <span
                      className={
                        isActive
                          ? "text-emerald-700 font-medium"
                          : "text-slate-600 font-medium"
                      }
                    >
                      {isActive ? t("status.active") : t("status.inactive")}
                    </span>
                  </div>
                </div>
              </div>
              <ToggleSwitch
                checked={isActive}
                onChange={handleStatusToggle}
                showPopup={false}
              />
            </div>
          </div>
        )}

        {/* ================= BASIC DETAILS ================= */}
        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          {/* Sub-Type Name — full width */}
          <div className="flex flex-col">
            <Input
              label={t("messages.subTypeNameLabel")}
              required
              name="description"
              value={formData.description || ""}
              onChange={(e) => setField("description", e.target.value)}
              onBlur={() => markTouched("description")}
              placeholder={t("messages.subTypeNameLabel")}
              fullWidth
              maxLength={100}
            />
            <ValidationMessage
              message={errors.description}
              visible={showError("description")}
            />
          </div>

          {/* Search Key + Sequence in ONE ROW */}
          <div className="grid grid-cols-2 gap-4">
            {/* Search Key */}

            {/* Sequence */}
            <div className="flex flex-col">
              <Input
                label={t("messages.searchSequenceLabel")}
                name="searchSequence"
                required
                type="number"
                min={0}
                value={String(formData.searchSequence ?? 0)}
                onChange={(e) =>
                  setField(
                    "searchSequence",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                onBlur={() => markTouched("searchSequence")}
                placeholder="0"
                fullWidth
              />
              <ValidationMessage
                message={errors.searchSequence}
                visible={showError("searchSequence")}
              />
            </div>
          </div>
        </div>

        {/* ================= NOTE ================= */}
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle size={16} />
          <span>
            {t("group.mandatoryNote", {
              defaultValue: "Fields marked with * are mandatory",
            })}
          </span>
        </div>
      </form>
    </Drawer>
  );
}