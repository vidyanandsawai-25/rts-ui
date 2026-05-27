'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import {
  AddButton,
  FloorDetailsTable,
  FloorDetailsTableColumn,
  SearchInput,
} from '@/components/common';
import { FloorData, RoomAPIResponse } from '@/types/room-details.types';
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

  const [expandedRowIds, setExpandedRowIds] = React.useState<Array<string | number>>([]);

  const toggleRowExpansion = React.useCallback((rowId: string | number) => {
    setExpandedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  }, []);

  // Adapt the custom MasterTable columns to be compatible with FloorDetailsTable and style cells cleanly
  const adaptedColumns = React.useMemo<FloorDetailsTableColumn<FloorData>[]>(() => {
    const baseCols: FloorDetailsTableColumn<FloorData>[] = columns.map((col) => ({
      ...col,
      sortable: true,
      render: (row: FloorData, index: number) => {
        const cellValue = row[col.key as keyof FloorData];
        const content = col.render
          ? (col.render as (val: unknown, r: FloorData, i: number) => React.ReactNode)(cellValue, row, index)
          : <span className="font-bold text-slate-900">{String(cellValue ?? '-')}</span>;

        return (
          <div className="px-1 py-1 text-[11px] text-center flex items-center justify-center min-h-[28px] font-bold text-slate-700">
            {content}
          </div>
        );
      },
    }));

    // Append standard Action column at the end
    baseCols.push({
      key: 'actions',
      label: t('floor.actions'),
      sortable: false,
      render: (row: FloorData) => {
        const deleteFn = renderFloorActions(t, handleDeleteFloor);
        return (
          <div className="flex justify-center items-center h-full min-h-[28px]">
            {deleteFn(row)}
          </div>
        );
      },
    });

    return baseCols;
  }, [columns, t, handleDeleteFloor]);

  /**
   * Handle row click to edit a floor
   * Extracts floor data, normalizes IDs, and updates form state
   */
  const handleFloorRowClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const tr = target.closest('tbody tr');
      if (!tr) return;

      // Ignore clicks on action buttons
      if (target.closest('button')) return;

      // Intercept expand button click to prevent row selection triggering
      const expandLink = target.closest('a');
      if (expandLink && (expandLink.getAttribute('aria-label') === 'Expand row' || expandLink.querySelector('svg'))) {
        const tbody = tr.closest('tbody');
        if (tbody) {
          // Filter out expanded child rows
          const rowsOnly = Array.from(tbody.children).filter(
            (child) => !child.classList.contains('border-b') || child.querySelector('td')?.getAttribute('colspan') === null
          );
          const rowIndex = rowsOnly.indexOf(tr);
          if (rowIndex >= 0 && rowIndex < filteredFloors.length) {
            const floor = filteredFloors[rowIndex];
            if (floor.id) {
              e.preventDefault();
              e.stopPropagation();
              toggleRowExpansion(floor.id);
              return;
            }
          }
        }
      }

      const tbody = tr.closest('tbody');
      if (!tbody) return;

      const rowsOnly = Array.from(tbody.children).filter(
        (child) => !child.classList.contains('border-b') || child.querySelector('td')?.getAttribute('colspan') === null
      );
      const rowIndex = rowsOnly.indexOf(tr);
      if (rowIndex < 0 || rowIndex >= filteredFloors.length) return;

      const floor = filteredFloors[rowIndex];

      startTransition(() => {
        setFormErrors({});
        updateUrlParams({
          floorId: String(floor.id),
          typeOfUseId: getTypeOfUseId(floor) || null,
          drawer: null,
        });
      });

      // Pre-populate the form immediately for faster UI response
      setEditingFloorForm(normalizeFloorFormData(floor) as FloorData);
      setSelectedFloor(floor);
      setIsAddingNewFloor(false);
    },
    [
      filteredFloors,
      startTransition,
      setFormErrors,
      updateUrlParams,
      setEditingFloorForm,
      setSelectedFloor,
      setIsAddingNewFloor,
      toggleRowExpansion,
    ]
  );

  // Render a beautiful detailed list of rooms inside this floor when row is expanded
  const renderExpandedRooms = React.useCallback(
    (floor: FloorData) => {
      const rooms = (floor.roomWiseSubmissionDetails || []) as RoomAPIResponse[];
      if (rooms.length === 0) {
        return (
          <div className="p-4 text-center text-xs text-gray-500 bg-blue-50/50 rounded-lg border border-dashed border-blue-200">
            {t('floor.noRoomsFound', { defaultValue: 'No rooms added to this floor yet.' })}
          </div>
        );
      }

      return (
        <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-xl border border-blue-100 shadow-inner">
          <h4 className="text-[11px] font-bold text-blue-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            {t('floor.roomBreakdown', { count: rooms.length, defaultValue: `Room Details Breakdown (${rooms.length} Rooms)` })}
          </h4>
          <div className="overflow-hidden rounded-lg border border-blue-100 shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-blue-800 text-white font-bold uppercase tracking-wider">
                  <th className="p-2 border-r border-blue-700/50 text-center w-16">{t('floor.roomNo', { defaultValue: 'Room No' })}</th>
                  <th className="p-2 border-r border-blue-700/50">{t('floor.roomName', { defaultValue: 'Room Name' })}</th>
                  <th className="p-2 border-r border-blue-700/50 w-28 text-center">{t('floor.roomShape', { defaultValue: 'Shape' })}</th>
                  <th className="p-2 border-r border-blue-700/50 text-center w-40">{t('floor.dimensions', { defaultValue: 'Dimensions (L x B x H)' })}</th>
                  <th className="p-2 text-right w-32">{t('floor.carpetArea', { defaultValue: 'Carpet Area' })}</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, idx) => {
                  const dimStr = `${room.length || '-'} x ${room.breadth || '-'} x ${room.height || '-'}`;
                  const areaStr = `${room.area || '0.00'} Sq.Ft`;
                  return (
                    <tr
                      key={room.id || idx}
                      className="bg-white border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-2 border-r border-gray-100 text-center font-semibold text-blue-900">
                        {room.roomNo || idx + 1}
                      </td>
                      <td className="p-2 border-r border-gray-100 font-semibold text-gray-700">
                        {room.roomName || 'N/A'}
                      </td>
                      <td className="p-2 border-r border-gray-100 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                          {room.shape || 'Standard'}
                        </span>
                      </td>
                      <td className="p-2 border-r border-gray-100 text-center text-gray-600 font-medium">{dimStr}</td>
                      <td className="p-2 text-right font-bold text-blue-800">{areaStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
    [t]
  );

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
        <FloorDetailsTable<FloorData & { id: string | number }>
          data={filteredFloors as (FloorData & { id: string | number })[]}
          columns={adaptedColumns as unknown as FloorDetailsTableColumn<FloorData & { id: string | number }>[]}
          showExpandColumn={false}
          expandedRowIds={expandedRowIds}
          getExpandHref={(row) => `#floor-${row.id}`}
          renderExpanded={renderExpandedRooms}
          tableClassName="w-full min-w-[1200px]"
          emptyMessage={t('floor.noFloorsFound')}
          striped={true}
          hoverable={true}
          containerClassName="border border-blue-200 shadow-md rounded-xl max-h-[235px] overflow-auto"
          theadClassName="bg-[#1e3a8a] text-white"
          rowClassName={(row) =>
            `cursor-pointer transition-all duration-200 hover:bg-blue-50/80 active:bg-blue-100 ${selectedFloor?.id === row.id && !isAddingNewFloor ? 'bg-blue-100/70 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`
          }
        />
      </div>
    </div>
  );
};

export default FloorTable;
