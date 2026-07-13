'use client';

import { MasterTable } from '@/components/common';
import type { Column } from '@/components/common';
import { TaxApplicabilityItem } from '@/types/applicable-taxes.types';

interface TaxesTableTemplateProps {
  columns: Column<TaxApplicabilityItem>[];
  data: TaxApplicabilityItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TaxesTableTemplate = ({
  columns,
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: TaxesTableTemplateProps) => {
  return (
    <MasterTable<TaxApplicabilityItem>
      columns={columns}
      data={data}
      pageNumber={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      onPageChange={onPageChange}
      paginationConfig={{ enabled: true, showPageSizeSelector: false }}
      maxBodyHeightClassName="max-h-[calc(100vh-430px)]"
      tableClassName="table-fixed border-separate border-spacing-y-3 bg-transparent [&_tr]:border-none [&_tr]:bg-transparent [&_tr]:hover:bg-transparent"
      theadClassName="!bg-none  !bg-[#0B3C8E] [&_th]:!text-white [&_th]:!text-xs [&_th]:!py-2 [&_th]:!px-1.5 [&_th]:break-words [&_th]:leading-tight rounded-xl"
      containerClassName="border-none bg-transparent shadow-none [&>div]:border-none [&>div]:bg-transparent [&>div]:shadow-none"
      rowClassName={() => "bg-transparent hover:bg-transparent border-none"}
    />
  );
};

export default TaxesTableTemplate;