'use client';

import React from 'react';
import { Input } from '@/components/common';
import { UpdateButton } from '@/components/common/ActionButtons';
import FloorTable from '../FloorTable';
import SelectPropertiesTable from '../SelectPropertiesTable';
import { FloorData } from '@/types/room-details.types';
import { LookupData } from '@/lib/utils/floorSubmission/floor-mappers';
import { SelectableProperty } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

interface TypeWiseTabProps {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  currentPropertyType: string;
  properties: SelectableProperty[];
  selectedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  onClearSelection: () => void;
  isLoading: boolean;
  disabledIds: Set<string | number>;
  isApplying: boolean;
  onApply: () => void;

  // FloorTable props
  filteredFloors: FloorData[];
  floorSearch: string;
  setFloorSearch: (val: string) => void;
  selectedFloor: FloorData | null;
  setSelectedFloor: (val: FloorData | null) => void;
  isAddingNewFloor: boolean;
  setIsAddingNewFloor: (val: boolean) => void;
  handleAddFloor: () => void;
  updateUrlParams: (params: Record<string, string | null>) => void;
  handleDeleteFloor: (floor: FloorData) => void;
  startTransition: (fn: () => void) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  floorLookup: LookupData[];
  subFloorLookup: LookupData[];
  constructionLookup: LookupData[];
  useLookup: LookupData[];
  subTypeData: LookupData[];
  setEditingFloorForm: (val: FloorData) => void;
}

export const TypeWiseTab: React.FC<TypeWiseTabProps> = ({
  t,
  currentPropertyType,
  properties,
  selectedIds,
  onToggle,
  onClearSelection,
  isLoading,
  disabledIds,
  isApplying,
  onApply,
  ...floorTableProps
}) => {
  return (
    <>
      <FloorTable
        {...floorTableProps}
        t={t}
        handleOpenDataEntrySameAs={() => {}}
        viewOnly
      />

      <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded text-[12px] font-medium text-red-700 shadow-sm">
        {t('floor.selectProperties.typeWiseInstruction')}
      </div>

      <div className="flex items-center gap-3 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            {t('floor.selectProperties.type')}
          </span>
          <Input
            type="text"
            readOnly
            naked
            value={currentPropertyType}
            className="h-8 w-16 rounded border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-center text-slate-500 cursor-default select-none outline-none"
            placeholder="-"
            aria-label={t('floor.selectProperties.currentType')}
          />
        </div>
      </div>

      <SelectPropertiesTable
        t={t}
        properties={properties}
        selectedIds={selectedIds}
        onToggle={onToggle}
        onClearSelection={onClearSelection}
        isLoading={isLoading}
        disabledIds={disabledIds}
      />

      <div className="flex justify-end mt-4 px-1">
        <UpdateButton
          type="button"
          size="sm"
          label={isApplying ? t('floor.selectProperties.applying') : t('floor.selectProperties.applyButton')}
          onClick={onApply}
          disabled={selectedIds.size === 0}
          isLoading={isApplying}
          className="h-9 px-5 text-xs font-semibold rounded-md"
        />
      </div>

      <div className="mt-4 px-3.5 py-3 bg-slate-100/60 border border-slate-200 rounded-md text-[11px] flex flex-col gap-1.5 shadow-sm">
        <p className="font-bold text-red-700 text-xs">{t('floor.selectProperties.typeClassificationNoteTitle')}</p>
        <p className="text-red-600 font-semibold">
          {t('floor.selectProperties.typeClassificationNote')}
        </p>
      </div>
    </>
  );
};
