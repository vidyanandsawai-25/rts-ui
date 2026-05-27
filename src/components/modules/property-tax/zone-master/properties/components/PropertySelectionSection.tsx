"use client";

import { Select, ValidationMessage } from "@/components/common";
import { ZonePropertyItem } from "@/types/zone-master/properties/zoneProperty.types";
import { Option } from "@/components/common";

interface PropertySelectionSectionProps {
  selectedProperty: ZonePropertyItem | null;
  propertyOptions: Option[];
  handlePropertySelect: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  errors: { mainPropertyId?: string };
  t: (key: string) => string;
  isApartmentCategory: boolean;
}

export function PropertySelectionSection({
  selectedProperty,
  propertyOptions,
  handlePropertySelect,
  errors,
  t,
  isApartmentCategory,
}: PropertySelectionSectionProps) {
  return (
    <div className="space-y-2">
      <Select
        label={t("partitionForm.property")}
        options={propertyOptions}
        value={selectedProperty ? String(selectedProperty.id) : ""}
        onChange={handlePropertySelect}
        placeholder={t("partitionForm.selectProperty")}
        selectSize="md"
        required
      />
      <ValidationMessage
        message={errors.mainPropertyId}
        visible={!!errors.mainPropertyId}
        type="error"
      />
      
      {selectedProperty && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">{t("partitionForm.propertyNumber")}:</span>
              <span className="ml-2 font-semibold text-blue-900">{selectedProperty.propertyNo}</span>
            </div>
            <div>
              <span className="text-gray-600">{t("partitionForm.category")}:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {isApartmentCategory ? t("partitionForm.apartment") : t("partitionForm.nonApartment")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
