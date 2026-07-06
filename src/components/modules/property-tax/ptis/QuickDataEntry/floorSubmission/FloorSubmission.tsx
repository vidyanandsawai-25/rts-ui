'use client';

import React from 'react';
import { toast } from 'sonner';
import { useFloorSubmission } from '@/hooks/ptis/floorSubmission/useFloorSubmission';
import { EditSidebarProps } from '@/types/floor-details.types';
import FloorTable from './FloorTable';
import FloorForm from './FloorForm';
import { RoomSubmissionModal, PlotAreaCalculator, FloorTypeToggle, SubmissionOverlayLoader, SubmissionApiErrors } from './components';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';
import { RoomAPIResponse } from '@/types/room-details.types';
import { updatePlotAreaAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import type { PlotAreaPayload } from '@/lib/api/ptis/floorSubmission/plot-area.service';

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
    remainingAvailablePlotAreaSqM,
    availableRemainingOpenSpaceAreaSqM,
    availableRemainingConstructionAreaSqM,
    enteredFloorAreaSqM,
    alreadyUtilizedOpenSpaceAreaSqM,
    enteredOpenSpaceAreaSqM,
    locale,
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
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 shadow-2xs">
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
                </div>
              </div>
            )}
          </div>

          {/* Plot Area Calculator Section */}
          {(selectedFloorType === 'Construction' || selectedFloorType === 'OpenPlot') && (
            <PlotAreaCalculator
              t={t}
              layout="single-row"
              propertyId={props.initialPropertyID}
              initialPlotArea={props.initialPlotArea}
              onLoad={(sqFt, sqM, len, wid) => {
                setPlotAreaSqM(parseFloat(sqM) || 0);
                // Only map Plot Area Calculator values to Floor/OpenSpace form for Plot categories
                // For non-Plot categories (Individual, etc.), the calculator is display-only
                if (!isPlotCategory) return;
                setEditingFloorForm((prev) => ({
                  ...prev,
                  ...(len ? { length: len } : {}),
                  ...(wid ? { width: wid } : {}),
                  ...(selectedFloorType === 'OpenPlot' ? {
                    areaSqFt: sqFt,
                    areaSqM: sqM,
                  } : {}),
                }));
              }}
              onApply={async (sqFt: string, sqM: string, len?: string, wid?: string) => {
                setPlotAreaSqM(parseFloat(sqM) || 0);
                // Only map Plot Area Calculator values to Floor/OpenSpace form for Plot categories
                // For non-Plot categories (Individual, etc.), no form field mapping occurs
                if (isPlotCategory) {
                  setEditingFloorForm((prev) => ({
                    ...prev,
                    ...(len ? { length: len } : {}),
                    ...(wid ? { width: wid } : {}),
                    ...(selectedFloorType === 'OpenPlot' ? {
                      areaSqFt: sqFt,
                      areaSqM: sqM,
                    } : {}),
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    ...(len ? { length: '' } : {}),
                    ...(wid ? { width: '' } : {}),
                    ...(selectedFloorType === 'OpenPlot' ? {
                      areaSqFt: '',
                      areaSqM: '',
                    } : {}),
                  }));
                }

                // ── Call Plot Area API on "Add Area" click (always, regardless of category) ──
                const plotLength = parseFloat(len || '0');
                const plotWidth = parseFloat(wid || '0');
                const totalPlotArea = plotLength * plotWidth;

                if (plotLength > 0 && plotWidth > 0 && totalPlotArea > 0) {
                  const plotAreaPayload: PlotAreaPayload = {
                    totalPlotArea,
                    length: plotLength,
                    width: plotWidth,
                  };

                  const toastId = toast.loading(
                    t('floor.savingPlotArea') || 'Saving plot area...'
                  );

                  try {
                    const plotAreaResponse = await updatePlotAreaAction(props.initialPropertyID || 0, plotAreaPayload, locale);
                    if (plotAreaResponse.success) {
                      toast.success(
                        t('floor.plotAreaSavedSuccess') || 'Plot area saved successfully',
                        { id: toastId }
                      );
                    } else {
                      toast.error(
                        plotAreaResponse.error || t('floor.errors.plotAreaSaveFailed') || 'Failed to save plot area',
                        { id: toastId }
                      );
                    }
                  } catch {
                    toast.error(
                      t('floor.errors.plotAreaSaveFailed') || 'Failed to save plot area',
                      { id: toastId }
                    );
                  }
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
          {(selectedFloor || isAddingNewFloor) && (
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
