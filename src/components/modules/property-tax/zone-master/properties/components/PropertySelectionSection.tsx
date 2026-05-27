"use client";

import { Select, ValidationMessage } from "@/components/common";
import { Option } from "@/components/common";

interface PropertySelectionSectionProps {
  selectedProperty: any;
  propertyOptions: Option[];

  onPropertyChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
    value: string
  ) => void;

  error?: string;

  t: (key: string) => string;

  isApartmentCategory: boolean;

  label?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string; // Explicit value prop for flexibility
}

export function PropertySelectionSection({
  selectedProperty,
  propertyOptions,
  onPropertyChange,
  error,
  t,
  isApartmentCategory,
  label,
  placeholder,
  disabled,
  value,
}: PropertySelectionSectionProps) {
  // Use explicit value prop if provided, otherwise try to get from selectedProperty
  const selectValue = value ?? (selectedProperty ? String(selectedProperty.id || selectedProperty.propertyId || "") : "");

  return (
    <div className="space-y-2">
      <Select
        label={label || t("partitionForm.property")}
        options={propertyOptions}
        value={selectValue}
        onChange={onPropertyChange}
        placeholder={
          placeholder || t("partitionForm.selectProperty")
        }
        selectSize="md"
        disabled={disabled}
        required
      />

      <ValidationMessage
        message={error}
        visible={!!error}
        type="error"
      />

      {selectedProperty && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">
                {t("partitionForm.propertyNumber")}:
              </span>

              <span className="ml-2 font-semibold text-blue-900">
                {selectedProperty.propertyNo}
              </span>
            </div>

            <div>
              <span className="text-gray-600">
                {t("partitionForm.category")}:
              </span>

              <span className="ml-2 font-semibold text-blue-900">
                {isApartmentCategory
                  ? t("partitionForm.apartment")
                  : t("partitionForm.nonApartment")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}