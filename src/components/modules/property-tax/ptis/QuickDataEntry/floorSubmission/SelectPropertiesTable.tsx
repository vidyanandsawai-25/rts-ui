'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Checkbox, MasterTable, type Column } from '@/components/common';
import { ClearButton } from '@/components/common/ActionButtons';
import { SelectableProperty } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

interface SelectPropertiesTableProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  properties: SelectableProperty[];
  selectedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  disabledIds?: Set<string | number>;
}

type SelectablePropertyRow = Record<string, unknown> &
  SelectableProperty & {
    selected: boolean;
    disabled: boolean;
    selection: string;
    propertyDisplay: string;
    typeDisplay: string;
    carpetAreaDisplay: string;
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

function formatCarpetAreaDisplay(property: SelectableProperty): string {
  const sqFeet = property.carpetAreaSqFeet;
  const sqMeter = property.carpetAreaSqMeter;
  if (sqFeet == null && sqMeter == null) return '-';
  return `${sqFeet != null ? Number(sqFeet).toFixed(2) : '0.00'} / ${sqMeter != null ? Number(sqMeter).toFixed(2) : '0.00'}`;
}

const SelectPropertiesTable: React.FC<SelectPropertiesTableProps> = ({
  t,
  properties,
  selectedIds,
  onToggle,
  onClearSelection,
  isLoading = false,
  disabledIds = new Set(),
}) => {
  const selectedCount = selectedIds.size;
  const selectableProperties = React.useMemo(
    () => properties.filter((property) => !disabledIds.has(property.id)),
    [disabledIds, properties]
  );
  const allSelected =
    selectableProperties.length > 0 && selectableProperties.every((property) => selectedIds.has(property.id));
  const someSelected = selectedCount > 0 && !allSelected;

  const tableData = React.useMemo<SelectablePropertyRow[]>(
    () =>
      properties.map((property) => ({
        ...property,
        selected: selectedIds.has(property.id),
        disabled: disabledIds.has(property.id),
        selection: String(property.id),
        propertyDisplay: formatPropertyDisplay(property),
        typeDisplay: formatPropertyTypeDisplay(property),
        carpetAreaDisplay: formatCarpetAreaDisplay(property),
      })),
    [disabledIds, properties, selectedIds]
  );

  const handleSelectAll = React.useCallback(() => {
    if (allSelected) {
      onClearSelection();
      return;
    }

    selectableProperties.forEach((property) => {
      if (!selectedIds.has(property.id)) onToggle(property.id);
    });
  }, [allSelected, onClearSelection, onToggle, selectableProperties, selectedIds]);

  const checkboxClassName =
    'h-4 w-4 border-slate-400 bg-white text-white data-[state=checked]:border-slate-800 data-[state=checked]:bg-slate-800 data-[state=indeterminate]:border-slate-800 data-[state=indeterminate]:bg-slate-800 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:stroke-[3.5] disabled:opacity-100 disabled:border-slate-700 disabled:data-[state=checked]:bg-slate-700';

  const columns = React.useMemo<Column<SelectablePropertyRow>[]>(
    () => [
      {
        key: 'selection',
        label: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={handleSelectAll}
            className={checkboxClassName}
            aria-label={t('floor.selectProperties.selectAll')}
          />
        ),
        width: '44px',
        align: 'center',
        render: (_value, row) => (
          <Checkbox
            checked={row.selected}
            disabled={row.disabled}
            onCheckedChange={() => {
              if (!row.disabled) onToggle(row.id);
            }}
            onClick={(event) => event.stopPropagation()}
            className={checkboxClassName}
            aria-label={t('floor.selectProperties.selectProperty', { propertyNo: row.propertyNo })}
          />
        ),
      },
      {
        key: 'propertyDisplay',
        label: t('floor.selectProperties.property'),
        width: '220px',
        cellClassName: 'whitespace-nowrap text-sm font-bold text-slate-800',
      },
      {
        key: 'typeDisplay',
        label: t('floor.selectProperties.type'),
        width: '70px',
        cellClassName: 'whitespace-nowrap text-sm font-bold text-slate-800'
      },
      {
        key: 'carpetAreaDisplay',
        label: t('floor.selectProperties.carpetArea'),
        width: '120px',
        cellClassName: 'whitespace-nowrap text-sm font-bold text-slate-800'
      },
      {
        key: 'wing',
        label: t('floor.selectProperties.wing'),
        width: '70px',
        align: 'center',
        cellClassName: 'whitespace-nowrap text-sm font-bold text-slate-800'
      },
      {
        key: 'flatNo',
        label: t('floor.selectProperties.flatNo'),
        width: '90px',
        cellClassName: 'whitespace-nowrap text-sm font-bold text-slate-800'
      },
    ],
    [allSelected, checkboxClassName, handleSelectAll, onToggle, someSelected, t]
  );

  const headerExtra =
    selectedCount > 0 ? (
      <div className="ml-auto flex items-center gap-2">
        <span className="px-2 py-0.5 text-slate-800 rounded-full text-sm font-bold">
          {t('floor.selectProperties.selected', { count: selectedCount })}
        </span>
        <ClearButton
          type="button"
          label={t('floor.selectProperties.clearSelection')}
          onClick={onClearSelection}
          className="h-7 px-2.5 text-[11px] font-semibold rounded-md"
        />
      </div>
    ) : null;

  return (
    <div className="mt-3">
      {isLoading && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('floor.selectProperties.loading')}</span>
        </div>
      )}
      <MasterTable<SelectablePropertyRow>
        columns={columns}
        data={tableData}
        loading={isLoading}
        getRowKey={(row) => row.id}
        onRowClick={(row) => {
          if (!row.disabled) onToggle(row.id);
        }}
        headerTitle={t('floor.selectProperties.title')}
        headerExtra={headerExtra}
        emptyText={t('floor.selectProperties.noProperties')}
        loadingText={t('floor.selectProperties.loading')}
        containerClassName=""
        tableClassName="table-fixed text-xs [&_th]:px-3 [&_td]:px-3"
        maxBodyHeightClassName="max-h-[260px]"
      />
    </div>
  );
};

export default SelectPropertiesTable;
