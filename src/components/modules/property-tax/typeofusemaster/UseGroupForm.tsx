
"use client";
import { useTranslations } from 'next-intl';

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Home,
  Briefcase,
  Factory,
  GraduationCap,
  Wheat,
  MapPin,
  ChevronDown,
  Check,
  AlertCircle,
  Layers3,
} from "lucide-react";

import type { UseGroup, UseGroupIconKey } from "@/types/typeOfUse.types";
// import Drawer from "@/components/common/Drawer";
// import { ActionButton } from "@/components/common/Buttons";
import { Input } from "@/components/common/Input";



import {
  createUseGroup,
  updateUseGroup,
} from "@/app/[locale]/property-tax/typeofusemaster/actions";


import { ToggleSwitch } from "@/components/common/ToggleSwitch"; // ✅ adjust path if different
import { CheckCircle2 } from "lucide-react";
import { Drawer } from '@/components/common/Drawer';

import { CancelButton, SaveButton, ValidationMessage } from '@/components/common';
import { validateForm } from '@/lib/utils/validation-helpers';
import { CODE_REGEX, CODE_SANITIZE, TEXT_ALLOWED, TEXT_SANITIZE } from '@/lib/utils/validation-rules';
import type { Validator } from '@/lib/utils/validation-helpers';


interface Props {
  id: string | null;
  initialData?: UseGroup | null; // Server-side fetched data for edit mode
  allGroups?: UseGroup[]; // Server-side fetched groups for duplicate check
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_OPTIONS: Array<{ value: UseGroupIconKey; label: string; Icon: any }> =
  [
    { value: "home", label: "Home", Icon: Home },
    { value: "building", label: "Briefcase", Icon: Briefcase },
    { value: "factory", label: "Factory", Icon: Factory },
    { value: "school", label: "School", Icon: GraduationCap },
    { value: "leaf", label: "Wheat", Icon: Wheat },
    { value: "map", label: "MapPin", Icon: MapPin },
  ];

type FieldErrors = {
  code?: string;
  name?: string;
};

export default function UseGroupForm({ id, initialData, allGroups: allGroupsProp = [] }: Props) {
  const t = useTranslations('typeofusemaster');
  const router = useRouter();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<UseGroup>(
    initialData || {
      typeOfUseGroupId: 0,
      typeOfUseGroupCode: "",
      groupName: "",
      groupIcon: "home-icon",
      isActive: true,
      status: "Active",
    }
  );

  const [allGroups] = useState<UseGroup[]>(allGroupsProp);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [iconOpen, setIconOpen] = useState(false);
  const iconWrapRef = useRef<HTMLDivElement | null>(null);

  // Sanitization helpers using common validation patterns
  const sanitizeCode = (value: string, maxLength: number = 10): string => {
    return value.replace(CODE_SANITIZE, '').slice(0, maxLength);
  };

  const sanitizeText = (value: string, maxLength: number = 100): string => {
    return value.replace(TEXT_SANITIZE, '').slice(0, maxLength);
  };

  // Duplicate check helpers
  const normalize = (v: string) => v.trim().toLowerCase();

  // Helper to convert groupIcon string to UseGroupIconKey for display
  const getIconKey = (iconStr: string): UseGroupIconKey => {
    if (iconStr.includes('home')) return 'home';
    if (iconStr.includes('building') || iconStr.includes('briefcase')) return 'building';
    if (iconStr.includes('factory')) return 'factory';
    if (iconStr.includes('school') || iconStr.includes('graduation')) return 'school';
    if (iconStr.includes('leaf') || iconStr.includes('wheat')) return 'leaf';
    if (iconStr.includes('map') || iconStr.includes('pin')) return 'map';
    return 'home';
  };

  const selectedIconOption =
    ICON_OPTIONS.find((o) => o.value === getIconKey(formData.groupIcon)) ?? ICON_OPTIONS[0];


  const isActiveStatus = formData.isActive ?? true;

  const handleStatusToggle = () => {
    setFormData((p) => ({
      ...p,
      isActive: !p.isActive,
      status: p.isActive ? "Inactive" : "Active",
    }));
  };

  // close icon dropdown
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!iconWrapRef.current?.contains(e.target as Node)) setIconOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const isDuplicateCode = (code: string): boolean => {
    const c = normalize(code);
    if (!c) return false;
    return allGroups.some((g) => {
      if (isEdit && g.typeOfUseGroupId === formData.typeOfUseGroupId) return false;
      return normalize(g.typeOfUseGroupCode || '') === c;
    });
  };

