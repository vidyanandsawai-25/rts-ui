"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useBuildingList } from "@/hooks/zoneMaster/useBuildingList";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton } from "@/components/common";
import { useTranslations } from "next-intl";
import { PropertyInfoSection, PropertySelectionSection } from "./components";
import { PropertyAmenitySection } from "./components/PropertyAmenitySection";
import { WardItem } from "@/types/wardMaster.types";

interface DeletePropertyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWard?: WardItem | null;
}

export default function DeletePropertyDrawer({
  isOpen,
  onClose,
  selectedWard = null,
}: DeletePropertyDrawerProps) {
  const t = useTranslations("zoneMaster.deleteProperty");
  const tZone = useTranslations("zoneMaster");

  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  // Reset on ward change
  useEffect(() => {
    setSelectedPropertyId("");
  }, [selectedWard?.id]);

  const ward = selectedWard ?? null;

  const { buildingList, loadingBuildingList } = useBuildingList({
    wardId: ward?.id ?? null,
  });

  const selectedProperty = useMemo(
    () => buildingList.find((b) => String(b.propertyId) === selectedPropertyId),
    [buildingList, selectedPropertyId]
  );

  const isApartmentCategory = useMemo(() => {
    const cat = selectedProperty?.catPropertyCategoryName;
    return cat === "Apartment" || cat === "Multi Commercial Apartment";
  }, [selectedProperty]);

  const categoryName = useMemo(
    () => selectedProperty?.catPropertyCategoryName ?? null,
    [selectedProperty]
  );

  const propertyOptions = useMemo(
    () =>
      buildingList.map((item) => ({
        value: String(item.propertyId),
        label: item.catPropertyCategoryName
          ? `${item.propertyNo} - ${item.catPropertyCategoryName}`
          : item.propertyNo,
      })),
    [buildingList]
  );

  const handleClose = () => {
    setSelectedPropertyId("");
    onClose();
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      width="md"
      title={
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-red-500 to-red-600 rounded-lg shadow-md text-white shrink-0">
            <Trash2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-red-900">{t("pageTitle")}</h1>
            <p className="text-xs text-slate-500">{t("pageSubtitle")}</p>
          </div>
        </div>
      }
      footer={<CancelButton onClick={handleClose} />}
    >
      <div className="p-5 space-y-5">
        {/* Property info */}
        <PropertyInfoSection
          selectedWard={ward}
          selectedProperty={selectedProperty as any}
          isApartmentCategory={isApartmentCategory}
          categoryName={categoryName}
          t={tZone}
        />

        {/* Main Property No dropdown */}
        <PropertySelectionSection
          selectedProperty={selectedProperty as any}
          propertyOptions={propertyOptions}
          onPropertyChange={(_e, value) => setSelectedPropertyId(value)}
          t={tZone}
          isApartmentCategory={isApartmentCategory}
          label="Main Property No"
          placeholder={
            loadingBuildingList
              ? "Loading properties..."
              : propertyOptions.length === 0 && ward?.id
              ? "No properties found for this ward"
              : "Select a main property"
          }
          disabled={loadingBuildingList}
          value={selectedPropertyId}
          hidePropertyInfo
        />

        {/* Wing selection → toggle → table → delete */}
        {selectedPropertyId && (
          <PropertyAmenitySection propertyId={selectedPropertyId} />
        )}
      </div>
    </Drawer>
  );
}
