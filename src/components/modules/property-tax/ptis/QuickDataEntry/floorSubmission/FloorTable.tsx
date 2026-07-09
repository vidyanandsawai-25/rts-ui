'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import {
  AddButton,
  FloorDetailsTable,
  FloorDetailsTableColumn,
  SearchInput,
} from '@/components/common';
import { FloorData } from '@/types/room-details.types';
import { LookupData } from '@/lib/utils/floorSubmission/floor-mappers';
import {
  getTypeOfUseId,
  normalizeFloorFormData,
} from '@/lib/utils/floorSubmission/floor-mappers';
import { useFloorTableColumns, renderFloorActions } from './FloorTableColumns';
import { ExpandedRoomsBreakdown } from './components/ExpandedRoomsBreakdown';

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
  handleOpenDataEntrySameAs: () => void;
  viewOnly?: boolean;
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
  setEditingFloorForm: (val: FloorData) => void;
  selectedFloorType?: 'Construction' | 'OpenPlot';
  isPlotCategory?: boolean;
}

const FloorTable: React.FC<FloorTableProps> = ({
  t,
  filteredFloors,
  selectedFloorType,
  floorSearch,
  setFloorSearch,
  selectedFloor,
  setSelectedFloor,
  isAddingNewFloor,
  setIsAddingNewFloor,
  handleAddFloor,
  handleOpenDataEntrySameAs,
  viewOnly = false,
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
  isPlotCategory = false,
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

  const deleteCellRenderer = React.useMemo(() => {
    return renderFloorActions(t, handleDeleteFloor);
  }, [t, handleDeleteFloor]);

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
    if (!viewOnly) {
      baseCols.push({
      key: 'actions',
      label: t('floor.actions'),
      sortable: false,
      render: (row: FloorData) => {
        return (
          <div className="flex justify-center items-center h-full min-h-[28px]">
            {deleteCellRenderer(row)}
          </div>
        );
      },
      });
    }

    return baseCols;
  }, [columns, t, deleteCellRenderer, viewOnly]);

  /**
   * Handle row click to edit a floor
   * Extracts floor data, normalizes IDs, and updates form state
   */
  const handleFloorRowClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (viewOnly) return;

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
      viewOnly,
    ]
  );

  // Render detailed list of rooms inside this floor when row is expanded (extracted to components/ExpandedRoomsBreakdown)
  const renderExpandedRooms = React.useCallback(
    (floor: FloorData) => <ExpandedRoomsBreakdown floor={floor} t={t} />,
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!viewOnly && (
            <SearchInput
              value={floorSearch}
              onChange={setFloorSearch}
              placeholder={t('floor.searchFloors')}
              className="w-32 md:w-36 mb-0 h-7 scale-90"
            />
          )}

          {!viewOnly && (
            <AddButton
              label={t('floor.dataEntry')}
              size="sm"
              className="px-4 h-8 text-[11px] font-bold shadow-md rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center gap-2"
              onClick={handleOpenDataEntrySameAs}
            />
          )}

          {!viewOnly && !isPlotCategory && (
            <AddButton
              label={selectedFloorType === 'OpenPlot' ? (t('floor.addSpace') || 'Add Space') : (t('floor.addFloor') || 'Add Floor')}
              size="sm"
              className="px-4 h-8 text-[11px] font-bold shadow-md rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center gap-2"
              onClick={handleAddFloor}
            />
          )}
        </div>
      </div>

      <div onClick={handleFloorRowClick}>
        <FloorDetailsTable<FloorData & { id: string | number }>
          data={filteredFloors as (FloorData & { id: string | number })[]}
          columns={adaptedColumns as unknown as FloorDetailsTableColumn<FloorData & { id: string | number }>[]}
          showExpandColumn={false}
          showScrollButtons={false}
          expandedRowIds={expandedRowIds}
          getExpandHref={(row) => `#floor-${row.id}`}
          renderExpanded={renderExpandedRooms}
          tableClassName="w-full min-w-[1200px]"
          emptyMessage={t('floor.noFloorsFound')}
          striped={true}
          hoverable={true}
          containerClassName="border border-blue-200 shadow-md rounded-xl max-h-[200px] overflow-auto"
          theadClassName="bg-[#1e3a8a] text-white"
          rowClassName={(row) =>
            viewOnly
              ? 'cursor-default border-l-4 border-l-transparent'
              : `cursor-pointer transition-all duration-200 hover:bg-blue-50/80 active:bg-blue-100 ${selectedFloor?.id === row.id && !isAddingNewFloor ? 'bg-blue-100/70 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`
          }
        />
      </div>
    </div>
  );
};

export default FloorTable;