  const isDuplicateGroupName = (name: string): boolean => {
    const nm = normalize(name);
    if (!nm) return false;
    return allGroups.some((g) => {
      if (isEdit && g.typeOfUseGroupId === formData.typeOfUseGroupId) return false;
      return normalize(g.groupName || '') === nm;
    });
  };

  // Validation schema using common validation patterns
  const validationSchema: Record<string, Validator> = {
    typeOfUseGroupCode: (value: unknown) => {
      const code = String(value ?? '').trim();
      
      if (!code) return t('group.fields.groupId') + ' ' + t('messages.createError');
      if (code.length > 10) return t('group.fields.groupId') + ' ' + t('messages.maxLength', { count: 10 });
      if (!CODE_REGEX.test(code)) return t('group.fields.groupId') + ' ' + t('messages.onlyAlphanumeric');
      if (isDuplicateCode(code)) return t('messages.duplicateGroupId');
      
      return undefined;
    },
    
    groupName: (value: unknown) => {
      const name = String(value ?? '').trim();
      
      if (!name) return t('group.fields.groupName') + ' ' + t('messages.createError');
      if (name.length > 100) return t('group.fields.groupName') + ' ' + t('messages.maxLength', { count: 100 });
      if (!TEXT_ALLOWED.test(name)) return t('group.fields.groupName') + ' ' + t('messages.allowedChars');
      if (isDuplicateGroupName(name)) return t('messages.duplicateGroupName');
      
      return undefined;
    }
  };

  const showError = (field: keyof FieldErrors) =>
    (submittedOnce || touched[field as string]) && !!errors[field];

