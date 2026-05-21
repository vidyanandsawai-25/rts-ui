"use client"

import { useMemo, useCallback } from "react";
import { Button, DeleteButton, EditButton, Input, MasterTable, SearchSelect, useConfirm, ValidationMessage } from "@/components/common";
import { Label } from "@/components/common/label";
import { Layers, Plus, RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from 'next/navigation';

import {
  FloorInformationFormProps,
  FloorTableRow
} from "@/types/property-old-details.types";

import { getFloorInformationColumns } from "./FloorInformationColumns";
import { useFloorInformationForm } from "@/hooks/ptis/QuickDataEntry/Olddetails/useFloorInformationForm";

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
  const { confirm } = useConfirm();
  const params = useParams();
  const propertyId = Number(params.propertyId);
  const locale = params.locale as string;

  const {
    formData,
    setFormData,
    subUseTypeOptions,
    isSubmitting,
    errors,
    showError,
    handleUseTypeChange,
    handleEdit,
    handleReset,
    handleSave,
    handleDelete
  } = useFloorInformationForm({
    propertyId,
    locale,
    initialSubUseTypeOptions
  });

  // Transformation helpers for SearchSelect
  // Transformation helpers for SearchSelect
  const initialFloorOptions = useMemo(() => floorOptions.map(opt => ({ label: `${opt.floorCode} - ${opt.description}`, value: String(opt.id) })), [floorOptions]);
  const initialSubFloorOptions = useMemo(() => subFloorOptions.map(opt => ({ label: `${opt.subFloorCode} - ${opt.description}`, value: String(opt.id) })), [subFloorOptions]);
  const initialConstructionTypeOptions = useMemo(() => constructionTypeOptions.map(opt => ({ label: `${opt.constructionCode} - ${opt.description}`, value: String(opt.id) })), [constructionTypeOptions]);
  const initialUseOptions = useMemo(() => useOptions.map(opt => ({ label: `${opt.typeOfUseCode} - ${opt.description}`, value: String(opt.id) })), [useOptions]);
  const currentSubUseTypeOptions = useMemo(() => subUseTypeOptions.map(opt => ({ label: opt.description, value: String(opt.id) })), [subUseTypeOptions]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-50 mb-10">
        <h3 className="text-base font-bold text-blue-800 mb-6 flex items-center gap-2 pb-3 border-b border-blue-100">
          <Layers className="w-5 h-5" />
          {formData.id ? t("oldDetails.updateFloorDetailsTitle") : t("oldDetails.floorDetailsTitle")}
        </h3>

        <div className="border border-blue-100 rounded-xl bg-gray-50/30 mb-8">
          {/* Floor Entry Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {/* Floor */}
            <div className="space-y-2 relative focus-within:z-100">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('floor.floorLabel')} <span className="text-red-500">*</span>
              </Label>
              <SearchSelect
                options={initialFloorOptions}
                placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                className="h-9 border-blue-100 focus:ring-blue-400"
                name="floor"
                onChange={(_, val) => setFormData(prev => ({ ...prev, oldFloorId: val }))}
                value={String(formData.oldFloorId)}
              />
              <ValidationMessage message={errors.oldFloorId} visible={showError("oldFloorId")} />
            </div>

            {/* Sub Floor */}
            <div className="space-y-2 relative focus-within:z-100">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('floor.subFloor')} <span className="text-red-500">*</span>
              </Label>
              <SearchSelect
                options={initialSubFloorOptions}
                placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                className="h-9 border-blue-100 focus:ring-blue-400"
                name="subFloor"
                onChange={(_, val) => setFormData(prev => ({ ...prev, oldSubFloorId: val }))}
                value={String(formData.oldSubFloorId)}
              />
              <ValidationMessage message={errors.oldSubFloorId} visible={showError("oldSubFloorId")} />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('oldDetails.year')} <span className="text-red-500">*</span>
              </Label>
              <Input
                className="h-9 border-blue-100 focus:ring-blue-400"
                placeholder="YYYY"
                maxLength={4}
                value={formData.oldConstructionYear}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, oldConstructionYear: val }));
                }}
              />
              <ValidationMessage message={errors.oldConstructionYear} visible={showError("oldConstructionYear")} />
            </div>

            {/* Assessment Year */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('oldDetails.assessmentYear')} <span className="text-red-500">*</span>
              </Label>
              <Input
                className="h-9 border-blue-100 focus:ring-blue-400"
                placeholder="YYYY"
                maxLength={4}
                value={formData.oldAssessmentYear || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, oldAssessmentYear: val }));
                }}
              />
              <ValidationMessage message={errors.oldAssessmentYear} visible={showError("oldAssessmentYear")} />
            </div>

            {/* Construction Type */}
            <div className="space-y-2 relative focus-within:z-100">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('floor.conTyp')} <span className="text-red-500">*</span>
              </Label>
              <SearchSelect
                options={initialConstructionTypeOptions}
                placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                className="h-9 border-blue-100 focus:ring-blue-400"
                name="conTyp"
                onChange={(_, val) => setFormData(prev => ({ ...prev, oldConstructionTypeId: val }))}
                value={String(formData.oldConstructionTypeId)}
              />
              <ValidationMessage message={errors.oldConstructionTypeId} visible={showError("oldConstructionTypeId")} />
            </div>

            {/* Type of Use */}
            <div className="space-y-2 relative focus-within:z-100">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('oldDetails.floordtails.use')} <span className="text-red-500">*</span>
              </Label>
              <SearchSelect
                options={initialUseOptions}
                placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                className="h-9 border-blue-100 focus:ring-blue-400"
                name="use"
                onChange={(_, val) => handleUseTypeChange(val)}
                value={String(formData.oldTypeOfUseId)}
              />
              <ValidationMessage message={errors.oldTypeOfUseId} visible={showError("oldTypeOfUseId")} />
            </div>

            {/* Sub Type */}
            <div className="space-y-2 relative focus-within:z-100">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('floor.subTyp')} <span className="text-red-500">*</span>
              </Label>
              <SearchSelect
                options={currentSubUseTypeOptions}
                placeholder={t('oldDetails.floordtails.selectPlaceholder')}
                className="h-9 border-blue-100 focus:ring-blue-400"
                name="subUseType"
                onChange={(_, val) => setFormData(prev => ({ ...prev, oldSubTypeOfUseId: val }))}
                value={String(formData.oldSubTypeOfUseId)}
              />
              <ValidationMessage message={errors.oldSubTypeOfUseId} visible={showError("oldSubTypeOfUseId")} />
            </div>

            {/* Carpet Area */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-blue-900 flex items-center gap-1">
                {t('oldDetails.carpetArea')} <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                className="h-9 border-blue-100 focus:ring-blue-400"
                placeholder={t('oldDetails.floordtails.carpetAreaPlaceholder')}
                value={formData.oldCarpetAreaSqFeet}
                onChange={(e) => setFormData(prev => ({ ...prev, oldCarpetAreaSqFeet: e.target.value }))}
              />
              <ValidationMessage message={errors.oldCarpetAreaSqFeet} visible={showError("oldCarpetAreaSqFeet")} />
            </div>
          </div>
          {/* Buttons Group */}
          <div className="flex justify-end mb-5 gap-5 mr-4">
            {!formData.id ? (
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                icon={Plus}
                className="h-11 w-40 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
              >
                {t('oldDetails.button.add')}
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                icon={Save}
                className="h-11 w-40 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
              >
                {t('property.updateButton')}
              </Button>
            )}

            {formData.id && (
              <Button
                onClick={handleReset}
                icon={RotateCcw}
                className="h-11 w-40 border border-blue-100 text-blue-600 hover:bg-blue-50 text-sm font-bold rounded-xl transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98]"
              >
                {tCommon('buttons.clear')}
              </Button>
            )}

          </div>
        </div>

        {/* MasterTable Section */}
        <div className="border border-blue-100 rounded-xl overflow-hidden bg-gray-50/30 mb-10">
          <MasterTable
            columns={getFloorInformationColumns(t)}
            data={existingFloorDetails.map(f => ({
              id: f.id,
              originalRow: f, // Keep reference for edit
              floor: f.floorDescription,
              subFloor: f.subFloorDescription,
              conYr: f.oldConstructionYear,
              assessmentYr: f.oldAssessmentYear || '',
              conTyp: f.constructionTypeDescription,
              use: f.typeOfUseDescription,
              subUse: f.subTypeOfUseDescription,
              carpetAreaSqFt: f.oldCarpetAreaSqFeet,
              builtupAreaSqFt: f.oldBuiltupAreaSqFeet || '',
            }))}
            totalCount={existingFloorDetails.length}
            getRowKey={(row: FloorTableRow) => String(row.id || "")}
            maxBodyHeightClassName="max-h-[400px]"
            theadClassName="bg-blue-50 text-blue-900 border-b border-blue-100"
            rowClassName={() => "hover:bg-blue-50/50 transition-colors"}
            actionLabel={t('floor.actions')}
            renderActions={useCallback((row: FloorTableRow) => (
              <div className="flex items-center gap-2">
                <EditButton onClick={() => handleEdit(row.originalRow)} />
                <DeleteButton
                  onClick={() => {
                    confirm({
                      variant: "delete",
                      title: tCommon("messages.confirmDelete"),
                      meta: { id: row.id, name: row.floor },
                      onConfirm: async () => {
                        await handleDelete(row.id);
                      }
                    });
                  }}
                />
              </div>
            ), [handleEdit, handleDelete, confirm, tCommon])}
          />
        </div>
      </div>
    </div>
  )
}
