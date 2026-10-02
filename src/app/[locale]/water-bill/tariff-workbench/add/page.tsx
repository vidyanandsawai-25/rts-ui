import { setRequestLocale } from 'next-intl/server';
import { TariffWorkbench } from '@/components/modules/water-bill/tariff-workbench';
import type { AddTariffPageProps } from '@/types/waterBill/tariffWorkbench.types';
import {
  fetchTariffWorkbenchesServer,
  getTariffFormLookups,
} from '@/lib/services/water-bill/tariffWorkbench.server';
import { parsePagedSearchParams } from '@/lib/utils/search-params-helper';
import {
  createTariffWorkbenchAction,
  updateTariffWorkbenchAction,
  deleteTariffWorkbenchAction,
} from '../actions';

export default async function AddTariffPage({ params, searchParams }: AddTariffPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sParams = await searchParams;
  const { pageNumber, pageSize, searchTerm, sortBy, sortOrder } = parsePagedSearchParams(sParams);

  const [{ financialYearOptions, connectionTypeOptions, connectionCategoryOptions }, pagedData] =
    await Promise.all([
      getTariffFormLookups(),
      fetchTariffWorkbenchesServer({
        pageNumber,
        pageSize,
        searchTerm,
        sortBy,
        sortOrder,
      }),
    ]);

  return (
    <TariffWorkbench
      pagedData={pagedData}
      locale={locale}
      drawer="add"
      initialEditingData={null}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialSearchTerm={searchTerm}
      financialYearOptions={financialYearOptions}
      connectionTypeOptions={connectionTypeOptions}
      connectionCategoryOptions={connectionCategoryOptions}
      createAction={createTariffWorkbenchAction}
      updateAction={updateTariffWorkbenchAction}
      deleteAction={deleteTariffWorkbenchAction}
    />
  );
}
