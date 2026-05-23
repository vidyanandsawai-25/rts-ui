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
    handleUpdate,
    handleInputChange,
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
              {t("oldDetails.zoneName")}
            </Label>
            <Input
              placeholder={t("oldDetails.zoneNamePlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldZoneNo}
              onChange={(e) => handleInputChange('oldZoneNo', e.target.value)}
            />
          </div>

          {/* Old Ward No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.wardNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.wardNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldWardNo}
              onChange={(e) => handleInputChange('oldWardNo', e.target.value)}
            />
          </div>

          {/* Old Property No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.propertyNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.propertyNoPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldPropertyNo}
              onChange={(e) => handleInputChange('oldPropertyNo', e.target.value)}
            />
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
              onChange={(e) => handleInputChange('oldPartitionNo', e.target.value)}
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
              onChange={(e) => handleInputChange('oldEgovNo', e.target.value)}
            />
          </div>

          {/* Old Plot Area */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.plotArea")}
            </Label>
            <Input
              type="text"
              placeholder={t("oldDetails.plotAreaPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldPlotArea}
              onChange={(e) => handleInputChange('oldPlotArea', e.target.value)}
              onKeyDown={(e) => {
                // Prevent negative sign and 'e' character
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
              onChange={(e) => handleInputChange('oldPlotNo', e.target.value)}
            />
          </div>

          {/* Old Construction Area */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.constructionArea")}
            </Label>
            <Input
              type="number"
              placeholder={t("oldDetails.constructionAreaPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldConstructionArea || ""}
              onChange={(e) => handleInputChange('oldConstructionArea', e.target.value)}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e' character
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
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
              type="number"
              placeholder={t("oldDetails.rvPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldRV || ""}
              onChange={(e) => handleInputChange('oldRV', e.target.value)}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e' character
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
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
              type="number"
              placeholder={t("oldDetails.alvPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldALV || ""}
              onChange={(e) => handleInputChange('oldALV', e.target.value)}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e' character
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
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
              type="number"
              placeholder={t("oldDetails.propertyTaxPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldGeneralTax || ""}
              onChange={(e) => handleInputChange('oldGeneralTax', e.target.value)}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e' character
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
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
              type="number"
              placeholder={t("oldDetails.totalTaxPlaceholder")}
              className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              value={formData.oldTotalTax}
              onChange={(e) => handleInputChange('oldTotalTax', Number(e.target.value))}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e' character
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end border-t border-gray-100 pt-3">
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
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
