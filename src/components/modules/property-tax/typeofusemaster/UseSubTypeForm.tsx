
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useTranslations } from 'next-intl';

// import { useRouter, useSearchParams } from "next/navigation";
// import { AlertCircle } from "lucide-react";

// import type { UseSubType, UseType } from "@/types/typeOfUse.types";
// // import Drawer from "@/components/common/Drawer";

// import { Input } from "@/components/common/Input";


// import {
//   createSubType,
//   getSubTypeById,
//   getTypeById,
//   updateSubType,
//   getAllSubTypes,
// } from "@/app/[locale]/property-tax/typeofusemaster/actions";

// import { CheckCircle2 } from "lucide-react";
// import { ToggleSwitch } from "@/components/common/ToggleSwitch";
// import { toast } from "sonner";
// import { Drawer } from "@/components/common/Drawer";
// import { CancelButton, SaveButton } from "@/components/common";

// interface Props {
//   id: string | null;
// }

// type FieldErrors = {
//   typeId?: string;
//   description?: string;
//   searchKey?: string;
//   searchSequence?: string;
// };

// /* ✅ Red box message like screenshot */
// function ErrorBox({ message, visible }: { message?: string; visible: boolean }) {
//   if (!visible || !message) return null;

//   return (
//     <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
//       <AlertCircle className="h-4 w-4" />
//       <span>{message}</span>
//     </div>
//   );
// }

// export default function UseSubTypeForm({ id }: Props) {
//   const t = useTranslations('typeofusemaster');
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const isEdit = Boolean(id);

//   const queryTypeId = Number(searchParams.get("typeId") || 0);

//   const [typeInfo, setTypeInfo] = useState<UseType | null>(null);
//   const [allSubTypes, setAllSubTypes] = useState<UseSubType[]>([]); // ✅ for duplicate check

 

//   const [formData, setFormData] = useState<UseSubType>({
//     subTypeOfUseId: 0,
//     typeOfUseId: queryTypeId,
//     description: "",
//     searchKey: "",
//     searchSequence: 0,
//     isActive: true,
//     status: "Active",
//   });


//   const isActive = formData.isActive ?? true;

//   const handleStatusToggle = () => {
//     setFormData((p) => ({
//       ...p,
//       isActive: !p.isActive,
//       status: p.isActive ? "Inactive" : "Active",
//     }));
//   };

//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [touched, setTouched] = useState<Record<string, boolean>>({});
//   const [submittedOnce, setSubmittedOnce] = useState(false);

//   /* ================= RULES ================= */
//   const MAX_NAME_LEN = 100;
//   const MAX_SHORTCUT_LEN = 20;

//   // English: varchar(100) => letters/numbers/spaces and . - ,
//   const EN_NAME_REGEX = /^[A-Za-z0-9 .,-]+$/;

//   // Regional: nvarchar(100) => unicode letters/numbers/spaces and . - ,
//   // const REG_NAME_REGEX = /^[\p{L}\p{N} .,-]+$/u;
//   const REG_NAME_REGEX = /^[\p{L}\p{M}\p{N} .,-]+$/u;

//   // Shortcut: letters/spaces/+/- only (no digits), max 20
//   const SHORTCUT_REGEX = /^[A-Za-z+\- ]+$/;

//   // Sanitizers
//   const sanitizeEnglishName = (v: string) =>
//     v.replace(/[^A-Za-z0-9 .,-]/g, "").slice(0, MAX_NAME_LEN);

//   // const sanitizeRegionalName = (v: string) =>
//   //   v.replace(/[^\p{L}\p{N} .,-]/gu, "").slice(0, MAX_NAME_LEN);
//   const sanitizeRegionalName = (v: string) =>
//   v.replace(/[^\p{L}\p{M}\p{N} .,-]/gu, "").slice(0, MAX_NAME_LEN);

//   const sanitizeShortcut = (v: string) =>
//     v.replace(/[^A-Za-z+\- ]/g, "").slice(0, MAX_SHORTCUT_LEN);

