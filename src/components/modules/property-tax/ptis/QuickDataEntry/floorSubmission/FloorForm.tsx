/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { Edit2, X } from 'lucide-react';
import {
  Button,
  IconButton,
} from '@/components/common';
import { FloorFormProps } from '@/types/floor-details.types';
import { LookupData } from '@/types/common-details.types';
import {
  getFloorDescription,
  getSubFloorDescription,
  getConstructionDescription,
  getUseDescription,
  getSubTypeDescription,
} from '@/lib/utils/floorSubmission/floor-mappers';

import { floorFormSchema } from '@/lib/validations/floor-form.schema';

import {
  BasicInfoSection,
  UsageSection,
  RenterSection,
  AreaSection,
} from './components';

const FloorForm: React.FC<FloorFormProps & {
  selectedFloorType?: 'Construction' | 'OpenPlot';
  isPlotCategory?: boolean;
  isAreaExceeded?: boolean;
  plotAreaSqM?: number;
  isOpenSpaceAreaExceeded?: boolean;
  isFloorAreaExceeded?: boolean;
  totalOpenSpaceAreaSqM?: number;
  totalConstructionAreaSqM?: number;
  availableRemainingOpenSpaceAreaSqM?: number;
  availableRemainingConstructionAreaSqM?: number;
  enteredFloorAreaSqM?: number;
  alreadyUtilizedOpenSpaceAreaSqM?: number;
  enteredOpenSpaceAreaSqM?: number;
}> = ({
  t,
  isAddingNewFloor,
  editingFloorForm,
  setEditingFloorForm,
  formErrors,
  setFormErrors,
  resetForm,
  handleOpenDropdown,
  handleOpenRenterManagement,
  updateUrlParams,
  isOperationLoading,
  startTransition,
  roomsInputRef,
  areaInputRef,
  floorOptions,
  floorLookup,
  subFloorOptions,
  subFloorLookup,
  constructionTypeOptions,
  constructionLookup,
  useOptions,
  useLookup,
  subTypeOptionsFromData,
  subTypeData,
  setShowRoomSubmission,
  onSave,
  selectedFloorType = 'Construction',
  isPlotCategory = false,
  isAreaExceeded = false,
  plotAreaSqM = 0,
  isOpenSpaceAreaExceeded = false,
  isFloorAreaExceeded = false,
  totalOpenSpaceAreaSqM = 0,
  totalConstructionAreaSqM = 0,
  availableRemainingOpenSpaceAreaSqM = 0,
  availableRemainingConstructionAreaSqM = 0,
  enteredFloorAreaSqM = 0,
  alreadyUtilizedOpenSpaceAreaSqM = 0,
  enteredOpenSpaceAreaSqM = 0,
}) => {
  const isFormValid = React.useMemo(() => {
    const result = floorFormSchema.safeParse({
      ...editingFloorForm,
      isAddingNewFloor,
      selectedFloorType,
    });
    return result.success;
  }, [editingFloorForm, isAddingNewFloor, selectedFloorType]);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 m-0 p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          {isAddingNewFloor
            ? (selectedFloorType === 'OpenPlot' ? (t('floor.addOpenPlotDetails') || 'Add Open Plot Details') : (t('floor.addFloorDetails') || 'Add Floor Details'))
            : (selectedFloorType === 'OpenPlot' ? (t('floor.editOpenPlotDetails') || 'Edit Open Plot Details') : (t('floor.editFloorDetails') || 'Edit Floor Details'))}
        </h3>
        <IconButton
          icon={X}
          onClick={() => {
            resetForm();
          }}
          className="bg-transparent border-0 hover:bg-blue-50 text-blue-400 hover:text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <BasicInfoSection
          t={t}
          editingFloorForm={editingFloorForm}
          setEditingFloorForm={setEditingFloorForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          floorOptions={floorOptions}
          floorLookup={floorLookup}
          subFloorOptions={subFloorOptions}
          subFloorLookup={subFloorLookup}
          getFloorDescription={(val: string, lookup: LookupData[]): string => val ? (getFloorDescription(val, lookup) || String(editingFloorForm.floorDescription || '')) : ''}
          getSubFloorDescription={(val: string, lookup: LookupData[]): string => val ? (getSubFloorDescription(val, lookup) || String(editingFloorForm.subFloorDescription || '')) : ''}
          handleOpenDropdown={handleOpenDropdown}
          selectedFloorType={selectedFloorType}
          isAddingNewFloor={isAddingNewFloor}
        />

        <UsageSection
          t={t}
          editingFloorForm={editingFloorForm}
          setEditingFloorForm={setEditingFloorForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          constructionTypeOptions={constructionTypeOptions}
          constructionLookup={constructionLookup}
          useOptions={useOptions}
          useLookup={useLookup}
          subTypeOptionsFromData={subTypeOptionsFromData}
          subTypeData={subTypeData}
          startTransition={startTransition}
          updateUrlParams={updateUrlParams}
          getConstructionDescription={(val: string, lookup: LookupData[]): string => val ? (getConstructionDescription(val, lookup) || String(editingFloorForm.constructionTypeDescription || '')) : ''}
          getUseDescription={(val: string, lookup: LookupData[]): string => val ? (getUseDescription(val, lookup) || String(editingFloorForm.typeOfUseDescription || '')) : ''}
          getSubTypeDescription={(val: string, lookup: LookupData[]): string => val ? (getSubTypeDescription(val, lookup) || String(editingFloorForm.subTypeOfUseDescription || '')) : ''}
          handleOpenDropdown={handleOpenDropdown}
          selectedFloorType={selectedFloorType}
          isPlotCategory={isPlotCategory}
        />

        {selectedFloorType !== 'OpenPlot' && (
          <RenterSection
            t={t}
            editingFloorForm={editingFloorForm}
            setEditingFloorForm={setEditingFloorForm}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            handleOpenRenterManagement={handleOpenRenterManagement}
            isOperationLoading={isOperationLoading}
          />
        )}

        <AreaSection
          t={t}
          editingFloorForm={editingFloorForm}
          setEditingFloorForm={setEditingFloorForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          roomsInputRef={roomsInputRef}
          areaInputRef={areaInputRef}
          setShowRoomSubmission={setShowRoomSubmission}
          selectedFloorType={selectedFloorType}
        />

        {selectedFloorType === 'OpenPlot' && isOpenSpaceAreaExceeded && (
          <div className="md:col-span-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-xs font-semibold space-y-2 whitespace-pre-line shadow-sm">
            <span className="font-bold text-sm block text-red-800">
              Open Space Area cannot exceed the available remaining area ({parseFloat(Number(availableRemainingOpenSpaceAreaSqM || 0).toFixed(2))} Sq.M).
            </span>
            <div>
              <p>Plot Area: {parseFloat(Number(plotAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Total Construction Area: {parseFloat(Number(totalConstructionAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Already Utilized Open Space Area: {parseFloat(Number(alreadyUtilizedOpenSpaceAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Attempted Open Space Area: {parseFloat(Number(enteredOpenSpaceAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Remaining Area for Open Space: {parseFloat(Number(availableRemainingOpenSpaceAreaSqM || 0).toFixed(2))} Sq M</p>
            </div>
            <p className="text-red-600 font-bold mt-1">
              Please enter an Open Space area less than or equal to the remaining area.
            </p>
          </div>
        )}

        {selectedFloorType === 'Construction' && isFloorAreaExceeded && (
          <div className="md:col-span-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4 text-xs font-semibold space-y-2 whitespace-pre-line shadow-sm">
            <span className="font-bold text-sm block text-red-800">
              Floor Built-up Area cannot exceed the available remaining area ({parseFloat(Number(availableRemainingConstructionAreaSqM || 0).toFixed(2))} Sq.M).
            </span>
            <div>
              <p>Plot Area: {parseFloat(Number(plotAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Already Utilized Open Space Area: {parseFloat(Number(totalOpenSpaceAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Entered Floor Built-up Area: {parseFloat(Number(enteredFloorAreaSqM || 0).toFixed(2))} Sq M</p>
              <p>Remaining Area: {parseFloat(Number(availableRemainingConstructionAreaSqM || 0).toFixed(2))} Sq M</p>
            </div>
            <p className="text-red-600 font-bold mt-1">
              Please enter a Construction area less than or equal to the remaining area.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end md:col-span-3">
          <Button
            onClick={onSave}
            isLoading={isOperationLoading}
            disabled={isOperationLoading || !isFormValid || isAreaExceeded}
            className="px-6 h-9 text-xs font-bold shadow-md rounded-lg transition-all duration-300 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none"
          >
            {isAddingNewFloor ? t('floor.add') : t('floor.updateFloor')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloorForm;
