'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Input } from '@/components/common';
import { AreaSectionProps } from '@/types/floor-details.types';
import { cn } from '@/lib/utils/cn';
import { FieldWrapper, ReadOnlyField } from './SectionField';


export const AreaSection: React.FC<AreaSectionProps> = ({
  t,
  editingFloorForm,
  setEditingFloorForm,
  formErrors,
  setFormErrors,
  roomsInputRef,
  areaInputRef,
  setShowRoomSubmission,
}) => {

  return (
    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Rooms */}
      <FieldWrapper
        label={t('floor.rooms')}
        htmlFor="floor-rooms"
        required
        error={formErrors.rooms}
        labelExtra={
          !formErrors.rooms && !editingFloorForm.use && (
            <span className="text-[9px] text-orange-500 font-medium px-1.5 py-0.5 bg-orange-50 rounded border border-orange-100 animate-pulse">
              {t('floor.selectUseFirst')}
            </span>
          )
        }
      >
        <Input
          ref={roomsInputRef}
          id="floor-rooms"
          type="number"
          placeholder="4"
          min="1"
          max="999"
          value={editingFloorForm.rooms || ''}
          onChange={(e) => {
            setEditingFloorForm({ ...editingFloorForm, rooms: e.target.value });
            if (formErrors.rooms) setFormErrors((prev) => ({ ...prev, rooms: '' }));
          }}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
          }}
          disabled={!editingFloorForm.use}
          className={cn(
            "h-9 text-sm transition-all duration-200",
            !editingFloorForm.use ? "bg-gray-100/80 cursor-not-allowed grayscale" : "bg-white hover:border-blue-400 focus:border-blue-500"
          )}
        />
      </FieldWrapper>

      {/* Area (Sq Ft) */}
      <FieldWrapper
        label={t('floor.areaSqFt')}
        htmlFor="floor-area-sqft"
        required
        error={formErrors.areaSqFt}
        labelExtra={
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[9px] text-blue-700 font-bold uppercase tracking-tight">
              {t('floor.autoCalculated')}
            </span>
          </span>
        }
      >
        <div className="group relative">
          <Input
            ref={areaInputRef}
            id="floor-area-sqft"
            type="number"
            placeholder="0.00"
            value={editingFloorForm.areaSqFt || ''}
            readOnly
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            className="h-9 text-sm bg-gray-50 cursor-default group-hover:bg-blue-50/30 transition-colors pr-24 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/90 px-2 py-1 rounded-md border border-slate-300 shadow-sm transition-all duration-200 group-hover:shadow group-focus-within:border-blue-400 group-focus-within:ring-1 group-focus-within:ring-blue-100">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
              {t('floor.sqFt')}
            </span>
            <div className="w-[1px] h-3.5 bg-slate-400 mx-0.5 opacity-60" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowRoomSubmission(true);
              }}
              className="flex items-center justify-center p-1 rounded hover:bg-blue-600 hover:text-white text-blue-600 transition-all active:scale-90"
              title={t('floor.openRoomSubmission') || 'Open Room Submission'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </FieldWrapper>

      {/* Calculated Fields */}
      <ReadOnlyField
        id="floor-area-sqm"
        label={t('floor.areaSqM')}
        value={editingFloorForm.areaSqM}
        badgeText={t('floor.autoCalculated')}
      />

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
    </div>
  );
};
