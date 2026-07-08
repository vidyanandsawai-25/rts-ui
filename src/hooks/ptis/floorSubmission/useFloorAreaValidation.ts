'use client';

import { useMemo } from 'react';
import { FloorData } from '@/types/room-details.types';

interface UseFloorAreaValidationProps {
  localFloors: FloorData[];
  selectedFloor: FloorData | null;
  editingFloorForm: FloorData;
  selectedFloorType: 'Construction' | 'OpenPlot';
  isAddingNewFloor: boolean;
  plotAreaSqM: number;
  floorLookup?: unknown[];
  initialFloors?: FloorData[];
}

export const isRecordOpenPlot = (floor: FloorData) => {
  return (
    floor.isOpenPlot === true ||
    floor.selectedFloorType === 'OpenPlot' ||
    ((!floor.floorId || floor.floorId === '0' || floor.floor === '0') &&
     (!floor.constructionTypeId ||
      floor.constructionTypeId === '0' ||
      !floor.conTyp ||
      String(floor.conTyp).toLowerCase().includes('open plot') ||
      String(floor.conTyp).toLowerCase() === 'op'))
  );
};

export const useFloorAreaValidation = ({
  localFloors,
  selectedFloor,
  editingFloorForm,
  selectedFloorType,
  isAddingNewFloor,
  plotAreaSqM,
  floorLookup: _floorLookup,
  initialFloors,
}: UseFloorAreaValidationProps) => {


  // Use initialFloors if localFloors is not yet populated to avoid flash of incorrect calculations
  const activeFloors = useMemo(() => {
    return localFloors.length > 0 ? localFloors : (initialFloors || []);
  }, [localFloors, initialFloors]);

  // 1. Calculate already utilized Construction Area (excluding the currently edited one)
  const alreadyUtilizedConstructionAreaSqM = useMemo(() => {
    const constructionFloors = activeFloors.filter(
      (f) => !isRecordOpenPlot(f) && (!selectedFloor || f.id !== selectedFloor.id)
    );
    return constructionFloors.reduce((sum, f) => sum + (parseFloat(String(f.builtupAreaSqM || f.areaSqM || '0')) || 0), 0);
  }, [activeFloors, selectedFloor]);

  // 2. Entered Construction Area from form (if editing/adding a Construction record)
  const enteredConstructionAreaSqM = useMemo(() => {
    if (!selectedFloor && !isAddingNewFloor) return 0;
    if (selectedFloorType === 'Construction') {
      return parseFloat(String(editingFloorForm.builtupAreaSqM || editingFloorForm.areaSqM || '0')) || 0;
    }
    return 0;
  }, [editingFloorForm, selectedFloorType, selectedFloor, isAddingNewFloor]);

  // 3. Real-time Total Construction Area (includes form value if active)
  const totalConstructionAreaSqM = useMemo(() => {
    return alreadyUtilizedConstructionAreaSqM + enteredConstructionAreaSqM;
  }, [alreadyUtilizedConstructionAreaSqM, enteredConstructionAreaSqM]);

  // 4. Open Space Area calculation: Open Space Area = Sum of all saved Open Space entries
  const totalOpenSpaceAreaSqM = useMemo(() => {
    const openSpaceFloors = activeFloors.filter(
      (f) => isRecordOpenPlot(f) && (!selectedFloor || f.id !== selectedFloor.id)
    );
    let sum = openSpaceFloors.reduce((s, f) => s + (parseFloat(String(f.areaSqM || f.builtupAreaSqM || '0')) || 0), 0);
    if (selectedFloorType === 'OpenPlot' && (selectedFloor || isAddingNewFloor)) {
      sum += parseFloat(String(editingFloorForm.areaSqM || editingFloorForm.builtupAreaSqM || '0')) || 0;
    }
    return sum;
  }, [activeFloors, selectedFloor, editingFloorForm, selectedFloorType, isAddingNewFloor]);

  // 5. Remaining Area for the Summary Section: Remaining Area = Total Plot Area - Utilized Area - Open Space Area
  const remainingAvailablePlotAreaSqM = useMemo(() => {
    const rawRemaining = plotAreaSqM - totalConstructionAreaSqM - totalOpenSpaceAreaSqM;
    // Round to 4 decimal places to prevent floating-point precision issues (e.g. 1000 - 529.2 - 470.8 = -5.68e-14)
    return Math.round(rawRemaining * 10000) / 10000;
  }, [plotAreaSqM, totalConstructionAreaSqM, totalOpenSpaceAreaSqM]);

  // 6. Max available area for the currently edited Construction record
  const availableRemainingConstructionAreaSqM = useMemo(() => {
    const savedOpenSpaceArea = activeFloors
      .filter((f) => isRecordOpenPlot(f) && (!selectedFloor || f.id !== selectedFloor.id))
      .reduce((sum, f) => sum + (parseFloat(String(f.areaSqM || f.builtupAreaSqM || '0')) || 0), 0);
    return Math.max(0, plotAreaSqM - alreadyUtilizedConstructionAreaSqM - savedOpenSpaceArea);
  }, [plotAreaSqM, alreadyUtilizedConstructionAreaSqM, activeFloors, selectedFloor]);

  // 7. Validation: Total Ground Floor Construction Area cannot exceed Total Plot Area
  const isFloorAreaExceeded = useMemo(() => {
    return remainingAvailablePlotAreaSqM < 0;
  }, [remainingAvailablePlotAreaSqM]);

  // 8. Remaining Open Space Validation: Open Space Area < 0
  const isOpenSpaceNegative = useMemo(() => {
    return remainingAvailablePlotAreaSqM < 0;
  }, [remainingAvailablePlotAreaSqM]);

  // 10. Already Utilized Open Space Area
  const alreadyUtilizedOpenSpaceAreaSqM = useMemo(() => {
    const openPlots = activeFloors.filter(
      (f) => isRecordOpenPlot(f) && (!selectedFloor || f.id !== selectedFloor.id)
    );
    return openPlots.reduce((sum, f) => sum + (parseFloat(String(f.areaSqM || f.builtupAreaSqM || '0')) || 0), 0);
  }, [activeFloors, selectedFloor]);

  // 11. Entered Open Space Area
  const enteredOpenSpaceAreaSqM = useMemo(() => {
    if (!selectedFloor && !isAddingNewFloor) return 0;
    if (selectedFloorType === 'OpenPlot') {
      return parseFloat(String(editingFloorForm.areaSqM || editingFloorForm.builtupAreaSqM || '0')) || 0;
    }
    return 0;
  }, [editingFloorForm, selectedFloorType, selectedFloor, isAddingNewFloor]);

  // 12. Available Remaining Open Space Area
  const availableRemainingOpenSpaceAreaSqM = useMemo(() => {
    return Math.max(0, plotAreaSqM - alreadyUtilizedConstructionAreaSqM - alreadyUtilizedOpenSpaceAreaSqM);
  }, [plotAreaSqM, alreadyUtilizedConstructionAreaSqM, alreadyUtilizedOpenSpaceAreaSqM]);

  // 13. Open Space Area Exceeded Validation
  const isOpenSpaceAreaExceeded = useMemo(() => {
    return remainingAvailablePlotAreaSqM < 0;
  }, [remainingAvailablePlotAreaSqM]);

  const isAreaExceeded = useMemo(() => {
    return remainingAvailablePlotAreaSqM < 0;
  }, [remainingAvailablePlotAreaSqM]);

  return {
    totalConstructionAreaSqM,
    totalOpenSpaceAreaSqM,
    remainingAvailablePlotAreaSqM,
    availableRemainingOpenSpaceAreaSqM,
    availableRemainingConstructionAreaSqM,
    isOpenSpaceAreaExceeded,
    isFloorAreaExceeded,
    isAreaExceeded,
    enteredFloorAreaSqM: enteredConstructionAreaSqM,
    alreadyUtilizedOpenSpaceAreaSqM,
    enteredOpenSpaceAreaSqM,
    currentTotalGroundFloorAreaSqM: totalConstructionAreaSqM,
    isGroundFloorAreaExceeded: isFloorAreaExceeded,
    isOpenSpaceNegative,
  };
};
