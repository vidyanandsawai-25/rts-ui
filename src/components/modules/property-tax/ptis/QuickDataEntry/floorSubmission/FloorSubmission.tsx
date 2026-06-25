'use client';

import React from 'react';
import { Loader2, MapPin, Hash, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useFloorSubmission } from '@/hooks/ptis/floorSubmission/useFloorSubmission';
import { EditSidebarProps } from '@/types/floor-details.types';
import { Drawer, LoadingPage, Tabs, SearchSelect, type SearchSelectOption } from '@/components/common';
import FloorTable from './FloorTable';
import FloorForm from './FloorForm';
import SelectPropertiesTable from './SelectPropertiesTable';
import { RoomSubmissionModal } from './components';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';
import { RoomAPIResponse } from '@/types/room-details.types';
import {
  fetchDataEntrySameAsAction,
  applyDataEntrySameAsAction,
  type SelectableProperty,
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import { getWardListAction, getPropertyListByWardAction } from '@/app/[locale]/property-tax/ptis/actions';

const DATA_ENTRY_SAME_AS_FILTER_TYPES: Record<string, string> = {
  'type-wise': 'TYPE_WISE',
  'property-wise': 'PROPERTY_WISE',
  parking: 'PARKING',
};

function normalizePartitionNo(value: string | number | null | undefined): string {
  return String(value ?? '').trim().toUpperCase();
}

function getDataEntrySameAsType(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? '').trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getNumericDataEntrySameAsId(...values: Array<string | number | null | undefined>): number | undefined {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

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

  const [showDataEntrySameAsDrawer, setShowDataEntrySameAsDrawer] = React.useState(false);
  const [dataEntrySameAsTab, setDataEntrySameAsTab] = React.useState('type-wise');
  const [selectableProperties, setSelectableProperties] = React.useState<SelectableProperty[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = React.useState<Set<string | number>>(new Set());
  const [isLoadingProperties, setIsLoadingProperties] = React.useState(false);
  const [searchWardId, setSearchWardId] = React.useState(props.wardId ? String(props.wardId) : '');
  const [searchPropertyNo, setSearchPropertyNo] = React.useState(props.propertyNo || '');

  // SearchSelect list options and loading states
  const [wardOptions, setWardOptions] = React.useState<SearchSelectOption[]>([]);
  const [isFetchingWards, setIsFetchingWards] = React.useState(false);
  const [propertyOptions, setPropertyOptions] = React.useState<SearchSelectOption[]>([]);
  const [isFetchingProperties, setIsFetchingProperties] = React.useState(false);

  const sanitizeWardNo = React.useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  }, []);

  const sanitizePropertyNo = React.useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 10);
  }, []);

  const loadWards = React.useCallback(async () => {
    setIsFetchingWards(true);
    try {
      const res = await getWardListAction();
      if (res.success && res.data) {
        const options = res.data.map((w) => ({
          label: w.wardNo || '',
          value: String(w.wardId),
        }));
        setWardOptions(options);
      }
    } catch {
      // Ignore
    } finally {
      setIsFetchingWards(false);
    }
  }, []);

  const loadPropertiesForWard = React.useCallback(async (wardId: number) => {
    setIsFetchingProperties(true);
    try {
      const res = await getPropertyListByWardAction(wardId);
      if (res.success && res.data) {
        const uniquePropertyNos = Array.from(
          new Set(res.data.map((p) => p.propertyNo).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        const options = uniquePropertyNos.map((pNo) => ({
          label: pNo,
          value: pNo,
        }));
        setPropertyOptions(options);
      } else {
        setPropertyOptions([]);
      }
    } catch {
      setPropertyOptions([]);
    } finally {
      setIsFetchingProperties(false);
    }
  }, []);

  const handleWardChange = React.useCallback(async (_name: string | undefined, value: string) => {
    setSearchWardId(value);
    setSearchPropertyNo('');
    setSelectableProperties([]);
    setSelectedPropertyIds(new Set());
    const wardIdNum = Number(value);
    if (wardIdNum) {
      await loadPropertiesForWard(wardIdNum);
    } else {
      setPropertyOptions([]);
    }
  }, [loadPropertiesForWard]);

  const dataEntrySameAsDrawerClassName = "[&_div.fixed.right-0]:!w-[97vw] md:[&_div.fixed.right-0]:!w-[1000px] lg:[&_div.fixed.right-0]:!w-[1100px] xl:[&_div.fixed.right-0]:!w-[1200px] [&_div.fixed.right-0>div:first-child]:!bg-blue-600 [&_div.fixed.right-0>div:first-child_h2]:!text-white [&_div.fixed.right-0>div:first-child>div:first-child]:!flex-1 [&_div.fixed.right-0>div:first-child_button_svg]:!text-white [&_div.fixed.right-0>div:first-child_button]:hover:!bg-blue-700";

  const handleSearchProperties = React.useCallback(async () => {
    const wardId = Number(searchWardId);
    if (!wardId || !searchPropertyNo.trim()) return;
    setIsLoadingProperties(true);
    setSelectableProperties([]);
    setSelectedPropertyIds(new Set());
    try {
      const results = await fetchDataEntrySameAsAction(wardId, searchPropertyNo.trim());
      setSelectableProperties(results);
    } finally {
      setIsLoadingProperties(false);
    }
  }, [searchWardId, searchPropertyNo]);

  const handleOpenDataEntrySameAsDrawer = React.useCallback(async () => {
    setShowDataEntrySameAsDrawer(true);
    if (wardOptions.length === 0) {
      await loadWards();
    }
    if (searchWardId && propertyOptions.length === 0) {
      await loadPropertiesForWard(Number(searchWardId));
    }
    if (searchWardId && searchPropertyNo && selectableProperties.length === 0) {
      const wardId = Number(searchWardId);
      if (wardId && searchPropertyNo.trim()) {
        setIsLoadingProperties(true);
        try {
          const results = await fetchDataEntrySameAsAction(wardId, searchPropertyNo.trim());
          setSelectableProperties(results);
        } finally {
          setIsLoadingProperties(false);
        }
      }
    }
  }, [
    wardOptions.length,
    propertyOptions.length,
    searchWardId,
    searchPropertyNo,
    selectableProperties.length,
    loadWards,
    loadPropertiesForWard,
  ]);

  const handleCloseDataEntrySameAsDrawer = React.useCallback(() => {
    setShowDataEntrySameAsDrawer(false);
  }, []);

  const [isApplyingSameAs, setIsApplyingSameAs] = React.useState(false);

  const handleApplySameAsDetails = React.useCallback(async () => {
    const sourceProperty = selectableProperties.find(
      (property) => normalizePartitionNo(property.partitionNo) === normalizePartitionNo(props.partitionNo)
    );
    const sourcePropertyMasterId = Number(sourceProperty?.id);
    const sourceFloor = filteredFloors.find((floor) => getNumericDataEntrySameAsId(
      floor.propertyDetailsId,
      floor.id
    ));
    const sourcePropertyId = getNumericDataEntrySameAsId(
      sourceProperty?.propertyFloorId,
      sourceProperty?.propertyDetailsId,
      sourceFloor?.propertyDetailsId,
      sourceFloor?.id,
      sourceProperty?.id
    );
    const sameAsType = getDataEntrySameAsType(sourceProperty?.type) ?? 0;

    if (!sourcePropertyId) {
      toast.error(`Source property ${props.partitionNo || ''} not found in selected property list.`);
      return;
    }

    if (selectedPropertyIds.size === 0) return;

    const destinationPropertyIds = Array.from(selectedPropertyIds)
      .map(Number)
      .filter((id) => (
        Number.isFinite(id)
        && id > 0
        && id !== sourcePropertyId
        && id !== sourcePropertyMasterId
      ));

    if (destinationPropertyIds.length === 0) {
      toast.error('Select at least one destination property.');
      return;
    }

    setIsApplyingSameAs(true);
    try {
      const filterType = DATA_ENTRY_SAME_AS_FILTER_TYPES[dataEntrySameAsTab] ?? dataEntrySameAsTab.toUpperCase();

      const sourceDebug = sourcePropertyMasterId && sourcePropertyMasterId !== sourcePropertyId
        ? `${sourcePropertyId} (property ${sourcePropertyMasterId})`
        : String(sourcePropertyId);

      const payload = {
        sourcePropertyId,
        destinationPropertyIds,
        filterType,
        type: sameAsType,
      };

      const res = await applyDataEntrySameAsAction(payload);
      if (res.success && res.data) {
        const processed = Number(res.data.processedDestinations ?? 0);
        const appliedCount = [
          res.data.propertyDetailsCopied,
          res.data.roomSubmissionsCopied,
          res.data.roomMinusCopied,
          res.data.typeUpdatedProperties,
          res.data.buildingPlanTypeInserted,
        ].reduce((total, count) => total + Number(count ?? 0), 0);

        if (processed <= 0) {
          toast.error('No destination property was processed.');
          return;
        }

        if (appliedCount <= 0) {
          toast.error(`No data was copied. Source: ${sourceDebug}, type: ${sameAsType}, processed: ${processed}.`);
          return;
        }

        toast.success(
          `${t('floor.selectProperties.applySuccess') || 'Details applied successfully.'} Source: ${sourcePropertyId}, type: ${sameAsType}, copied: ${appliedCount}, processed: ${processed || destinationPropertyIds.length}.`
        );
        setSelectedPropertyIds(new Set());
        handleCloseDataEntrySameAsDrawer();
        window.location.reload();
      } else {
        toast.error(res.error || 'Failed to apply details.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error occurred.');
    } finally {
      setIsApplyingSameAs(false);
    }
  }, [props.partitionNo, selectableProperties, filteredFloors, selectedPropertyIds, dataEntrySameAsTab, handleCloseDataEntrySameAsDrawer, t]);

  const handleTogglePropertySelection = React.useCallback((id: string | number) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClearPropertySelection = React.useCallback(() => {
    setSelectedPropertyIds(new Set());
  }, []);

  const renderDataEntrySameAsFloorTable = () => (
    <>
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
        viewOnly
      />
      {/* Ward No & Property No dropdowns */}
      <div className="flex items-end gap-3 mt-3 px-1">
        <div className="flex flex-col gap-1">
          <label htmlFor="search-ward-id" className="text-[11px] font-semibold text-slate-600">
            {t('floor.selectProperties.wardNo')}
          </label>
          <div className="w-44 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
              id="search-ward-id"
              options={wardOptions}
              value={searchWardId}
              onChange={handleWardChange}
              sanitizeInput={sanitizeWardNo}
              className="h-8 text-xs"
              isLoading={isFetchingWards}
              loadingPlaceholder={t('search.loading') || 'Loading...'}
              noOptionsPlaceholder={t('search.noOptionsAvailable') || 'No options'}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="search-property-no" className="text-[11px] font-semibold text-slate-600">
            {t('floor.selectProperties.propertyNo')}
          </label>
          <div className="w-44 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
              id="search-property-no"
              options={propertyOptions}
              value={searchPropertyNo}
              onChange={(_name, val) => {
                setSearchPropertyNo(val);
                setSelectableProperties([]);
                setSelectedPropertyIds(new Set());
              }}
              sanitizeInput={sanitizePropertyNo}
              className="h-8 text-xs"
              disabled={!searchWardId || isFetchingProperties}
              isLoading={isFetchingProperties}
              loadingPlaceholder={t('search.loading') || 'Loading...'}
              noOptionsPlaceholder={t('search.noOptionsAvailable') || 'No options'}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSearchProperties}
          disabled={!searchWardId || !searchPropertyNo.trim() || isLoadingProperties}
          className="h-8 px-4 rounded-md bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('floor.selectProperties.search') || 'Search'}
        </button>
      </div>
      <SelectPropertiesTable
        t={t}
        properties={selectableProperties
          .filter(p => p.partitionNo && p.partitionNo !== '-')
          .map(p => {
            const wardOpt = wardOptions.find(o => o.value === String(p.wardNo));
            return {
              ...p,
              wardNo: wardOpt ? wardOpt.label : p.wardNo
            };
          })
        }
        selectedIds={selectedPropertyIds}
        onToggle={handleTogglePropertySelection}
        onClearSelection={handleClearPropertySelection}
        isLoading={isLoadingProperties}
      />
      {selectedPropertyIds.size > 0 && (
        <div className="flex justify-end mt-4 px-1">
          <button
            type="button"
            onClick={handleApplySameAsDetails}
            disabled={isApplyingSameAs}
            className="flex items-center justify-center gap-1.5 h-9 px-5 rounded-md bg-green-600 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isApplyingSameAs ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('floor.selectProperties.applying') || 'Applying...'}
              </>
            ) : (
              t('floor.selectProperties.applyButton') || 'Apply Details'
            )}
          </button>
        </div>
      )}
    </>
  );

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
              {props.apiErrors.map((err, i) => {
                // Check if it's a translation key (no spaces, contains dots)
                const isTranslationKey = !err.includes(' ') && err.includes('.');
                return <li key={i}>{isTranslationKey ? t(err) : err}</li>;
              })}
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
          />

          {/* Edit Floor Form Section */}
          {(selectedFloor || isAddingNewFloor) && !showDataEntrySameAsDrawer && (
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
      <div className={dataEntrySameAsDrawerClassName}>
        <Tabs
          value={dataEntrySameAsTab}
          onChange={(value) => setDataEntrySameAsTab(String(value))}
          variant="pills"
          size="sm"
          className="h-full"
          activeTabClassName="bg-white text-blue-700 shadow-sm"
        >
          <Drawer
            open={showDataEntrySameAsDrawer}
            onClose={handleCloseDataEntrySameAsDrawer}
            title={(
              <div className="flex w-full flex-wrap items-center gap-4">
                <h2 className="text-[15px] font-bold leading-tight text-white">{t('floor.dataEntry')}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/15">
                    <MapPin className="h-3 w-3 text-white/80" />
                    <span>{t('roomSubmission.info.ward') || 'Ward'}: {props.wardNo || '—'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/15">
                    <Hash className="h-3 w-3 text-white/80" />
                    <span>{t('roomSubmission.info.property') || 'Property'}: {props.propertyNo || '—'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white border border-white/10 backdrop-blur-xs transition-colors hover:bg-white/15">
                    <Layers className="h-3 w-3 text-white/80" />
                    <span>{t('roomSubmission.info.partition') || 'Partition'}: {props.partitionNo || '—'}</span>
                  </div>
                </div>
                <Tabs.TabList className="ml-auto border-0 bg-white/10 p-1 rounded-lg">
                  <Tabs.Tab value="type-wise" className="justify-center py-1.5 text-xs font-bold text-white hover:bg-white/15 hover:text-white data-[state=active]:text-blue-700">
                    {t('floor.dataEntryTabs.typeWise')}
                  </Tabs.Tab>
                  <Tabs.Tab value="property-wise" className="justify-center py-1.5 text-xs font-bold text-white hover:bg-white/15 hover:text-white data-[state=active]:text-blue-700">
                    {t('floor.dataEntryTabs.propertyWise')}
                  </Tabs.Tab>
                  <Tabs.Tab value="parking" className="justify-center py-1.5 text-xs font-bold text-white hover:bg-white/15 hover:text-white data-[state=active]:text-blue-700">
                    {t('floor.dataEntryTabs.parking')}
                  </Tabs.Tab>
                </Tabs.TabList>
              </div>
            )}
            width="xl"
          >
            <div className="flex h-full flex-col overflow-hidden bg-slate-50">
              <div className="flex-1 overflow-y-auto p-4">
                <Tabs.TabPanel value="type-wise" className="mt-0">{null}</Tabs.TabPanel>
                <Tabs.TabPanel value="property-wise" className="mt-0">{null}</Tabs.TabPanel>
                <Tabs.TabPanel value="parking" className="mt-0">{renderDataEntrySameAsFloorTable()}</Tabs.TabPanel>
              </div>

            </div>
          </Drawer>
        </Tabs>
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
            roomWiseSubmissionDetails: data.rooms as unknown[],
            areaSqM: areaSqM.toFixed(2),
            areaSqFt: areaSqFt.toFixed(2),
            builtupAreaSqM: builtUpSqM.toFixed(2),
            builtupAreaSqFt: builtUpAreaSqFt.toFixed(2),
            rooms: data.rooms.length,
            noOfRooms: data.rooms.length
          }));

          setFormErrors(prev => {
            if (prev.rooms) {
              return { ...prev, rooms: '' };
            }
            return prev;
          });
        }}
      />
    </>
  );
};

export default FloorSubmission;
