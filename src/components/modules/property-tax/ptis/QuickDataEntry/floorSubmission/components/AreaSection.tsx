'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { Input, AnimatedDigitInput } from '@/components/common';
import { AreaSectionProps } from '@/types/floor-details.types';
import { FieldWrapper, ReadOnlyField } from './SectionField';
import { cn } from '@/lib/utils/cn';
import { checkIsUtilityCategory } from '@/lib/utils/floorSubmission/floor-utility-checks';

export const AreaSection: React.FC<AreaSectionProps & { selectedFloorType?: 'Construction' | 'OpenPlot'; isDrawer?: boolean }> = ({
  t,
  editingFloorForm,
  setEditingFloorForm,
  formErrors,
  setFormErrors,
  roomsInputRef,
  areaInputRef,
  setShowRoomSubmission,
  selectedFloorType = 'Construction',
  isDrawer = false,
}) => {

  const isUtility = checkIsUtilityCategory(editingFloorForm?.typeOfUseCategoryId);
  const isOpenPlot = selectedFloorType === 'OpenPlot';

  const content = (
    <>
      {/* Rooms */}
      {!isOpenPlot && !isUtility && (
        <FieldWrapper
          label={t('floor.rooms')}
          htmlFor="floor-rooms"
          required={!isUtility}
          error={formErrors.rooms}
          labelExtra={
            !formErrors.rooms && !editingFloorForm.use && (
              <span className="text-[9px] text-orange-500 font-medium px-1.5 py-0.5 bg-orange-50 rounded border border-orange-100 animate-pulse">
                {t('floor.selectUseFirst')}
              </span>
            )
          }
        >
          <AnimatedDigitInput
            ref={roomsInputRef}
            id="floor-rooms"
            maxLength={2}
            value={String(editingFloorForm.rooms || '')}
            placeholder="0"
            disabled={!editingFloorForm.use}
            onChange={(cleaned) => {
              setEditingFloorForm({ ...editingFloorForm, rooms: cleaned });
              if (formErrors.rooms) setFormErrors((prev) => ({ ...prev, rooms: '' }));
            }}
          />
        </FieldWrapper>
      )}

      {/* Area / Plot Area (Sq Ft) */}
      <FieldWrapper
        label={isOpenPlot ? (t('floor.plotAreaSqFt') || 'Plot Area (Sq Ft)') : t('floor.areaSqFt')}
        htmlFor="floor-area-sqft"
        required
        error={formErrors.areaSqFt}
        labelExtra={
          !isOpenPlot ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[9px] text-blue-700 font-bold uppercase tracking-tight">
                {t('floor.autoCalculated')}
              </span>
            </span>
          ) : undefined
        }
      >
        <div className="group relative">
          <Input
            ref={areaInputRef}
            id="floor-area-sqft"
            type="text"
            placeholder="0.00"
            value={editingFloorForm.areaSqFt || ''}
            readOnly={true}
            className={cn(
              "h-9 text-sm pr-24 border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-colors",
              "bg-gray-50 cursor-default group-hover:bg-blue-50/30"
            )}
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/90 px-2 py-1 rounded-md border border-slate-300 shadow-sm transition-all duration-200 group-hover:shadow group-focus-within:border-blue-400 group-focus-within:ring-1 group-focus-within:ring-blue-100">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
              {t('floor.sqFt')}
            </span>
            {!isOpenPlot && (
              <>
                <div className="w-[1px] h-3.5 bg-slate-400 mx-0.5 opacity-60" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isUtility) {
                      const roomsStr = editingFloorForm.rooms !== undefined && editingFloorForm.rooms !== null ? String(editingFloorForm.rooms) : '';
                      const roomCount = parseInt(roomsStr, 10);
                      if (!roomsStr || isNaN(roomCount) || roomCount <= 0) {
                        setFormErrors((prev) => ({
                          ...prev,
                          rooms: t('floor.errors.roomsRequiredForDetails') || 'Number of rooms must be greater than zero before entering room details.'
                        }));
                        toast.error(
                          t('floor.errors.roomGuidance') || 'Guidance: To enter room-wise breakdown, please first enter the total number of rooms (1 to 9999) for this floor.'
                        );
                        return;
                      }
                    }
                    setShowRoomSubmission(true);
                  }}
                  className="flex items-center justify-center p-1 rounded hover:bg-blue-600 hover:text-white text-blue-600 transition-all active:scale-90"
                  title={t('floor.openRoomSubmission') || 'Open Room Submission'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </FieldWrapper>

      {/* Calculated Fields / Plot Area (Sq M) */}
      <ReadOnlyField
        id="floor-area-sqm"
        label={isOpenPlot ? (t('floor.plotAreaSqM') || 'Plot Area (Sq M)') : t('floor.areaSqM')}
        value={editingFloorForm.areaSqM}
        badgeText={!isOpenPlot ? t('floor.autoCalculated') : undefined}
      />

      {!isOpenPlot && (
        <>
          <ReadOnlyField
            id="floor-builtup-sqft"
            label={t('floor.builtupAreaSqFt')}
            value={editingFloorForm.builtupAreaSqFt}
          />

          <ReadOnlyField
            id="floor-builtup-sqm"
            label={t('floor.builtupAreaSqM')}
            value={editingFloorForm.builtupAreaSqM}
          />
        </>
      )}
    </>
  );

  if (isDrawer) {
    return content;
  }

  return (
    <div className={cn(
      "grid grid-cols-1 gap-4",
      isOpenPlot ? "md:col-span-2 md:grid-cols-2" : "md:col-span-3 md:grid-cols-5"
    )}>
      {content}
    </div>
  );
};
