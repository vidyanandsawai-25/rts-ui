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
  // Helper renderers for Detailed Taxes Table Grid with bordered cells
  const numericTaxRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
    const numVal = typeof val === 'number' ? val : 0;
    return (
      <div className={cn(
        "border border-gray-300 shadow-sm rounded h-6 flex items-center justify-center transition-all duration-150 hover:border-blue-500 hover:shadow",
        row.isTotal && "bg-green-50",
        row.isAdditional && "bg-yellow-50",
        !row.isTotal && !row.isAdditional && "bg-blue-50"
      )}>
        <span
          className={cn(
            'font-mono text-xs text-gray-900',
            row.isTotal ? 'font-bold' : ''
          )}
        >
          {formatReassessmentNumber(numVal)}
        </span>
      </div>
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
      <div className={cn(
        "border border-gray-300 shadow-sm rounded h-6 flex items-center justify-end px-2 transition-all duration-150 hover:border-blue-500 hover:shadow",
        row.isTotal && "bg-green-50",
        row.isAdditional && "bg-yellow-50",
        !row.isTotal && !row.isAdditional && "bg-blue-50"
      )}>
        <span
          className={cn(
            'font-mono text-xs text-gray-900',
            row.isTotal ? 'font-bold' : ''
          )}
        >
          {displayVal}
        </span>
      </div>
    );
  };

  const taxesLabelRender = (val: unknown, row: DynamicTaxRow): React.ReactNode => {
    const displayVal = typeof val === 'string' || typeof val === 'number' ? val : '';
    return (
      <div className={cn(
        "border border-gray-300 shadow-sm rounded h-6 flex items-center px-1.5 py-0.5 transition-all duration-150 hover:border-blue-500 hover:shadow",
        row.isTotal && "bg-green-50",
        row.isAdditional && "bg-yellow-50",
        !row.isTotal && !row.isAdditional && "bg-blue-50"
      )}>
        <span
          className={cn(
            'font-sans text-xs text-left text-gray-900',
            row.isTotal ? 'font-bold' : 'font-semibold'
          )}
        >
          {displayVal}
        </span>
      </div>
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
      width: '120px',
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