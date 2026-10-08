import { setRequestLocale } from 'next-intl/server';
import { ChargeHeads } from '@/components/modules/water-bill/charge-heads';
import type { AddChargeHeadPageProps } from '@/types/waterBill/chargeHeads.types';
import { parsePagedSearchParams } from '@/lib/utils/search-params-helper';
import {
  fetchChargeHeadsServer,
  createChargeHeadAction,
  updateChargeHeadAction,
  deleteChargeHeadAction,
} from '../actions';

export default async function AddChargeHeadPage({ params, searchParams }: AddChargeHeadPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sParams = await searchParams;
  const { pageNumber, pageSize, searchTerm, sortBy, sortOrder } = parsePagedSearchParams(sParams);

  const pagedData = await fetchChargeHeadsServer({
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder,
  });

  return (
    <ChargeHeads
      pagedData={pagedData}
      locale={locale}
      drawer="add"
      initialEditingData={null}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialSearchTerm={searchTerm}
      createAction={createChargeHeadAction}
      updateAction={updateChargeHeadAction}
      deleteAction={deleteChargeHeadAction}
    />
  );
}
