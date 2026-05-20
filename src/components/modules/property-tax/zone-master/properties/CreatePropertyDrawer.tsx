"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useTransition, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { Select, Option, Input, ToggleSwitch, CancelButton, SaveButton, ValidationMessage } from "@/components/common";
import { WardItem } from "@/types/wardMaster.types";
import { PropertyType } from "@/types/property-type.types";
import { PropertyCategory } from "@/types/property-category.types";
import { TaxZone } from "@/types/taxzoning.types";
import { PropertyRangeCreatePayload } from "@/types/property-range.types";
import { createPropertyRangeAction } from "@/app/[locale]/property-tax/zone-master/property.actions";

interface Props {
  isOpen: boolean;
  selectedWard: WardItem | null;
  propertyTypes: PropertyType[];
  propertyCategories: PropertyCategory[];
  taxZones: TaxZone[];
  /** Next available property number for auto-population (SSR fetched) */
  nextPropertyNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  propertyTypeId: string;
  categoryId: string;
  taxZoneId: string;
  propertyNo: string;
  ownerName: string;
  isBulkCreate: boolean;
  fromPropertyNo: string;
  toPropertyNo: string;
}

interface FormErrors {
  propertyTypeId?: string;
  categoryId?: string;
  taxZoneId?: string;
  propertyNo?: string;
  ownerName?: string;
  fromPropertyNo?: string;
  toPropertyNo?: string;
}

