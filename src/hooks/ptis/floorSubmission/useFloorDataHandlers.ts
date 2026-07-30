/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useCallback, useRef, useState } from 'react';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';
import { FloorData } from '@/types/room-details.types';
import { FloorSubmissionPayload, EditSidebarProps } from '@/types/floor-details.types';
import { ConfirmOptions } from '@/components/common';
import { mapFormToPayload } from '@/lib/utils/floorSubmission/floor-mappers';
import { createOptimisticFloor, getOptimisticFloorsList, parseServerError } from '@/lib/utils/floorSubmission/floor-optimistic.utils';
import { submitFloorSubmissionNoRedirectAction, updateFloorSubmissionNoRedirectAction, } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import { useFloorDeletion } from './useFloorDeletion';
import { isPlotCategory as checkIsPlotCategory } from '@/lib/utils/ptis/category-helpers';

export const useFloorDataHandlers = (params: {
  props: EditSidebarProps;
  editingFloorForm: FloorData;
  selectedFloor: FloorData | null;
  isAddingNewFloor: boolean;
  setIsAddingNewFloor: (val: boolean) => void;
  setSelectedFloor: (val: FloorData | null) => void;
  setEditingFloorForm: (val: FloorData) => void;
  localFloors: FloorData[];
  setLocalFloors: (val: FloorData[]) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validateForm: () => boolean;
  startTransition: React.TransitionStartFunction;
  router: AppRouterInstance;
  locale: string;
  propertyId: string;
  confirm: (payload: ConfirmOptions) => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  INITIAL_FORM_STATE: FloorData;
  selectedFloorType?: 'Construction' | 'OpenPlot';
  // Area validation fields
  plotAreaSqM?: number;
  isOpenSpaceAreaExceeded?: boolean;
  isFloorAreaExceeded?: boolean;
  availableRemainingOpenSpaceAreaSqM?: number;
  availableRemainingConstructionAreaSqM?: number;
  isGroundFloorAreaExceeded?: boolean;
  isOpenSpaceNegative?: boolean;
  totalOpenSpaceAreaSqM?: number;
  totalConstructionAreaSqM?: number;
  alreadyUtilizedOpenSpaceAreaSqM?: number;
  enteredFloorAreaSqM?: number;
  enteredOpenSpaceAreaSqM?: number;
}) => {
  const {
    props, editingFloorForm, selectedFloor, isAddingNewFloor,
    setIsAddingNewFloor, setSelectedFloor, setEditingFloorForm, localFloors, setLocalFloors, setFormErrors,
    startTransition,
    router, locale, propertyId, confirm, t, INITIAL_FORM_STATE, selectedFloorType,
    plotAreaSqM = 0,
    isOpenSpaceAreaExceeded = false,
    isFloorAreaExceeded = false,
    availableRemainingOpenSpaceAreaSqM = 0,
    availableRemainingConstructionAreaSqM = 0,
    isGroundFloorAreaExceeded = false,
    isOpenSpaceNegative = false,
    totalOpenSpaceAreaSqM = 0,
    totalConstructionAreaSqM = 0,
    alreadyUtilizedOpenSpaceAreaSqM = 0,
    enteredFloorAreaSqM = 0,
    enteredOpenSpaceAreaSqM = 0,
  } = params;

  const { floorData: floorLookup, constructionTypeData: constructionLookup } = props;

  // Separate loading states
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // Use deletion hook
  const { handleDeleteFloor, isDeleting } = useFloorDeletion({
    localFloors,
    setLocalFloors,
    setSelectedFloor,
    setEditingFloorForm,
    router,
    startTransition,
    locale,
    propertyId,
    confirm,
    t,
    INITIAL_FORM_STATE,
  });

  const handleOpenRenterManagement = useCallback((_floor?: FloorData) => {
    if (!selectedFloor && isAddingNewFloor) {
      toast.error(t('floor.saveFloorBeforeRenterManagement') || 'Please save the floor before managing renter details');
      return;
    }
    toast.info(t('floor.renterManagementNotAvailable') || 'Renter management is not available from this screen yet');
  }, [selectedFloor, isAddingNewFloor, t]);

  const getSafeTranslation = useCallback((key: string, fallback: string) => {
    try {
      const res = t(key);
      if (
        !res ||
        res.includes('quickDataEntry.') ||
        res.includes('DataEntry.') ||
        res.includes('floor.errors.') ||
        res.includes('floor.ok') ||
        res.startsWith('MISSING_MESSAGE')
      ) {
        return fallback;
      }
      return res;
    } catch {
      return fallback;
    }
  }, [t]);

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return;

    if (selectedFloorType === 'OpenPlot' && isOpenSpaceAreaExceeded) {
      const availArea = parseFloat(Number(availableRemainingOpenSpaceAreaSqM || 0).toFixed(2));
      const msg = `Open Space Area cannot exceed the available remaining area (${availArea} Sq.M).\n\nPlot Area: ${parseFloat(Number(plotAreaSqM || 0).toFixed(2))} Sq M\nTotal Construction Area: ${parseFloat(Number(totalConstructionAreaSqM || 0).toFixed(2))} Sq M\nAlready Utilized Open Space Area: ${parseFloat(Number(alreadyUtilizedOpenSpaceAreaSqM || 0).toFixed(2))} Sq M\nAttempted Open Space Area: ${parseFloat(Number(enteredOpenSpaceAreaSqM || 0).toFixed(2))} Sq M\nRemaining Area for Open Space: ${availArea} Sq M\n\nPlease enter an Open Space area less than or equal to the remaining area.`;

      confirm({
        variant: 'warning',
        title: getSafeTranslation('floor.errors.areaExceededTitle', 'Plot Area Limit Exceeded'),
        description: msg,
        confirmText: getSafeTranslation('floor.ok', 'OK'),
        onConfirm: () => {},
      });
      return;
    }

    if (selectedFloorType === 'Construction' && isFloorAreaExceeded) {
      const availArea = parseFloat(Number(availableRemainingConstructionAreaSqM || 0).toFixed(2));
      const msg = `Floor Built-up Area cannot exceed the available remaining area (${availArea} Sq.M).\n\nPlot Area: ${parseFloat(Number(plotAreaSqM || 0).toFixed(2))} Sq M\nAlready Utilized Open Space Area: ${parseFloat(Number(totalOpenSpaceAreaSqM || 0).toFixed(2))} Sq M\nEntered Floor Built-up Area: ${parseFloat(Number(enteredFloorAreaSqM || 0).toFixed(2))} Sq M\nRemaining Area: ${availArea} Sq M\n\nPlease enter a Construction area less than or equal to the remaining area.`;

      confirm({
        variant: 'warning',
        title: getSafeTranslation('floor.errors.areaExceededTitle', 'Plot Area Limit Exceeded'),
        description: msg,
        confirmText: getSafeTranslation('floor.ok', 'OK'),
        onConfirm: () => {},
      });
      return;
    }

    if (!selectedFloorType && isGroundFloorAreaExceeded) {
      const msg = getSafeTranslation('floor.groundFloorAreaExceeded', 'Total Ground Floor Construction Area cannot exceed Total Plot Area.');
      confirm({
        variant: 'warning',
        title: getSafeTranslation('floor.errors.areaExceededTitle', 'Plot Area Limit Exceeded'),
        description: msg,
        confirmText: getSafeTranslation('floor.ok', 'OK'),
        onConfirm: () => {},
      });
      return;
    }

    if (isOpenSpaceNegative) {
      const msg = getSafeTranslation('floor.openSpaceNegative', 'Open Space Area cannot be negative.');
      confirm({
        variant: 'warning',
        title: getSafeTranslation('floor.errors.areaExceededTitle', 'Plot Area Limit Exceeded'),
        description: msg,
        confirmText: getSafeTranslation('floor.ok', 'OK'),
        onConfirm: () => {},
      });
      return;
    }

    const enteredRooms = parseInt(String(editingFloorForm.rooms || editingFloorForm.noOfRooms || 0), 10);
    const roomDetailsCount = Array.isArray(editingFloorForm.roomWiseSubmissionDetails)
      ? editingFloorForm.roomWiseSubmissionDetails.filter((r: any) => {
          const area = Number(r.area || r.areaSqMtr || r.totalAreaSqMtr || r.total || r.carpetArea || 0);
          return area > 0;
        }).length
      : 0;

    if (enteredRooms > 0 && roomDetailsCount > 0 && enteredRooms !== roomDetailsCount) {
      setFormErrors((prev) => ({
        ...prev,
        rooms: t('floor.errors.roomCountMismatch') || `Expected details for ${enteredRooms} rooms, but found ${roomDetailsCount}. Please update room details.`
      }));
      toast.error(t('floor.errors.roomCountMismatch') || `Expected details for ${enteredRooms} rooms, but found ${roomDetailsCount}. Please update room details.`);
      return;
    }

    if (selectedFloorType === 'OpenPlot') {
      const openPlotCon = constructionLookup?.find(
        (c: any) =>
          String(c.constructionCode || '').toLowerCase() === 'op' ||
          String(c.description || '').toLowerCase() === 'open plot'
      );
      if (!openPlotCon) {
        setFormErrors((prev) => ({
          ...prev,
          constructionTypeId: t('floor.errors.openPlotConstructionTypeNotFound') || 'Construction Type for Open Plot not found in master data'
        }));
        toast.error(t('floor.errors.openPlotConstructionTypeNotFound') || 'Construction Type for Open Plot (op) not found in master data.');
        return;
      }
    }

    confirm({
      variant: isAddingNewFloor ? 'add' : 'update',
      title: isAddingNewFloor ? t('floor.addConfirmTitle') : t('floor.updateConfirmTitle'),
      description: isAddingNewFloor ? t('floor.addConfirmText') : t('floor.updateConfirmText'),
      confirmText: isAddingNewFloor ? t('floor.addConfirmButton') : t('floor.updateConfirmButton'),
      onConfirm: async () => {

        isSavingRef.current = true;
        setIsSaving(true);
        const previousFloors = [...localFloors];
        try {
          const isPlotCategory = checkIsPlotCategory(props.initialPropertyData?.categoryName as string);
          const payload: FloorSubmissionPayload = mapFormToPayload({
            formData: editingFloorForm,
            floorLookup,
            subFloorLookup: props.subFloorData,
            constructionLookup,
            useLookup: props.useData,
            subTypeLookup: props.subTypeData,
            propertyId,
            isAddingNew: isAddingNewFloor,
            existingFloorId: selectedFloor?.id,
            selectedFloorType,
            isPlotCategory,
          });

          // Create optimistic floor object
          const optimisticFloor = createOptimisticFloor(
            editingFloorForm,
            isAddingNewFloor,
            selectedFloor?.id
          );

          // Optimistically update UI
          const updatedFloors = getOptimisticFloorsList(
            localFloors,
            optimisticFloor,
            isAddingNewFloor
          );
          setLocalFloors(updatedFloors);

          // Perform actual Server Action call
          const isEditing = !isAddingNewFloor && (selectedFloor?.id || editingFloorForm.id);
          const response = isEditing
            ? await updateFloorSubmissionNoRedirectAction(
                Number(selectedFloor?.id || editingFloorForm.id),
                payload,
                locale,
                propertyId
              )
            : await submitFloorSubmissionNoRedirectAction(payload, locale, propertyId);

          if (!response || !response.success) {
            setLocalFloors(previousFloors);
            const serverMsg = parseServerError(response?.error, t);
            toast.error(serverMsg);
            return;
          }

          toast.success(
            isAddingNewFloor
              ? t('floor.floorAddSuccess') || 'Floor added successfully'
              : t('floor.floorUpdateSuccess') || 'Floor updated successfully'
          );

          // Reset selection state and update URL silently
          startTransition(() => {
            setSelectedFloor(null);
            setIsAddingNewFloor(true);
            setEditingFloorForm(INITIAL_FORM_STATE);
            setFormErrors({});

            // Trigger quiet router refresh
            router.refresh();
          });
        } catch (error) {
          setLocalFloors(previousFloors);
          const catchMsg = parseServerError(error, t);
          toast.error(catchMsg);
        } finally {
          setIsSaving(false);
          isSavingRef.current = false;
        }
      },
    });
  }, [
    isSaving, selectedFloorType, isOpenSpaceAreaExceeded, isFloorAreaExceeded, isGroundFloorAreaExceeded, isOpenSpaceNegative,
    availableRemainingOpenSpaceAreaSqM, availableRemainingConstructionAreaSqM, plotAreaSqM, totalOpenSpaceAreaSqM, totalConstructionAreaSqM,
    alreadyUtilizedOpenSpaceAreaSqM, enteredFloorAreaSqM, enteredOpenSpaceAreaSqM, confirm, t, editingFloorForm, setFormErrors,
    constructionLookup, isAddingNewFloor, localFloors, props, floorLookup, selectedFloor, locale, propertyId, setLocalFloors,
    startTransition, setSelectedFloor, setIsAddingNewFloor, setEditingFloorForm, INITIAL_FORM_STATE, router
  ]);

  return {
    handleSave,
    handleDeleteFloor,
    handleOpenRenterManagement,
    isSaving,
    isDeleting,
  };
};