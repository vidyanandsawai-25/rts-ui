"use client"
import {
  Button,
  Input,
} from "@/components/common"
import { Label } from "@/components/common/label";
import { PropertyOldDetailsApiItem } from "@/types/property-old-details.types";
import { Save } from "lucide-react";
import { useOldTaxationForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useOldTaxationForm";

interface OldTaxationFormProps {
  propertyOldDetails?: PropertyOldDetailsApiItem | null;
}

export default function OldTaxationForm({
  propertyOldDetails = null,
}: OldTaxationFormProps) {

  const {
    formData,
    isSubmitting,
    showError,
    handleUpdate,
    handleInputChange,
    isChanged,
    t
  } = useOldTaxationForm(propertyOldDetails);

  return (
    <div className="p-3 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
          {t("oldDetails.title")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Old Zone Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.zoneName")}<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              required
              placeholder={t("oldDetails.zoneNamePlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldZoneNo}
              maxLength={100}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9\s\-\/]/g, '');
                if (value.trim() || value === '') {
                  handleInputChange('oldZoneNo', value);
                }
              }}
            />
            {showError('oldZoneNo', formData.oldZoneNo.trim().length > 0) && (
              <span className="text-xs text-red-500">{t('oldDetails.validation.zoneNameRequired')}</span>
            )}
          </div>

          {/* Old Ward No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.wardNo")}<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              required
              placeholder={t("oldDetails.wardNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldWardNo}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9\s\-\/]/g, '');
                if (value.trim() || value === '') {
                  handleInputChange('oldWardNo', value);
                }
              }}
            />
            {showError('oldWardNo', formData.oldWardNo.trim().length > 0) && (
              <span className="text-xs text-red-500">{t('oldDetails.validation.wardNoRequired')}</span>
            )}
          </div>

          {/* Old Property No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.propertyNo")}<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              required
              placeholder={t("oldDetails.propertyNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldPropertyNo}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9\s\-\/]/g, '');
                if (value.trim() || value === '') {
                  handleInputChange('oldPropertyNo', value);
                }
              }}
            />
            {showError('oldPropertyNo', formData.oldPropertyNo.trim().length > 0) && (
              <span className="text-xs text-red-500">{t('oldDetails.validation.propertyNoRequired')}</span>
            )}
          </div>

          {/* Old Partition No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.partitionNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.partitionNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldPartitionNo}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9\s\-\/]/g, '');
                if (value.trim() || value === '') {
                  handleInputChange('oldPartitionNo', value);
                }
              }}
            />
          </div>

          {/* Old E-Governance No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.eGovernanceNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.eGovernanceNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldEgovNo}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9\-\/]/g, '');
                handleInputChange('oldEgovNo', value);
              }}
            />
          </div>

          {/* Old Plot Area */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.plotArea")}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("oldDetails.plotAreaPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldPlotArea}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only positive decimals with up to 4 decimal places and max 15 total digits
                if (value === '' || /^\d{0,15}(\.\d{0,4})?$/.test(value)) {
                  handleInputChange('oldPlotArea', value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* Old Plot No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.plotNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.plotNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldPlotNo}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9\s\-\/]/g, '');
                if (value.trim() || value === '') {
                  handleInputChange('oldPlotNo', value);
                }
              }}
            />
          </div>

          {/* Old Construction Area */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.constructionArea")}
            </Label>

            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("oldDetails.constructionAreaPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldConstructionArea ?? ""}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "" || /^\d{0,15}(\.\d{0,4})?$/.test(value)) {
                  handleInputChange("oldConstructionArea", value);
                }
              }}
              onKeyDown={(e) => {
                if (["-", "e", "E", "+"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
          {/* Old RV */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.rv")}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("oldDetails.rvPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldRV || ""}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only positive decimals with up to 4 decimal places and max 15 total digits
                if (value === '' || /^\d{0,15}(\.\d{0,4})?$/.test(value)) {
                  handleInputChange('oldRV', value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* Old ALV */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.alv")}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("oldDetails.alvPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldALV || ""}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only positive decimals with up to 4 decimal places and max 15 total digits
                if (value === '' || /^\d{0,15}(\.\d{0,4})?$/.test(value)) {
                  handleInputChange('oldALV', value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* Old Property Tax */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.propertyTax")}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t("oldDetails.propertyTaxPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldGeneralTax || ""}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only positive decimals with up to 4 decimal places and max 15 total digits
                if (value === '' || /^\d{0,15}(\.\d{0,4})?$/.test(value)) {
                  handleInputChange('oldGeneralTax', value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* Old Total Tax */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.totalTax")}
            </Label>
            <Input
              readOnly
              type="text"
              inputMode="decimal"
              placeholder={t("oldDetails.totalTaxPlaceholder")}
              className="h-9 text-sm border-blue-200 bg-gray-50 cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldTotalTax}
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end border-t border-gray-100 pt-3">
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting || !isChanged}
            className="w-[17.5%] bg-[#2563eb] hover:bg-blue-700 text-white h-11 rounded-xl shadow-lg shadow-blue-900/10 font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95"
          >
            <div className="flex gap-2 text-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? t("oldDetails.loading.saving") : t("property.updateButton")}
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