//   /* ================= DUPLICATE CHECK ================= */
//   const normalize = (v: string) => v.trim().toLowerCase();

//   const isDuplicateDescription = (description: string) => {
//     const n = normalize(description);
//     if (!n) return false;

//     return (allSubTypes ?? []).some((s) => {
//       const sameRecord =
//         isEdit &&
//         (s.subTypeOfUseId === formData.subTypeOfUseId ||
//           normalize(s.description ?? "") === normalize(formData.description ?? ""));

//       if (sameRecord) return false;

//       return normalize(s.description ?? "") === n;
//     });
//   };

//   /* ================= VALIDATE ================= */
//   const validate = (data: UseSubType): FieldErrors => {
//     const next: FieldErrors = {};

//     // typeOfUseId is always needed (hidden, but validate)
//     if (!data.typeOfUseId) next.typeId = t('messages.typeMissing');

//     // Regional required
//     const reg = (data.description ?? "").trim();
//     if (!reg) next.description = t('messages.subTypeNameRequired');
//     else if (reg.length > MAX_NAME_LEN)
//       next.description = t('messages.subTypeNameLabel') + ' ' + t('messages.maxLength', { count: MAX_NAME_LEN });
//     else if (!REG_NAME_REGEX.test(reg))
//       next.description = t('messages.subTypeNameLabel') + ' ' + t('messages.allowedChars');
//     else if (isDuplicateDescription(reg))
//       next.description = t('messages.duplicateSubTypeName');

//     // Shortcut required
//     const ks = (data.searchKey ?? "").trim();
//     if (!ks) next.searchKey = t('messages.searchKeyRequired');
//     else if (ks.length > MAX_SHORTCUT_LEN)
//       next.searchKey = t('messages.searchKeyLabel') + ' ' + t('messages.maxLength', { count: MAX_SHORTCUT_LEN });
//     else if (!SHORTCUT_REGEX.test(ks))
//       next.searchKey = t('messages.searchKeyLabel') + ' ' + t('messages.allowedShortcutChars');
//     else if (!/[A-Za-z]/.test(ks))
//       next.searchKey = t('messages.searchKeyLabel') + ' ' + t('messages.atLeastOneLetter');

//     // Sequence required (0 or more)
//     const n = Number(data.searchSequence);
//     if (!Number.isFinite(n) || n < 0)
//       next.searchSequence = t('messages.searchSequenceLabel') + ' ' + t('messages.sequenceNonNegative');

//     return next;
//   };

//   const showError = (field: keyof FieldErrors) =>
//     (submittedOnce || touched[field as string]) && !!errors[field];

//   const markTouched = (name: keyof FieldErrors) =>
//     setTouched((p) => ({ ...p, [name]: true }));

//   const setField = <K extends keyof UseSubType>(key: K, value: UseSubType[K]) => {
//     setFormData((p) => {
//       let nextValue: any = value;

//       if (key === "description" && typeof value === "string")
//         nextValue = sanitizeRegionalName(value);

//       if (key === "searchKey" && typeof value === "string")
//         nextValue = sanitizeShortcut(value);

//       const next = { ...p, [key]: nextValue };

//       // Live validate if touched or already submitted
//       const v = validate(next);
//       setErrors((prev) => ({ ...prev, ...v }));

//       return next;
//     });
//   };

//   /* ================= LOAD EDIT ================= */
//   useEffect(() => {
//     if (!id) return;

//     (async () => {
//       const record = await getSubTypeById(id);
//       if (!record) {
//         toast.error(t('messages.subTypeNotFound'));
//         router.back();
//         return;
//       }
//       setFormData(record);
//       setErrors({});
//       setTouched({});
//       setSubmittedOnce(false);
//     })();
//   }, [id, router]);

//   /* ================= LOAD TYPE INFO ================= */
//   useEffect(() => {
//     if (!formData.typeOfUseId) return;

