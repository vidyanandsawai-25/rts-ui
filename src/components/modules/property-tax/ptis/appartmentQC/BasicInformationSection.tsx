import { User, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CompactInput } from './EditScreenComponents';
import { ApartmentQCDetail } from '@/types/apartmentQC.types';

interface BasicInformationSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  propertyData?: ApartmentQCDetail;
}

export const BasicInformationSection = ({ isOpen, onToggle, propertyData }: BasicInformationSectionProps) => {
  const t = useTranslations("ptis");

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 flex items-center justify-between hover:from-gray-100 hover:to-gray-150 transition"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm text-gray-800">{t("apartmentQC.edit.basicInfo")}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-3 bg-white">
          <div className="grid grid-cols-6 gap-2 mb-2">
            <CompactInput label={`${t("fields.propertyHolderName")} *`} value={propertyData?.ownerName || "-"} />
            <CompactInput label={`${t("fields.occupierName")} *`} value={propertyData?.occupierName || "-"} />
            <CompactInput label={t("floorTable.columns.renterName")} value={propertyData?.renterName || "-"} />
            <CompactInput label={t("fields.mobileNumber")} value={propertyData?.mobileNo || "-"} />
            <CompactInput label={t("fields.emailId")} value={propertyData?.emailId || "-"} />
            <CompactInput label="BHK" value={String(propertyData?.bhk || "-")} />
          </div>
          <div className="grid grid-cols-6 gap-2 mb-2">
            <CompactInput label={t("fields.wing")} value={propertyData?.wingName || "-"} />
            <CompactInput label={`${t("fields.flatNoShopNo")} *`} value={propertyData?.flatOrShopNo || "-"} />
            <CompactInput label={t("fields.oldPropertyNo")} value={propertyData?.oldPropertyNo || "-"} />
            <CompactInput label={`${t("fields.propertyDescription")} *`} value={propertyData?.typeOfUse || "-"} />
            <CompactInput label={t("fields.shopName")} value={propertyData?.flatOrShopName || "-"} />
            <CompactInput label={t("fields.remark")} value={propertyData?.remark || "-"} />
          </div>
          <div className="grid grid-cols-6 gap-2">
            <CompactInput label={t("apartmentTabs.columns.oldRV")} value={String(propertyData?.oldRV || "0")} />
            <CompactInput label={t("apartmentTabs.columns.newRV")} value={String(propertyData?.rateableValue || "0")} />
            <CompactInput label={t("fields.oldTotalTax")} value={String(propertyData?.oldTotalTax || "0")} />
            <CompactInput label={t("fields.taxTotal")} value={String(propertyData?.newTaxTotal || "0")} />
            <CompactInput label={t("fields.oldBuiltupArea")} value={String(propertyData?.oldConstArea || "0")} />
            <CompactInput label={t("fields.builtupArea")} value={String(propertyData?.builtupASqMtr || "0")} />
          </div>
        </div>
      )}
    </div>
  );
};
