'use client';

import { useMemo, useCallback, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { PageContainer } from '@/components/common/PageContainer';
import { EditButton, DeleteButton } from '@/components/common/ActionButtons';
import type { ModuleMaster as ModuleMasterType } from '@/types/moduleMaster.types';
import { useModulePagination } from '@/hooks/configuration-settings/module-master/useModulePagination';
import { useModuleSearch } from '@/hooks/configuration-settings/module-master/useModuleSearch';
import { useModuleDelete } from '@/hooks/configuration-settings/module-master/useModuleDelete';
import { usePermissions } from '@/hooks/usePermissions';

import { getModuleColumns, type ModuleMasterTableRow } from './ModuleColumns';
import { ModuleMasterHeader } from './components/ModuleMasterHeader';
import { ModuleMasterStats } from './components/ModuleMasterStats';
import { ModuleMasterTable } from './components/ModuleMasterTable';

interface ModuleMasterProps {
  data: ModuleMasterType[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  statsData: {
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
  };
  fetchError?: string;
  statusCode?: number;
}

export function ModuleMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  statsData,
  fetchError,
  statusCode,
}: ModuleMasterProps) {
  const t = useTranslations('moduleMaster');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const { canView, canEdit, canDelete, haveFullAccess } = usePermissions('MODULE_MASTER');

  const [isPending, startTransition] = useTransition();

  const { search, currentSearchTerm, handleSearchChange } = useModuleSearch({
    locale,
    startTransition,
  });

  const { changePage, handlePageSizeChange } = useModulePagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    currentSearchTerm,
    startTransition,
  });

  const columns = useMemo(() => getModuleColumns(t, tCommon), [t, tCommon]);

  const handleAdd = useCallback(() => {
    startTransition(() => {
      router.push(`/${locale}/configuration-settings/module-master/add`);
    });
  }, [locale, router, startTransition]);

  const { handleDelete, isDeleting } = useModuleDelete({
    t,
    startTransition,
  });

  const handleRowEdit = useCallback(
    (row: ModuleMasterTableRow) => {
      startTransition(() => {
        router.push(`/${locale}/configuration-settings/module-master/edit/${row.moduleId}`);
      });
    },
    [locale, router, startTransition]
  );

  const handleRowDelete = useCallback(
    (row: ModuleMasterTableRow) => {
      handleDelete(row);
    },
    [handleDelete]
  );

  const renderActions = useCallback(
    (row: ModuleMasterTableRow) => (
      <div className="flex items-center gap-1">
        {(canEdit || haveFullAccess) && <EditButton onClick={() => handleRowEdit(row)} />}
        {(canDelete || haveFullAccess) && <DeleteButton onClick={() => handleRowDelete(row)} />}
      </div>
    ),
    [handleRowEdit, handleRowDelete, canEdit, canDelete, haveFullAccess]
  );

  if (!canView && !haveFullAccess) {
    const isUnauthorized =
      statusCode === 401 ||
      (fetchError &&
        (fetchError.toLowerCase().includes('unauthorized') ||
          fetchError.toLowerCase().includes('token') ||
          fetchError === 'messages.unauthorizedToken'));

    const messageKey = isUnauthorized ? 'errors.unauthorized' : 'errors.noAccess';

    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-xl border border-gray-200/80 shadow-sm animate-in fade-in duration-300">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
          <h3 className="text-lg font-semibold text-gray-900">{tCommon(messageKey)}</h3>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <ModuleMasterHeader
          t={t}
          onAdd={haveFullAccess ? handleAdd : undefined}
          search={search}
          onSearchChange={handleSearchChange}
        />

        {fetchError && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">{t('messages.fetchFailed')}</h3>
              <p className="text-xs text-red-700 mt-1 font-mono">
                {typeof t.has === 'function' && t.has(fetchError) ? t(fetchError) : fetchError}
              </p>
            </div>
          </div>
        )}

        <ModuleMasterStats
          totalCount={statsData.totalCount}
          activeCount={statsData.activeCount}
          inactiveCount={statsData.inactiveCount}
          t={t}
        />

        <ModuleMasterTable
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