export default function CreatePropertyDrawer({
  isOpen,
  selectedWard,
  propertyTypes,
  propertyCategories,
  taxZones,
  nextPropertyNumber,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("zoneMaster");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<FormData>({
    propertyTypeId: "",
    categoryId: "",
    taxZoneId: "",
    propertyNo: "",
    ownerName: "",
    isBulkCreate: false,
    fromPropertyNo: "",
    toPropertyNo: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Track if form was initialized with next property number
  const initializedRef = useRef(false);

  // Pre-populate property number fields when drawer opens (SSR data)
  useEffect(() => {
    if (isOpen && nextPropertyNumber && !initializedRef.current) {
      setFormData((prev) => ({
        ...prev,
        propertyNo: prev.isBulkCreate ? "" : nextPropertyNumber,
        fromPropertyNo: prev.isBulkCreate ? nextPropertyNumber : "",
      }));
      initializedRef.current = true;
    }
    
    // Reset initialization flag when drawer closes
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen, nextPropertyNumber]);

  // Property type options
  const propertyTypeOptions: Option[] = useMemo(() => {
    return propertyTypes.map((pt) => ({
      value: String(pt.id),
      label: pt.propertyDescription || pt.type,
    }));
  }, [propertyTypes]);

  // Category options
  const categoryOptions: Option[] = useMemo(() => {
    return propertyCategories.map((c) => ({
      value: String(c.id),
      label: c.propertyCategoryName,
    }));
  }, [propertyCategories]);

  // Tax zone options
  const taxZoneOptions: Option[] = useMemo(() => {
    return taxZones.map((z) => ({
      value: String(z.id),
      label: `${z.taxZoneNo}${z.taxZoneType ? ` - ${z.taxZoneType}` : ""}`,
    }));
  }, [taxZones]);

  // Form field handlers
  const handleFieldChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (typeof value === "string" && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBulkToggle = useCallback((checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isBulkCreate: checked,
      // Pre-populate the appropriate field based on mode
      propertyNo: checked ? "" : nextPropertyNumber,
      fromPropertyNo: checked ? nextPropertyNumber : "",
      toPropertyNo: "",
    }));
    setErrors({});
  }, [nextPropertyNumber]);

  // Calculate property count for bulk mode indicator
  const bulkPropertyCount = useMemo(() => {
    if (!formData.isBulkCreate || !formData.fromPropertyNo || !formData.toPropertyNo) {
      return null;
    }
    const from = parseInt(formData.fromPropertyNo, 10);
    const to = parseInt(formData.toPropertyNo, 10);
    if (isNaN(from) || isNaN(to) || from >= to) {
      return null;
    }
    return to - from + 1;
  }, [formData.isBulkCreate, formData.fromPropertyNo, formData.toPropertyNo]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.propertyTypeId) {
      newErrors.propertyTypeId = t("createProperty.errors.propertyTypeRequired");
    }

    if (!formData.categoryId) {
      newErrors.categoryId = t("createProperty.errors.categoryRequired");
    }

    if (!formData.taxZoneId) {
      newErrors.taxZoneId = t("createProperty.errors.taxZoneRequired");
    }

    if (!formData.ownerName || !formData.ownerName.trim()) {
      newErrors.ownerName = t("createProperty.errors.ownerNameRequired");
    }

    if (formData.isBulkCreate) {
      if (!formData.fromPropertyNo) {
        newErrors.fromPropertyNo = t("createProperty.errors.fromPropertyNoRequired");
      }
      if (!formData.toPropertyNo) {
        newErrors.toPropertyNo = t("createProperty.errors.toPropertyNoRequired");
      }
      // Validate range
      if (formData.fromPropertyNo && formData.toPropertyNo) {
        const from = parseInt(formData.fromPropertyNo, 10);
        const to = parseInt(formData.toPropertyNo, 10);
        if (!isNaN(from) && !isNaN(to) && from >= to) {
          newErrors.toPropertyNo = t("createProperty.errors.invalidRange");
        }
      }
    } else {
      if (!formData.propertyNo) {
        newErrors.propertyNo = t("createProperty.errors.propertyNoRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !selectedWard) return;

    startTransition(async () => {
      try {
        // Build the payload for Range API
        const payload: PropertyRangeCreatePayload = {
          // For single property: rangeFrom === rangeTo
          // For bulk: rangeFrom < rangeTo
          rangeFrom: formData.isBulkCreate ? formData.fromPropertyNo : formData.propertyNo,
          rangeTo: formData.isBulkCreate ? formData.toPropertyNo : formData.propertyNo,
          template: {
            propertyTypeId: parseInt(formData.propertyTypeId, 10),
            categoryId: parseInt(formData.categoryId, 10),
            taxZoneId: parseInt(formData.taxZoneId, 10), // Now required field
            wardId: selectedWard.id,
            ownerName: formData.ownerName || undefined,
            createdBy: 1, // TODO: Get from auth context
          },
          startSequenceNo: 0,
        };

        const result = await createPropertyRangeAction(payload);

        if (result.success) {
          // Show success toast
          if (formData.isBulkCreate) {
            const count = parseInt(formData.toPropertyNo, 10) - parseInt(formData.fromPropertyNo, 10) + 1;
            toast.success(
              t("createProperty.success.bulkPropertiesCreated", {
                from: formData.fromPropertyNo,
                to: formData.toPropertyNo,
                count,
              })
            );
          } else {
            toast.success(
              t("createProperty.success.singlePropertyCreated", {
                propertyNo: formData.propertyNo,
              })
            );
          }

          // Reset form
          setFormData({
            propertyTypeId: "",
            categoryId: "",
            taxZoneId: "",
            propertyNo: "",
            ownerName: "",
            isBulkCreate: false,
            fromPropertyNo: "",
            toPropertyNo: "",
          });
          setErrors({});

          onSuccess();
          onClose();
        } else {
          // Handle API validation errors
          if (result.error) {
            // Try to parse validation errors from API response
            const errorMsg = result.error;
            if (errorMsg.includes('TaxZoneId')) {
              toast.error(t("createProperty.errors.taxZoneRequired"));
            } else {
              toast.error(errorMsg);
            }
          } else {
            toast.error(t("createProperty.errors.createFailed"));
          }
        }
      } catch (error) {
        // Handle network or parsing errors
        const errorMsg = error instanceof Error ? error.message : '';
        if (errorMsg.includes('TaxZoneId')) {
          toast.error(t("createProperty.errors.taxZoneRequired"));
        } else {
          toast.error(t("createProperty.errors.createFailed"));
        }
      }
    });
  }, [formData, selectedWard, validateForm, onSuccess, onClose, t]);

  const handleClose = useCallback(() => {
    // Reset form state
    setFormData({
      propertyTypeId: "",
      categoryId: "",
      taxZoneId: "",
      propertyNo: "",
      ownerName: "",
      isBulkCreate: false,
      fromPropertyNo: "",
      toPropertyNo: "",
    });
    setErrors({});

    // Remove createProperty param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createProperty");
    router.push(`${pathname}?${params.toString()}`);
    onClose();
  }, [router, pathname, searchParams, onClose]);

  if (!isOpen) return null;

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      width="md"
      title={
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-900">
              {t("createProperty.title")}
            </h1>
            <p className="text-xs text-slate-500">
              {t("createProperty.subtitle")}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton onClick={handleClose} disabled={isPending} label={tCommon("buttons.cancel")} />
          <SaveButton onClick={handleSubmit} isLoading={isPending} disabled={isPending || !selectedWard} label={tCommon("buttons.save")} />
        </>
      }
    >
      <div className="p-6 space-y-6">
        {/* Ward (Read-only) */}
        <div>
          <Input
           label=  {t("createProperty.ward")}
            value={selectedWard ? `${selectedWard.wardNo}${selectedWard.description ? ` - ${selectedWard.description}` : ""}` : ""}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Property Type & Category Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label={t("createProperty.propertyType")}
              options={propertyTypeOptions}
              value={formData.propertyTypeId}
              onChange={(_, value) => handleFieldChange("propertyTypeId", value)}
              placeholder={t("createProperty.selectPropertyType")}
              selectSize="md"
              required
            />
            <ValidationMessage
              message={errors.propertyTypeId}
              visible={!!errors.propertyTypeId}
              type="error"
            />
          </div>

          <div>
            <Select
              label={t("createProperty.category")}
              options={categoryOptions}
              value={formData.categoryId}
              onChange={(_, value) => handleFieldChange("categoryId", value)}
              placeholder={t("createProperty.selectCategory")}
              selectSize="md"
              required
            />
            <ValidationMessage
              message={errors.categoryId}
              visible={!!errors.categoryId}
              type="error"
            />
          </div>
        </div>

        {/* Tax Zone ID */}
        <div>
          <Select
            label={t("createProperty.taxZoneId")}
            options={taxZoneOptions}
            value={formData.taxZoneId}
            onChange={(_, value) => handleFieldChange("taxZoneId", value)}
            placeholder={t("createProperty.selectTaxZone")}
            selectSize="md"
            required
          />
          <ValidationMessage
            message={errors.taxZoneId}
            visible={!!errors.taxZoneId}
            type="error"
          />
        </div>

        {/* Bulk Create Mode Toggle */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {t("createProperty.bulkCreateMode")}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {t("createProperty.bulkCreateDescription")}
              </p>
            </div>
            <ToggleSwitch
              checked={formData.isBulkCreate}
              onChange={handleBulkToggle}
              showPopup={false}
            />
          </div>
        </div>

        {/* Single Property Mode Fields */}
        {!formData.isBulkCreate && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
               label={t("createProperty.propertyNo")}
                value={formData.propertyNo}
                onChange={(e) => handleFieldChange("propertyNo", e.target.value)}
                placeholder={t("createProperty.propertyNoPlaceholder")}
                disabled
                className="text-blue-800 font-bold bg-gray-50"
              />
              <ValidationMessage
                message={errors.propertyNo}
                visible={!!errors.propertyNo}
                type="error"
              />
            </div>

            <div>
              <Input
                label={t("createProperty.ownerName")}
                value={formData.ownerName}
                onChange={(e) => handleFieldChange("ownerName", e.target.value)}
                placeholder={t("createProperty.ownerNamePlaceholder")}
                required
                className="bg-white"
              />
              <ValidationMessage
                message={errors.ownerName}
                visible={!!errors.ownerName}
                type="error"
              />
            </div>
          </div>
        )}

        {/* Bulk Create Mode Fields */}
        {formData.isBulkCreate && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label={t("createProperty.fromPropertyNo")}
                  value={formData.fromPropertyNo}
                  onChange={(e) => handleFieldChange("fromPropertyNo", e.target.value)}
                  placeholder={t("createProperty.fromPropertyNoPlaceholder")}
                  type="number"
                  disabled
                  className="text-blue-800 font-bold bg-gray-50"
                />
                <ValidationMessage
                  message={errors.fromPropertyNo}
                  visible={!!errors.fromPropertyNo}
                  type="error"
                />
              </div>

              <div>
                <Input
                  label={t("createProperty.toPropertyNo")}
                  value={formData.toPropertyNo}
                  onChange={(e) => handleFieldChange("toPropertyNo", e.target.value)}
                  placeholder={t("createProperty.toPropertyNoPlaceholder")}
                  type="number"
                  required
                  className="bg-white"
                />
                <ValidationMessage
                  message={errors.toPropertyNo}
                  visible={!!errors.toPropertyNo}
                  type="error"
                />
              </div>
            </div>

            <div>
              <Input
                label={t("createProperty.ownerName")}
                value={formData.ownerName}
                onChange={(e) => handleFieldChange("ownerName", e.target.value)}
                placeholder={t("createProperty.ownerNamePlaceholder")}
                required
                className="bg-white"
              />
              <ValidationMessage
                message={errors.ownerName}
                visible={!!errors.ownerName}
                type="error"
              />
            </div>

             {/* Property Count Indicator */}
            {bulkPropertyCount !== null && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  {t("createProperty.bulkPropertyCountIndicator", {
                    from: formData.fromPropertyNo,
                    to: formData.toPropertyNo,
                    count: bulkPropertyCount,
                  })}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}
