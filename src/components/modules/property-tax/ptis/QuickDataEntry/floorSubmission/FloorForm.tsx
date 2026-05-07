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

import {
  BasicInfoSection,
  UsageSection,
  RenterSection,
  AreaSection,
} from './components';

const FloorForm: React.FC<FloorFormProps> = ({
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
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          {isAddingNewFloor ? t('floor.addFloorDetails') : t('floor.editFloorDetails')}
        </h3>
        <IconButton
          icon={X}
          onClick={() => {
            resetForm();
          }}
          className="bg-transparent border-0 hover:bg-blue-50 text-blue-400 hover:text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          getFloorDescription={(val: string, lookup: LookupData[]): string => getFloorDescription(val, lookup) || String(editingFloorForm.floorDescription || '')}
          getSubFloorDescription={(val: string, lookup: LookupData[]): string => getSubFloorDescription(val, lookup) || String(editingFloorForm.subFloorDescription || '')}
          handleOpenDropdown={handleOpenDropdown}
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
          getConstructionDescription={(val: string, lookup: LookupData[]): string => getConstructionDescription(val, lookup) || String(editingFloorForm.constructionTypeDescription || '')}
          getUseDescription={(val: string, lookup: LookupData[]): string => getUseDescription(val, lookup) || String(editingFloorForm.typeOfUseDescription || '')}
          getSubTypeDescription={(val: string, lookup: LookupData[]): string => getSubTypeDescription(val, lookup) || String(editingFloorForm.subTypeOfUseDescription || '')}
          handleOpenDropdown={handleOpenDropdown}
        />

        <RenterSection
          t={t}
          editingFloorForm={editingFloorForm}
          setEditingFloorForm={setEditingFloorForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          handleOpenRenterManagement={handleOpenRenterManagement}
          isOperationLoading={isOperationLoading}
        />

        <AreaSection
          t={t}
          editingFloorForm={editingFloorForm}
          setEditingFloorForm={setEditingFloorForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          roomsInputRef={roomsInputRef}
          areaInputRef={areaInputRef}
          setShowRoomSubmission={setShowRoomSubmission}
        />

        <div className="mt-4 flex justify-end md:col-span-3">
          <Button
            onClick={onSave}
            isLoading={isOperationLoading}
            disabled={isOperationLoading}
            className="px-6 h-9 text-xs font-bold shadow-md rounded-lg transition-all duration-300 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95"
          >
            {isAddingNewFloor ? t('floor.add') : t('floor.updateFloor')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloorForm;
