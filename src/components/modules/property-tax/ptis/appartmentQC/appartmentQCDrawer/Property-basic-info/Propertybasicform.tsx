"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input, Select, ValidationMessage } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import { updateBasicDetailsAction } from "@/app/[locale]/property-tax/ptis/appartmentQC/action";
import { useToast } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { useTranslations } from "next-intl";
import { UpdateButton } from "@/components/common/ActionButtons";
import { EditableInputWithRefresh } from "@/components/modules/property-tax/ptis/appartmentQC/PropertyEditDrawerInputs";
import {
  NAME_ONLY_SANITIZE,
  limitTwoDigitNumber,
  MOBILE_10_REGEX,
  EMAIL_REGEX,
  limitSingleAtEmail
} from "@/lib/utils/validation-rules";

// ─── Compact Form Field Component ─────────────────────────────────────────────
interface CompactFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showError?: boolean;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
}
// ─── Compact Select Field Component ───────────────────────────────────────────
interface CompactSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

// ─── Read-only Field Component ────────────────────────────────────────────────
interface ReadOnlyFieldProps {
  label: string;
  value: string;
  type?: string;
}

const CompactField = ({
  label,
  value,
  onChange,
  error,
  showError = false,
  onBlur,
  required = false,
  placeholder,
  type = "text",
  maxLength,
  readOnly = false,
}: CompactFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    onChange(newValue);
  };

  return (
    <div className="flex flex-col">
      <Input
        naked={false}
        label={label}
        required={required}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={readOnly}
        className={cn(
          readOnly && "bg-gray-100 cursor-not-allowed",
          error && showError && "border-red-500"
        )}
      />
      <ValidationMessage message={error} visible={showError && !!error} type="error" />
    </div>
  );
};
CompactField.displayName = "CompactField";

const CompactSelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  required = false,
}: CompactSelectFieldProps) => (
  <Select
    label={label}
    required={required}
    value={value}
    onChange={(_e, val) => onChange(val)}
    options={options}
    placeholder={placeholder}
  />
);
CompactSelectField.displayName = "CompactSelectField";

