"use client";

import { useMemo, useState, useEffect } from "react";
import { useBuildingList } from "@/hooks/zoneMaster/useBuildingList";
import { Trash2, AlertTriangle } from "lucide-react";
import { PropertySelectionSection } from "./components";
import { Drawer } from "@/components/common/Drawer";

import {
  Checkbox,
  CancelButton,
} from "@/components/common";

import { Button } from "@/components/common/ActionButton";

import { useTranslations } from "next-intl";

import { PropertyInfoSection } from "./components";
import { WardItem } from "@/types/wardMaster.types";

interface PropertyOption {
  value: string;
  label: string;
  propertyNo?: string;
  ownerName?: string | null;
  address?: string | null;
  categoryId?: number | null;
  propertyTypeId?: number;
  taxZoneId?: number;
  wardId?: number;
}

interface DeletePropertyDrawerProps {
  isOpen: boolean;
  onClose: () => void;

  properties: PropertyOption[];

  onDeleteSingle: (propertyId: string) => void;

  loading?: boolean;

  selectedWard?: WardItem | null;
  categoryMap?: Map<number, string>;
}

export default function DeletePropertyDrawer({
  isOpen,
  onClose,
  onDeleteSingle,
  loading = false,
  selectedWard = null,
}: DeletePropertyDrawerProps) {
  const t = useTranslations("zoneMaster.deleteProperty");
  const tZone = useTranslations("zoneMaster");

  const [selectedPropertyId, setSelectedPropertyId] =
    useState("");

  const [confirmed, setConfirmed] = useState(false);

  const [errors, setErrors] = useState<{
    property?: string;
  }>({});

  // RESET WHEN WARD CHANGES
  useEffect(() => {
    setSelectedPropertyId("");
    setConfirmed(false);
    setErrors({});
  }, [selectedWard?.id]);

  // NORMALIZED WARD
  const ward = selectedWard ?? null;

  // BUILDING LIST
  const { buildingList, loadingBuildingList, buildingListError } = useBuildingList({
    wardId: ward?.id ?? null,
  });

  // SELECTED PROPERTY
  const selectedProperty = useMemo(() => {
    return buildingList.find(
      (b) => String(b.propertyId) === String(selectedPropertyId)
    );
  }, [buildingList, selectedPropertyId]);

  // CATEGORY CHECK
  const isApartmentCategory = useMemo(() => {
    if (!selectedProperty) return false;
    const cat = selectedProperty.catPropertyCategoryName;
    return cat === "Apartment" || cat === "Multi Commercial Apartment";
  }, [selectedProperty]);

  // CATEGORY NAME
  const categoryName = useMemo(() => {
    return selectedProperty?.catPropertyCategoryName ?? null;
  }, [selectedProperty]);

  // PROPERTY OPTIONS
  const propertyOptions = useMemo(() => {
    return buildingList.map((item) => ({
      value: String(item.propertyId),
      label: item.catPropertyCategoryName
        ? `${item.propertyNo} - ${item.catPropertyCategoryName}`
        : item.propertyNo,
    }));
  }, [buildingList]);

  // CLOSE
  const handleClose = () => {
    setSelectedPropertyId("");
    setConfirmed(false);
    setErrors({});

    onClose();
  };

  // VALIDATE
  const validate = () => {
    const validationErrors: {
      property?: string;
    } = {};

    if (!selectedPropertyId) {
      validationErrors.property =
        "Please select property";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  // DELETE
  const handleDelete = () => {
    if (!validate()) return;

    onDeleteSingle(selectedPropertyId);
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
            <h1 className="text-lg font-bold text-red-900">
              {t("pageTitle")}
            </h1>

            <p className="text-xs text-slate-500">
              {t("pageSubtitle")}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            onClick={handleClose}
            disabled={loading}
          />

          <Button
            variant="danger"
            disabled={
              loading ||
              !selectedPropertyId ||
              !confirmed
            }
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Property
          </Button>
        </>
      }
    >
      <div className="p-5 space-y-5">
        {/* WARNING */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

          <div>
            <h3 className="text-sm font-semibold text-red-800">
              Warning
            </h3>

            <p className="text-xs text-red-700 mt-1">
              Deleted properties cannot be restored.
            </p>
          </div>
        </div>

        {/* PROPERTY INFORMATION */}
        <PropertyInfoSection
          selectedWard={ward}
          selectedProperty={selectedProperty as any}
          isApartmentCategory={isApartmentCategory}
          categoryName={categoryName}
          t={tZone}
        />

        {/* PROPERTY SELECT */}
        <div className="space-y-2">
          <PropertySelectionSection
            selectedProperty={selectedProperty as any}
            propertyOptions={propertyOptions}
            onPropertyChange={(_e, value) => {
              setSelectedPropertyId(value);
              setErrors({});
            }}
            error={errors.property}
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
            disabled={loading || loadingBuildingList}
            value={selectedPropertyId}
            hidePropertyInfo
          />

          {/* {buildingListError && (
            <p className="text-xs text-red-600">{buildingListError}</p>
          )} */}
        </div>

        {/* CONFIRMATION */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(checked) =>
              setConfirmed(!!checked)
            }
            label="I confirm to permanently delete this property"
          />
        </div>
      </div>
    </Drawer>
  );
}