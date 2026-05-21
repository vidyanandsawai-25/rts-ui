'use client';

import { useMemo, useCallback, useTransition } from 'react';
import { AlertCircle } from 'lucide-react';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

import { PageContainer } from '@/components/common/PageContainer';
import { EditButton, DeleteButton } from '@/components/common/ActionButtons';
import type { BankMasterData } from '@/types/bank-master.types';
import { useBankPagination } from '@/hooks/configuration-settings/bank/useBankPagination';
import { useBankSearch } from '@/hooks/configuration-settings/bank/useBankSearch';
import { useBankDelete } from '@/hooks/configuration-settings/bank/useBankDelete';
import { usePermissions } from '@/hooks/usePermissions';

import { getBankColumns, type BankMasterTableRow } from './BankColumns';
import { BankMasterHeader } from './components/BankMasterHeader';
import { BankMasterStats } from './components/BankMasterStats';
import { BankMasterTable } from './components/BankMasterTable';

interface BankMasterProps {
  data: BankMasterData[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  statsData: {
    activeCount: number;
    uniqueStates: string[];
  };
  /** Specific error message from server — shown inline instead of triggering the error boundary */
  errorMessage?: string;
}

export function BankMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  statsData,
  errorMessage,
}: BankMasterProps) {
  const t = useTranslations('bankMaster');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const { search, currentSearchTerm, handleSearchChange } = useBankSearch({
    locale,
    startTransition,
  });

  const { changePage, handlePageSizeChange } = useBankPagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    currentSearchTerm,
    filterState: 'all',
    startTransition,
  });

  const columns = useMemo(() => getBankColumns(t, tCommon), [t, tCommon]);

  const handleAdd = useCallback(() => {
    startTransition(() => {
      router.push(`/${locale}/configuration-settings/bank-master/add`);
    });
  }, [locale, router, startTransition]);

  const { handleDelete, isDeleting } = useBankDelete({
    t,
    startTransition,
  });

  const handleEdit = useCallback(
    (row: BankMasterData) => {
      startTransition(() => {
        router.push(`/${locale}/configuration-settings/bank-master/edit/${row.id}`);
      });
    },
    [locale, router, startTransition]
  );

  const { canEdit, canDelete, haveFullAccess } = usePermissions('BANK_MASTER');

  const renderActions = useCallback(
    (row: BankMasterTableRow) => (
      <div className="flex items-center gap-1">
        {(canEdit || haveFullAccess) && <EditButton onClick={() => handleEdit(row)} />}
        {(canDelete || haveFullAccess) && <DeleteButton onClick={() => handleDelete(row)} />}
      </div>
    ),
    [handleEdit, handleDelete, canEdit, canDelete, haveFullAccess]
  );

  return (
    <PageContainer>
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold">
                {t('errorTitle', { defaultValue: 'Failed to load bank data' })}
              </p>
              <p className="text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}
        <BankMasterHeader
          t={t}
          onAdd={haveFullAccess ? handleAdd : undefined}
          search={search}
          onSearchChange={handleSearchChange}
        />

        <BankMasterStats
          totalCount={totalCount}
          activeCount={statsData.activeCount}
          statesCount={statsData.uniqueStates.length}
          t={t}
        />

        <BankMasterTable
          columns={columns}
          data={data}
          loading={isPending || isDeleting}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          onPageSizeChange={(size) => handlePageSizeChange(String(size))}
          renderActions={renderActions}
        />
      </div>
    </PageContainer>
  );
}
