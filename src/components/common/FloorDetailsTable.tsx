'use client';

import React, { type ReactNode, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Home, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from './Tooltip';

/**
 * Common color groupings for floor detail table rows
 */
const DEFAULT_ROW_COLOR_GROUPS = ['bg-white', 'bg-[#EEF6FF]', 'bg-[#F5F3FF]'] as const;

export const COLUMN_FULL_NAMES: Record<string, string> = {
  floor: 'Floor',
  subFloor: 'Sub Floor',
  constructionYear: 'Construction Year',
  constYear: 'Construction Year',
  conYr: 'Construction Year',
  assessmentYear: 'Assessment Year',
  asstYear: 'Assessment Year',
  assmtYear: 'Assessment Year',
  constructionType: 'Construction Type',
  constType: 'Construction Type',
  conTyp: 'Construction Type',
  natureTypeBuilding: 'Nature of Building / Type of Use',
  use: 'Nature of Building / Type of Use',
  subType: 'Sub Type of Use',
  subTyp: 'Sub Type of Use',
  noOfRooms: 'Number of Rooms',
  rooms: 'Number of Rooms',
  carpetArea: 'Carpet Area (Square Feet / Square Meter)',
  carpetSqFt: 'Carpet Area (Square Feet)',
  carpetSqM: 'Carpet Area (Square Meter)',
  builtUpArea: 'Built-Up Area (Square Feet / Square Meter)',
  builtupAreaSqFt: 'Built-Up Area (Square Feet)',
  builtupAreaSqM: 'Built-Up Area (Square Meter)',
  ocNumber: 'Occupancy Certificate Number',
  ocDate: 'Occupancy Certificate Date',
  renterName: 'Renter Name',
  rentMY: 'Rent (Monthly / Yearly)',
  annualRent: 'Rent (Monthly / Yearly)',
  appliedOn: 'Applied On Date',
  rateMY: 'Rate (Monthly / Yearly)',
  rate: 'Rate (Monthly / Yearly)',
  yearlyRentalValue: 'Yearly Rental Value',
  rentalValue: 'Yearly Rental Value',
  depreciation: 'Depreciation',
  maintenance: 'Maintenance & Repair',
  mr: 'Maintenance & Repair',
  alv: 'Annual Letting Value',
  rv: 'Rateable Value',
  sdrrRate: 'Stamp Duty Ready Reckoner Rate',
  sdrr: 'Stamp Duty Ready Reckoner Rate',
  baseValue: 'Base Value',
  floorFactor: 'Floor Factor',
  ageFactor: 'Age Factor',
  ntbFactor: 'Nature of Building / Type of Use Factor',
  useFactor: 'Use Factor',
  finalCapitalValue: 'Capital Value',
  capitalValue: 'Capital Value',
  isTaxable: 'Is Taxable',
  taxable: 'Is Taxable',
  actions: 'Actions',
};

/**
 * Calculates the background class for a row based on its group index
 */
function getRowBackgroundClass(
  index: number,
  colorGroups: readonly string[] = DEFAULT_ROW_COLOR_GROUPS
): string {
  const groupIndex = Math.floor(index / 2) % colorGroups.length;
  return colorGroups[groupIndex] || 'bg-white';
}

export interface FloorDetailsTableColumn<Row> {
  key: string;
  label: ReactNode;
  headerClassName?: string;
  headerBadgeClassName?: string;
  cellClassName?: string;
  render: (row: Row, index: number) => ReactNode;
  headerRender?: (col: FloorDetailsTableColumn<Row>) => ReactNode;
  sortable?: boolean;
  tooltip?: ReactNode;
}

interface FloorDetailsTableProps<Row extends { id: number | string }> {
  data: Row[];
  columns: FloorDetailsTableColumn<Row>[];
  emptyMessage?: ReactNode;

  // Expansion Props
  showExpandColumn?: boolean;
  expandedLabel?: string;
  expandedRowIds?: Array<number | string>;
  getExpandHref?: (row: Row) => string;
  renderExpanded?: (row: Row) => ReactNode;
  expandIcon?: LucideIcon;
  expandHeaderIcon?: LucideIcon;

  // Styling Configuration
  hoverable?: boolean;
  showBorder?: boolean;
  striped?: boolean;

  // Styling Props
  tableClassName?: string;
  containerClassName?: string;
  theadClassName?: string;
  headerRowClassName?: string;
  tbodyClassName?: string;
  headerCellClassName?: string;
  headerBadgeClassName?: string;
  cellClassName?: string;
  rowClassName?: (row: Row, index: number) => string;
  expandedRowClassName?: string;
  colorGroups?: readonly string[];

  // Custom Content
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
}

/**
 * A highly flexible, high-density table component designed for complex data displays.
 * SSR-compatible (no client-side hooks) and easily customizable for any layout or design.
 *
 * ### Reference Syntax for Developers:
 *
 * #### 1. Basic Usage (Standard Table)
 * ```tsx
 * <FloorDetailsTable
 *   data={items}
 *   columns={[
 *     { key: 'name', label: 'Name', render: (row) => row.name },
 *     { key: 'val', label: 'Value', render: (row) => row.value }
 *   ]}
 * />
 * ```
 *
 * #### 2. With Expansion (Master-Detail)
 * ```tsx
 * <FloorDetailsTable
 *   data={items}
 *   columns={columns}
 *   showExpandColumn={true}
 *   expandedRowIds={['id1', 'id2']}
 *   getExpandHref={(row) => `?expand=${row.id}`}
 *   renderExpanded={(row) => <DetailView data={row} />}
 * />
 * ```
 *
 * #### 3. Custom Header Styling
 * ```tsx
 * {
 *   key: 'total',
 *   label: 'Total',
 *   headerClassName: 'bg-indigo-900 border-l border-indigo-700 sticky right-0 z-30',
 *   render: (row) => <strong>{row.total}</strong>
 * }
 * ```
 *
 * #### 4. Full Header Customization (Override Default Wrapper)
 * ```tsx
 * {
 *   key: 'action',
 *   label: 'Actions',
 *   headerRender: (col) => (
 *     <div className="flex justify-center p-2 bg-slate-800 text-white rounded">
 *       {col.label}
 *     </div>
 *   ),
 *   render: (row) => <button>Delete</button>
 * }
 * ```
 */
export function FloorDetailsTable<Row extends { id: number | string }>({
  data,
  columns,
  emptyMessage = 'No data found',
  showExpandColumn = true,
  expandedLabel = 'Expand row',
  expandedRowIds = [],
  getExpandHref,
  renderExpanded,
  expandIcon: ExpandIcon = ChevronRight,
  expandHeaderIcon: ExpandHeaderIcon = Home,
  hoverable = true,
  showBorder = true,
  striped = true,
  tableClassName,
  containerClassName,
  theadClassName,
  headerRowClassName,
  tbodyClassName,
  headerCellClassName,
  headerBadgeClassName,
  cellClassName,
  rowClassName,
  expandedRowClassName,
  colorGroups = DEFAULT_ROW_COLOR_GROUPS,
  renderHeader,
  renderFooter,
}: FloorDetailsTableProps<Row>) {
  const expandedRowIdSet = new Set(expandedRowIds.map(String));

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: '', direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!data) return [];
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Row];
      const bVal = b[sortConfig.key as keyof Row];

      const parseVal = (val: unknown): number | string => {
        if (val === undefined || val === null || val === '-') return -Infinity;
        if (typeof val === 'number') return val;

        const str = String(val).trim();

        // Check if it matches a date pattern like DD/MM/YYYY
        const dateMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dateMatch) {
          const [_, d, m, y] = dateMatch;
          return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
        }

        // Check if it's a number pair/fraction/formatted number:
        // Try extracting first number: "21,527.82 / 2,000.00" -> "21527.82"
        const cleaned = str.replace(/,/g, '');
        const firstNumMatch = cleaned.match(/^-?\d+(\.\d+)?/);
        if (firstNumMatch) {
          return parseFloat(firstNumMatch[0]);
        }

        return str;
      };

      const parsedA = parseVal(aVal);
      const parsedB = parseVal(bVal);

      if (typeof parsedA === 'number' && typeof parsedB === 'number') {
        return sortConfig.direction === 'asc' ? parsedA - parsedB : parsedB - parsedA;
      }

      const strA = String(parsedA);
      const strB = String(parsedB);
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
        : strB.localeCompare(strA, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [data, sortConfig]);

  return (
    <div
      className={cn(
        'w-full overflow-x-auto bg-white shadow-sm',
        showBorder && 'border border-blue-200 rounded-xl',
        containerClassName
      )}
    >
      <table className={cn('w-full border-collapse text-left', tableClassName)}>
        <thead className={cn('bg-[#1e3a8a] text-white sticky top-0 z-20', theadClassName)}>
          {renderHeader?.()}
          <tr className={headerRowClassName}>
            {/* Optional Expand Control Header */}
            {showExpandColumn && (
              <th
                className={cn(
                  'w-[40px] min-w-[40px] px-0.5 py-0.5 border-r border-blue-400/20',
                  headerCellClassName
                )}
              >
                <div className="flex items-center justify-center">
                  <div className="inline-flex h-6 w-8 items-center justify-center rounded-md border border-blue-400/30 bg-blue-800/40 shadow-sm">
                    <ExpandHeaderIcon className="h-3 w-3 text-white" />
                  </div>
                </div>
              </th>
            )}

            {/* Data Headers */}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-1 py-1 border-r border-blue-400/20',
                  headerCellClassName,
                  col.headerClassName
                )}
              >
                {col.headerRender ? (
                  col.headerRender(col)
                ) : (
                  <Tooltip
                    content={
                      col.tooltip &&
                        typeof col.tooltip === 'string' &&
                        !col.tooltip.startsWith('ptis.floorTable.tooltips') &&
                        !col.tooltip.includes('.tooltips.')
                        ? col.tooltip
                        : (COLUMN_FULL_NAMES[col.key] || col.label)
                    }
                    placement="top"
                  >
                    <div
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={cn(
                        'inline-flex h-6 w-full items-center justify-center gap-0.5 rounded border border-blue-400/10 bg-black/5 px-1.5 text-[10px] font-bold text-inherit shadow-sm transition-colors duration-200 select-none whitespace-nowrap',
                        col.sortable !== false && 'cursor-pointer hover:bg-black/15 active:bg-black/25',
                        headerBadgeClassName,
                        col.headerBadgeClassName
                      )}
                    >
                      {typeof col.label === 'string' ? (
                        <span className="truncate font-bold uppercase tracking-normal">
                          {col.label}
                        </span>
                      ) : (
                        col.label
                      )}
                      {col.sortable !== false && (
                        <span className="inline-flex flex-shrink-0 items-center ml-1">
                          {sortConfig.key === col.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="h-2.5 w-2.5 text-white opacity-100" />
                            ) : (
                              <ArrowDown className="h-2.5 w-2.5 text-white opacity-100" />
                            )
                          ) : (
                            <ArrowUpDown className="h-2.5 w-2.5 text-white opacity-60 hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </Tooltip>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={tbodyClassName}>
          {(!data || data.length === 0) ? (
            <tr className="h-[120px] bg-gray-50/30">
              <td
                colSpan={columns.length + (showExpandColumn ? 1 : 0)}
                className="px-6 py-10 text-center align-middle"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                  <span className="text-sm font-medium italic opacity-80">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => {
              const isExpanded = expandedRowIdSet.has(String(row.id));
              const bgClass = striped ? getRowBackgroundClass(index, colorGroups) : '';
              const baseRowClass = rowClassName
                ? rowClassName(row, index)
                : cn(
                  'group h-[36px] border-b border-gray-100 transition-colors',
                  hoverable && 'hover:bg-blue-50/50',
                  bgClass
                );

              return (
                <React.Fragment key={row.id}>
                  <tr className={baseRowClass}>
                    {/* Optional Expand Control Cell */}
                    {showExpandColumn && (
                      <td
                        className={cn(
                          'px-1 py-1 text-center align-middle border-r border-gray-100',
                          cellClassName
                        )}
                      >
                        <div className="flex items-center justify-center">
                          {getExpandHref ? (
                            <Link
                              href={getExpandHref(row)}
                              scroll={false}
                              aria-label={expandedLabel}
                              aria-expanded={isExpanded}
                              className="rounded border border-gray-300 p-0.5 transition-colors hover:border-blue-500 bg-white shadow-sm"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3 text-gray-700" />
                              ) : (
                                <ExpandIcon className="h-3 w-3 text-gray-700" />
                              )}
                            </Link>
                          ) : (
                            <div className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                    )}

                    {/* Data Cells */}
                    {columns.map((col) => (
                      <td
                        key={`${row.id}-${col.key}`}
                        className={cn(
                          'px-1.5 py-1 text-center align-middle whitespace-nowrap border-r border-gray-100 last:border-r-0',
                          cellClassName,
                          col.cellClassName
                        )}
                      >
                        {col.render(row, index)}
                      </td>
                    ))}
                  </tr>

                  {/* Expanded Row Content */}
                  {isExpanded && renderExpanded && (
                    <tr className={cn('border-b border-gray-100', bgClass, expandedRowClassName)}>
                      <td colSpan={columns.length + (showExpandColumn ? 1 : 0)} className="p-0">
                        <div className="w-full bg-blue-50/30 p-2 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
                          {renderExpanded(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
          {renderFooter?.()}
        </tbody>
      </table>
    </div>
  );
}
