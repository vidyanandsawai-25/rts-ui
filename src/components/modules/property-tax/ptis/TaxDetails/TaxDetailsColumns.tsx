import { Column } from '@/components/common/MasterTable';
import { formatIndianNumber } from '@/lib/utils/format';
import { TaxRow } from '@/types/ptisMain-taxdetails.types';
import {
  TAX_LABEL_CLASSES,
  HEADER_TEXT_CLASSES,
  CELL_CENTER_CLASS,
  NUMBER_CELL_CLASSES,
  TOTAL_CELL_CLASSES,
} from './config';

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
