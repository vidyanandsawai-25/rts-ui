import { setRequestLocale } from 'next-intl/server';
import { BillingPeriodMaster } from '@/components/modules/water-bill/billing-period-master';
import type { BillingPeriodMasterPageProps } from '@/types/waterBill/billingPeriodMaster.types';
import {
  fetchBillingPeriodsAction,
  createBillingPeriodAction,
  updateBillingPeriodAction,
  deleteBillingPeriodAction,
  fetchFinancialYearsDropdownAction,
  fetchBillingFrequenciesDropdownAction,
} from './actions';

export default async function BillingPeriodMasterPage({ params, searchParams }: BillingPeriodMasterPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sParams = await searchParams;
  const pageNumber = Math.max(1, Number(sParams?.pageNumber) || 1);
  const pageSize = Math.max(1, Number(sParams?.pageSize) || 10);
  const searchTerm = typeof sParams?.searchTerm === 'string' ? sParams.searchTerm : undefined;
  const sortBy = typeof sParams?.sortBy === 'string' ? sParams.sortBy : undefined;
  const sortOrder =
    sParams?.sortOrder === 'desc' || sParams?.sortOrder === 'asc' ? sParams.sortOrder : undefined;

  // 1. Server-side fetch data and dropdown options in parallel
  const [pagedData, financialYearOptions, billingFrequencyOptions] = await Promise.all([
    fetchBillingPeriodsAction({
      pageNumber,
      pageSize,
      searchTerm,
      sortBy,
      sortOrder,
    }),
    fetchFinancialYearsDropdownAction(),
    fetchBillingFrequenciesDropdownAction(),
  ]);

  // 2. Pass data to client component with drawer closed
  return (
    <BillingPeriodMaster
      pagedData={pagedData}
      financialYearOptions={financialYearOptions}
      billingFrequencyOptions={billingFrequencyOptions}
      locale={locale}
      drawer={null}
      initialEditingData={null}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      initialSearchTerm={searchTerm}
      createAction={createBillingPeriodAction}
      updateAction={updateBillingPeriodAction}
      deleteAction={deleteBillingPeriodAction}
    />
  );
}
