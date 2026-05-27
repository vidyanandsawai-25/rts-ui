"use client";

import { Input, Select, ValidationMessage } from "@/components/common";
import { CreatePropertyFormData, CreatePropertyFormErrors } from "@/types/zone-master/properties/create-property-drawer.types";
import { WardItem } from "@/types/wardMaster.types";
import { Option } from "@/components/common";
import { useTranslations } from "next-intl";

interface PropertyFormFieldsProps {
  selectedWard: WardItem | null;
  formData: CreatePropertyFormData;
  errors: CreatePropertyFormErrors;
  propertyTypeOptions: Option[];
  categoryOptions: Option[];
  taxZoneOptions: Option[];
  handleFieldChange: (field: keyof CreatePropertyFormData, value: string | boolean) => void;
  t: ReturnType<typeof useTranslations<"zoneMaster">>;
}

export function PropertyFormFields({
  selectedWard,
  formData,
  errors,
  propertyTypeOptions,
  categoryOptions,
  taxZoneOptions,
  handleFieldChange,
  t,
}: PropertyFormFieldsProps) {
  return (
    <>
      {/* Ward (Read-only) */}
      <div>
        <Input
          label={t("createProperty.ward")}
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
    </>
  );
}
