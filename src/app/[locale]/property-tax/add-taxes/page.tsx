import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { AddTaxesConsole } from '@/components/modules/property-tax/add-taxes';
import { getAddTaxesInitAction } from './actions';
import type { AddTaxesInit } from '@/types/add-taxes.types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('addTaxes');
  return { title: t('title') };
}

const FALLBACK_INIT: AddTaxesInit = {
  financeYears: [],
  permissions: { addTax: false, quarterlyAdd: false, removeTax: false, quarterlyRemove: false },
  summary: { totalProperties: 0, eligibleRecords: 0, skippedRecords: 0, runningJobs: 0 },
  scopeMaster: { zones: [], propertyTypes: [], wards: [] },
};

export default async function Page() {
  const result = await getAddTaxesInitAction();
  const init: AddTaxesInit = result.success ? result.data : FALLBACK_INIT;
  return <AddTaxesConsole init={init} />;
}
