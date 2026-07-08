import React from 'react';
import { Column } from '@/components/common/MasterTable';
import { cn } from '@/lib/utils/cn';
import { formatReassessmentCurrency, formatReassessmentNumber } from '@/lib/utils/format';
import { ReassessmentTaxRow } from '@/types/reassessment.types';

interface TaxColumn {
  key: string;
  label: string;
  displayOrder: number;
}

interface DynamicTaxRow extends Record<string, unknown> {
  taxes: string;
  totalTax: string;
  isTotal?: boolean;
  isAdditional?: boolean;
  [key: string]: unknown;
}

export function useReassessmentTaxTable({
  taxColumns,
  taxRows,
}: {
  taxColumns: TaxColumn[];
  taxRows: ReassessmentTaxRow[];
}) {
  // Helper renderers for Detailed Taxes Table Grid
  const numericTaxRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
    const numVal = typeof val === 'number' ? val : 0;
    return (
      <span
        className={cn(
          'font-mono',
          row.isTotal ? 'text-blue-900' : row.isAdditional ? 'text-sky-700' : ''
        )}
      >
        {formatReassessmentNumber(numVal)}
      </span>
    );
  };

  const totalTaxRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
    let displayVal;
    if (typeof val === 'number') {
      displayVal = formatReassessmentCurrency(val);
    } else if (typeof val === 'string') {
      displayVal = val;
    } else {
      displayVal = '';
    }
    return (
      <span
        className={cn(
          'font-mono pr-2',
          row.isTotal ? 'text-blue-950 font-black' : 'text-slate-800 font-extrabold'
        )}
      >
        {displayVal}
      </span>
    );
  };

  const taxesLabelRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
    const displayVal = typeof val === 'string' || typeof val === 'number' ? val : '';
    return (
      <span
        className={cn(
          'font-sans font-bold',
          row.isTotal ? 'text-blue-900' : row.isAdditional ? 'text-sky-700' : 'text-gray-500'
        )}
      >
        {displayVal}
      </span>
    );
  };

  // Generate dynamic columns from tax data
  const detailedTaxesColumns: Column<DynamicTaxRow>[] = [
    { 
      key: 'taxes', 
      label: 'Taxes', 
      width: '140px', 
      align: 'left', 
      render: taxesLabelRender,
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    },
    ...taxColumns.map((col) => ({
      key: col.key,
      label: col.label,
      width: '140px',
      align: 'center' as const,
      render: numericTaxRender,
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    })),
    {
      key: 'totalTax',
      label: 'Total Tax (₹)',
      width: '140px',
      align: 'right' as const,
      headerClassName: 'bg-slate-100 font-black text-right pr-3 whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
      render: totalTaxRender,
    },
  ];

  // Transform tax rows to table format
  const detailedTaxesData: DynamicTaxRow[] = taxRows.map((row) => {
    const rowData: DynamicTaxRow = {
      taxes: row.label,
      totalTax: formatReassessmentCurrency(row.totalTax),
      isTotal: row.rowType === 'total',
      isAdditional: row.rowType === 'additional',
    };

    // Add each tax column value
    Object.entries(row.taxes).forEach(([key, value]) => {
      rowData[key] = value;
    });

    return rowData;
  });

  return { detailedTaxesColumns, detailedTaxesData };
}
