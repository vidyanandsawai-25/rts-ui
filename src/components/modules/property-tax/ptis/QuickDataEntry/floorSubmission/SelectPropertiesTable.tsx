'use client';

import React from 'react';
import { MasterTable, type Column } from '@/components/common';
import { SelectableProperty } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

interface SelectPropertiesTableProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  properties: SelectableProperty[];
  selectedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

type SelectablePropertyRow = Record<string, unknown> &
  SelectableProperty & {
    selected: boolean;
    selection: string;
    propertyDisplay: string;
    typeDisplay: string;
  };

function formatPropertyPart(value: unknown): string {
  const text = String(value ?? '').trim();
  return text || '-';
}

function formatPropertyDisplay(property: SelectableProperty): string {
  return [
    formatPropertyPart(property.wardNo),
    formatPropertyPart(property.propertyNo),
    formatPropertyPart(property.partitionNo),
  ].join('-');
}

function formatPropertyTypeDisplay(property: SelectableProperty): string {
  const label = String(property.typeLabel ?? '').trim();
  if (label) return label;

  const rawType = String(property.type ?? '').trim();
  if (!rawType || rawType === '-') return '-';
  return rawType;
}

const SelectPropertiesTable: React.FC<SelectPropertiesTableProps> = ({
  t,
  properties,
  selectedIds,
  onToggle,
  onClearSelection,
  isLoading = false,
}) => {
  const selectedCount = selectedIds.size;
  const allSelected =
    properties.length > 0 && properties.every((property) => selectedIds.has(property.id));
  const someSelected = selectedCount > 0 && !allSelected;

  const tableData = React.useMemo<SelectablePropertyRow[]>(
    () =>
      properties.map((property) => ({
        ...property,
        selected: selectedIds.has(property.id),
        selection: String(property.id),
        propertyDisplay: formatPropertyDisplay(property),
        typeDisplay: formatPropertyTypeDisplay(property),
      })),
    [properties, selectedIds]
  );

  const handleSelectAll = React.useCallback(() => {
    if (allSelected) {
      onClearSelection();
      return;
    }

    properties.forEach((property) => {
      if (!selectedIds.has(property.id)) onToggle(property.id);
    });
  }, [allSelected, onClearSelection, onToggle, properties, selectedIds]);

  const columns = React.useMemo<Column<SelectablePropertyRow>[]>(
    () => [
      {
        key: 'selection',
        label: (
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={handleSelectAll}
            className="w-3.5 h-3.5 rounded border-gray-300 accent-violet-600 cursor-pointer"
            aria-label={t('floor.selectProperties.selectAll')}
          />
        ),
        width: '44px',
        align: 'center',
        render: (_value, row) => (
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => onToggle(row.id)}
            onClick={(event) => event.stopPropagation()}
            className="w-3.5 h-3.5 rounded border-gray-300 accent-violet-600 cursor-pointer"
            aria-label={t('floor.selectProperties.selectProperty', { propertyNo: row.propertyNo })}
          />
        ),
      },
      {
        key: 'propertyDisplay',
        label: 'Property',
        width: '220px',
        cellClassName: 'whitespace-nowrap font-bold text-violet-700',
      },
      {
        key: 'typeDisplay',
        label: t('floor.selectProperties.type'),
        width: '70px',
        cellClassName: 'text-slate-600 whitespace-nowrap',
      },
      {
        key: 'wing',
        label: t('floor.selectProperties.wing'),
        width: '70px',
        align: 'center',
        cellClassName: 'text-slate-600 whitespace-nowrap',
      },
      {
        key: 'flatNo',
        label: t('floor.selectProperties.flatNo'),
        width: '90px',
        cellClassName: 'text-slate-600 whitespace-nowrap',
      },
    ],
    [allSelected, handleSelectAll, onToggle, someSelected, t]
  );

  const headerExtra =
    selectedCount > 0 ? (
      <div className="ml-auto flex items-center gap-2">
        <span className="px-2 py-0.5 text-slate-700 rounded-full text-[10px] font-bold">
          {t('floor.selectProperties.selected', { count: selectedCount })}
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-[11px] font-semibold text-slate-700 border border-slate-300 rounded-md px-2.5 py-1 transition-colors"
        >
          {t('floor.selectProperties.clearSelection')}
        </button>
      </div>
    ) : null;

  return (
    <MasterTable<SelectablePropertyRow>
      columns={columns}
      data={tableData}
      loading={isLoading}
      getRowKey={(row) => row.id}
      onRowClick={(row) => onToggle(row.id)}
      headerTitle={t('floor.selectProperties.title')}
      headerExtra={headerExtra}
      emptyText={t('floor.selectProperties.noProperties')}
      loadingText={t('floor.selectProperties.loading')}
      containerClassName="mt-3"
      tableClassName="table-fixed text-[11px] [&_th]:px-3 [&_td]:px-3"
      maxBodyHeightClassName="max-h-[260px]"
    />
  );
};

export default SelectPropertiesTable;
