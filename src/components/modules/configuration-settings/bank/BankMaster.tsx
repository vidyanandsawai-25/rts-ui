'use client';

import { useMemo, useCallback, useTransition } from 'react';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

import { PageContainer } from '@/components/common/PageContainer';
import { EditButton, DeleteButton } from '@/components/common/ActionButtons';
import type { BankMasterData } from '@/types/bank-master.types';
import { useBankPagination } from '@/hooks/configuration-settings/bank/useBankPagination';
import { useBankSearch } from '@/hooks/configuration-settings/bank/useBankSearch';
import { useBankDelete } from '@/hooks/configuration-settings/bank/useBankDelete';

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
}

export function BankMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  statsData,
}: BankMasterProps) {
  const t = useTranslations('bankMaster');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

    const { search, currentSearchTerm, handleSearchChange } =
    useBankSearch({
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

  const renderActions = useCallback(
    (row: BankMasterTableRow) => (
      <div className="flex items-center gap-1">
        <EditButton onClick={() => handleEdit(row)} />
        <DeleteButton onClick={() => handleDelete(row)} />
      </div>
    ),
    [handleEdit, handleDelete]
  );

  return (
    <PageContainer>
      <div className="space-y-4">
        <BankMasterHeader
          t={t}
          onAdd={handleAdd}
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
