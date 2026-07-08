"use client";

import React, { useMemo, useState, useTransition, useEffect } from "react";
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
  OWNERNAME_REGEX,
  limitTwoDigitNumber,
  MOBILE_10_REGEX,
  EMAIL_REGEX,
  limitSingleAtEmail
} from "@/lib/utils/validation-rules";
import type { ApartmentQCDetail } from "@/types/apartmentQC.types";

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

type PropertyData = Partial<ApartmentQCDetail>;

interface PropertyTypeOptionSource {
  id: string | number;
  code?: string;
  propertyDescription?: string;
}

type OldPropertyData = Pick<
  ApartmentQCDetail,
  | "oldRV"
  | "oldTotalTax"
  | "oldConstructionArea"
  | "oldUseType"
  | "oldConstructionType"
  | "oldConstructionYear"
  | "oldCSN"
>;

interface OldPropertyFetchResult {
  success: boolean;
  data?: OldPropertyData | null;
  message?: string;
  error?: string;
}

interface PropertyBasicFormProps {
  propertyData?: PropertyData;
  propertyTypes?: PropertyTypeOptionSource[];
  oldPropertyFetchResult?: OldPropertyFetchResult | null;
}

type OldFieldState = {
  oldRV: string;
  oldTax: string;
  oldArea: string;
  oldUseType: string;
  oldConstructionType: string;
  oldConstructionYear: string;
  oldCSN: string;
};

const hasAnyOldPropertyData = (data?: OldPropertyData | null) => {
  if (!data) return false;

  const hasOldRV = data.oldRV != null && data.oldRV !== 0;
  const hasOldTax = data.oldTotalTax != null && data.oldTotalTax !== 0;
  const hasOldArea = data.oldConstructionArea != null && data.oldConstructionArea !== 0;
  const hasOldUseType = Boolean(data.oldUseType && data.oldUseType.trim() !== "");
  const hasOldConType = Boolean(data.oldConstructionType && data.oldConstructionType.trim() !== "");
  const hasOldConYear = Boolean(data.oldConstructionYear && data.oldConstructionYear.trim() !== "");
  const hasOldCSN = Boolean(data.oldCSN && data.oldCSN.trim() !== "");

  return hasOldRV || hasOldTax || hasOldArea || hasOldUseType || hasOldConType || hasOldConYear || hasOldCSN;
};

const mapOldPropertyFields = (data?: OldPropertyData | null): OldFieldState => ({
  oldRV: data?.oldRV != null ? String(data.oldRV) : "",
  oldTax: data?.oldTotalTax != null ? String(data.oldTotalTax) : "",
  oldArea: data?.oldConstructionArea != null ? String(data.oldConstructionArea) : "",
  oldUseType: data?.oldUseType || "",
  oldConstructionType: data?.oldConstructionType || "",
  oldConstructionYear: data?.oldConstructionYear || "",
  oldCSN: data?.oldCSN || "",
});

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

