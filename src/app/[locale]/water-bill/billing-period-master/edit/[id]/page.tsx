import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BillingPeriodMaster } from '@/components/modules/water-bill/billing-period-master';
import type { EditBillingPeriodPageProps } from '@/types/waterBill/billingPeriodMaster.types';
import {
  fetchBillingPeriodsAction,
  fetchBillingPeriodByIdAction,
  createBillingPeriodAction,
  updateBillingPeriodAction,
  deleteBillingPeriodAction,
  fetchFinancialYearsDropdownAction,
  fetchBillingFrequenciesDropdownAction,
} from '../../actions';

export default async function EditBillingPeriodPage({ params, searchParams }: EditBillingPeriodPageProps) {
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

  // 1. Fetch data, specific editing record, and dropdown options in parallel
  const [pagedData, editingData, financialYearOptions, billingFrequencyOptions] = await Promise.all([
    fetchBillingPeriodsAction({
      pageNumber,
      pageSize,
      searchTerm,
      sortBy,
      sortOrder,
    }),
    fetchBillingPeriodByIdAction(id),
    fetchFinancialYearsDropdownAction(),
    fetchBillingFrequenciesDropdownAction(),
  ]);

  if (!editingData) {
    notFound();
  }

  // 2. Open drawer in 'edit' mode with initial preloaded data
  return (
    <BillingPeriodMaster
      pagedData={pagedData}
      financialYearOptions={financialYearOptions}
      billingFrequencyOptions={billingFrequencyOptions}
      locale={locale}
      drawer="edit"
      initialEditingData={editingData}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialSearchTerm={searchTerm}
      createAction={createBillingPeriodAction}
      updateAction={updateBillingPeriodAction}
      deleteAction={deleteBillingPeriodAction}
    />
  );
}