  const handleBlur = (name: keyof UseGroup | "code") => {
    setTouched((p) => ({ ...p, [name as string]: true }));

    const validationErrors = validateForm(formData, validationSchema);
    setErrors({
      code: validationErrors.typeOfUseGroupCode,
      name: validationErrors.groupName
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const validationErrors = validateForm(formData, validationSchema);
    setErrors({
      code: validationErrors.typeOfUseGroupCode,
      name: validationErrors.groupName
    });

    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isEdit) {
        await updateUseGroup({
          id: formData.typeOfUseGroupId,
          code: formData.typeOfUseGroupCode,
          name: formData.groupName,
          icon: getIconKey(formData.groupIcon),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t('messages.groupUpdated'));
      } else {
        await createUseGroup({
          code: formData.typeOfUseGroupCode,
          name: formData.groupName,
          icon: getIconKey(formData.groupIcon),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t('messages.groupCreated'));
      }

      router.back();
    }
   
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      const msg = String(err?.message ?? "").toLowerCase();

      const isDup =
        msg.includes("duplicate") ||
        msg.includes("already exists") ||
        msg.includes("unique");

      if (isDup) {
        setErrors((p) => ({
          ...p,
          name: t('messages.duplicateGroupName'),
        }));

        setTouched((p) => ({
          ...p,
          name: true,
        }));

        return;
      }

      toast.error(t('messages.createGroupFailed'));
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
            <Layers3 size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t('group.edit') : t('group.add')}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t('group.editSubtitle', { defaultValue: 'Update use group details' }) : t('group.addSubtitle', { defaultValue: 'Create new use group' })}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
           // variant="cancel"
            label={t('buttons.cancel')}
            onClick={() => router.back()}
          />
          <SaveButton
           // variant="save"
            label={isEdit ? t('buttons.edit', { defaultValue: 'Update' }) : t('buttons.save')}
            type="submit"
            form="use-group-form"
          />
        </>
      }
    >
      <form
        id="use-group-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F8FAFF] p-5"
      >
        {/* ================= ACTIVE STATUS (EDIT ONLY) ================= */}
        {isEdit && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <div className="text-base font-semibold text-slate-900">{t('group.fields.status')}</div>
                  <div className="text-sm text-slate-500">
                    {t('group.title')} {t('status.isCurrently', { defaultValue: 'is currently' })} <span className={isActiveStatus ? "text-emerald-700 font-medium" : "text-slate-600 font-medium"}>{isActiveStatus ? t('status.active') : t('status.inactive')}</span>
                  </div>
                </div>
              </div>

              <ToggleSwitch
                checked={isActiveStatus}
                onChange={handleStatusToggle}
                showPopup={false}
              />
            </div>
          </div>
        )}

        {/* ================= BASIC DETAILS ================= */}
        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Group Code */}
            <div className="flex flex-col">
              <Input
                label={t('group.fields.groupId')} // Keeping the translation key but it represents 'Code' now
                name="typeOfUseGroupCode"
                value={formData.typeOfUseGroupCode}
                onChange={(e) => {
                  const cleaned = sanitizeCode(e.target.value, 10);
                  const next = { ...formData, typeOfUseGroupCode: cleaned };
                  setFormData(next);
                  if (submittedOnce || touched.code) {
                    const validationErrors = validateForm(next, validationSchema);
                    setErrors({
                      code: validationErrors.typeOfUseGroupCode,
                      name: validationErrors.groupName
                    });
                  }
                }}
                onBlur={() => handleBlur("typeOfUseGroupCode")}
                placeholder={t('group.placeholders.groupId')}
                required
                fullWidth
              />
              <ValidationMessage
                message={errors.code}
                visible={showError("code")}
              />
            </div>

            {/* Group Name */}
            <div className="flex flex-col">
             
              <Input
                label={t('group.fields.groupName')}
                name="groupName"
                value={formData.groupName}
                onChange={(e) => {
                  const cleaned = sanitizeText(e.target.value, 100);
                  const next = { ...formData, groupName: cleaned };
                  setFormData(next);

                  if (submittedOnce || touched.name) {
                    const validationErrors = validateForm(next, validationSchema);
                    setErrors({
                      code: validationErrors.typeOfUseGroupCode,
                      name: validationErrors.groupName
                    });
                  }
                }}
                onBlur={() => handleBlur("groupName")}
                placeholder={t('group.placeholders.groupName')}
                required
                fullWidth
              />
              <ValidationMessage
                message={errors.name}
                visible={showError("name")}
              />
            </div>

            {/* ICON DROPDOWN */}
            <div className="flex flex-col" ref={iconWrapRef}>
              <label className="text-sm font-semibold text-gray-700">
                {t('group.fields.iconType')} <span className="text-red-500">*</span>
              </label>

              <div className="relative mt-1.5">
                <button
                  type="button"
                  onClick={() => setIconOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <div className="flex items-center gap-2">
                    <selectedIconOption.Icon className="h-4 w-4" />
                    {selectedIconOption.label}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {iconOpen && (
                  <div className="absolute z-50 mt-2 w-full text-gray-700 overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
                    {ICON_OPTIONS.map((opt) => {
                      const active = opt.value === getIconKey(formData.groupIcon);
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            // Convert UseGroupIconKey back to groupIcon string format
                            const iconStr = `${opt.value}-icon`;
                            setFormData((p) => ({ ...p, groupIcon: iconStr }));
                            setIconOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <opt.Icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                          {active && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* (optional) spacing to match other fields */}
              <div className="h-[18px]" />
            </div>
          </div>
        </div>

        {/* ================= NOTE ================= */}
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle size={16} />
          <span>
            {t('group.mandatoryNote', { defaultValue: 'Fields marked with * are mandatory' })}
          </span>
        </div>
      </form>
    </Drawer>
  );
}

