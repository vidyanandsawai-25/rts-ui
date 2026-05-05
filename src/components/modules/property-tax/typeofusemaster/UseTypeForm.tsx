
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from 'next-intl';

import { useRouter, useSearchParams } from "next/navigation";
import { Tag, AlertCircle } from "lucide-react";

import type { UseGroup, UseType, UseTypeFormProps } from "@/types/typeOfUse.types";

import { Input } from "@/components/common/Input";

import {
  createUseType,
  updateUseType,
} from "@/app/[locale]/property-tax/typeofusemaster/actions";


import { CheckCircle2 } from "lucide-react";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, ValidationMessage } from "@/components/common";
import { validateForm } from '@/lib/utils/validation-helpers';
import { CODE_REGEX, CODE_SANITIZE, DESCRIPTION_REGEX, DESCRIPTION_SANITIZE } from '@/lib/utils/validation-rules';
import type { Validator } from '@/lib/utils/validation-helpers';

type FieldErrors = {
  code?: string;
  typeValue?: string;
  groupId?: string;
  description?: string;
  searchSequence?: string;
};

export default function UseTypeForm({ id, initialData, allGroups: allGroupsProp = [], allTypes: allTypesProp = [] }: UseTypeFormProps) {
  const t = useTranslations('typeofusemaster');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(id);

  const queryGroupId = Number(searchParams.get("groupId") || 0);

  const [allGroups] = useState<UseGroup[]>(allGroupsProp);
  const [allTypes] = useState<UseType[]>(allTypesProp); // ✅ for duplicate check

  const [formData, setFormData] = useState<UseType>(
    initialData || {
      typeOfUseId: 0,
      typeOfUseGroupId: queryGroupId,
      typeOfUseCode: "",
      description: "",
      type: "",
      searchSequence: 0,
      isActive: true,
      status: "Active",
    }
  );

  const [typeValue, setTypeValue] = useState(initialData?.type || "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Sanitization helpers using common validation patterns
  const sanitizeCode = (value: string, maxLength: number = 10): string => {
    return value.replace(CODE_SANITIZE, '').slice(0, maxLength);
  };

  const sanitizeDescription = (value: string, maxLength: number = 100): string => {
    return value.replace(DESCRIPTION_SANITIZE, '').slice(0, maxLength);
  };

  // Duplicate check helpers
  const normalize = (v: string) => v.trim().toLowerCase();

  const isActive = formData.isActive ?? true;

  const handleStatusToggle = () => {
    setFormData((p) => ({
      ...p,
      isActive: !p.isActive,
      status: p.isActive ? "Inactive" : "Active",
    }));
  };

  // ✅ FIX: Find group by typeOfUseGroupId
  const selectedGroup = useMemo(
    () => allGroups.find((g) => 
      g.typeOfUseGroupId === formData.typeOfUseGroupId
    ) || null,
    [allGroups, formData.typeOfUseGroupId]
  );

  const isDuplicateCode = (code: string): boolean => {
    const c = normalize(code);
    if (!c) return false;
    return allTypes.some((t) => {
      if (isEdit && t.typeOfUseId === formData.typeOfUseId) return false;
      return normalize(t.typeOfUseCode) === c;
    });
  };

  const isDuplicateDescription = (desc: string): boolean => {
    const d = normalize(desc);
    if (!d) return false;
    return allTypes.some((t) => {
      if (isEdit && t.typeOfUseId === formData.typeOfUseId) return false;
      return normalize(t.description ?? '') === d;
    });
  };

  // Validation schema using common validation patterns
  const validationSchema: Record<string, Validator> = {
    typeOfUseCode: (value: unknown) => {
      const code = String(value ?? '').trim();
      
      if (!code) return t('type.fields.typeId') + ' ' + t('messages.createError');
      if (code.length > 10) return t('type.fields.typeId') + ' ' + t('messages.maxLength', { count: 10 });
      if (!CODE_REGEX.test(code)) return t('type.fields.typeId') + ' ' + t('messages.onlyAlphanumeric');
      if (isDuplicateCode(code)) return t('messages.duplicateTypeId');
      
      return undefined;
    },
    
    type: (value: unknown) => {
      const type = String(value ?? '').trim();
      if (!type) return t('messages.typeRequired');
      return undefined;
    },
    
    typeOfUseGroupId: (value: unknown) => {
      const groupId = Number(value);
      if (!groupId) return t('messages.groupRequired');
      return undefined;
    },
    
    description: (value: unknown) => {
      const desc = String(value ?? '').trim();
      
      if (!desc) return t('messages.descriptionRequired');
      if (desc.length > 100) return t('type.fields.description') + ' ' + t('messages.maxLength', { count: 100 });
      if (!DESCRIPTION_REGEX.test(desc)) return t('type.fields.description') + ' ' + t('messages.allowedChars');
      if (isDuplicateDescription(desc)) return t('messages.duplicateDescription');
      
      return undefined;
    },
    
    searchSequence: (value: unknown) => {
      const seq = Number(value);
      if (!Number.isFinite(seq) || seq < 0) {
        return t('type.fields.sequence') + ' ' + t('messages.sequenceNonNegative');
      }
      return undefined;
    }
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((p) => {
      if (!p[field]) return p;
      const next = { ...p };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "typeOfUseCode") {
      const cleaned = sanitizeCode(value, 10);
      setFormData((p) => ({ ...p, typeOfUseCode: cleaned }));
      if (submittedOnce) clearFieldError("code");
      return;
    }

    if (name === "description") {
      const cleaned = sanitizeDescription(value, 100);
      setFormData((p) => ({ ...p, description: cleaned }));
      if (submittedOnce) clearFieldError("description");
      return;
    }

    if (name === "searchSequence") {
      const num = parseInt(value || "0", 10);
      setFormData((p) => ({ ...p, searchSequence: num }));
      if (submittedOnce) clearFieldError("searchSequence");
      return;
    }

    if (name === "typeOfUseGroupId") {
      // Parse select value as number to ensure strict equality checks work
      const num = Number(value) || 0;
      setFormData((p) => ({ ...p, typeOfUseGroupId: num }));
      if (submittedOnce) clearFieldError("groupId");
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
    if (submittedOnce) {
      if (name === "typeOfUseGroupId") clearFieldError("groupId");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    // Create form data with typeValue for validation
    const dataToValidate = { ...formData, type: typeValue };
    const validationErrors = validateForm(dataToValidate, validationSchema);
    
    setErrors({
      code: validationErrors.typeOfUseCode,
      typeValue: validationErrors.type,
      groupId: validationErrors.typeOfUseGroupId,
      description: validationErrors.description,
      searchSequence: validationErrors.searchSequence
    });

    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isEdit) {
        await updateUseType({
          id: Number(formData.typeOfUseId),
          groupId: Number(formData.typeOfUseGroupId),
          code: formData.typeOfUseCode,
          description: formData.description,
          type: typeValue,
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t('messages.typeUpdated'));
      } else {
        await createUseType({
          groupId: Number(formData.typeOfUseGroupId),
          code: formData.typeOfUseCode,
          description: formData.description,
          type: typeValue,
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t('messages.typeCreated'));
      }
      router.back();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || t('messages.saveFailed'));
    }
  };

  return (
    <Drawer
      open
      onClose={() => router.back()}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white shadow">
            <Tag size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t('type.edit') : t('type.add')}
            </div>
            <div className="text-sm text-slate-500">
              {selectedGroup
                ? t('type.addingToGroup', { group: selectedGroup.groupName })
                : t('type.selectGroup')}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            label={t('buttons.cancel')}
            onClick={() => router.back()}
          />
          <SaveButton
            label={isEdit ? t('buttons.edit') : t('buttons.save')}
            type="submit"
            form="use-type-form"
          />
        </>
      }
    >
      <form
        id="use-type-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F8FAFF] p-5"
      >
        {isEdit && <input type="hidden" name="typeOfUseId" value={formData.typeOfUseId} />}

        {/* ================= ACTIVE STATUS (EDIT ONLY) ================= */}
        {isEdit && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <div className="text-base font-semibold text-slate-900">{t('type.fields.status')}</div>
                  <div className="text-sm text-slate-500">
                    {t('type.statusMessage', { 
                      status: isActive ? t('status.active') : t('status.inactive')
                    })}
                  </div>
                </div>
              </div>

              <ToggleSwitch checked={isActive} onChange={handleStatusToggle} showPopup={false} />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="type-select" className="mb-1.5 text-sm font-semibold text-gray-700">
                {t('type.fields.type')} <span className="text-red-500">*</span>
              </label>
              <select
                id="type-select"
                value={typeValue}
                onChange={(e) => {
                  setTypeValue(e.target.value);
                  if (submittedOnce) clearFieldError("typeValue");
                }}
                className="w-full text-slate-700 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="" disabled>
                  {t('type.selectType')}
                </option>
                <option value="R">{t('type.options.residential')}</option>
                <option value="C">{t('type.options.commercial')}</option>
                <option value="I">{t('type.options.industrial')}</option>
                <option value="N">{t('type.options.nontaxable')}</option>
              </select>
              <ValidationMessage
                message={errors.typeValue}
                visible={submittedOnce && !!errors.typeValue}
              />
            </div>

            {/* UseTypeGroup */}
            <div className="flex flex-col">
              <label htmlFor="use-type-group-select" className="mb-1.5 text-sm font-semibold text-gray-700">
                {t('type.fields.useTypeGroup')} <span className="text-red-500">*</span>
              </label>

              <select
                id="use-type-group-select"
                name="typeOfUseGroupId"
                value={formData.typeOfUseGroupId || ""}
                onChange={handleChange}
                className=" w-full text-slate-700 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="" disabled>
                  {t('type.selectUseTypeGroup')}
                </option>
                {allGroups.map((g) => (
                  <option key={g.typeOfUseGroupId} value={g.typeOfUseGroupId}>
                    {g.groupName}
                  </option>
                ))}
              </select>

              <ValidationMessage
                message={errors.groupId}
                visible={submittedOnce && !!errors.groupId}
              />

              {/* {selectedGroup && (
                <div className="mt-2 text-xs text-slate-600">
                  {t('type.selectedGroup', { group: selectedGroup.groupName })}<b>{selectedGroup.groupName}</b>
                </div>
              )} */}
            </div>

            <div className="flex flex-col">
              <Input
                label={t('type.fields.typeId')}
                name="typeOfUseCode"
                value={formData.typeOfUseCode}
                onChange={handleChange}
                placeholder={t('type.placeholders.typeId')}
                fullWidth
                required={true}
                className="rounded-xl px-4 py-2"
                maxLength={10}
              />
              <ValidationMessage
                message={errors.code}
                visible={submittedOnce && !!errors.code}
              />
            </div>

            
            {/* Search Sequence */}
            <div className="flex flex-col">
              <Input
                label={t('messages.searchSequenceLabel')}
                name="searchSequence"
                type="number"
                value={String(formData.searchSequence ?? 0)}
                onChange={handleChange}
                placeholder="0"
                min={0}
                fullWidth
                className="rounded-xl px-4 py-2"
              />
              <ValidationMessage
                message={errors.searchSequence}
                visible={submittedOnce && !!errors.searchSequence}
              />
            </div>

            {/* ✅ Description (REQUIRED) */}
            <div className="flex flex-col col-span-2">
              <Input
                label={t('type.fields.description')}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder={t('type.placeholders.description')}
                fullWidth
                className="rounded-xl px-4 py-2"
                maxLength={100}
                required
              />
              <ValidationMessage
                message={errors.description}
                visible={submittedOnce && !!errors.description}
              />
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle size={16} />
          <span>
            {t('type.mandatoryNote')}
          </span>
        </div>
      </form>
    </Drawer>
  );
}
