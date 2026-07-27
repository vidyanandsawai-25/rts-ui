'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FloorDetailsTable, FloorDetailsTableColumn } from '@/components/common';
import { useTaxDetailsTable } from './useTaxDetailsTable';
import type { TaxDetailsData, TaxRow } from '@/types/ptisMain-taxdetails.types';

/**
 * TaxDetails Component
 * 
 * Renders a dynamic table of taxation breakdown using the FloorDetailsTable component concept.
 * Features a dark blue sticky header, clean rows without input-like containers, and subtle grid borders.
 */
const TaxDetails = ({ initialTaxDetails }: { initialTaxDetails?: TaxDetailsData }) => {
  const t = useTranslations('ptisMainTaxDetails');
  const { taxRows, taxColumns } = useTaxDetailsTable(initialTaxDetails);

  // Adapt MasterTable column definitions to FloorDetailsTableColumn
  const adaptedColumns = React.useMemo<FloorDetailsTableColumn<TaxRow & { id: number | string }>[]>(() => {
    return taxColumns.map((col) => ({
      key: String(col.key),
      label: typeof col.label === 'string' ? col.label : String(col.label),
      sortable: true,
      headerClassName: col.headerClassName,
      cellClassName: col.cellClassName,
      render: (row: TaxRow & { id: number | string }, index: number) => {
        const val = row[col.key as keyof TaxRow];
        if (col.render) {
          return col.render(val, row, index);
        }
        return <span className="font-semibold text-slate-800 text-[12px]">{String(val ?? '-')}</span>;
      },
    }));
  }, [taxColumns]);

  return (
    <div className="w-full tax-details-container overflow-x-auto">
      <FloorDetailsTable<TaxRow & { id: number | string }>
        data={taxRows as (TaxRow & { id: number | string })[]}
        columns={adaptedColumns}
        showExpandColumn={false}
        showScrollButtons={false}
        showBorder={false}
        striped={true}
        hoverable={true}
        emptyMessage={t('noTaxDetailsAvailable')}
        tableClassName="w-full min-w-max text-[12px]"
        theadClassName="bg-[#1440aa] text-white"
        rowClassName={() => "h-[34px] border-b-2 border-blue-200/90 hover:bg-blue-50/70 transition-colors"}
      />
    </div>
  );
};

TaxDetails.displayName = 'TaxDetails';

export default TaxDetails;