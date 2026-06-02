'use client';

import { useMemo } from 'react';
import React from 'react';
import type { Column } from '@/components/common/MasterTable';
import { cn } from '@/lib/utils/cn';
import { 
  type TaxRowData, 
  type TaxColumnDef, 
  formatCurrency 
} from './useApartmentTaxDetailsTable';

/* ============================================================
   TYPE DEFINITIONS
 ============================================================ */

export interface UseTaxTableColumnsProps {
  taxColumns: TaxColumnDef[];
  activeSubTab: string;
  t: (key: string) => string;
  hasData: boolean;
}

/* ============================================================
   CELL RENDERERS
 ============================================================ */

/**
 * Render the method/property type cell
 */
function renderMethodCell(value: unknown, row: TaxRowData): React.ReactNode {
  if (row.rowType === 'rateable') {
    return (
      <div className="flex items-center gap-2 bg-white -mx-2 px-2 -my-2 py-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        <span className="text-xs font-medium text-blue-900">{value as string}</span>
      </div>
    );
  }
  if (row.rowType === 'capital') {
    return (
      <div className="flex items-center gap-2 bg-white -mx-2 px-2 -my-2 py-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span className="text-xs font-medium text-green-900">{value as string}</span>
      </div>
    );
  }
  if (row.rowType === 'total') {
    return (
      <div className="bg-purple-100 -mx-2 px-2 -my-2 py-2">
        <span className="text-xs font-bold text-gray-900">{value as string}</span>
      </div>
    );
  }
  // Single method (default)
  return (
    <div className="bg-white -mx-2 px-2 -my-2 py-2">
      <span className="text-xs font-medium text-gray-900">{value as string}</span>
    </div>
  );
}

/**
 * Render tax amount cell
 */
function renderTaxCell(value: unknown, row: TaxRowData): React.ReactNode {
  const amount = value as number | undefined;
  const formatted = amount !== undefined ? formatCurrency(amount) : '-';
  
  if (row.rowType === 'total') {
    return <span className="text-xs font-semibold text-gray-900">{formatted}</span>;
  }
  return <span className="text-xs text-gray-700">{formatted}</span>;
}

/**
 * Render total cell with colored background
 */
function renderTotalCell(value: unknown, row: TaxRowData, activeSubTab: string): React.ReactNode {
  const amount = value as number;
  const formatted = formatCurrency(amount);
  
  if (row.rowType === 'rateable') {
    return (
      <div className="bg-blue-100 -mx-2 px-2 -my-2 py-2">
        <span className="text-xs font-semibold text-blue-900">{formatted}</span>
      </div>
    );
  }
  if (row.rowType === 'capital') {
    return (
      <div className="bg-green-100 -mx-2 px-2 -my-2 py-2">
        <span className="text-xs font-semibold text-green-900">{formatted}</span>
      </div>
    );
  }
  if (row.rowType === 'total') {
    return (
      <div className="bg-[#1E3A8A] -mx-2 px-2 -my-2 py-2">
        <span className="text-xs font-bold text-white">{formatted}</span>
      </div>
    );
  }
  // Single method
  const isCapital = activeSubTab === 'capital';
  return (
    <div className={cn('-mx-2 px-2 -my-2 py-2', isCapital ? 'bg-green-600' : 'bg-[#1E3A8A]')}>
      <span className="text-xs font-bold text-white">{formatted}</span>
    </div>
  );
}

/* ============================================================
   HOOK
 ============================================================ */

/**
 * Hook to build dynamic table columns for tax details
 */
export function useTaxTableColumns({
  taxColumns,
  activeSubTab,
  t,
  hasData,
}: UseTaxTableColumnsProps): Column<TaxRowData>[] {
  return useMemo((): Column<TaxRowData>[] => {
    // If no data, return empty array (no columns to show)
    if (!hasData) {
      return [];
    }

    const cols: Column<TaxRowData>[] = [];

    // First column - Method/Property Type (only show when data exists)
    cols.push({
      key: 'methodLabel' as keyof TaxRowData,
      label: activeSubTab === 'dual-method' ? t('taxDetails.method') : t('taxDetails.methodLabel'),
      width: '150px',
      headerClassName: 'sticky left-0 z-10 bg-[#d9e3ec] border-r border-gray-300',
      cellClassName: 'sticky left-0 z-10 bg-white border-r border-gray-300',
      render: (value, row) => renderMethodCell(value, row),
    });

    // Dynamic tax columns
    taxColumns.forEach((tax) => {
      cols.push({
        key: tax.taxName as keyof TaxRowData,
        label: tax.taxName,
        align: 'center',
        headerClassName: 'whitespace-nowrap border-r border-gray-200',
        cellClassName: 'border-r border-gray-100',
        render: (value, row) => renderTaxCell(value, row),
      });
    });

    // Total column (only show when data exists)
    cols.push({
      key: 'total' as keyof TaxRowData,
      label: t('taxDetails.total'),
      align: 'center',
      headerClassName: 'bg-amber-100 border-l border-gray-300 font-bold',
      cellClassName: 'border-l border-gray-300',
      render: (value, row) => renderTotalCell(value, row, activeSubTab),
    });

    return cols;
  }, [taxColumns, activeSubTab, t, hasData]);
}
