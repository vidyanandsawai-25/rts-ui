import { useState, useCallback, useTransition, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CreatePropertyFormData, CreatePropertyFormErrors } from "@/types/zone-master/properties/create-property-drawer.types";
import { PropertyType } from "@/types/property-type.types";
import { PropertyCategory } from "@/types/property-category.types";
import { TaxZone } from "@/types/taxzoning.types";
import { Option } from "@/components/common";

interface UseCreatePropertyFormProps {
  isOpen: boolean;
  nextPropertyNumber: string;
  propertyTypes: PropertyType[];
  propertyCategories: PropertyCategory[];
  taxZones: TaxZone[];
}

export function useCreatePropertyForm({
  isOpen,
  nextPropertyNumber,
  propertyTypes,
  propertyCategories,
  taxZones,
}: UseCreatePropertyFormProps) {
  const t = useTranslations("zoneMaster");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<CreatePropertyFormData>({
    propertyTypeId: "",
    categoryId: "",
    taxZoneId: "",
    propertyNo: "",
    ownerName: "",
    isBulkCreate: false,
    fromPropertyNo: "",
    toPropertyNo: "",
  });

  const [errors, setErrors] = useState<CreatePropertyFormErrors>({});

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
  const handleFieldChange = useCallback((field: keyof CreatePropertyFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (typeof value === "string" && errors[field as keyof CreatePropertyFormErrors]) {
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
    const newErrors: CreatePropertyFormErrors = {};

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
    } else if (formData.ownerName.trim().length < 2) {
      newErrors.ownerName = t("createProperty.errors.ownerNameMinLength");
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

  const resetForm = useCallback(() => {
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
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isPending,
    startTransition,
    propertyTypeOptions,
    categoryOptions,
    taxZoneOptions,
    handleFieldChange,
    handleBulkToggle,
    bulkPropertyCount,
    validateForm,
    resetForm,
    t,
    tCommon,
  };
}
