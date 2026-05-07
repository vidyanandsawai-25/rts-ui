'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import {
  AddButton,
  MasterTable,
  SearchInput,
} from '@/components/common';
import {
  FloorData,
} from '@/types/room-details.types';
import { LookupData } from '@/lib/utils/floorSubmission/floor-mappers';
import {
  getTypeOfUseId,
  normalizeFloorFormData,
} from '@/lib/utils/floorSubmission/floor-mappers';
import { useFloorTableColumns, renderFloorActions } from './FloorTableColumns';

interface FloorTableProps {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
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
  // Lookups for rendering
  floorLookup: LookupData[];
  subFloorLookup: LookupData[];
  constructionLookup: LookupData[];
  useLookup: LookupData[];
  subTypeData: LookupData[];
  // State for Add Fresh setup
  setEditingFloorForm: (val: FloorData) => void;
}

const FloorTable: React.FC<FloorTableProps> = ({
  t,
  filteredFloors,
  floorSearch,
  setFloorSearch,
  selectedFloor,
  setSelectedFloor,
  isAddingNewFloor,
  setIsAddingNewFloor,
  handleAddFloor,
  updateUrlParams,
  handleDeleteFloor,
  startTransition,
  setFormErrors,
  floorLookup,
  subFloorLookup,
  constructionLookup,
  useLookup,
  subTypeData,
  setEditingFloorForm,
}) => {
  const columns = useFloorTableColumns({
    t,
    floorLookup,
    subFloorLookup,
    constructionLookup,
    useLookup,
    subTypeData,
  });

  /**
   * Handle row click to edit a floor
   * Extracts floor data, normalizes IDs, and updates form state
   */
  const handleFloorRowClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tr = target.closest('tbody tr');
    if (!tr) return;

    // Ignore clicks on action buttons
    if (target.closest('button')) return;

    const tbody = tr.closest('tbody');
    if (!tbody) return;

    const rowIndex = Array.from(tbody.children).indexOf(tr);
    if (rowIndex < 0 || rowIndex >= filteredFloors.length) return;

    const floor = filteredFloors[rowIndex];

    startTransition(() => {
      setFormErrors({});
      updateUrlParams({
        floorId: String(floor.id),
        typeOfUseId: getTypeOfUseId(floor) || null,
      });
    });

    // Pre-populate the form immediately for faster UI response
    setEditingFloorForm(normalizeFloorFormData(floor) as FloorData);
    setSelectedFloor(floor);
    setIsAddingNewFloor(false);
  }, [filteredFloors, startTransition, setFormErrors, updateUrlParams, setEditingFloorForm, setSelectedFloor, setIsAddingNewFloor]);

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-2">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-blue-200">
        <h3 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          {t('floor.allFloors')}
          <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
            {filteredFloors.length}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <SearchInput
            value={floorSearch}
            onChange={setFloorSearch}
            placeholder={t('floor.searchFloors')}
            className="w-32 md:w-36 mb-0 h-7 scale-90"
          />

          <AddButton
            label={t('floor.addFloor')}
            size="sm"
            className="px-4 h-8 text-[11px] font-bold shadow-md rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center gap-2"
            onClick={handleAddFloor}
          />
        </div>
      </div>

      <div onClick={handleFloorRowClick}>
        <MasterTable<FloorData>
          columns={columns}
          data={filteredFloors}
          getRowKey={(row) => ((row as FloorData).id ?? 0) as React.Key}
          maxBodyHeightClassName="max-h-[240px]"
          containerClassName="border-0 shadow-none overflow-hidden rounded-lg"
          theadClassName="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border-b-2 border-blue-200"
          rowClassName={(row) =>
            `cursor-pointer transition-all duration-200 hover:bg-blue-50/80 active:bg-blue-100 ${selectedFloor?.id === (row as FloorData).id && !isAddingNewFloor ? 'bg-blue-100/70 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`
          }
          renderActions={renderFloorActions(t, handleDeleteFloor)}
          actionLabel={t('floor.actions')}
          emptyText={t('floor.noFloorsFound')}
        />
      </div>
    </div>
  );
};

export default FloorTable;
