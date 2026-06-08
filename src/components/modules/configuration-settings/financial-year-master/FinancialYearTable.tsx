"use client";

import { Table, PageContainer } from '@/components/common';
import { FinancialYear } from '@/types/financialYear.types';
import { TableColumn } from '@/types/common.types';
import { FinancialYearTableToolbar } from './FinancialYearTableToolbar';
import { FinancialYearPagination } from './FinancialYearPagination';
import { useFinancialYearTable } from '../../../../hooks/configuration-settings/financial-year-master/useFinancialYearTable';
import { FinancialYearDrawerWrapper } from './FinancialYearDrawerWrapper';
import { FinancialYearForm } from './FinancialYearForm';

interface FinancialYearTableProps {
  initialData: FinancialYear[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  drawer?: 'add' | 'edit' | null;
  initialEditingData?: FinancialYear | null;
  title?: string;
  subtitle?: string;
  statsCard?: React.ReactNode;
  modal?: React.ReactNode;
}

export const FinancialYearTable = ({ 
  initialData, 
  totalCount, 
  pageNumber, 
  pageSize,
  drawer = null,
  initialEditingData = null,
  title,
  subtitle,
  statsCard,
  modal,
}: FinancialYearTableProps) => {
  const {
    activeDrawer,
    editingData,
    loadingState,
    isPending,
    handleAdd,
    handleCloseDrawer,
    handlePageChange,
    handlePageSizeChange,
    columns,
    t,
    router,
  } = useFinancialYearTable({
    initialData,
    totalCount,
    pageNumber,
    pageSize,
    drawer,
    initialEditingData,
  });

  return (
    <PageContainer title={title} subtitle={subtitle}>
      <div className="space-y-6">
        {statsCard}
        
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
          <FinancialYearTableToolbar 
            onAdd={handleAdd}
          />
          
          <div className="overflow-x-auto">
            <Table 
              data={initialData as unknown as Record<string, unknown>[]} 
              columns={columns as unknown as TableColumn<Record<string, unknown>>[]} 
              className="w-full border-none [&_th:last-child]:!text-right [&_td:last-child]:!text-right [&_td:nth-child(2)]:!whitespace-normal [&_td:nth-child(2)]:!max-w-[320px]" 
              isLoading={isPending && loadingState === null}
            />
          </div>
          
          <FinancialYearPagination 
            totalCount={totalCount}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalPages={Math.ceil(totalCount / pageSize)}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />

          {activeDrawer && (
            <FinancialYearDrawerWrapper
              title={activeDrawer === 'add' ? t('form.addTitle') : t('form.editTitle')}
              onClose={handleCloseDrawer}
            >
              <FinancialYearForm
                initialData={editingData}
                onSuccess={() => {
                  handleCloseDrawer();
                  router.refresh();
                }}
                onCancel={handleCloseDrawer}
              />
            </FinancialYearDrawerWrapper>
          )}
        </div>
      </div>
      {modal}
    </PageContainer>
  );
};
