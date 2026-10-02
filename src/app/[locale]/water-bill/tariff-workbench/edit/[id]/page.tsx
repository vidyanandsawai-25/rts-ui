import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TariffWorkbench } from '@/components/modules/water-bill/tariff-workbench';
import type { EditTariffPageProps } from '@/types/waterBill/tariffWorkbench.types';
import {
  fetchTariffWorkbenchesServer,
  fetchTariffWorkbenchByIdServer,
  getTariffFormLookups,
} from '@/lib/services/water-bill/tariffWorkbench.server';
import { parsePagedSearchParams } from '@/lib/utils/search-params-helper';
import {
  createTariffWorkbenchAction,
  updateTariffWorkbenchAction,
  deleteTariffWorkbenchAction,
} from '../../actions';

export default async function EditTariffPage({ params, searchParams }: EditTariffPageProps) {
  const { id: idStr, locale } = await params;
  setRequestLocale(locale);
  const sParams = await searchParams;

  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    notFound();
  }

  const { pageNumber, pageSize, searchTerm, sortBy, sortOrder } = parsePagedSearchParams(sParams);

  const [
    { financialYearOptions, connectionTypeOptions, connectionCategoryOptions },
    pagedData,
    fetchedData,
  ] = await Promise.all([
    getTariffFormLookups(),
    fetchTariffWorkbenchesServer({
      pageNumber,
      pageSize,
      searchTerm,
      sortBy,
      sortOrder,
    }),
    fetchTariffWorkbenchByIdServer(id),
  ]);

  const editingData = fetchedData && Number(fetchedData.id) === Number(id) ? fetchedData : null;

  if (!editingData) {
    notFound();
  }

  return (
    <TariffWorkbench
      pagedData={pagedData}
      locale={locale}
      drawer="edit"
      initialEditingData={editingData}
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
