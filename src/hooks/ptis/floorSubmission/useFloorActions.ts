'use client';

import { useCallback } from 'react';
import { FloorData } from '@/types/room-details.types';

/**
 * Hook for floor action handlers (Add, Reset, Lazy Loading)
 * Extracted from useFloorSubmission to reduce file size
 */
export const useFloorActions = (params: {
  setEditingFloorForm: React.Dispatch<React.SetStateAction<FloorData>>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSelectedFloor: (val: FloorData | null) => void;
  setShowRoomSubmission: (val: boolean) => void;
  setIsAddingNewFloor: (val: boolean) => void;
  updateUrlParams: (params: Record<string, string | null>) => void;
  searchParams: URLSearchParams;
  startTransition: React.TransitionStartFunction;
  INITIAL_FORM_STATE: FloorData;
  floorData: unknown[];
}) => {
  const {
    setEditingFloorForm,
    setFormErrors,
    setSelectedFloor,
    setShowRoomSubmission,
    setIsAddingNewFloor,
    updateUrlParams,
    searchParams,
    startTransition,
    INITIAL_FORM_STATE,
    floorData,
  } = params;

  // Lazy Loading Handlers
  const handleOpenDropdown = useCallback(
    (key: 'loadFloor' | 'loadSubFloor' | 'loadConstruction' | 'loadUsage' | 'loadSubType') => {
      if (searchParams.get(key) === 'true') return;
      startTransition(() => {
        updateUrlParams({ [key]: 'true' });
      });
    },
    [searchParams, updateUrlParams, startTransition]
  );

  const resetForm = useCallback(() => {
    startTransition(() => {
      setEditingFloorForm(INITIAL_FORM_STATE);
      setFormErrors({});
      setIsAddingNewFloor(false);
      setSelectedFloor(null);
      setShowRoomSubmission(false);
      updateUrlParams({
        floorId: null,
        drawer: null,
        typeOfUseId: null,
        loadFloor: null,
        loadSubFloor: null,
        loadConstruction: null,
        loadUsage: null,
        loadSubType: null,
      });

      // Clear session storage
      try {
        const floorIdToClear = searchParams.get('floorId') || 'new';
        sessionStorage.removeItem(`renter_data_${floorIdToClear}`);
        sessionStorage.removeItem('renter_data_new');
        sessionStorage.removeItem('editingFloorForm');
      } catch (_e) { }
    });
  }, [
    setEditingFloorForm,
    setFormErrors,
    setIsAddingNewFloor,
    setSelectedFloor,
    setShowRoomSubmission,
    updateUrlParams,
    INITIAL_FORM_STATE,
    startTransition,
    searchParams,
  ]);

  const handleAddFloor = useCallback(() => {
    startTransition(() => {
      setEditingFloorForm(INITIAL_FORM_STATE);
      setFormErrors({});
      setSelectedFloor(null);
      setShowRoomSubmission(false);
      setIsAddingNewFloor(true);
      updateUrlParams({
        floorId: null,
        drawer: 'add',
        typeOfUseId: null,
        loadFloor: 'false',
        loadSubFloor: 'false',
        loadConstruction: 'false',
        loadUsage: 'false',
        loadSubType: 'false',
      });

      const gFloor = (floorData as { floorCode?: string; floorId?: number; description?: string }[]).find(
        (f) => f.floorCode === 'G' || f.description?.toLowerCase() === 'ground floor'
      );
      if (gFloor) {
        setEditingFloorForm((prev) => ({
          ...prev,
          floorId: String(gFloor.floorId || gFloor.floorCode || ''),
          floor: gFloor.description || '',
          rooms: '0',
        }));
      }
    });
  }, [
    setEditingFloorForm,
    setFormErrors,
    setSelectedFloor,
    setShowRoomSubmission,
    setIsAddingNewFloor,
    updateUrlParams,
    INITIAL_FORM_STATE,
    floorData,
    startTransition,
  ]);

  return {
    handleOpenDropdown,
    resetForm,
    handleAddFloor,
  };
};
