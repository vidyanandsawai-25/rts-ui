"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Drawer } from "@/components/common/Drawer";
import { SaveButton } from "@/components/common/ActionButtons";
import { Floor } from "@/types/floor.types";
import { ConstructionType } from "@/types/construction.types";
import { UseSubType, UseType } from "@/types/typeOfUse.types";
import { ApartmentQCDetail } from "@/types/apartmentQC.types";

import { useApartmentQCEdit } from "@/hooks/apartmentQc/useApartmentQCEdit";
import { BasicInformationSection } from "./BasicInformationSection";
import { FloorQCSection } from "./FloorQCSection";
import { PhotoGallerySection } from "./PhotoGallerySection";

interface ResidentialEditScreenProps {
  open: boolean;
  onClose?: () => void;
  propertyData?: ApartmentQCDetail;
  returnTo?: 'residential' | 'commercial' | 'amenities';
  floors?: Floor[];
  constructionTypes?: ConstructionType[];
  useTypes?: UseType[];
  allSubTypes?: UseSubType[];
}

const ResidentialEditScreen = ({
  open,
  onClose,
  propertyData,
  returnTo = 'residential',
  floors = [],
  constructionTypes = [],
  useTypes = [],
  allSubTypes = [],
}: ResidentialEditScreenProps) => {
  const router = useRouter();
  const t = useTranslations("ptis");
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  const [isFloorQCOpen, setIsFloorQCOpen] = useState(true);

  const hookProps = useApartmentQCEdit({ floors, constructionTypes, useTypes, allSubTypes });

  const handleClose = () => {
    onClose?.();
    const tabUrl = returnTo === 'commercial' 
      ? "/property-tax/ptis?tab=apartment&appartmentTab=commercial&subTab=rateable&pageNumber=1"
      : returnTo === 'amenities' 
      ? "/property-tax/ptis?tab=apartment"
      : "/property-tax/ptis?tab=apartment&appartmentTab=residential&subTab=rateable&pageNumber=1";
    router.push(tabUrl);
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width="xl"
      title={
        <div className="flex items-center justify-between w-full">
          <h2 className="text-base font-semibold text-gray-900">{t("apartmentQC.edit.title")}</h2>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">{`${t("fields.wardNo")}: ${propertyData?.wardId || "13"}`}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-medium">{`${t("fields.blockNo")}: ${propertyData?.buildingNo || "B-12"}`}</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">{`${t("fields.propertyNo")}: ${propertyData?.propertyNo || "RP001"}`}</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">{`${t("fields.societyName")}: ${propertyData?.society || "Green Valley"}`}</span>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">{t("apartmentQC.actions.previous")}</button>
            <span className="text-xs text-gray-600 font-medium">{"1 / 8"}</span>
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">{t("apartmentQC.actions.next")}</button>
          </div>
          <SaveButton />
        </div>
      }
    >
      <div className="p-3 flex flex-row gap-4">
        <div className="w-full lg:w-10/12 space-y-3">
          <BasicInformationSection isOpen={isBasicInfoOpen} onToggle={() => setIsBasicInfoOpen(!isBasicInfoOpen)} propertyData={propertyData} />
          <FloorQCSection isOpen={isFloorQCOpen} onToggle={() => setIsFloorQCOpen(!isFloorQCOpen)} {...hookProps} />
        </div>
        <PhotoGallerySection />
      </div>
    </Drawer>
  );
};

export default ResidentialEditScreen;