//     (async () => {
//       const t = await getTypeById(formData.typeOfUseId);
//       setTypeInfo(t);
//     })();
//   }, [formData.typeOfUseId]);

//   /* ================= LOAD ALL SUBTYPES (for duplicate check) ================= */
//   useEffect(() => {
//     if (!formData.typeOfUseId) return;

//     (async () => {
//       const res = await getAllSubTypes(formData.typeOfUseId);
//       setAllSubTypes(res.items || []);
//     })();
//   }, [formData.typeOfUseId]);

//   const typeLabel = useMemo(() => typeInfo?.description || "", [typeInfo]);

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmittedOnce(true);

//     // mark all touched so all errors show
//     setTouched({
//       typeId: true,
//       description: true,
//       searchKey: true,
//       searchSequence: true,
//     });

//     const v = validate(formData);
//     setErrors(v);
//     if (Object.keys(v).length > 0) return;

//     try {
//       if (isEdit) {
//         await updateSubType({
//           id: Number(formData.subTypeOfUseId),
//           typeId: Number(formData.typeOfUseId),
//           description: formData.description,
//           searchKey: formData.searchKey ?? "",
//           searchSequence: Number(formData.searchSequence ?? 0),
//           status: formData.isActive ? "Active" : "Inactive",
//         });
//         toast.success(t('messages.subTypeUpdated'));
//       } else {
//         await createSubType({
//           typeId: Number(formData.typeOfUseId),
//           description: formData.description,
//           searchKey: formData.searchKey ?? "",
//           searchSequence: Number(formData.searchSequence ?? 0),
//           status: formData.isActive ? "Active" : "Inactive",
//         });
//         toast.success(t('messages.subTypeCreated'));
//       }

//       router.back();
//     } 
//     catch (err: any) {
//       // ✅ Handle backend errors - duplicate already caught by validation
//       const errorMsg = err?.message || "";
      
//       // If backend returns 409, set inline error instead of toast
//       if (errorMsg.includes("409") || errorMsg.toLowerCase().includes("duplicate") || errorMsg.includes("same details already")) {
//         setErrors((prev) => ({
//           ...prev,
//           description: t('messages.duplicateSubTypeName'),
//         }));
//         setTouched((prev) => ({ ...prev, description: true }));
//       } else {
//         toast.error(errorMsg || t('messages.saveFailed'));
//       }
//     }
//   };

//   return (
//     <Drawer
//       open
//       onClose={() => router.back()}
//       title={isEdit ? t('subtype.edit') : t('subtype.add')}
//       description={typeLabel ? t('subtype.forType', { type: typeLabel, defaultValue: `For Type: ${typeLabel}` }) : t('subtype.addSubtitle', { defaultValue: 'Create a new Sub-Type' })}
//       width="md"
//       footer={
//         <>
//           <CancelButton  label={t('buttons.cancel')} onClick={() => router.back()} />
//           <SaveButton  label={isEdit ? t('buttons.edit', { defaultValue: 'Update' }) : t('buttons.save')} type="submit" form="use-subtype-form" />
//         </>
//       }
//     >
//       <form id="use-subtype-form" onSubmit={handleSubmit} className="space-y-4">
//         {isEdit && <input type="hidden" name="subTypeOfUseId" value={formData.subTypeOfUseId} />}
//         <input type="hidden" name="typeOfUseId" value={formData.typeOfUseId} />

//         {/* ================= ACTIVE STATUS (EDIT ONLY) ================= */}
//         {isEdit && (
//           <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
//             <div className="flex items-center justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
//                   <CheckCircle2 size={20} />
//                 </div>
//                 <div>
//                   <div className="text-base font-semibold text-slate-900">{t('subtype.fields.status')}</div>
//                   <div className="text-sm text-slate-500">
//                     {t('subtype.title')} {t('status.is', { defaultValue: 'is' })} <span className={isActive ? "text-emerald-700 font-medium" : "text-slate-600 font-medium"}>{isActive ? t('status.active') : t('status.inactive')}</span>
//                   </div>
//                 </div>
//               </div>
//               <ToggleSwitch checked={isActive} onChange={handleStatusToggle} showPopup={false} />
//             </div>
//           </div>
//         )}

