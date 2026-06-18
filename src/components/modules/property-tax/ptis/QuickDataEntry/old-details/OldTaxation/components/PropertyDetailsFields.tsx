"use client"

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { sanitizeAlphanumeric, isValidStringField } from "../utils/inputValidation";
import { PropertyDetailsFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";

/**
 * PropertyDetailsFields Component
 * Renders property identification fields (zone, ward, property number, etc.)
 * Handles validation display for required fields
 */
export function PropertyDetailsFields({
  t,
  formData,
  showError,
  onFieldChange
}: PropertyDetailsFieldsProps) {
  return (
    <>
      {/* Old Zone Name */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("oldDetails.zoneName")}<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          required
          type="text"
          placeholder={t("oldDetails.zoneNamePlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldZoneNo}
          maxLength={20}
          onChange={(e) => {
            const value = sanitizeAlphanumeric(e.target.value);
            if (value.trim() || value === '') {
              onFieldChange('oldZoneNo', value);
            }
          }}
        />
        {showError('oldZoneNo', isValidStringField(formData.oldZoneNo)) && (
          <span className="text-xs text-red-500">{t('oldDetails.validation.zoneNameRequired')}</span>
        )}
      </div>

      {/* Old Ward No */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("oldDetails.wardNo")}<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          required
          placeholder={t("oldDetails.wardNoPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldWardNo}
          maxLength={10}
          onChange={(e) => {
            const value = sanitizeAlphanumeric(e.target.value);
            if (value.trim() || value === '') {
              onFieldChange('oldWardNo', value);
            }
          }}
        />
        {showError('oldWardNo', isValidStringField(formData.oldWardNo)) && (
          <span className="text-xs text-red-500">{t('oldDetails.validation.wardNoRequired')}</span>
        )}
      </div>

      {/* Old Property No */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("oldDetails.propertyNo")}<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          required
          placeholder={t("oldDetails.propertyNoPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldPropertyNo}
          maxLength={10}
          onChange={(e) => {
            const value = sanitizeAlphanumeric(e.target.value);
            if (value.trim() || value === '') {
              onFieldChange('oldPropertyNo', value);
            }
          }}
        />
        {showError('oldPropertyNo', isValidStringField(formData.oldPropertyNo)) && (
          <span className="text-xs text-red-500">{t('oldDetails.validation.propertyNoRequired')}</span>
        )}
      </div>

      {/* Old Partition No */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("oldDetails.partitionNo")}
        </Label>
        <Input
          placeholder={t("oldDetails.partitionNoPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldPartitionNo}
          maxLength={10}
          onChange={(e) => {
            const value = sanitizeAlphanumeric(e.target.value);
            if (value.trim() || value === '') {
              onFieldChange('oldPartitionNo', value);
            }
          }}
        />
      </div>

      {/* Old E-Governance No */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">
          {t("oldDetails.eGovernanceNo")}
        </Label>
        <Input
          placeholder={t("oldDetails.eGovernanceNoPlaceholder")}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          value={formData.oldEgovNo}
          maxLength={10}
          onChange={(e) => {
            const value = e.target.value.replace(/[^A-Za-z0-9\-\/ऀ-ॿ]/g, '');
            onFieldChange('oldEgovNo', value);
          }}
        />
      </div>
    </>
  );
}
