'use client';


import React from 'react';
import { useFloorSubmission } from '@/hooks/ptis/floorSubmission/useFloorSubmission';
import { EditSidebarProps } from '@/types/floor-details.types';
import { LoadingPage } from '@/components/common';
import FloorTable from './FloorTable';
import FloorForm from './FloorForm';
import { RoomSubmissionModal } from './components';

const FloorSubmission: React.FC<EditSidebarProps> = (props) => {
  const {
    t,
    isOperationLoading,
    floorSearch,
    setFloorSearch,
    filteredFloors,
    selectedFloor,
    setSelectedFloor,
    isAddingNewFloor,
    setIsAddingNewFloor,
    editingFloorForm,
    setEditingFloorForm,
    formErrors,
    setFormErrors,
    showRoomSubmission,
    setShowRoomSubmission,
    subTypeOptionsFromData,
    roomsInputRef,
    areaInputRef,
    // Handlers
    updateUrlParams,
    handleOpenDropdown,
    resetForm,
    handleAddFloor,
    handleOpenRenterManagement,
    handleDeleteFloor,
    handleSave,
    startTransition,
  } = useFloorSubmission(props);

  const {
    floorData: floorLookup,
    subFloorData: subFloorLookup,
    constructionTypeData: constructionLookup,
    useData: useLookup,
    subTypeData,
    floorOptions,
    subFloorOptions,
    constructionTypeOptions,
    useOptions,
  } = props;

  // Show full-screen loader during save/update/delete operations
  if (isOperationLoading) {
    return (
      <LoadingPage
        translationNamespace="quickDataEntry"
        messageKey={isAddingNewFloor ? 'floor.addingFloor' : 'floor.updatingFloor'}
        descriptionKey="floor.pleaseWait"
      />
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Render API errors if any */}
        {Array.isArray(props.apiErrors) && props.apiErrors.length > 0 && (
          <div className="p-2 mb-2 bg-red-50 border border-red-200 text-red-700 rounded">
            <ul className="list-disc pl-5">
              {props.apiErrors.map((err, i) => (
                <li key={i}>{t(err)}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* All Floors Table Section */}
          <FloorTable
            t={t}
            filteredFloors={filteredFloors}
            floorSearch={floorSearch}
            setFloorSearch={setFloorSearch}
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            isAddingNewFloor={isAddingNewFloor}
            setIsAddingNewFloor={setIsAddingNewFloor}
            handleAddFloor={handleAddFloor}
            updateUrlParams={updateUrlParams}
            handleDeleteFloor={handleDeleteFloor}
            startTransition={startTransition}
            setFormErrors={setFormErrors}
            floorLookup={floorLookup}
            subFloorLookup={subFloorLookup}
            constructionLookup={constructionLookup}
            useLookup={useLookup}
            subTypeData={subTypeData || []}
            setEditingFloorForm={setEditingFloorForm}
          />

          {/* Edit Floor Form Section */}
          {(selectedFloor || isAddingNewFloor) && (
            <FloorForm
              t={t}
              isAddingNewFloor={isAddingNewFloor}
              editingFloorForm={editingFloorForm}
              setEditingFloorForm={setEditingFloorForm}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              resetForm={resetForm}
              handleOpenDropdown={handleOpenDropdown}
              handleOpenRenterManagement={handleOpenRenterManagement}
              updateUrlParams={updateUrlParams}
              isOperationLoading={isOperationLoading}
              startTransition={startTransition}
              roomsInputRef={roomsInputRef}
              areaInputRef={areaInputRef}
              floorOptions={floorOptions}
              floorLookup={floorLookup}
              subFloorOptions={subFloorOptions}
              subFloorLookup={subFloorLookup}
              constructionTypeOptions={constructionTypeOptions}
              constructionLookup={constructionLookup}
              useOptions={useOptions}
              useLookup={useLookup}
              subTypeOptionsFromData={subTypeOptionsFromData}
              subTypeData={subTypeData || []}
              setShowRoomSubmission={setShowRoomSubmission}
              onSave={handleSave}
            />
          )}

        </div>
      </div>

      <RoomSubmissionModal
        show={showRoomSubmission}
        onClose={() => setShowRoomSubmission(false)}
        t={t}
      />
    </>
  );
};

export default FloorSubmission;
