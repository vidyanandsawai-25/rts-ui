"use client"

import type { TaxationBreakdownFormProps } from "@/types/OldDetails/property-old-details.types";
import { useTaxationBreakdownForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useTaxationBreakdownForm";

// Import refactored components
import { TaxationMetaFields } from "./components/TaxationMetaFields";
import { DynamicTaxFields } from "./components/DynamicTaxFields";
import { TaxationSummaryFields } from "./components/TaxationSummaryFields";
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
    formData,
    taxes,
    isSubmitting,
    handleTaxChange,
    handleMetaChange,
    handleSave,
    isChanged,
    hasTaxData,
    validationErrors,
    t,
    tValidation
  } = useTaxationBreakdownForm(initialData);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-blue-800 mb-8">
        {t("title")}
      </h3>

      {/* Warning when no tax data is available */}
      {!hasTaxData && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium">
            {t("noTaxDataAvailable")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-5 items-end">
        {/* Meta Fields (Year & Interest) */}
        <TaxationMetaFields
          t={t}
          year={formData.year}
          interest={formData.interest}
          onYearChange={(value) => handleMetaChange('year', value)}
          onInterestChange={(value) => handleMetaChange('interest', value)}
          validationErrors={validationErrors}
        />

        {/* Dynamic Tax Fields */}
        <DynamicTaxFields
          taxes={taxes}
          onTaxChange={handleTaxChange}
          validationErrors={validationErrors}
        />

        {/* Summary Fields (Tax Total & Net Total) */}
        <TaxationSummaryFields
          t={t}
          taxTotal={formData.taxTotal}
          netTotal={formData.netTotal}
          validationErrors={validationErrors}
        />
      </div>

      <div className="pt-2 mt-5 flex justify-end items-center">
        <UpdateButton
          label={isSubmitting ? tValidation('footer.saving') : tValidation('commonbuttonmessages.UpdateChanges')}
          type="submit"
          onClick={handleSave}
          isLoading={isSubmitting}
          disabled={isSubmitting || !hasTaxData || !isChanged}
        />
      </div>
    </div>
  );
}