const ReadOnlyField = ({ label, value, type = "text" }: ReadOnlyFieldProps) => (
  <div className="flex flex-col">
    <label className="mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      readOnly
      aria-label={label}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
    />
  </div>
);
ReadOnlyField.displayName = "ReadOnlyField";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Propertybasicform({ propertyData, propertyTypes, oldPropertyFetchResult }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();
  const { confirm } = useConfirm();
  const tQ = useTranslations("quickDataEntry");
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState(() => ({
    ownerName: propertyData?.ownerName || "",
    occupierName: propertyData?.occupierName || "",
    renterName: propertyData?.renterName || "",
    propertyTypeId: String((propertyData as any)?.propertyType || ""),
    bhk: String((propertyData as any)?.bhk || ""),
    mobileNo: propertyData?.mobileNo || "",
    emailId: propertyData?.emailId || "",
    flatOrShopName: propertyData?.flatOrShopName || "",
    wingName: String((propertyData as any)?.wing || ""),
    flatOrShopNo: propertyData?.flatOrShopNo || "",
    oldPropertyNo: propertyData?.oldPropertyNo || "",
    remark: String((propertyData as any)?.remark || ""),
    oldRV: String(propertyData?.oldRV || ""),
    newRV: String(propertyData?.rVorCVValue || ""),
    oldTax: String(propertyData?.oldTotalTax || ""),
    newTax: String(propertyData?.newTaxTotal || ""),
    oldArea: String(propertyData?.oldConstructionArea || ""),
    newArea: String(propertyData?.carpetASqMtr || propertyData?.builtupASqMtr || ""),
    oldUseType: propertyData?.oldUseType || "",
    oldConstructionType: propertyData?.oldConstructionType || "",
    oldCSN: propertyData?.oldCSN || "",
    oldConstructionYear: propertyData?.oldConstructionYear || "",
  }));

  const t = useTranslations("appartmentQC");

  const propertyTypeOptions = propertyTypes?.map((p: any) => ({
    value: String(p.id),
    label: p.propertyDescription || p.code,
  })) || [];

  const handleFieldChange = (field: string, value: string) => {
    setHasChanges(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePropertyTypeChange = (value: string) => {
    setHasChanges(true);
    handleFieldChange("propertyTypeId", value);
  };

  const clearOldPropertyFields = () => {
    setFormData(prev => ({
      ...prev,
      oldRV: "",
      oldTax: "",
      oldArea: "",
      oldUseType: "",
      oldConstructionType: "",
      oldConstructionYear: "",
      oldCSN: "",
    }));
  };

  const handleOldPropertyRefresh = async () => {
    if (!formData.oldPropertyNo) return;

    // Push the updated searchParams to trigger server-side fetch in page.tsx
    const params = new URLSearchParams(searchParams.toString());
    params.set("oldPropertyNo", formData.oldPropertyNo);
    // Add a unique timestamp so Next.js always re-fetches even if the property number is the same
    params.set("_refresh", Date.now().toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!oldPropertyFetchResult) return;

    if (oldPropertyFetchResult.success && oldPropertyFetchResult.data) {
      const d = oldPropertyFetchResult.data;

      const hasOldRV = d.oldRV != null && d.oldRV !== 0;
      const hasOldTax = d.oldTotalTax != null && d.oldTotalTax !== 0;
      const hasOldArea = d.oldConstructionArea != null && d.oldConstructionArea !== 0;
      const hasOldUseType = d.oldUseType && d.oldUseType.trim() !== "";
      const hasOldConType = d.oldConstructionType && d.oldConstructionType.trim() !== "";
      const hasOldConYear = d.oldConstructionYear && d.oldConstructionYear.trim() !== "";
      const hasOldCSN = d.oldCSN && d.oldCSN.trim() !== "";

      const hasAnyData =
        hasOldRV ||
        hasOldTax ||
        hasOldArea ||
        hasOldUseType ||
        hasOldConType ||
        hasOldConYear ||
        hasOldCSN;

      if (!hasAnyData) {
        clearOldPropertyFields();
        toastError(`No old property data found for property no. "${formData.oldPropertyNo}"`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        oldRV: d.oldRV != null ? String(d.oldRV) : "",
        oldTax: d.oldTotalTax != null ? String(d.oldTotalTax) : "",
        oldArea: d.oldConstructionArea != null ? String(d.oldConstructionArea) : "",
        oldUseType: d.oldUseType || "",
        oldConstructionType: d.oldConstructionType || "",
        oldConstructionYear: d.oldConstructionYear || "",
        oldCSN: d.oldCSN || "",
      }));
      toastSuccess(oldPropertyFetchResult.message || "Old property data refreshed");
    } else {
      clearOldPropertyFields();
      toastError(oldPropertyFetchResult.error || "No old property data found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldPropertyFetchResult]);

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!propertyData?.id) {
      toastError("Property ID not found.");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!formData.ownerName?.trim()) newErrors.ownerName = t('basicInfo.validation.ownerNameRequired', { fallback: "Owner name is required" });
    if (!formData.occupierName?.trim()) newErrors.occupierName = t('basicInfo.validation.occupierNameRequired', { fallback: "Occupier name is required" });
    if (!formData.flatOrShopNo?.trim()) newErrors.flatOrShopNo = t('basicInfo.validation.flatOrShopNoRequired', { fallback: "Flat/Shop No. is required" });

    if (formData.mobileNo && formData.mobileNo.trim().length > 0) {
      if (!MOBILE_10_REGEX.test(formData.mobileNo)) {
        newErrors.mobileNo = t('basicInfo.validation.invalidMobile', { fallback: "Valid 10-digit mobile number required (starting with 6-9)" });
      }
    }

    if (formData.emailId && formData.emailId.trim().length > 0) {
      if (!EMAIL_REGEX.test(formData.emailId)) {
        newErrors.emailId = t('basicInfo.validation.invalidEmail', { fallback: "Invalid email format" });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    confirm({
      variant: "update",
      title: tQ('property.updateConfirmTitle'),
      description: tQ('property.updateConfirmText'),
      confirmText: tQ('property.updateConfirmButton'),
      onConfirm: async () => {
        startTransition(async () => {
          const payload = {
            ownerName: formData.ownerName,
            occupierName: formData.occupierName,
            renterName: formData.renterName,
            propertyType: formData.propertyTypeId ? Number(formData.propertyTypeId) : undefined,
            bhk: formData.bhk,
            mobileNo: formData.mobileNo,
            emailId: formData.emailId,
            wing: formData.wingName,
            flatOrShopNo: formData.flatOrShopNo,
            flatOrShopName: formData.flatOrShopName,
            oldPropertyNo: formData.oldPropertyNo,
          };

          const result = await updateBasicDetailsAction(propertyData.id, payload);
          if (result.success) {
            toastSuccess(result.message || "Updated successfully");
            setHasChanges(false);
          } else {
            toastError(result.error || "Failed to update");
          }
        });
      }
    });
  };

  return (
    <form noValidate onSubmit={handleUpdate} className="flex flex-col gap-4 p-4">
      <div className="border border-blue-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          {t('basicInfo.title', { fallback: "Basic Information" })}
        </div>

        <div className="p-4 bg-white">
          <div className="grid grid-cols-4 gap-3 mb-3">
            <CompactField
              label={t('basicInfo.fields.ownerName.label', { fallback: "Owner Name *" })}
              value={formData.ownerName}
              onChange={(v) => handleFieldChange("ownerName", v.replace(NAME_ONLY_SANITIZE, ""))}
              required
              maxLength={100}
              placeholder={t('basicInfo.fields.ownerName.placeholder', { fallback: "" })}
              error={errors.ownerName}
              showError={true}
            />
            <CompactField
              label={t('basicInfo.fields.occupierName.label', { fallback: "Occupier Name *" })}
              value={formData.occupierName}
              onChange={(v) => handleFieldChange("occupierName", v.replace(NAME_ONLY_SANITIZE, ""))}
              required
              maxLength={100}
              placeholder={t('basicInfo.fields.occupierName.placeholder', { fallback: "" })}
              error={errors.occupierName}
              showError={true}
            />
            <CompactField
              label={t('basicInfo.fields.renterName.label', { fallback: "Renter Name" })}
              value={formData.renterName}
              onChange={(v) => handleFieldChange("renterName", v.replace(NAME_ONLY_SANITIZE, ""))}
              maxLength={100}
              placeholder={t('basicInfo.fields.renterName.placeholder', { fallback: "" })}
            />
            <CompactSelectField
              label={t('basicInfo.fields.propertyDescription.label', { fallback: "Property Description" })}
              value={formData.propertyTypeId}
              onChange={handlePropertyTypeChange}
              options={propertyTypeOptions}
              placeholder={t('basicInfo.fields.propertyDescription.placeholder', { fallback: "Select" })}
            />

            <CompactField
              label={t('basicInfo.fields.bhk.label', { fallback: "BHK" })}
              value={formData.bhk}
              onChange={(v) => handleFieldChange("bhk", limitTwoDigitNumber(v))}
              maxLength={2}
              placeholder={t('basicInfo.fields.bhk.placeholder', { fallback: "" })}
            />
            <CompactField
              label={t('basicInfo.fields.mobileNo.label', { fallback: "Mobile" })}
              value={formData.mobileNo}
              onChange={(v) => handleFieldChange("mobileNo", v.replace(/\D/g, ''))}
              maxLength={10}
              placeholder={t('basicInfo.fields.mobileNo.placeholder', { fallback: "" })}
              error={errors.mobileNo}
              showError={true}
            />
            <CompactField
              label={t('basicInfo.fields.emailId.label', { fallback: "Email ID" })}
              value={formData.emailId}
              onChange={(v) => handleFieldChange("emailId", limitSingleAtEmail(v))}
              type="email"
              maxLength={100}
              placeholder={t('basicInfo.fields.emailId.placeholder', { fallback: "" })}
              error={errors.emailId}
              showError={true}
            />
            <CompactField
              label={t('basicInfo.fields.flatOrShopName.label', { fallback: "Shop Name" })}
              value={formData.flatOrShopName}
              onChange={(v) => handleFieldChange("flatOrShopName", v.replace(NAME_ONLY_SANITIZE, ""))}
              maxLength={100}
              placeholder={t('basicInfo.fields.flatOrShopName.placeholder', { fallback: "" })}
            />
            <CompactField
              label={t('basicInfo.fields.wingName.label', { fallback: "Wing" })}
              value={formData.wingName}
              onChange={(v) => handleFieldChange("wingName", v.replace(/\D/g, ''))}
              maxLength={20}
              placeholder={t('basicInfo.fields.wingName.placeholder', { fallback: "" })}
            />
            <CompactField
              label={t('basicInfo.fields.flatOrShopNo.label', { fallback: "Flat/Shop No. *" })}
              value={formData.flatOrShopNo}
              onChange={(v) => handleFieldChange("flatOrShopNo", v)}
              required
              maxLength={50}
              placeholder={t('basicInfo.fields.flatOrShopNo.placeholder', { fallback: "" })}
              error={errors.flatOrShopNo}
              showError={true}
            />
            <EditableInputWithRefresh
              label={t('basicInfo.fields.oldPropertyNo.label', { fallback: "Old Property No." })}
              value={formData.oldPropertyNo}
              onChange={(v) => handleFieldChange("oldPropertyNo", v)}
              onRefresh={handleOldPropertyRefresh}
              maxLength={50}
              placeholder={t('basicInfo.fields.oldPropertyNo.placeholder', { fallback: "" })}
            />

            <ReadOnlyField label={t('basicInfo.fields.remark.label', { fallback: "Remark" })} value={formData.remark} />
            <ReadOnlyField label={t('basicInfo.fields.oldRV.label', { fallback: "Old RV" })} value={formData.oldRV} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.newRV.label', { fallback: "New RV" })} value={formData.newRV} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldTax.label', { fallback: "Old Tax" })} value={formData.oldTax} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.newTax.label', { fallback: "New Tax" })} value={formData.newTax} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldArea.label', { fallback: "Old Area (sq.mtr)" })} value={formData.oldArea} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.newArea.label', { fallback: "New Area (sq.mtr)" })} value={formData.newArea} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldUseType.label', { fallback: "Old Use Type" })} value={formData.oldUseType} />
            <ReadOnlyField label={t('basicInfo.fields.oldConstructionType.label', { fallback: "Old Construction Type" })} value={formData.oldConstructionType} />
            <ReadOnlyField label={t('basicInfo.fields.oldCSN.label', { fallback: "Old CSN" })} value={formData.oldCSN} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldConstructionYear.label', { fallback: "Old Construction Year" })} value={formData.oldConstructionYear} type="number" />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <UpdateButton
              label={isPending ? tQ('footer.saving', { fallback: "Saving..." }) : tQ('commonbuttonmessages.UpdateChanges', { fallback: "Update Changes" })}
              type="submit"
              isLoading={isPending}
              disabled={isPending || !hasChanges}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
