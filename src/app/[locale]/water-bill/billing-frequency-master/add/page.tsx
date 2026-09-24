import { setRequestLocale } from 'next-intl/server';
import { BillingFrequencyMaster } from '@/components/modules/water-bill/billing-frequency-master';
import type { AddBillingFrequencyPageProps } from '@/types/waterBill/billingFrequencyMaster.types';
import {
  fetchBillingFrequenciesAction,
  createBillingFrequencyAction,
  updateBillingFrequencyAction,
  deleteBillingFrequencyAction,
} from '../actions';

export default async function AddBillingFrequencyPage({ params, searchParams }: AddBillingFrequencyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sParams = await searchParams;
  const pageNumber = Math.max(1, Number(sParams?.pageNumber) || 1);
  const pageSize = Math.max(1, Number(sParams?.pageSize) || 10);
  const searchTerm = typeof sParams?.searchTerm === 'string' ? sParams.searchTerm : undefined;
  const sortBy = typeof sParams?.sortBy === 'string' ? sParams.sortBy : undefined;
  const sortOrder =
    sParams?.sortOrder === 'desc' || sParams?.sortOrder === 'asc' ? sParams.sortOrder : undefined;

  // 1. Server-side fetch action call and store in a variable
  const pagedData = await fetchBillingFrequenciesAction({
    pageNumber,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder,
  });

  // 2. Open drawer in 'add' mode
  return (
    <BillingFrequencyMaster
      pagedData={pagedData}
      locale={locale}
      drawer="add"
      initialEditingData={null}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialSearchTerm={searchTerm}
      createAction={createBillingFrequencyAction}
      updateAction={updateBillingFrequencyAction}
      deleteAction={deleteBillingFrequencyAction}
    />
  );
}
