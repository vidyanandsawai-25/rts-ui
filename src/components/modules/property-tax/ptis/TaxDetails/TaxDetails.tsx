'use client';

import { MasterTable } from '@/components/common/MasterTable';
import { useTaxDetailsTable } from './useTaxDetailsTable';
import type { TaxDetailsData, TaxRow } from '@/types/ptisMain-taxdetails.types';

/**
 * TaxDetails Component
 * 
 * Renders a dynamic table of taxation breakdown based on provided policies.
 * Logic is decoupled into the `useTaxDetailsTable` hook and `TaxDetailsColumns` utility.
 * If no tax details are provided, renders an empty table with default structure.
 */
const TaxDetails = ({ initialTaxDetails }: { initialTaxDetails?: TaxDetailsData }) => {
  const { taxRows, taxColumns } = useTaxDetailsTable(initialTaxDetails);

  return (
    <div className="w-full tax-details-container overflow-x-auto">
      <div className="min-w-max">
        <MasterTable<TaxRow>
          columns={taxColumns}
          data={taxRows}
          loading={false}
          getRowKey={(row) => row.id}
          tableClassName="table-auto"
          theadClassName="bg-linear-to-r from-[#1e3a8a] via-[#1e40af] to-[#1e3a8a] border-b border-blue-700 py-1.5 hover:from-[#1e40af] hover:via-[#2563eb] hover:to-[#1e40af] transition-colors duration-200 shadow-sm"
        />
      </div>
    </div>
  );
};

TaxDetails.displayName = 'TaxDetails';

export default TaxDetails;