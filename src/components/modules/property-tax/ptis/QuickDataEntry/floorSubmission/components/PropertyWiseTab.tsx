'use client';

import React from 'react';
import { UpdateButton } from '@/components/common/ActionButtons';
import FloorTable from '../FloorTable';
import SelectPropertiesTable from '../SelectPropertiesTable';
import { FloorData } from '@/types/room-details.types';
import { LookupData } from '@/lib/utils/floorSubmission/floor-mappers';
import { SelectableProperty } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

interface PropertyWiseTabProps {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
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

export const PropertyWiseTab: React.FC<PropertyWiseTabProps> = ({
  t,
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
    </>
  );
};
