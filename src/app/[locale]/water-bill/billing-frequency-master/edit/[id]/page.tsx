import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BillingFrequencyMaster } from '@/components/modules/water-bill/billing-frequency-master';
import type { EditBillingFrequencyPageProps } from '@/types/waterBill/billingFrequencyMaster.types';
import {
  fetchBillingFrequenciesAction,
  fetchBillingFrequencyByIdAction,
  createBillingFrequencyAction,
  updateBillingFrequencyAction,
  deleteBillingFrequencyAction,
} from '../../actions';

export default async function EditBillingFrequencyPage({ params, searchParams }: EditBillingFrequencyPageProps) {
  const { id: idStr, locale } = await params;
  setRequestLocale(locale);
  const sParams = await searchParams;

  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    notFound();
  }

  const pageNumber = Math.max(1, Number(sParams?.pageNumber) || 1);
  const pageSize = Math.max(1, Number(sParams?.pageSize) || 10);
  const searchTerm = typeof sParams?.searchTerm === 'string' ? sParams.searchTerm : undefined;
  const sortBy = typeof sParams?.sortBy === 'string' ? sParams.sortBy : undefined;
  const sortOrder =
    sParams?.sortOrder === 'desc' || sParams?.sortOrder === 'asc' ? sParams.sortOrder : undefined;

  // 1. Fetch billing frequencies list and specific editing record on server
  const [pagedData, editingData] = await Promise.all([
    fetchBillingFrequenciesAction({
      pageNumber,
      pageSize,
      searchTerm,
      sortBy,
      sortOrder,
    }),
    fetchBillingFrequencyByIdAction(id),
  ]);

  if (!editingData) {
    notFound();
  }

  // 2. Open drawer in 'edit' mode with initial preloaded data
  return (
    <BillingFrequencyMaster
      pagedData={pagedData}
      locale={locale}
      drawer="edit"
      initialEditingData={editingData}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialSearchTerm={searchTerm}
      createAction={createBillingFrequencyAction}
      updateAction={updateBillingFrequencyAction}
      deleteAction={deleteBillingFrequencyAction}
    />
  );
}
