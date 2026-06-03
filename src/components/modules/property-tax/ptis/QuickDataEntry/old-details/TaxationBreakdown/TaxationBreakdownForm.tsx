"use client"

import { useMemo } from "react";
import type { TaxationBreakdownFormProps } from "@/types/OldDetails/property-old-details.types";
import { useTaxationBreakdownForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useTaxationBreakdownForm";
import { SearchSelect } from "@/components/common";
import { Label } from "@/components/common/label";

// Import refactored components
import { DynamicTaxFields } from "./components/DynamicTaxFields";
import { UpdateButton, AddButton } from "@/components/common/ActionButtons";

/**
 * TaxationBreakdownForm - Main Component
 * Orchestrates taxation breakdown data entry and management
 * Delegates field groups to focused sub-components for better organization
 */
export default function TaxationBreakdownForm({
  initialData = null,
  yearOptions = [],
}: TaxationBreakdownFormProps) {

  const {
    taxes,
    selectedYearId,
    setSelectedYearId,
    isSubmitting,
    handleTaxChange,
    handleSave,
    isChanged,
    hasTaxData,
    hasAppliedTaxes,
    validationErrors,
    t,
    tValidation,
  } = useTaxationBreakdownForm(initialData, yearOptions);

  const transformedYearOptions = useMemo(() => {
    return (yearOptions || []).map((y) => ({
      label: String(y.year),
      value: String(y.id),
    }));
  }, [yearOptions]);



  return (
    <div className="p-2 space-y-3">
      <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-4">
        <h3 className="text-sm font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
          {t("title")}
        </h3>

        {/* Warning when no tax data is available */}
        {!hasTaxData && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium">
              {t("noTaxDataAvailable")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-x-4 gap-y-5">
          <div className=" max-w-xs relative focus-within:z-100 space-y-1.5 z-999">
            <Label className="text-xs font-semibold text-gray-700">
             {t("assessmentYear")} <span className="text-red-500 ml-1">*</span>
            </Label>
            <SearchSelect
              options={transformedYearOptions}
              placeholder={t("selectYearPlaceholder")}
              className={`h-9 text-sm rounded-lg focus:ring-2 ${
                validationErrors.yearMaster
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 text-red-900 bg-red-50'
                  : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200 text-gray-900 bg-white'
              }`}
              name="yearMaster"
              onChange={(_, val) => setSelectedYearId(val)}
              value={selectedYearId}
            />
            {validationErrors.yearMaster && (
              <span className="text-[11px]  text-red-500 absolute top-full left-0 mt-0.5 whitespace-nowrap z-10">
                {validationErrors.yearMaster}
              </span>
            )}
          </div>
          <DynamicTaxFields
            taxes={taxes}
            onTaxChange={handleTaxChange}
            validationErrors={validationErrors}
          />
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4 gap-3">
          {hasAppliedTaxes ? (
            <UpdateButton
              label={
                isSubmitting
                  ? tValidation('footer.saving')
                  : tValidation('commonbuttonmessages.UpdateChanges')
              }
              type="submit"
              onClick={handleSave}
              isLoading={isSubmitting}
              disabled={isSubmitting || !hasTaxData || !isChanged || Object.keys(validationErrors).length > 0}
            />
          ) : (
            hasTaxData && (
              <AddButton
                label={tValidation("oldDetails.oldTaxation.applyTaxes")}
                type="submit"
                onClick={handleSave}
                isLoading={isSubmitting}
                disabled={isSubmitting || !hasTaxData || !isChanged || Object.keys(validationErrors).length > 0}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
