/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { toast } from 'sonner';
import { useFloorSubmission } from '@/hooks/ptis/floorSubmission/useFloorSubmission';
import { EditSidebarProps, FloorSubmissionPayload } from '@/types/floor-details.types';
import FloorTable from './FloorTable';
import FloorForm from './FloorForm';
import { RoomSubmissionModal, PlotAreaCalculator, FloorTypeToggle, SubmissionOverlayLoader, SubmissionApiErrors, DataEntrySameAsDrawer } from './components';
import { LoadingPage } from '@/components/common';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';
import { RoomAPIResponse, FloorData } from '@/types/room-details.types';
import { submitFloorSubmissionNoRedirectAction, updateFloorSubmissionNoRedirectAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

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
    router,
    localFloors,
  } = useFloorSubmission(props);

  const [isAddingArea, setIsAddingArea] = React.useState(false);

  const openPlotRecord = React.useMemo(() => {
    const floors = ((localFloors && localFloors.length > 0) ? localFloors : (props.initialFloors || [])) as FloorData[];
    return floors.find(
      (f: FloorData) =>
        f.isOpenPlot === true ||
        String(f.floorId) === '77' ||
        String(f.floor) === '77'
    ) as FloorData | undefined;
  }, [localFloors, props.initialFloors]);

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

  const [showDataEntrySameAsDrawer, setShowDataEntrySameAsDrawer] = React.useState(false);

  const handleOpenDataEntrySameAsDrawer = React.useCallback(() => {
    setShowDataEntrySameAsDrawer(true);
  }, []);

  const handleCloseDataEntrySameAsDrawer = React.useCallback(() => {
    setShowDataEntrySameAsDrawer(false);
  }, []);

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


          {/* Header Controls and Area Comparison Row */}
          <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center 2xl:justify-between gap-4 bg-white border border-slate-200 rounded-xl py-2.5 px-4 shadow-sm">
            {/* Toggle buttons */}
            <div className="flex-shrink-0">
              <FloorTypeToggle
                selectedFloorType={selectedFloorType}
                onChange={setSelectedFloorType}
                isPlotCategory={isPlotCategory}
                t={t}
                size="md"
              />
            </div>

            {/* Real-time Summary Area Display */}
            {(selectedFloorType === 'Construction' || selectedFloorType === 'OpenPlot') && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 w-full 2xl:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 shadow-2xs">
                  <span className="text-slate-500">{t('floor.plotAreaColon') || 'Plot Area:'}</span>
                  <span className="text-sm font-extrabold text-slate-800">{parseFloat(Number(plotAreaSqM || 0).toFixed(2))} {t('floor.sqMText') || 'Sq M'}</span>
                </div>
                {/* <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 shadow-2xs">
                  <span className="text-slate-500">{t('floor.utilizedAreaColon') || 'Utilized Area:'}</span>
                  <span className="text-sm font-extrabold text-slate-800">{parseFloat(Number(totalConstructionAreaSqM || 0).toFixed(2))} {t('floor.sqMText') || 'Sq M'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 shadow-2xs">
                  <span className="text-slate-500">{t('floor.openSpaceAreaColon') || 'Open Space Area:'}</span>
                  <span className="text-sm font-extrabold text-slate-800">{parseFloat(Number(totalOpenSpaceAreaSqM || 0).toFixed(2))} {t('floor.sqMText') || 'Sq M'}</span>
                </div>
                <div className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 shadow-2xs ${remainingAvailablePlotAreaSqM < 0
                  ? 'bg-red-50 border-red-100/80 text-red-700'
                  : 'bg-emerald-50 border-emerald-100/80 text-emerald-700'
                  }`}>
                  <span className={remainingAvailablePlotAreaSqM < 0 ? 'text-red-600' : 'text-emerald-600'}>{t('floor.remainingAreaColon') || 'Remaining Area:'}</span>
                  <span className={`text-sm font-extrabold ${remainingAvailablePlotAreaSqM < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {parseFloat(Number(remainingAvailablePlotAreaSqM || 0).toFixed(2))} {t('floor.sqMText') || 'Sq M'}
                  </span>
                </div> */}
              </div>
            )}
          </div>

          {/* Plot Area Calculator Section */}
          {(selectedFloorType === 'Construction' || selectedFloorType === 'OpenPlot') && (
            <PlotAreaCalculator
              t={t}
              layout="single-row"
              propertyId={props.initialPropertyID}
              initialPlotArea={dynamicPlotArea}
              isLoading={isAddingArea}
              buttonText={openPlotRecord ? (t('floor.updateArea') || 'Update Area') : (t('floor.applyArea') || 'Add Area')}
              onLoad={(_sqFt, sqM) => {
                setPlotAreaSqM(parseFloat(sqM) || 0);
                // onLoad should only set the plot area. It should not modify form state on initial mount.
              }}
              onChange={(_sqFt, sqM) => {
                setPlotAreaSqM(parseFloat(sqM) || 0);
              }}
              onApply={async (_sqFt: string, _sqM: string, len?: string, wid?: string) => {
                const plotLength = parseFloat(len || '0');
                const plotWidth = parseFloat(wid || '0');

                if (isNaN(plotLength) || plotLength <= 0 || isNaN(plotWidth) || plotWidth <= 0) {
                  toast.error(t('floor.errors.invalidDimensions') || "Length and Width must be greater than 0.");
                  return;
                }

                const targetFloor = (floorLookup || []).find((f: any) => String(f.floorId) === '77' || String(f.floorCode) === '77' || String(f.floorCode) === '0');
                const targetConstruction = (constructionLookup || []).find((c: any) => String(c.constructionTypeId) === '11' || String(c.constructionTypeCode) === 'op' || String(c.description || '').toLowerCase().includes('open plot'));
                const targetUse = (useLookup || []).find((u: any) => String(u.typeOfUseId) === '10' || String(u.typeOfUseCode) === 'OPR' || String(u.description || '').includes('OPR'));

                const resolvedFloorId = targetFloor ? Number(targetFloor.floorId) : 77;
                const resolvedFloorVal = targetFloor ? String(targetFloor.floorId) : '77';
                const resolvedConstructionTypeId = targetConstruction ? Number(targetConstruction.constructionTypeId) : 11;
                const resolvedConstructionVal = targetConstruction ? String(targetConstruction.constructionTypeId) : '11';
                const resolvedTypeOfUseId = targetUse ? Number(targetUse.typeOfUseId) : 10;
                const resolvedUseVal = targetUse ? String(targetUse.typeOfUseId) : '10';

                const areaSqMeter = plotLength * plotWidth;
                const areaSqFeet = convertSqMToSqFt(areaSqMeter);
                const currentYear = new Date().getFullYear().toString();

                // Update local state before the API call
                setPlotAreaSqM(areaSqMeter);
                setEditingFloorForm((prev) => ({
                  ...prev,
                  length: String(plotLength),
                  width: String(plotWidth),
                  areaSqM: String(areaSqMeter),
                  areaSqFt: String(areaSqFeet),
                  builtupAreaSqM: String(areaSqMeter),
                  builtupAreaSqFt: String(areaSqFeet),
                  carpetAreaSqMeter: areaSqMeter,
                  carpetAreaSqFeet: areaSqFeet,
                  builtupAreaSqMeter: areaSqMeter,
                  builtupAreaSqFeet: areaSqFeet,
                  conYr: currentYear,
                  asstYr: currentYear,
                  floorId: resolvedFloorId,
                  floor: resolvedFloorVal,
                  constructionTypeId: resolvedConstructionTypeId,
                  conTyp: resolvedConstructionVal,
                  typeOfUseId: resolvedTypeOfUseId,
                  use: resolvedUseVal,
                  roomWiseSubmissionDetails: [
                    {
                      lengthMtr: plotLength,
                      widthMtr: plotWidth,
                      areaSqMtr: areaSqMeter,
                      totalAreaSqMtr: areaSqMeter,
                    },
                  ],
                }));

                setIsAddingArea(true);
                try {
                  const roomsList = ((openPlotRecord as any)?.roomWiseSubmissionDetails || (openPlotRecord as any)?.propertyRooms || []) as any[];
                  const lastRoomRecord = roomsList.length > 0 ? roomsList[roomsList.length - 1] : null;
                  const roomRecordId = Number(lastRoomRecord?.id || lastRoomRecord?.roomWiseSubmissionId || 0);

                  const completePayload = {
                    ...(props.initialPropertyData || {}),
                    id: openPlotRecord?.id || 0,
                    propertyDetailsId: openPlotRecord?.id || 0,
                    isOpenPlot: true,
                    selectedFloorType: 'OpenPlot',
                    floorId: 77,
                    constructionTypeId: 11,
                    typeOfUseId: 10,
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
          />

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
