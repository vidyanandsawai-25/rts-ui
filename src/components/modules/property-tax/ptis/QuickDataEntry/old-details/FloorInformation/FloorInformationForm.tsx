"use client"

import { useMemo, useTransition } from "react";
import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from 'next/navigation';

import type { FloorInformationFormProps } from "@/types/OldDetails/property-old-details.types";
import { useFloorInformationForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useFloorInformationForm";
import { useFloorPagination } from "@/hooks/ptis/QuickDataEntry/Olddetails/useFloorPagination";
import { useFloorSearch } from "@/hooks/ptis/QuickDataEntry/Olddetails/useFloorSearch";
import { SearchInput } from "@/components/common";

import { 
  convertSqFtToSqM,
  convertSqMToSqFt, 
  calculateBuiltUpArea 
} from "@/lib/utils/RoomSubmission/conversions";

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
  totalCount = 0,
  pageNumber = 1,
  pageSize = 5,
  totalPages = 0,
  searchTerm = '',
}: FloorInformationFormProps) {

  const t = useTranslations('quickDataEntry');
  const tCommon = useTranslations('common');
  const params = useParams();
  const propertyId = Number(params.propertyId);
  const locale = params.locale as string;
  const [, startTransition] = useTransition();

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

  // Field change handler with automatic area calculations
  const handleFieldChange = (field: string, value: string) => {
    // If carpet area in sq m is changed, calculate all derived fields
    if (field === 'oldAreaSqMeter') {
      const carpetAreaSqM = parseFloat(value) || 0;
      
      // Calculate Carpet Area (Sq Ft) from Carpet Area (Sq M)
      const carpetAreaSqFt = carpetAreaSqM > 0 ? convertSqMToSqFt(carpetAreaSqM) : 0;
      
      // Calculate Built-up Area (Sq Ft) from Carpet Area (Sq Ft) - adds 20%
      const builtupAreaSqFt = carpetAreaSqFt > 0 ? calculateBuiltUpArea(carpetAreaSqFt) : 0;
      
      // Calculate Built-up Area (Sq M) from Built-up Area (Sq Ft)
      const builtupAreaSqMeter = builtupAreaSqFt > 0 ? convertSqFtToSqM(builtupAreaSqFt) : 0;
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        oldCarpetAreaSqFeet: carpetAreaSqFt > 0 ? carpetAreaSqFt.toFixed(2) : '',
        oldBuiltupAreaSqFeet: builtupAreaSqFt > 0 ? builtupAreaSqFt.toFixed(2) : '',
        oldBuiltupAreaSqMeter: builtupAreaSqMeter > 0 ? builtupAreaSqMeter.toFixed(2) : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Pagination hook
  const { changePage, handlePageSizeChange, handleSearchChange } = useFloorPagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    propertyId,
    startTransition,
  });

  // Search hook
  const { search, handleSearchChange: handleSearchInput } = useFloorSearch({
    onSearchChange: handleSearchChange,
    startTransition,
  });

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
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3 md:pr-3">
              <h4 className="text-sm font-semibold text-blue-800">
                {t('oldDetails.existingFloorDetails') || 'Existing Floor Details'}
              </h4>
              <div className="w-72">
                <SearchInput
                  value={search}
                  onChange={handleSearchInput}
                  placeholder={tCommon('actions.search') || 'Search floor details...'}
                  className="mb-0"
                />
              </div>
            </div>
            <FloorTableSection
              t={t}
              tCommon={tCommon}
              existingFloorDetails={existingFloorDetails}
              totalCount={totalCount}
              pageNumber={pageNumber}
              pageSize={pageSize}
              totalPages={totalPages}
              searchTerm={searchTerm}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPageChange={changePage}
              onPageSizeChange={handlePageSizeChange}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
