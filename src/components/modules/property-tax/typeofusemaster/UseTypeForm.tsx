
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from 'next-intl';

import { useRouter, useSearchParams } from "next/navigation";
import { Tag, AlertCircle } from "lucide-react";

import type { UseGroup, UseType } from "@/types/typeOfUse.types";
// import Drawer from "@/components/common/Drawer";

import { Input } from "@/components/common/Input";
// import { ValidationMessage } from "@/components/common/ValidationMessage";

import {
  createUseType,
  updateUseType,
} from "@/app/[locale]/property-tax/typeofusemaster/actions";


import { CheckCircle2 } from "lucide-react";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, ValidationMessage } from "@/components/common";

interface Props {
  id: string | null; // null = add
  initialData?: UseType | null; // Server-side fetched data for edit mode
  allGroups?: UseGroup[]; // Server-side fetched groups
  allTypes?: UseType[]; // Server-side fetched types for duplicate check
}

type FieldErrors = {
  code?: string;
  typeValue?: string;
  groupId?: string;
  description?: string; // ✅ required now
  searchKey?: string; // ✅ required now
  searchSequence?: string;
};

export default function UseTypeForm({ id, initialData, allGroups: allGroupsProp = [], allTypes: allTypesProp = [] }: Props) {
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
      searchKey: "",
      searchSequence: 0,
      isActive: true,
      status: "Active",
    }
  );

  const [typeValue, setTypeValue] = useState(initialData?.type || "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const MAX_NAME_LEN = 100;

  // ✅ Shortcut key: allow only letters (+ optional separators like + and -)
  const SHORTCUT_REGEX = /^[A-Za-z+\- ]+$/;

  // sanitize shortcut: remove digits and invalid chars
  const sanitizeShortcut = (v: string) => v.replace(/[^A-Za-z+\- ]/g, "");

  // ✅ Regional name: allow Unicode letters + numbers + space + . - ,
  const REGIONAL_NAME_REGEX = /^[\p{L}\p{M}\p{N} .,-]+$/u;

  // sanitize: remove disallowed chars, keep Unicode
  const sanitizeRegionalName = (v: string) =>
    v.replace(/[^\p{L}\p{M}\p{N} .,-]/gu, "").slice(0, MAX_NAME_LEN);


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

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((p) => {
      if (!p[field]) return p;
      const next = { ...p };
      delete next[field];
      return next;
    });
  };

  const normalize = (v: string) => v.trim().toLowerCase();

  const MAX_CODE_LEN = 10;

  const sanitizeCode = (v: string) =>
    v.replace(/[^A-Za-z0-9]/g, "").slice(0, MAX_CODE_LEN);

  const isDuplicateCode = (code: string) => {
    const c = normalize(code);
    if (!c) return false;

    return (allTypes ?? []).some((t) => {
      // exclude same record during edit
      const sameRecord =
        isEdit &&
        (t.typeOfUseId === formData.typeOfUseId || normalize(t.typeOfUseCode) === normalize(formData.typeOfUseCode));
      if (sameRecord) return false;

      return normalize(t.typeOfUseCode) === c || normalize(String(t.typeOfUseId)) === c;
    });
  };


  const isDuplicateDescription = (name: string) => {
    const n = normalize(name);
    if (!n) return false;

    return (allTypes ?? []).some((t) => {
      const sameRecord =
        isEdit &&
        (t.typeOfUseId === formData.typeOfUseId ||
          normalize(t.description ?? "") === normalize(formData.description ?? ""));

      if (sameRecord) return false;

      return normalize(t.description ?? "") === n;
    });
  };




  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    const seq = Number(formData.searchSequence ?? 0);
    if (!Number.isFinite(seq) || seq < 0) {
      nextErrors.searchSequence = t('type.fields.sequence') + ' ' + t('messages.sequenceNonNegative');
    }

    // ✅ required
    if (!formData.typeOfUseCode?.trim()) {
      nextErrors.code = t('type.fields.typeId') + ' ' + t('messages.createError');
    } else if (isDuplicateCode(formData.typeOfUseCode)) {
      nextErrors.code = t('messages.duplicateTypeId');
    }
    if (!typeValue?.trim()) nextErrors.typeValue = t('messages.typeRequired');
    if (!formData.typeOfUseGroupId) nextErrors.groupId = t('messages.groupRequired');


    // ✅ Regional required + validation
    if (!formData.description?.trim()) {
      nextErrors.description = t('messages.descriptionRequired');
    } else if (formData.description.trim().length > MAX_NAME_LEN) {
      nextErrors.description = t('type.fields.description') + ' ' + t('messages.maxLength', { count: MAX_NAME_LEN });
    } else if (!REGIONAL_NAME_REGEX.test(formData.description.trim())) {
      nextErrors.description =
        t('type.fields.description') + ' ' + t('messages.allowedChars');
    } else if (isDuplicateDescription(formData.description)) {
      nextErrors.description = t('messages.duplicateDescription');
    }




    // ✅ Shortcut required + validation
    if (!formData.searchKey?.trim()) {
      nextErrors.searchKey = t('messages.searchKeyRequired');
    } else if (!SHORTCUT_REGEX.test(formData.searchKey.trim())) {
      nextErrors.searchKey = t('messages.searchKeyLabel') + ' ' + t('messages.allowedShortcutChars');
    }

    return nextErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "typeOfUseCode") {
      const cleaned = sanitizeCode(value);
      setFormData((p) => ({ ...p, typeOfUseCode: cleaned }));
      if (submittedOnce) clearFieldError("code");
      return;
    }

    if (name === "description") {
      const cleaned = sanitizeRegionalName(value);
      setFormData((p) => ({ ...p, description: cleaned }));
      if (submittedOnce) clearFieldError("description");
      return;
    }

    if (name === "searchKey") {
      const cleaned = sanitizeShortcut(value);
      setFormData((p) => ({ ...p, searchKey: cleaned }));
      if (submittedOnce) clearFieldError("searchKey");
      return;
    }

    if (name === "searchSequence") {
      const num = parseInt(value || "0", 10);
      setFormData((p) => ({ ...p, searchSequence: num }));
      if (submittedOnce) clearFieldError("searchSequence");
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

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      if (isEdit) {
        await updateUseType({
          id: Number(formData.typeOfUseId),
          groupId: Number(formData.typeOfUseGroupId),
          code: formData.typeOfUseCode,
          description: formData.description,
          type: typeValue,
          searchKey: formData.searchKey ?? "",
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
          searchKey: formData.searchKey ?? "",
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t('messages.typeCreated'));
      }
      router.back();
    } catch (err: any) {
      toast.error(err?.message || t('messages.saveFailed'));
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
                ? t('type.addingToGroup', { group: selectedGroup.groupName, defaultValue: `Adding to ${selectedGroup.groupName} group` })
                : t('type.selectGroup', { defaultValue: 'Select group' })}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
          //  variant="cancel"
            label={t('buttons.cancel')}
            onClick={() => router.back()}
          />
          <SaveButton
           // variant="save"
            label={isEdit ? t('buttons.edit', { defaultValue: 'Update' }) : t('buttons.save')}
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
                    {t('type.title')} {t('status.is', { defaultValue: 'is currently' })} <span className={isActive ? "text-emerald-700 font-medium" : "text-slate-600 font-medium"}>{isActive ? t('status.active') : t('status.inactive')}</span>
                  </div>
                </div>
              </div>

              <ToggleSwitch checked={isActive} onChange={handleStatusToggle} showPopup={false} />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type Code */}
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

            {/* Type Dropdown */}
            <div className="flex flex-col">
              <label className="mb-1.5 text-sm font-semibold text-gray-700">
                {t('type.fields.type')} <span className="text-red-500">*</span>
              </label>
              <select
                value={typeValue}
                onChange={(e) => {
                  setTypeValue(e.target.value);
                  if (submittedOnce) clearFieldError("typeValue");
                }}
                className="w-full text-slate-700 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="" disabled>
                  {t('type.selectType', { defaultValue: 'Select Type' })}
                </option>
                <option value="R">{t('type.options.residential', { defaultValue: 'R - Residential' })}</option>
                <option value="C">{t('type.options.commercial', { defaultValue: 'C - Commercial' })}</option>
                <option value="I">{t('type.options.industrial', { defaultValue: 'I - Industrial' })}</option>
                <option value="N">{t('type.options.nontaxable', { defaultValue: 'N - Non-taxable' })}</option>
              </select>
              <ValidationMessage
                message={errors.typeValue}
                visible={submittedOnce && !!errors.typeValue}
              />
            </div>

            {/* UseTypeGroup */}
            <div className="flex flex-col">
              <label className="mb-1.5 text-sm font-semibold text-gray-700">
                {t('type.fields.useTypeGroup')} <span className="text-red-500">*</span>
              </label>

              <select
                name="typeOfUseGroupId"
                value={formData.typeOfUseGroupId}
                onChange={handleChange}
                className=" w-full text-slate-700 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="" disabled>
                  {t('type.selectUseTypeGroup', { defaultValue: 'Select UseTypeGroup' })}
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

              {selectedGroup && (
                <div className="mt-2 text-xs text-slate-600">
                  {t('type.selectedGroup', { group: selectedGroup.groupName, defaultValue: 'Selected: ' })}<b>{selectedGroup.groupName}</b>
                </div>
              )}
            </div>

            {/* ✅ Description (REQUIRED) */}
            <div className="flex flex-col">
              <Input
                label={t('type.fields.description')}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder={t('type.placeholders.description')}
                fullWidth
                className="rounded-xl px-4 py-2"
                maxLength={100}
              />
              <ValidationMessage
                message={errors.description}
                visible={submittedOnce && !!errors.description}
              />
            </div>

            {/* ✅ Search Key (REQUIRED) */}
            <div className="flex flex-col">
              <Input
                label={t('messages.searchKeyLabel')}
                name="searchKey"
                value={formData.searchKey || ""}
                onChange={handleChange}
                placeholder={t('messages.searchKeyLabel')}
                fullWidth
                className="rounded-xl px-4 py-2"
              />
              <ValidationMessage
                message={errors.searchKey}
                visible={submittedOnce && !!errors.searchKey}
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
              <p className="mt-1 text-xs text-gray-500">{t('type.displayOrder')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle size={16} />
          <span>
            {t('type.mandatoryNote', { defaultValue: 'Fields marked with * are mandatory' })}
          </span>
        </div>
      </form>
    </Drawer>
  );
}
