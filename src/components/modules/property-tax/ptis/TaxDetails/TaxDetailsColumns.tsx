import { Column } from '@/components/common/MasterTable';
import { formatIndianNumber } from '@/lib/utils/format';
import { TAX_LABEL_CLASSES } from './constants';
import { TaxRow } from '@/types/ptisMain-taxdetails.types';

// UI Constants for styling
export const HEADER_TEXT_CLASSES = 'text-white text-[9.5px] font-bold uppercase tracking-tighter py-1.5';
export const CELL_CENTER_CLASS = 'text-center';
export const NUMBER_CELL_CLASSES = 'border border-blue-200 rounded px-1 py-0.5 text-center bg-white text-[10px] min-w-[55px] shadow-sm';
export const TOTAL_CELL_CLASSES = 'border border-indigo-300 rounded px-1 py-0.5 text-center bg-white text-[10px] min-w-[55px] font-bold';

/**
 * Returns the column configuration for the TaxDetails table.
 * 
 * @param allTaxNames - Array of unique tax names found in the data
 * @param t - Translation function
 * @param getTaxLabelStyle - Function to get styling classes for tax labels
 * @returns Array of column definitions
 */
export function getTaxDetailsColumns(
  allTaxNames: string[],
  t: (key: string) => string,
  getTaxLabelStyle: (taxType: string) => string
): Column<TaxRow>[] {
  const columns: Column<TaxRow>[] = [
    {
      key: 'taxes' as keyof TaxRow,
      label: t('taxes'),
      width: '125px',
      headerClassName: HEADER_TEXT_CLASSES,
      render: (_v, row) => (
        <div className={`${TAX_LABEL_CLASSES} ${getTaxLabelStyle(row.labelKey || row.taxes)}`}>
          {row.taxes}
        </div>
      ),
    },
  ];

  // Dynamic tax amount columns
  allTaxNames.forEach((taxName) => {
    columns.push({
      key: taxName as keyof TaxRow,
      label: taxName,
      headerClassName: `${HEADER_TEXT_CLASSES} ${CELL_CENTER_CLASS}`,
      cellClassName: CELL_CENTER_CLASS,
      render: (_v, row) => (
        <div className={NUMBER_CELL_CLASSES}>
          {formatIndianNumber(Number(row[taxName] ?? 0), 2, 2)}
        </div>
      ),
    });
  });

  // Total tax column
  columns.push({
    key: 'totalTax' as keyof TaxRow,
    label: t('totalTax'),
    headerClassName: `${HEADER_TEXT_CLASSES} ${CELL_CENTER_CLASS}`,
    cellClassName: CELL_CENTER_CLASS,
    render: (_v, row) => (
      <div className={TOTAL_CELL_CLASSES}>
        {formatIndianNumber(Number(row.totalTax), 2, 2)}
      </div>
    ),
  });

  return columns;
}