export default function Propertybasicform({ propertyData, propertyTypes, oldPropertyFetchResult }: PropertyBasicFormProps) {
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
    propertyTypeId: String(propertyData?.propertyType || ""),
    bhk: String(propertyData?.bhk || ""),
    mobileNo: propertyData?.mobileNo || "",
    emailId: propertyData?.emailId || "",
    flatOrShopName: propertyData?.flatOrShopName || "",
    wingName: String(propertyData?.wing || ""),
    flatOrShopNo: propertyData?.flatOrShopNo || "",
    oldPropertyNo: propertyData?.oldPropertyNo || "",
    remark: String(propertyData?.remark || ""),
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

  const propertyTypeOptions = propertyTypes?.map((p) => ({
    value: String(p.id),
    label: p.propertyDescription || p.code || "",
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

  const refreshToken = searchParams.get("_refresh");
  const refreshedOldPropertyNo = searchParams.get("oldPropertyNo") || "";

  const oldPropertyFields = useMemo<OldFieldState>(() => {
    if (!oldPropertyFetchResult) {
      return {
        oldRV: formData.oldRV,
        oldTax: formData.oldTax,
        oldArea: formData.oldArea,
        oldUseType: formData.oldUseType,
        oldConstructionType: formData.oldConstructionType,
        oldConstructionYear: formData.oldConstructionYear,
        oldCSN: formData.oldCSN,
      };
    }

    if (oldPropertyFetchResult.success && oldPropertyFetchResult.data && hasAnyOldPropertyData(oldPropertyFetchResult.data)) {
      return mapOldPropertyFields(oldPropertyFetchResult.data);
    }

    return mapOldPropertyFields(null);
  }, [oldPropertyFetchResult, formData.oldRV, formData.oldTax, formData.oldArea, formData.oldUseType, formData.oldConstructionType, formData.oldConstructionYear, formData.oldCSN]);

  const handleOldPropertyRefresh = async () => {
    if (!formData.oldPropertyNo) return;

    // Push the updated searchParams to trigger server-side fetch in page.tsx
    const params = new URLSearchParams(searchParams.toString());
    params.set("oldPropertyNo", formData.oldPropertyNo);
    // Add a unique timestamp so Next.js always re-fetches even if the property number is the same
    params.set("_refresh", Date.now().toString());

    router.push(`${pathname}?${params.toString()}`);
  };
  // 1. Sync Stale URLs
  // We use a ref to track which property we've already synced. This prevents the effect 
  // from running on every render and accidentally undoing a user's manual search.
  const syncedPropertyIdRef = React.useRef<number | string | null>(null);

  useEffect(() => {
    const propertyId = propertyData?.id;
    if (!propertyId || syncedPropertyIdRef.current === propertyId) return;

    syncedPropertyIdRef.current = propertyId;

    const initialOldNo = propertyData.oldPropertyNo || "";
    const currentUrlOldNo = searchParams.get("oldPropertyNo") || "";

    if (currentUrlOldNo !== initialOldNo) {
      const params = new URLSearchParams(searchParams.toString());
      if (initialOldNo) params.set("oldPropertyNo", initialOldNo);
      else params.delete("oldPropertyNo");

      params.delete("_refresh");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [propertyData, pathname, router, searchParams]);

  // 2. Handle Toast Notifications
  // We use a ref to remember the last processed token. This prevents the toast 
  // from firing multiple times if the component re-renders for other reasons (like typing).
  const processedRefreshTokenRef = React.useRef<string | null>(refreshToken);

  useEffect(() => {
    if (!oldPropertyFetchResult || !refreshToken || processedRefreshTokenRef.current === refreshToken) {
      return;
    }

    processedRefreshTokenRef.current = refreshToken;

    if (oldPropertyFetchResult.success && oldPropertyFetchResult.data) {
      if (!hasAnyOldPropertyData(oldPropertyFetchResult.data)) {
        const fallbackMsg = `No old-property record found for OldPropertyNo '${refreshedOldPropertyNo}'.`;
        const errorMsg = t.has('messages.oldPropertyNotFound')
          ? t('messages.oldPropertyNotFound', { oldPropertyNo: refreshedOldPropertyNo })
          : fallbackMsg;
        toastError(errorMsg);
      } else {
        const successMsg = t.has('messages.oldPropertyDataRefreshed')
          ? t('messages.oldPropertyDataRefreshed')
          : "Old property data refreshed";
        toastSuccess(oldPropertyFetchResult.message || successMsg);
      }
    } else {
      const defaultErrorMsg = t.has('messages.noOldPropertyDataFound')
        ? t('messages.noOldPropertyDataFound')
        : "No old property data found";
      toastError(oldPropertyFetchResult.error || defaultErrorMsg);
    }
  }, [oldPropertyFetchResult, refreshToken, refreshedOldPropertyNo, toastError, toastSuccess, t]);

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const propertyId = propertyData?.id;
    if (!propertyId) {
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

          const result = await updateBasicDetailsAction(propertyId, payload);
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
              onChange={(v) => handleFieldChange("ownerName", v.replace(OWNERNAME_REGEX, ""))}
              required
            
              placeholder={t('basicInfo.fields.ownerName.placeholder', { fallback: "" })}
              error={errors.ownerName}
              showError={true}
            />
            <CompactField
              label={t('basicInfo.fields.occupierName.label', { fallback: "Occupier Name *" })}
              value={formData.occupierName}
              onChange={(v) => handleFieldChange("occupierName", v.replace(OWNERNAME_REGEX, ""))}
              required
            
              placeholder={t('basicInfo.fields.occupierName.placeholder', { fallback: "" })}
              error={errors.occupierName}
              showError={true}
            />
            <CompactField
              label={t('basicInfo.fields.renterName.label', { fallback: "Renter Name" })}
              value={formData.renterName}
              onChange={(v) => handleFieldChange("renterName", v.replace(OWNERNAME_REGEX, ""))}
            
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
              onChange={(v) => handleFieldChange("flatOrShopName", v.replace(OWNERNAME_REGEX, ""))}
              placeholder={t('basicInfo.fields.flatOrShopName.placeholder', { fallback: "" })}
            />
            <CompactField
              label={t('basicInfo.fields.wingName.label', { fallback: "Wing" })}
              value={formData.wingName}
              onChange={(v) => handleFieldChange("wingName", v)}
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
              onClick={handleOldPropertyRefresh}
              maxLength={50}
              placeholder={t('basicInfo.fields.oldPropertyNo.placeholder', { fallback: "" })}
            />

            <ReadOnlyField label={t('basicInfo.fields.remark.label', { fallback: "Remark" })} value={formData.remark} />
            <ReadOnlyField label={t('basicInfo.fields.oldRV.label', { fallback: "Old RV" })} value={oldPropertyFields.oldRV} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.newRV.label', { fallback: "New RV" })} value={formData.newRV} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldTax.label', { fallback: "Old Tax" })} value={oldPropertyFields.oldTax} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.newTax.label', { fallback: "New Tax" })} value={formData.newTax} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldArea.label', { fallback: "Old Area (sq.mtr)" })} value={oldPropertyFields.oldArea} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.newArea.label', { fallback: "New Area (sq.mtr)" })} value={formData.newArea} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldUseType.label', { fallback: "Old Use Type" })} value={oldPropertyFields.oldUseType} />
            <ReadOnlyField label={t('basicInfo.fields.oldConstructionType.label', { fallback: "Old Construction Type" })} value={oldPropertyFields.oldConstructionType} />
            <ReadOnlyField label={t('basicInfo.fields.oldCSN.label', { fallback: "Old CSN" })} value={oldPropertyFields.oldCSN} type="number" />
            <ReadOnlyField label={t('basicInfo.fields.oldConstructionYear.label', { fallback: "Old Construction Year" })} value={oldPropertyFields.oldConstructionYear} type="number" />
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
