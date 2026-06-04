"use client";

import { Input, ValidationMessage, ToggleSwitch } from "@/components/common";
import { AlertCircle } from "lucide-react";
import { CreatePropertyFormData, CreatePropertyFormErrors } from "@/types/zone-master/properties/create-property-drawer.types";
import { useTranslations } from "next-intl";
import { sanitizeName } from "@/lib/utils/input-sanitization";
import { KYC_VALIDATION_RULES } from "@/lib/utils/kyc-validation.constants";

interface BulkCreateSectionProps {
  formData: CreatePropertyFormData;
  errors: CreatePropertyFormErrors;
  bulkPropertyCount: number | null;
  handleFieldChange: (field: keyof CreatePropertyFormData, value: string | boolean) => void;
  handleBulkToggle: (checked: boolean) => void;
  t: ReturnType<typeof useTranslations<"zoneMaster">>;
}

export function BulkCreateSection({
  formData,
  errors,
  bulkPropertyCount,
  handleFieldChange,
  handleBulkToggle,
  t,
}: BulkCreateSectionProps) {
  return (
    <>
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
              onChange={(e) => {
                const sanitized = sanitizeName(e.target.value);
                if (sanitized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
                  handleFieldChange("ownerName", sanitized);
                }
              }}
              placeholder={t("createProperty.ownerNamePlaceholder")}
              required
              maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
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
                min={0}
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
              onChange={(e) => {
                const sanitized = sanitizeName(e.target.value);
                if (sanitized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
                  handleFieldChange("ownerName", sanitized);
                }
              }}
              placeholder={t("createProperty.ownerNamePlaceholder")}
              required
              maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
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
    </>
  );
}
