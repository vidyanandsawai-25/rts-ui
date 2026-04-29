"use client"
import {
  Button,
  Input,
  useConfirm
} from "@/components/common"
import { Label } from "@/components/common/label";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PropertyOldDetailsApiItem } from "@/types/property-old-details.types";
import { updatePropertyOldDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/old-taxation/action";
import { useTranslations } from "next-intl";

interface OldTaxationFormProps {
  propertyOldDetails?: PropertyOldDetailsApiItem | null;
}

export default function OldTaxationForm({
  propertyOldDetails = null,
}: OldTaxationFormProps) {

  const t = useTranslations('quickDataEntry');
  const { confirm } = useConfirm();
  const params = useParams();
  const propertyId = Number(params.propertyId);
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    oldPlotNo: propertyOldDetails?.oldPlotNo || "",
    oldCarpetAreaSqFeet: propertyOldDetails?.oldCarpetAreaSqFeet || 0,
    oldRV: propertyOldDetails?.oldRV || 0,
    oldALV: propertyOldDetails?.oldALV || 0,
    oldGeneralTax: propertyOldDetails?.oldGeneralTax || "0",
    oldTotalTax: propertyOldDetails?.oldTotalTax || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = () => {
    confirm({
      title: t("property.updateConfirmTitle"),
      description: t("property.updateConfirmText"),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const payload = {
            ...propertyOldDetails,
            ...formData,
          };
          await updatePropertyOldDetailsAction(propertyId, payload, locale);
          toast.success("Property details updated successfully");
        } catch (error) {
          toast.error("Failed to update property details");
          console.error(error);
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="p-3 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border-1 border-blue-100 p-5 bg-red-600  ">
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
              readOnly
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              defaultValue={propertyOldDetails?.oldZoneNo || ""}
            />
          </div>

          {/* Old Ward No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.wardNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.wardNoPlaceholder")}
              readOnly
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              defaultValue={propertyOldDetails?.oldWardNo || ""}
            />
          </div>

          {/* Old Property No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.propertyNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.propertyNoPlaceholder")}
              readOnly
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              defaultValue={propertyOldDetails?.oldPropertyNo || ""}
            />
          </div>

          {/* Old Partition No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.partitionNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.partitionNoPlaceholder")}
              readOnly
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              defaultValue={propertyOldDetails?.oldPartitionNo || ""}
            />
          </div>

          {/* Old E-Governance No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.eGovernanceNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.eGovernanceNoPlaceholder")}
              readOnly
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              defaultValue={propertyOldDetails?.oldEgovNo || ""}
            />
          </div>

          {/* Old Plot Area */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.plotArea")}
            </Label>
            <Input
              type="number"
              readOnly
              placeholder={t("oldDetails.plotAreaPlaceholder")}
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              defaultValue={propertyOldDetails?.oldPlotArea || ""}
            />
          </div>

          {/* Old Plot No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 ml-1">
              {t("oldDetails.plotNo")}
            </Label>
            <Input
              placeholder={t("oldDetails.plotNoPlaceholder")}
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              value={formData.oldPlotNo}
              onChange={(e) => setFormData(prev => ({ ...prev, oldPlotNo: e.target.value }))}
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
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              value={formData.oldCarpetAreaSqFeet}
              onChange={(e) => setFormData(prev => ({ ...prev, oldCarpetAreaSqFeet: Number(e.target.value) }))}
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
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              value={formData.oldRV}
              onChange={(e) => setFormData(prev => ({ ...prev, oldRV: Number(e.target.value) }))}
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
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              value={formData.oldALV}
              onChange={(e) => setFormData(prev => ({ ...prev, oldALV: Number(e.target.value) }))}
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
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              value={formData.oldGeneralTax || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, oldGeneralTax: e.target.value }))}
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
              className="h-11 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg bg-gray-50/50"
              value={formData.oldTotalTax}
              onChange={(e) => setFormData(prev => ({ ...prev, oldTotalTax: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end border-t border-gray-100 pt-3">
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl shadow-lg hover:shadow-blue-200/50 transition-all font-bold text-base h-auto disabled:opacity-50"
          >
            {t("property.updateButton")}
          </Button>
        </div>
      </div>
    </div>
  )
}
