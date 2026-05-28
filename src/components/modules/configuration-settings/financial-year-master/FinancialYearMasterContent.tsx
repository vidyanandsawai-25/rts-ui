import type { ReactNode } from 'react';

import { FinancialYearStats } from '@/components/modules/configuration-settings/financial-year-master/FinancialYearStats';
import { FinancialYearTable } from '@/components/modules/configuration-settings/financial-year-master/FinancialYearTable';
import { getFinancialYearsPaged } from '@/lib/api/financial-year.service';
import { parsePaginationParams } from '@/lib/utils/pagination';
import { getTranslations } from 'next-intl/server';
import { FinancialYear } from '@/types/financialYear.types';

interface FinancialYearMasterContentProps {
  locale: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  drawer?: 'add' | 'edit' | null;
  initialEditingData?: FinancialYear | null;
  modal?: ReactNode;
}

export async function FinancialYearMasterContent({
  locale,
  searchParams = {},
  drawer = null,
  initialEditingData = null,
  modal,
}: FinancialYearMasterContentProps) {
  const { page, pageSize, search, status } = searchParams;
  const t = await getTranslations({ locale, namespace: 'financialYear' });

  const { pageNumber, pageSize: size } = parsePaginationParams(page, pageSize);
  const searchTerm = (Array.isArray(search) ? search[0] : (search as string)) || '';
  const statusFilter = (Array.isArray(status) ? status[0] : (status as string)) || '';

  const [data, allData] = await Promise.all([
    getFinancialYearsPaged(pageNumber, size, searchTerm, statusFilter),
    getFinancialYearsPaged(1, 2000)
  ]);

  const stats = {
    total: allData.totalCount,
    active: allData.items.filter(y => y.status === 'Active').length,
    closed: allData.items.filter(y => y.status === 'Closed').length,
  };

  return (
    <FinancialYearTable
      initialData={data.items}
      totalCount={data.totalCount}
      pageNumber={pageNumber}
      pageSize={size}
      drawer={drawer}
      initialEditingData={initialEditingData}
      title={t('title')}
      subtitle={t('subtitle')}
      statsCard={<FinancialYearStats stats={stats} locale={locale} />}
      modal={modal}
    />
  );
}