//         <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
//           {/* Sub-Type Name */}
//           <div>
//             <Input
//               label={t('messages.subTypeNameLabel')}
//               required
//               name="description"
//               value={formData.description || ""}
//               onChange={(e) => setField("description", e.target.value)}
//               onBlur={() => markTouched("description")}
//               placeholder={t('messages.subTypeNameLabel')}
//               fullWidth
//               maxLength={100}
//             />
//             <ErrorBox message={errors.description} visible={showError("description")} />
//           </div>

//           {/* Shortcut + Sequence in ONE ROW */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Search Key */}
//             <div className="flex flex-col">
//               <Input
//                 label={t('messages.searchKeyLabel')}
//                 required
//                 name="searchKey"
//                 value={formData.searchKey || ""}
//                 onChange={(e) => setField("searchKey", e.target.value)}
//                 onBlur={() => markTouched("searchKey")}
//                 placeholder={t('subtype.placeholders.shortcutKey')}
//                 fullWidth
//                 maxLength={20}
//               />
//               <ErrorBox
//                 message={errors.searchKey}
//                 visible={showError("searchKey")}
//               />
//             </div>

//             {/* Sequence */}
//             <div className="flex flex-col">
//               <Input
//                 label={t('messages.searchSequenceLabel')}
//                 name="searchSequence"
//                 required
//                 type="number"
//                 min={0}
//                 value={String(formData.searchSequence ?? 0)}
//                 onChange={(e) =>
//                   setField("searchSequence", e.target.value === "" ? 0 : Number(e.target.value))
//                 }
//                 onBlur={() => markTouched("searchSequence")}
//                 placeholder="0"
//                 fullWidth
//               />
//               <ErrorBox
//                 message={errors.searchSequence}
//                 visible={showError("searchSequence")}
//               />
//             </div>
//           </div>
//         </div>
//       </form>
//     </Drawer>
//   );
// }


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

interface Props {
  id: string | null;
  initialData?: UseSubType | null; // Server-side fetched data for edit mode
  typeInfo?: UseType | null; // Server-side fetched type info
  allSubTypes?: UseSubType[]; // Server-side fetched subtypes for duplicate check
}

