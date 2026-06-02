'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ApartmentTaxDetailsItems, DualMethodTaxDetails } from '@/types/apartmentQC.types';
import { MasterTable } from '@/components/common/MasterTable';
import { cn } from '@/lib/utils/cn';
import {
  useTaxColumns,
  useTaxTableData,
  useHasData,
  useFooterContent,
  getTabTranslationKey,
  getSubTabLabel,
  getHeaderGradientClass,
  getRowClassName,
  type TaxRowData,
} from '@/hooks/apartmentQc/useApartmentTaxDetailsTable';
import { useTaxTableColumns } from '@/hooks/apartmentQc/useTaxTableColumns';

/* ============================================================
   TYPE DEFINITIONS
 ============================================================ */

interface ApartmentTaxDetailsTableProps {
  taxDetails: ApartmentTaxDetailsItems | null;
  dualMethodDetails?: DualMethodTaxDetails | null;
  loading?: boolean;
  activeMainTab: string;
  activeSubTab: string;
}

/* ============================================================
   FOOTER COMPONENT
 ============================================================ */

interface FooterContentProps {
  footerData: { rvCount?: number; cvCount?: number; singleCount?: number } | null;
  t: (key: string) => string;
}

function FooterContent({ footerData, t }: FooterContentProps) {
  if (!footerData) return null;

  if (footerData.singleCount !== undefined) {
    return (
      <p className="text-xs text-gray-500">
        {t('taxDetails.propertyCount')}: <span className="font-medium text-gray-700">{footerData.singleCount}</span>
      </p>
    );
  }

  return (
    <div className="flex gap-4 text-xs text-gray-500">
      {footerData.rvCount !== undefined && (
        <p>
          {t('taxDetails.rvPropertyCount')}: <span className="font-medium text-blue-700">{footerData.rvCount}</span>
        </p>
      )}
      {footerData.cvCount !== undefined && (
        <p>
          {t('taxDetails.cvPropertyCount')}: <span className="font-medium text-green-700">{footerData.cvCount}</span>
        </p>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
 ============================================================ */

/**
 * Table component that displays tax details for apartment properties.
 * Uses MasterTable for consistent styling.
 * Supports Rateable Value, Capital Value, and Dual Method views.
 */
export function ApartmentTaxDetailsTable({ 
  taxDetails, 
  dualMethodDetails,
  loading = false,
  activeMainTab,
  activeSubTab,
}: ApartmentTaxDetailsTableProps) {
  const t = useTranslations('appartmentQC');
  const tPtis = useTranslations('ptis');

  // Use custom hooks for data processing
  const taxColumns = useTaxColumns(taxDetails, dualMethodDetails, activeSubTab);
  const hasData = useHasData(taxDetails, dualMethodDetails, taxColumns, activeSubTab);
  const tableData = useTaxTableData(
    taxDetails, 
    dualMethodDetails, 
    taxColumns, 
    activeSubTab, 
    activeMainTab, 
    t, 
    tPtis
  );
  const footerData = useFooterContent(taxDetails, dualMethodDetails, activeSubTab);

  // Build table columns
  const columns = useTaxTableColumns({
    taxColumns,
    activeSubTab,
    t,
    hasData,
  });

  // Build header title
  const headerTitle = useMemo(() => {
    const tabLabel = tPtis(getTabTranslationKey(activeMainTab));
    const subLabel = getSubTabLabel(activeSubTab, tPtis);
    return `${t('taxDetails.title')} - ${tabLabel} (${subLabel})`;
  }, [t, tPtis, activeMainTab, activeSubTab]);

  // Build subtitle
  const headerSubtitle = useMemo(() => {
    if (!hasData) return undefined;
    if (activeSubTab === 'dual-method') {
      return `${t('taxDetails.subtitle')} - ${tPtis('apartmentTabs.rateable')} / ${tPtis('apartmentTabs.capital')}`;
    }
    return t('taxDetails.subtitle');
  }, [hasData, activeSubTab, t, tPtis]);

  return (
    <div className={cn('w-full', getHeaderGradientClass(activeSubTab), 'rounded-t-xl')}>
      <MasterTable<TaxRowData>
        columns={columns}
        data={tableData}
        loading={loading}
        loadingText={tPtis('apartmentTabs.loading')}
        emptyText={t('taxDetails.noData')}
        headerTitle={headerTitle}
        headerSubtitle={headerSubtitle}
        footerLeftContent={<FooterContent footerData={footerData} t={t} />}
        getRowKey={(row) => row.id}
        rowClassName={getRowClassName}
        height="xs"
        theadClassName="bg-[#d9e3ec]"
        containerClassName="shadow-sm"
        paginationConfig={{ enabled: false }}
      />
    </div>
  );
}

export default ApartmentTaxDetailsTable;
