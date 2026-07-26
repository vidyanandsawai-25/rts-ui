/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React from 'react';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFloorSubmission } from '@/hooks/ptis/floorSubmission/useFloorSubmission';
import { EditSidebarProps, FloorSubmissionPayload } from '@/types/floor-details.types';
import FloorTable from './FloorTable';
import FloorForm from './FloorForm';
import { RoomSubmissionModal, PlotAreaCalculator, SubmissionOverlayLoader, SubmissionApiErrors, DataEntrySameAsDrawer } from './components';
import { LoadingPage } from '@/components/common';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';
import { RoomAPIResponse, FloorData } from '@/types/room-details.types';
import { submitFloorSubmissionNoRedirectAction, updateFloorSubmissionNoRedirectAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

import { validateOpenPlotForm } from '@/lib/validations/validateOpenPlotForm';

import {
  OpenPlotCategoryItem,
  filterOpenPlotCategories,
  isOpenPlotCodeTaxable,
} from '@/lib/utils/floorSubmission/openplot-category';

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
    selectedFloorType,
    setSelectedFloorType,
    isPlotCategory,
    // Validation fields
    plotAreaSqM,
    setPlotAreaSqM,
    isAreaExceeded,
    isOpenSpaceAreaExceeded,
    isFloorAreaExceeded,
    totalConstructionAreaSqM,
    totalOpenSpaceAreaSqM,
    availableRemainingOpenSpaceAreaSqM,
    availableRemainingConstructionAreaSqM,
    enteredFloorAreaSqM,
    alreadyUtilizedOpenSpaceAreaSqM,
    enteredOpenSpaceAreaSqM,
    locale,
    localFloors,
  } = useFloorSubmission(props);

  const router = useRouter();
  const [isAddingArea, setIsAddingArea] = React.useState(false);

  const openPlotCategoryOptions = React.useMemo(() => {
    return filterOpenPlotCategories(props.useData);
  }, [props.useData]);

  const [selectedOpenPlotCategory, setSelectedOpenPlotCategory] = React.useState<OpenPlotCategoryItem | null>(null);

  const openPlotRecord = React.useMemo(() => {
    const floors = ((localFloors && localFloors.length > 0) ? localFloors : (props.initialFloors || [])) as FloorData[];
    return floors.find(
      (f: FloorData) =>
        f.isOpenPlot === true ||
        String(f.floorId) === '77' ||
        String(f.floor) === '77'
    ) as FloorData | undefined;
  }, [localFloors, props.initialFloors]);

  // Auto-select previously saved TypeOfUseId during Edit mode
  React.useEffect(() => {
    if (openPlotRecord) {
      const rawId = Number(
        (openPlotRecord as any).typeOfUseId ||
        (openPlotRecord as any).useId ||
        (openPlotRecord as any).use ||
        0
      );
      const matched = openPlotCategoryOptions.find(
        (c) => Number(c.id || c.typeOfUseId) === rawId
      );
      if (matched) {
        setSelectedOpenPlotCategory(matched);
      }
    }
  }, [openPlotRecord, openPlotCategoryOptions]);

  const dynamicPlotArea = React.useMemo(() => {
    if (openPlotRecord) {
      const rooms = ((openPlotRecord as any).roomWiseSubmissionDetails || (openPlotRecord as any).propertyRooms || []) as any[];
      const firstRoom = (rooms[0] || {}) as any;
      return {
        length: firstRoom.lengthMtr || firstRoom.length || (openPlotRecord as any).length || '',
        width: firstRoom.widthMtr || firstRoom.width || (openPlotRecord as any).width || '',
        totalPlotArea: (openPlotRecord as any).carpetAreaSqMeter || (openPlotRecord as any).builtupAreaSqMeter || firstRoom.areaSqMtr || '',
      };
    }
    return props.initialPlotArea;
  }, [openPlotRecord, props.initialPlotArea]);

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

  const searchParams = useSearchParams();
  const initShowDrawer = searchParams?.get('dataEntrySameAs') === 'true';
  const [showDataEntrySameAsDrawer, setShowDataEntrySameAsDrawer] = React.useState(initShowDrawer);

  // Derive categoryName from initialPropertyData (comes from PropertyCategoryMaster via API)
  // Using name instead of numeric ID so it's not tied to hardcoded DB values
  const categoryName = React.useMemo(() => {
    const name = props.initialPropertyData?.categoryName;
    return typeof name === 'string' ? name.trim() : '';
  }, [props.initialPropertyData]);

  // Individual property: Data Entry Same As button should always be enabled
  const isIndividualProperty = categoryName.toLowerCase() === 'individual';

  const handleOpenDataEntrySameAsDrawer = React.useCallback(() => {
    setShowDataEntrySameAsDrawer(true);
    updateUrlParams({ dataEntrySameAs: 'true' });
  }, [updateUrlParams]);

  const handleCloseDataEntrySameAsDrawer = React.useCallback(() => {
    setShowDataEntrySameAsDrawer(false);
    updateUrlParams({ dataEntrySameAs: null });
  }, [updateUrlParams]);

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
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
        {/* Show overlay loader during save/update/delete operations to keep component tree mounted */}
        <SubmissionOverlayLoader isLoading={isOperationLoading} t={t} />
        {/* Render API errors if any */}
        <SubmissionApiErrors apiErrors={props.apiErrors} t={t} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* All Floors Table Section */}
          <FloorTable
            t={t}
            filteredFloors={filteredFloors}
            selectedFloorType={selectedFloorType}
            floorSearch={floorSearch}
            setFloorSearch={setFloorSearch}
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            isAddingNewFloor={isAddingNewFloor}
            setIsAddingNewFloor={setIsAddingNewFloor}
            handleAddFloor={handleAddFloor}
            handleOpenDataEntrySameAs={handleOpenDataEntrySameAsDrawer}
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
            isPlotCategory={isPlotCategory}
            partitionNo={props.partitionNo}
            isIndividualProperty={isIndividualProperty}
          />


          {/* Plot Area Calculator Section */}
          {(selectedFloorType === 'Construction' || selectedFloorType === 'OpenPlot') && (
            <PlotAreaCalculator
              t={t}
              layout="single-row"
              propertyId={props.initialPropertyID}
              initialPlotArea={dynamicPlotArea}
              isLoading={isAddingArea}
              buttonText={openPlotRecord ? (t('floor.updateArea') || 'Update Area') : (t('floor.applyArea') || 'Add Area')}
              selectedFloorType={selectedFloorType}
              onChangeFloorType={(type) => {
                setSelectedFloorType(type);
                handleAddFloor();
              }}
              openPlotCategories={openPlotCategoryOptions}
              selectedOpenPlotCategory={selectedOpenPlotCategory}
              onChangeOpenPlotCategory={(cat) => {
                setSelectedOpenPlotCategory(cat);
                if (cat && (selectedFloorType === 'OpenPlot' || editingFloorForm?.isOpenPlot)) {
                  const isTaxable = isOpenPlotCodeTaxable(cat.typeOfUseCode);
                  setEditingFloorForm((prev) => ({
                    ...prev,
                    typeOfUseId: cat.id,
                    use: String(cat.id),
                    typeOfUseDescription: cat.description,
                    isTaxable: isTaxable ? 'Yes' : 'No',
                    taxLiability: isTaxable ? 'Taxable' : 'NonTaxable',
                  }));
                }
              }}
              handleOpenDropdown={handleOpenDropdown}
              menuPlacement={Boolean(selectedFloor || isAddingNewFloor) ? 'bottom' : 'top'}
              onLoad={(_sqFt, sqM) => {
                setPlotAreaSqM(parseFloat(sqM) || 0);
                // onLoad should only set the plot area. It should not modify form state on initial mount.
              }}
              onChange={(_sqFt, sqM) => {
                setPlotAreaSqM(parseFloat(sqM) || 0);
              }}
              onApply={async (_sqFt: string, _sqM: string, len?: string, wid?: string) => {
                const validation = validateOpenPlotForm(selectedOpenPlotCategory, len, wid);
                if (!validation.isValid) {
                  let msg = validation.errorMessage || 'Validation failed';
                  if (validation.errorKey) {
                    try {
                      const translated = t(validation.errorKey);
                      if (translated && !translated.startsWith('quickDataEntry.') && !translated.startsWith('MISSING_MESSAGE')) {
                        msg = translated;
                      }
                    } catch (_err) {
                      // Fall back to validation.errorMessage
                    }
                  }
                  toast.error(msg);
                  return;
                }

                const { plotLength, plotWidth, areaSqMeter } = validation;
                const areaSqFeet = convertSqMToSqFt(areaSqMeter);
                const currentYear = new Date().getFullYear().toString();

                // Update local state before the API call
                setPlotAreaSqM(areaSqMeter);

                setIsAddingArea(true);
                try {
                  const roomsList = ((openPlotRecord as any)?.roomWiseSubmissionDetails || (openPlotRecord as any)?.propertyRooms || []) as any[];
                  const lastRoomRecord = roomsList.length > 0 ? roomsList[roomsList.length - 1] : null;
                  const roomRecordId = Number(lastRoomRecord?.id || lastRoomRecord?.roomWiseSubmissionId || 0);

                  const isCategoryTaxable = isOpenPlotCodeTaxable(selectedOpenPlotCategory?.typeOfUseCode);

                  const propId = Number(props.initialPropertyID || props.initialPropertyData?.propertyId || 0);

                  const completePayload = {
                    ...(props.initialPropertyData || {}),
                    propertyId: propId,
                    id: openPlotRecord?.id || 0,
                    propertyDetailsId: openPlotRecord?.id || 0,
                    isOpenPlot: true,
                    selectedFloorType: 'OpenPlot',
                    floorId: 77,
                    constructionTypeId: 11,
                    typeOfUseId: selectedOpenPlotCategory?.id,
                    typeOfUseDescription: selectedOpenPlotCategory?.description || '',
                    selectedOpenPlotCategory: selectedOpenPlotCategory,
                    openPlotCategory: selectedOpenPlotCategory,
                    isTaxable: isCategoryTaxable ? 'Yes' : 'No',
                    taxLiability: isCategoryTaxable ? 'Taxable' : 'NonTaxable',
                    constructionYear: currentYear,
                    assessmentYear: currentYear,
                    length: plotLength,
                    width: plotWidth,
                    carpetAreaSqMeter: areaSqMeter,
                    carpetAreaSqFeet: areaSqFeet,
                    builtupAreaSqMeter: areaSqMeter,
                    builtupAreaSqFeet: areaSqFeet,
                    roomWiseSubmissionDetails: [
                      {
                        ...(lastRoomRecord || {}),
                        id: roomRecordId,
                        roomWiseSubmissionId: roomRecordId,
                        propertyId: propId,
                        propertyDetailsId: openPlotRecord?.id || 0,
                        roomNo: String(lastRoomRecord?.roomNo || '1'),
                        roomType: String(lastRoomRecord?.roomType || 'OpenPlot'),
                        shape: String(lastRoomRecord?.shape || 'Rectangle'),
                        lengthMtr: plotLength,
                        widthMtr: plotWidth,
                        areaSqMtr: areaSqMeter,
                        totalAreaSqMtr: areaSqMeter,
                      },
                    ],
                  };

                  let response;
                  if (openPlotRecord) {
                    response = await updateFloorSubmissionNoRedirectAction(Number(openPlotRecord.id || 0), completePayload as unknown as FloorSubmissionPayload, locale, props.initialPropertyID || 0);
                  } else {
                    response = await submitFloorSubmissionNoRedirectAction(completePayload as unknown as FloorSubmissionPayload, locale, props.initialPropertyID || 0);
                  }

                  if (response.success) {
                    toast.success(openPlotRecord ? (t('floor.errors.areaUpdatedSuccess') || "Area updated successfully.") : (t('floor.errors.areaAddedSuccess') || "Area added successfully."));
                    startTransition(() => {
                      router.refresh();
                    });
                  } else {
                    toast.error(response.error || t('floor.errors.failedToSaveArea') || "Failed to save area.");
                  }
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : (t('floor.unexpectedError') || "An unexpected error occurred."));
                } finally {
                  setIsAddingArea(false);
                }
              }}
            />
          )}


          {/* Edit Floor Form Section */}
          {(selectedFloor || isAddingNewFloor) && !showDataEntrySameAsDrawer && (
            <div className="!mt-2 space-y-3">
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
                selectedFloorType={selectedFloorType}
                isPlotCategory={isPlotCategory}
                isAreaExceeded={isAreaExceeded}
                plotAreaSqM={plotAreaSqM}
                isOpenSpaceAreaExceeded={isOpenSpaceAreaExceeded}
                isFloorAreaExceeded={isFloorAreaExceeded}
                totalOpenSpaceAreaSqM={totalOpenSpaceAreaSqM}
                totalConstructionAreaSqM={totalConstructionAreaSqM}
                availableRemainingOpenSpaceAreaSqM={availableRemainingOpenSpaceAreaSqM}
                availableRemainingConstructionAreaSqM={availableRemainingConstructionAreaSqM}
                enteredFloorAreaSqM={enteredFloorAreaSqM}
                alreadyUtilizedOpenSpaceAreaSqM={alreadyUtilizedOpenSpaceAreaSqM}
                enteredOpenSpaceAreaSqM={enteredOpenSpaceAreaSqM}
              />
            </div>
          )}

        </div>
      </div>

      <DataEntrySameAsDrawer
        isOpen={showDataEntrySameAsDrawer}
        onClose={handleCloseDataEntrySameAsDrawer}
        t={t}
        wardId={props.wardId}
        wardNo={props.wardNo}
        propertyNo={props.propertyNo}
        partitionNo={props.partitionNo}
        initialPropertyID={props.initialPropertyID}
        categoryName={categoryName}

        // Pass FloorTable related props to render view-only floor table inside the drawer
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

      <RoomSubmissionModal
        key={`${editingFloorForm.floorId || editingFloorForm.id || ''}-${editingFloorForm.noOfRooms || editingFloorForm.rooms || 0}`}
        isOpen={showRoomSubmission}
        onClose={() => setShowRoomSubmission(false)}
        t={t}
        wardNo={props.wardNo}
        propertyNo={props.propertyNo}
        partitionNo={props.partitionNo}
        floorNumber={String(editingFloorForm.floor || '')}
        maxRooms={Number(editingFloorForm.noOfRooms || editingFloorForm.rooms || 0)}
        floorData={editingFloorForm}
        initialFloorId={editingFloorForm.floorId || editingFloorForm.id}
        initialPropertyID={props.initialPropertyID}
        existingRooms={(editingFloorForm?.roomWiseSubmissionDetails as RoomAPIResponse[]) || []}
        roomTypeData={props?.roomTypeData}
        onUpdate={(data) => {
          const areaSqM = data.totalAreaSqM;
          const builtUpSqM = data.builtUpAreaSqM;
          const areaSqFt = convertSqMToSqFt(areaSqM);
          const builtUpAreaSqFt = convertSqMToSqFt(builtUpSqM);

          setEditingFloorForm(prev => ({
            ...prev,
            roomWiseSubmissionDetails: data.rooms as RoomAPIResponse[],
            areaSqM: areaSqM.toFixed(2),
            areaSqFt: areaSqFt.toFixed(2),
            builtupAreaSqM: builtUpSqM.toFixed(2),
            builtupAreaSqFt: builtUpAreaSqFt.toFixed(2),
            rooms: data.rooms.length,
            noOfRooms: data.rooms.length
          }));

          setFormErrors(prev => {
            const next = { ...prev };
            delete next.rooms;
            delete next.areaSqFt;
            delete next.areaSqM;
            delete next.builtupAreaSqFt;
            delete next.builtupAreaSqM;
            return next;
          });
        }}
      />

    </>
  );
};

export default FloorSubmission;
