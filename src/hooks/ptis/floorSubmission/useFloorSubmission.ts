'use client';

import { useState, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/common';
import { EditSidebarProps } from '@/types/floor-details.types';
import { FloorData, RoomData } from '@/types/room-details.types';

// Split Hooks
import { useFloorFormState } from './useFloorFormState';
import { useFloorUrlSync } from './useFloorUrlSync';
import { useFloorDataHandlers } from './useFloorDataHandlers';
import { useFloorSync } from './useFloorSync';
import { useFloorActions } from './useFloorActions';

export const useFloorSubmission = (props: EditSidebarProps) => {
  const t = useTranslations('quickDataEntry');
  const [, startTransition] = useTransition();
  const { confirm } = useConfirm();

  // 1. Core Form State
  const formState = useFloorFormState();
  const {
    INITIAL_FORM_STATE,
    editingFloorForm,
    setEditingFloorForm,
    localFloors,
    setLocalFloors,
    formErrors,
    setFormErrors,
    isAddingNewFloor,
    setIsAddingNewFloor,
    selectedFloor,
    setSelectedFloor,
    showRoomSubmission,
    setShowRoomSubmission,
    validateForm,
  } = formState;

  // 2. URL and Navigation
  const urlSync = useFloorUrlSync();
  const { searchParams, updateUrlParams, router, locale, propertyId } = urlSync;

  // 3. Data Handlers (Save, Delete, etc.)
  const handlers = useFloorDataHandlers({
    props,
    editingFloorForm,
    selectedFloor,
    isAddingNewFloor,
    setIsAddingNewFloor,
    setSelectedFloor,
    setEditingFloorForm,
    localFloors,
    setLocalFloors,
    setFormErrors,
    validateForm,
    startTransition,
    router,
    locale,
    propertyId,
    confirm,
    t,
    INITIAL_FORM_STATE: INITIAL_FORM_STATE as unknown as FloorData,
  });

  const { handleSave, handleDeleteFloor, handleOpenRenterManagement, isSaving } = handlers;

  // 4. Floor Actions (Add, Reset, Lazy Loading)
  const actions = useFloorActions({
    setEditingFloorForm,
    setFormErrors,
    setSelectedFloor,
    setShowRoomSubmission,
    setIsAddingNewFloor,
    updateUrlParams,
    searchParams,
    startTransition,
    INITIAL_FORM_STATE: INITIAL_FORM_STATE as unknown as FloorData,
    floorData: props.floorData,
  });

  const { handleOpenDropdown, resetForm, handleAddFloor } = actions;

  // 5. Data Sync and Derived Data
  useFloorSync({
    props,
    isAddingNewFloor,
    setEditingFloorForm,
    localFloors,
    setLocalFloors,
    setSelectedFloor,
    updateUrlParams,
    searchParams,
    INITIAL_FORM_STATE: INITIAL_FORM_STATE as unknown as FloorData,
  });

  const [floorSearch, setFloorSearch] = useState('');
  
  const filteredFloors = useMemo(() => {
    const search = floorSearch.toLowerCase();
    return localFloors.filter(
      (f) =>
        !search ||
        (f.floor || '').toLowerCase().includes(search) ||
        (f.conTyp || '').toLowerCase().includes(search) ||
        (f.use || '').toLowerCase().includes(search)
    );
  }, [localFloors, floorSearch]);

  const subTypeOptionsFromData = useMemo(() => 
    (props.subTypeData || []).map(st => st.description),
    [props.subTypeData]
  );

  return {
    t,
    isOperationLoading: isSaving,
    setIsOperationLoading: () => { }, // Compatibility
    propertyId: props.initialPropertyID,
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
    stagedRooms: editingFloorForm.roomData || [], // Derived for compatibility
    setStagedRooms: (val: RoomData[]) => {
      setEditingFloorForm(prev => ({ ...prev, roomData: val }));
    }, // Compatibility setter
    showRoomSubmission,
    setShowRoomSubmission,
    subTypeOptionsFromData,
    roomsInputRef: formState.roomsInputRef,
    areaInputRef: formState.areaInputRef,
    // Handlers
    updateUrlParams,
    handleOpenDropdown,
    resetForm,
    handleAddFloor,
    handleOpenRenterManagement,
    handleDeleteFloor,
    handleSave,
    validateForm,
    startTransition,
  };
};