type FieldErrors = {
  typeId?: string;
  description?: string;
  searchKey?: string;
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
      typeOfUseId: initialData?.typeOfUseId || queryTypeId,
      description: "",
      searchKey: "",
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

  /* ================= RULES ================= */
  const MAX_NAME_LEN = 100;
  const MAX_SHORTCUT_LEN = 20;

  const EN_NAME_REGEX = /^[A-Za-z0-9 .,-]+$/;
  const REG_NAME_REGEX = /^[\p{L}\p{M}\p{N} .,-]+$/u;
  const SHORTCUT_REGEX = /^[A-Za-z+\- ]+$/;

  const sanitizeEnglishName = (v: string) =>
    v.replace(/[^A-Za-z0-9 .,-]/g, "").slice(0, MAX_NAME_LEN);

  const sanitizeRegionalName = (v: string) =>
    v.replace(/[^\p{L}\p{M}\p{N} .,-]/gu, "").slice(0, MAX_NAME_LEN);

  const sanitizeShortcut = (v: string) =>
    v.replace(/[^A-Za-z+\- ]/g, "").slice(0, MAX_SHORTCUT_LEN);

  /* ================= DUPLICATE CHECK ================= */
  const normalize = (v: string) => v.trim().toLowerCase();

  const isDuplicateDescription = (description: string) => {
    const n = normalize(description);
    if (!n) return false;

    return (allSubTypes ?? []).some((s) => {
      const sameRecord =
        isEdit &&
        (s.subTypeOfUseId === formData.subTypeOfUseId ||
          normalize(s.description ?? "") === normalize(formData.description ?? ""));

      if (sameRecord) return false;

      return normalize(s.description ?? "") === n;
    });
  };

  /* ================= VALIDATE ================= */
  const validate = (data: UseSubType): FieldErrors => {
    const next: FieldErrors = {};

    if (!data.typeOfUseId) next.typeId = t("messages.typeMissing");

    const reg = (data.description ?? "").trim();
    if (!reg) next.description = t("messages.subTypeNameRequired");
    else if (reg.length > MAX_NAME_LEN)
      next.description =
        t("messages.subTypeNameLabel") +
        " " +
        t("messages.maxLength", { count: MAX_NAME_LEN });
    else if (!REG_NAME_REGEX.test(reg))
      next.description =
        t("messages.subTypeNameLabel") + " " + t("messages.allowedChars");
    else if (isDuplicateDescription(reg))
      next.description = t("messages.duplicateSubTypeName");

    const ks = (data.searchKey ?? "").trim();
    if (!ks) next.searchKey = t("messages.searchKeyRequired");
    else if (ks.length > MAX_SHORTCUT_LEN)
      next.searchKey =
        t("messages.searchKeyLabel") +
        " " +
        t("messages.maxLength", { count: MAX_SHORTCUT_LEN });
    else if (!SHORTCUT_REGEX.test(ks))
      next.searchKey =
        t("messages.searchKeyLabel") + " " + t("messages.allowedShortcutChars");
    else if (!/[A-Za-z]/.test(ks))
      next.searchKey =
        t("messages.searchKeyLabel") + " " + t("messages.atLeastOneLetter");

    const n = Number(data.searchSequence);
    if (!Number.isFinite(n) || n < 0)
      next.searchSequence =
        t("messages.searchSequenceLabel") +
        " " +
        t("messages.sequenceNonNegative");

    return next;
  };

  const showError = (field: keyof FieldErrors) =>
    (submittedOnce || touched[field as string]) && !!errors[field];

  const markTouched = (name: keyof FieldErrors) =>
    setTouched((p) => ({ ...p, [name]: true }));

  const setField = <K extends keyof UseSubType>(key: K, value: UseSubType[K]) => {
    setFormData((p) => {
      let nextValue: any = value;

      if (key === "description" && typeof value === "string")
        nextValue = sanitizeRegionalName(value);

      if (key === "searchKey" && typeof value === "string")
        nextValue = sanitizeShortcut(value);

      const next = { ...p, [key]: nextValue };

      const v = validate(next);
      setErrors((prev) => ({ ...prev, ...v }));

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
      searchKey: true,
      searchSequence: true,
    });

    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      if (isEdit) {
        await updateSubType({
          id: Number(formData.subTypeOfUseId),
          typeId: Number(formData.typeOfUseId),
          description: formData.description,
          searchKey: formData.searchKey ?? "",
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t("messages.subTypeUpdated"));
      } else {
        await createSubType({
          typeId: Number(formData.typeOfUseId),
          description: formData.description,
          searchKey: formData.searchKey ?? "",
          searchSequence: Number(formData.searchSequence ?? 0),
          status: formData.isActive ? "Active" : "Inactive",
        });
        toast.success(t("messages.subTypeCreated"));
      }

      router.back();
    } catch (err: any) {
      const errorMsg = err?.message || "";

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
            <div className="flex flex-col">
              <Input
                label={t("messages.searchKeyLabel")}
                required
                name="searchKey"
                value={formData.searchKey || ""}
                onChange={(e) => setField("searchKey", e.target.value)}
                onBlur={() => markTouched("searchKey")}
                placeholder={t("subtype.placeholders.shortcutKey")}
                fullWidth
                maxLength={20}
              />
              <ValidationMessage
                message={errors.searchKey}
                visible={showError("searchKey")}
              />
            </div>

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