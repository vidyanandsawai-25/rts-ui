'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import { SortableColumnHeader } from '@/components/common/SortableColumnHeader';
import { cn } from '@/lib/utils/cn';
import {
  isApartmentColumnSortable,
  sortDirectionOf,
  type ApartmentSortPanel,
  type ApartmentSortState,
} from '@/lib/utils/apartment-sort';

export interface PtisColumnDef {
  key: string;
  labelKey: string;
  titleKey: string;
  defaultLabel: string;
  defaultTitle: string;
  className: string;
}

interface PtisTableHeaderProps {
  /** Which of the three tables this header belongs to (decides what a column is sorted by). */
  panel: ApartmentSortPanel;
  columns: PtisColumnDef[];
  /** Translates a column key; returns the key itself (or nothing) when there is no translation. */
  translate: (key: string) => string;
  /** Classes of the sticky <thead> and of its row: the colour of the table. */
  theadClassName: string;
  rowClassName: string;
  sort?: ApartmentSortState | null;
  onSort?: (panel: ApartmentSortPanel, column: string) => void;
  onClearSort?: () => void;
  /** Tooltip of the reset button on the # column. */
  resetSortLabel?: string;
}

/** The header of one comparison table: every data column is a sort button (ascending, descending, off). */
export const PtisTableHeader: React.FC<PtisTableHeaderProps> = ({
  panel,
  columns,
  translate,
  theadClassName,
  rowClassName,
  sort,
  onSort,
  onClearSort,
  resetSortLabel,
}) => (
  <thead className={theadClassName}>
    <tr className={rowClassName}>
      {columns.map((col) => {
        const label = translate(col.labelKey) || col.defaultLabel;
        const title = translate(col.titleKey) || col.defaultTitle;
        const isIndex = col.key === 'action' || col.key === 'index';
        const direction = sortDirectionOf(sort, panel, col.key);
        const sortable = !!onSort && isApartmentColumnSortable(panel, col.key);
        const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : sortable ? 'none' : undefined;

        return (
          <th key={col.key} aria-sort={ariaSort} className={cn('whitespace-nowrap', col.className)}>
            {sortable ? (
              <Tooltip content={title} placement="top">
                <SortableColumnHeader
                  label={label}
                  variant="plain"
                  sortDirection={direction}
                  onSort={() => onSort?.(panel, col.key)}
                  className="font-bold text-[10px]"
                />
              </Tooltip>
            ) : isIndex && sort && onClearSort ? (
              <button
                type="button"
                onClick={onClearSort}
                title={resetSortLabel}
                aria-label={resetSortLabel}
                className="inline-flex items-center gap-0.5 rounded cursor-pointer hover:opacity-75"
              >
                <span>{label}</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            ) : (
              <Tooltip content={title} placement="top">
                <span className="cursor-help inline-block">{label}</span>
              </Tooltip>
            )}
          </th>
        );
      })}
    </tr>
  </thead>
);
