"use client"

import { Input, SearchSelect } from "@/components/common";
import { Label } from "@/components/common/label";
import { FloorFormFieldsProps } from "@/types/OldDetails/property-old-floor-info.types";
import { FloorFormActions } from "./FloorFormActions";

/**
 * FloorFormFields Component
 * Renders all input fields for floor information entry form
 * Separates presentation from business logic
 */
export function FloorFormFields({
    t,
    floorOptions,
    subFloorOptions,
    constructionTypeOptions,
    useOptions,
    subUseOptions,
    hasSubUseOptions,
    formData,
    errors,
    showError,
    onFieldChange,
    onUseTypeChange,
    validateYearField,
    isSubmitting,
    isChanged,
    onSave,
    onReset
}: FloorFormFieldsProps) {
    return (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 p-4">
            {/* Floor */}
            <div className="space-y-1.5 relative focus-within:z-60">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('floor.floorLabel')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <SearchSelect
                    options={floorOptions}
                    placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    name="floor"
                    onChange={(_, val) => onFieldChange('oldFloorId', val)}
                    value={String(formData.oldFloorId)}
                />
                {showError("oldFloorId") && (
                    <span className="text-xs text-red-500">{errors.oldFloorId}</span>
                )}
            </div>

            {/* Sub Floor */}
            <div className="space-y-1.5 relative focus-within:z-50">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('floor.subFloor')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <SearchSelect
                    options={subFloorOptions}
                    placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    name="subFloor"
                    onChange={(_, val) => onFieldChange('oldSubFloorId', val)}
                    value={String(formData.oldSubFloorId)}
                />
                {showError("oldSubFloorId") && (
                    <span className="text-xs text-red-500">{errors.oldSubFloorId}</span>
                )}
            </div>

            {/* Construction Year */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.year')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    placeholder="YYYY"
                    maxLength={4}
                    value={formData.oldConstructionYear}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        onFieldChange('oldConstructionYear', val);
                        // Validate year in real-time
                        validateYearField('oldConstructionYear', val);
                    }}
                />
                {showError("oldConstructionYear") && (
                    <span className="text-xs text-red-500">{errors.oldConstructionYear}</span>
                )}
            </div>

            {/* Assessment Year */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.assessmentYear')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    placeholder="YYYY"
                    maxLength={4}
                    value={formData.oldAssessmentYear || ''}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        onFieldChange('oldAssessmentYear', val);
                        // Validate year in real-time
                        validateYearField('oldAssessmentYear', val);
                    }}
                />
                {showError("oldAssessmentYear") && (
                    <span className="text-xs text-red-500">{errors.oldAssessmentYear}</span>
                )}
            </div>

            {/* Construction Type */}
            <div className="space-y-1.5 relative focus-within:z-50">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('floor.conTyp')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <SearchSelect
                    options={constructionTypeOptions}
                    placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    name="conTyp"
                    onChange={(_, val) => onFieldChange('oldConstructionTypeId', val)}
                    value={String(formData.oldConstructionTypeId)}
                />
                {showError("oldConstructionTypeId") && (
                    <span className="text-xs text-red-500">{errors.oldConstructionTypeId}</span>
                )}
            </div>

            {/* Type of Use */}
            <div className="space-y-1.5 relative focus-within:z-50">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.floordtails.use')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <SearchSelect
                    options={useOptions}
                    placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    name="use"
                    onChange={(_, val) => onUseTypeChange(val)}
                    value={String(formData.oldTypeOfUseId)}
                />
                {showError("oldTypeOfUseId") && (
                    <span className="text-xs text-red-500">{errors.oldTypeOfUseId}</span>
                )}
            </div>

            {/* Sub Type */}
            <div className="space-y-1.5 relative focus-within:z-50">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('floor.subTyp')} {hasSubUseOptions && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <SearchSelect
                    options={subUseOptions}
                    placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    name="subUseType"
                    onChange={(_, val) => onFieldChange('oldSubTypeOfUseId', val)}
                    value={String(formData.oldSubTypeOfUseId)}
                    disabled={!hasSubUseOptions}
                />
                {showError("oldSubTypeOfUseId") && (
                    <span className="text-xs text-red-500">{errors.oldSubTypeOfUseId}</span>
                )}
            </div>

            {/* Carpet Area (Sq Ft) - Editable */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.carpetAreaSqFt')}<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    type="number"
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    placeholder={t('oldDetails.floordtails.carpetAreaPlaceholder')}
                    value={formData.oldCarpetAreaSqFeet ?? ''}
                    onChange={(e) => onFieldChange('oldCarpetAreaSqFeet', e.target.value)}
                />
                {showError("oldCarpetAreaSqFeet") && (
                    <span className="text-xs text-red-500">{errors.oldCarpetAreaSqFeet}</span>
                )}
            </div>

            {/* Area (Sq M) - Read Only */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.areaSqM')}
                </Label>
                <Input
                    type="number"
                    className="h-9 text-sm border-blue-200 bg-gray-50 cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    placeholder="0"
                    value={
                        formData.oldAreaSqMeter
                            ? Number(formData.oldAreaSqMeter).toFixed(2)
                            : ''
                    }
                    readOnly
                />
            </div>

            {/* Builtup Area (Sq Ft) - Read Only */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.builtupAreaSqFt')}
                </Label>
                <Input
                    type="number"
                    className="h-9 text-sm border-blue-200 bg-gray-50 cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    placeholder="0"
                    value={
                        formData.oldBuiltupAreaSqFeet
                            ? Number(formData.oldBuiltupAreaSqFeet).toFixed(2)
                            : ''
                    }
                    readOnly
                />
            </div>

            {/* Builtup Area (Sq M) - Read Only */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('oldDetails.builtupAreaSqMeter')}
                </Label>
                <Input
                    type="number"
                    className="h-9 text-sm border-blue-200 bg-gray-50 cursor-not-allowed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    placeholder="0"
                    value={
                        formData.oldBuiltupAreaSqMeter
                            ? Number(formData.oldBuiltupAreaSqMeter).toFixed(2)
                            : ''
                    }
                    readOnly
                />
            </div>
            <div className="space-y-1.5 mt-6 w-full flex justify-end gap-5 items-end">
                <FloorFormActions
                    t={t}
                    isEditMode={!!formData.id}
                    isSubmitting={isSubmitting}
                    isChanged={isChanged}
                    onSave={onSave}
                    onReset={onReset}
                />
            </div>
        </div>
    );
}
