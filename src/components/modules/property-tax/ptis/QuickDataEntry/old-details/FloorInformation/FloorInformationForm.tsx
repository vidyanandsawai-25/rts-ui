"use client"

import { useMemo } from "react";
import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from 'next/navigation';

import type { FloorInformationFormProps } from "@/types/OldDetails/property-old-details.types";
import { useFloorInformationForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useFloorInformationForm";

// Import refactored components
import { FloorFormFields } from "./components/FloorFormFields";
import { FloorTableSection } from "./components/FloorTableSection";
import {
  transformFloorOptions,
  transformSubFloorOptions,
  transformConstructionTypeOptions,
  transformUseOptions,
  transformSubUseOptions
} from "./utils/optionTransformers";

/**
 * FloorInformationForm - Main Component
 * Orchestrates floor information entry and management
 * Delegates rendering to focused sub-components for better maintainability
 */
export default function FloorInformationForm({
  floorOptions = [],
  subFloorOptions = [],
  constructionTypeOptions = [],
  useOptions = [],
  initialSubUseTypeOptions = [],
  existingFloorDetails = [],
}: FloorInformationFormProps) {

  const t = useTranslations('quickDataEntry');
  const tCommon = useTranslations('common');
  const params = useParams();
  const propertyId = Number(params.propertyId);
  const locale = params.locale as string;

  const {
    formData,
    setFormData,
    subUseTypeOptions,
    hasSubUseOptions,
    isSubmitting,
    errors,
    showError,
    validateYearField,
    handleUseTypeChange,
    handleEdit,
    handleReset,
    handleSave,
    handleDelete,
    isChanged
  } = useFloorInformationForm({
    propertyId,
    locale,
    initialSubUseTypeOptions
  });

  // Transform dropdown options for SearchSelect components
  const transformedFloorOptions = useMemo(() => transformFloorOptions(floorOptions), [floorOptions]);
  const transformedSubFloorOptions = useMemo(() => transformSubFloorOptions(subFloorOptions), [subFloorOptions]);
  const transformedConstructionTypeOptions = useMemo(() => transformConstructionTypeOptions(constructionTypeOptions), [constructionTypeOptions]);
  const transformedUseOptions = useMemo(() => transformUseOptions(useOptions), [useOptions]);
  const transformedSubUseOptions = useMemo(() => transformSubUseOptions(subUseTypeOptions), [subUseTypeOptions]);

  // Field change handler
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm mb-10">
        <h3 className="text-base font-bold text-blue-800 px-4 py-3 flex items-center gap-2 border-b border-blue-100">
          <Layers className="w-5 h-5" />
          {formData.id ? t("oldDetails.updateFloorDetailsTitle") : t("oldDetails.floorDetailsTitle")}
        </h3>

        <div className="mb-6 p-2">
          {/* Floor Entry Form Fields */}
          <FloorFormFields
            t={t}
            floorOptions={transformedFloorOptions}
            subFloorOptions={transformedSubFloorOptions}
            constructionTypeOptions={transformedConstructionTypeOptions}
            useOptions={transformedUseOptions}
            subUseOptions={transformedSubUseOptions}
            hasSubUseOptions={hasSubUseOptions}
            formData={formData}
            errors={errors}
            showError={showError}
            onFieldChange={handleFieldChange}
            onUseTypeChange={handleUseTypeChange}
            validateYearField={validateYearField}
            isSubmitting={isSubmitting}
            isChanged={isChanged}
            onSave={handleSave}
            onReset={handleReset}
          />

          {/* Floor Details Table */}
          <FloorTableSection
            t={t}
            tCommon={tCommon}
            existingFloorDetails={existingFloorDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

      </div>
    </div>
  );
}
