import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, ArrowUpDown, Home, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Common color groupings for floor detail table rows
 */
const DEFAULT_ROW_COLOR_GROUPS = ['bg-white', 'bg-[#EEF6FF]', 'bg-[#F5F3FF]'] as const;

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
                  <div
                    className={cn(
                      'inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-blue-400/10 bg-black/5 px-3 text-xs font-bold text-inherit shadow-sm transition-colors duration-200 select-none whitespace-nowrap',
                      headerBadgeClassName,
                      col.headerBadgeClassName
                    )}
                  >
                    {typeof col.label === 'string' ? (
                      <span className="truncate font-bold uppercase tracking-wider">
                        {col.label}
                      </span>
                    ) : (
                      col.label
                    )}
                    {col.sortable !== false && (
                      <ArrowUpDown className="h-2.5 w-2.5 text-white opacity-60" />
                    )}
                  </div>
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
            data.map((row, index) => {
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
