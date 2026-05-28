"use client"

import type { TaxationBreakdownFormProps } from "@/types/OldDetails/property-old-details.types";
import { useTaxationBreakdownForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useTaxationBreakdownForm";

// Import refactored components
import { DynamicTaxFields } from "./components/DynamicTaxFields";
import { UpdateButton } from "@/components/common/ActionButtons";

/**
 * TaxationBreakdownForm - Main Component
 * Orchestrates taxation breakdown data entry and management
 * Delegates field groups to focused sub-components for better organization
 */
export default function TaxationBreakdownForm({
  initialData = null,
}: TaxationBreakdownFormProps) {

  const {
    // formData,
    taxes,
    isSubmitting,
    handleTaxChange,
    // handleMetaChange,
    handleSave,
    isChanged,
    hasTaxData,
    validationErrors,
    t,
    tValidation
  } = useTaxationBreakdownForm(initialData);


  console.log("Form Data:", hasTaxData);
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

        <div className="grid grid-cols-4 gap-x-4 gap-y-3">
          {/* Meta Fields (Year & Interest) */}
          {/* <TaxationMetaFields
          t={t}
          year={formData.year}
          interest={formData.interest}
          onYearChange={(value) => handleMetaChange('year', value)}
          onInterestChange={(value) => handleMetaChange('interest', value)}
          validationErrors={validationErrors}
        /> */}

          {/* Dynamic Tax Fields */}
          <DynamicTaxFields
            taxes={taxes}
            onTaxChange={handleTaxChange}
            validationErrors={validationErrors}
          />
          {/* Summary Fields (Tax Total & Net Total) */}
          {/* <TaxationSummaryFields
          t={t}
          taxTotal={formData.taxTotal}
          netTotal={formData.netTotal}
          validationErrors={validationErrors}
        /> */}
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          {hasTaxData && (
            <UpdateButton
              label={
                isSubmitting
                  ? tValidation('footer.saving')
                  : tValidation('commonbuttonmessages.UpdateChanges')
              }
              type="submit"
              onClick={handleSave}
              isLoading={isSubmitting}
              disabled={isSubmitting || !hasTaxData || !isChanged}
            />
          )}
        </div>
      </div>
    </div>
  );
}
