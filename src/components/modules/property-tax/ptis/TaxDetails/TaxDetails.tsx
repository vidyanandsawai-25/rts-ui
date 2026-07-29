'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FloorDetailsTable } from '@/components/common/FloorDetailsTable';
import type { TaxDetailsData, PendingTaxRow, TaxRow, PendingYearTaxDetail } from '@/types/ptisMain-taxdetails.types';
import {
  getTaxDetailsFloorColumns,
  getPendingTaxDetailsFloorColumns,
} from './TaxDetailsColumns';
import { getTaxRowStyleByLabel } from './config';

interface TaxDetailsProps {
  initialTaxDetails?: TaxDetailsData;
  locale?: string;
  activeTab?: 'current' | 'pending';
}

/**
 * TaxDetails Component
 * 
 * Standard, theme-compliant table of taxation breakdown using the common FloorDetailsTable component.
 * Displays either Current Taxes or Pending Taxes based on activeTab prop.
 */
const TaxDetails = ({ initialTaxDetails, activeTab = 'current' }: TaxDetailsProps) => {
  const t = useTranslations('ptisMainTaxDetails');

  const allTaxNames = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];
    const namesSet = new Set<string>();
    policies.forEach((policy) => {
      policy.taxAmounts?.forEach((item) => {
        if (item.taxName) namesSet.add(item.taxName);
      });
      policy.pendingYears?.forEach((pYear) => {
        pYear.taxAmounts?.forEach((item) => {
          if (item.taxName) namesSet.add(item.taxName);
        });
      });
    });
    return Array.from(namesSet);
  }, [initialTaxDetails]);

  const currentFloorColumns = useMemo(
    () =>
      getTaxDetailsFloorColumns(
        allTaxNames,
        t,
        getTaxRowStyleByLabel
      ),
    [allTaxNames, t]
  );

  const pendingFloorColumns = useMemo(
    () => getPendingTaxDetailsFloorColumns(allTaxNames, t, getTaxRowStyleByLabel),
    [allTaxNames, t]
  );

  const taxRows = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];
    return policies
      .filter((policy) => {
        if (policies.length <= 1) return true;
        const code = (policy.policyCode || policy.policyName || '').toUpperCase();
        if (
          (code.includes('CC') || code.includes('COMMENCEMENT')) &&
          (!policy.taxAmounts || policy.taxAmounts.length === 0) &&
          policy.taxTotal === 0
        ) {
          return false;
        }
        return true;
      })
      .map((policy, index) => {
        const code = policy.policyCode || policy.policyName || 'NETTAX';
        const row: Record<string, unknown> = {
          id: 100 + index,
          taxes: code,
          labelKey: code,
          totalTax: policy.taxTotal,
          pendingYears: policy.pendingYears,
        };

        policy.taxAmounts?.forEach((item) => {
          if (item.taxName) {
            row[item.taxName] = item.taxAmount;
          }
        });

        return row as unknown as TaxRow;
      });
  }, [initialTaxDetails]);

  const pendingTaxRows = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];
    const rows: PendingTaxRow[] = [];
    const seenRowKeys = new Set<string>();

    const netTaxPolicy = policies.find(
      (p) => (p.policyCode || p.policyName || '').toUpperCase() === 'NETTAX'
    );
    if (netTaxPolicy) {
      rows.push({
        id: 'NETTAX-ANCHOR',
        policyCode: 'NETTAX',
        yearCode: '',
        taxTotal: netTaxPolicy.taxTotal,
        taxAmounts: netTaxPolicy.taxAmounts,
        isNetTax: true,
      });
      seenRowKeys.add('NETTAX-ANCHOR');
    }

    const allPendingItems: {
      pYear: PendingYearTaxDetail;
      policyCode: string;
      pIdx: number;
      yIdx: number;
      startYear: number;
    }[] = [];

    policies.forEach((policy, pIdx) => {
      if (policy.pendingYears && policy.pendingYears.length > 0) {
        policy.pendingYears.forEach((pYear, yIdx) => {
          const itemPolicyCode =
            (pYear as unknown as { policyCode?: string; PolicyCode?: string }).policyCode ||
            (pYear as unknown as { policyCode?: string; PolicyCode?: string }).PolicyCode ||
            policy.policyCode ||
            policy.policyName ||
            'CC';

          const yearMatch = (pYear.yearCode || '').match(/\d{4}/);
          const startYear = yearMatch ? parseInt(yearMatch[0], 10) : 0;

          allPendingItems.push({
            pYear,
            policyCode: itemPolicyCode,
            pIdx,
            yIdx,
            startYear,
          });
        });
      }
    });

    // Sort pending items chronologically by financial start year ASCENDING (less year first)
    allPendingItems.sort((a, b) => a.startYear - b.startYear);

    allPendingItems.forEach(({ pYear, policyCode, pIdx, yIdx }) => {
      const baseKey = `${policyCode}-${pYear.yearCode}`;
      if (!seenRowKeys.has(baseKey)) {
        seenRowKeys.add(baseKey);
        rows.push({
          id: baseKey,
          policyCode,
          yearCode: pYear.yearCode,
          taxTotal: pYear.taxTotal,
          taxAmounts: pYear.taxAmounts,
        });
      } else {
        const fallbackKey = `${baseKey}-${pIdx}-${yIdx}`;
        seenRowKeys.add(fallbackKey);
        rows.push({
          id: fallbackKey,
          policyCode,
          yearCode: pYear.yearCode,
          taxTotal: pYear.taxTotal,
          taxAmounts: pYear.taxAmounts,
        });
      }
    });

    return rows;
  }, [initialTaxDetails]);

  return (
    <div
      className="w-full overflow-x-auto tax-details-container"
      data-testid="master-table"
    >
      {activeTab === 'current' ? (
        <FloorDetailsTable<TaxRow>
          data={taxRows}
          columns={currentFloorColumns}
          emptyMessage={t('noTaxDetailsAvailable')}
          showExpandColumn={false}
          showScrollButtons={false}
          containerClassName="max-h-[300px] overflow-y-auto relative"
          tableClassName="w-full border-collapse"
          theadClassName="bg-[#1e3a8a] text-white border-b border-blue-700/60 shadow-xs sticky top-0 z-20"
        />
      ) : (
        <FloorDetailsTable<PendingTaxRow>
          data={pendingTaxRows}
          columns={pendingFloorColumns}
          emptyMessage={t('noArrearsTaxDetailsAvailable')}
          showExpandColumn={false}
          showScrollButtons={false}
          containerClassName="max-h-[300px] overflow-y-auto relative"
          tableClassName="w-full border-collapse"
          theadClassName="bg-[#1e3a8a] text-white border-b border-blue-700/60 shadow-xs sticky top-0 z-20"
        />
      )}
    </div>
  );
};

TaxDetails.displayName = 'TaxDetails';

export default TaxDetails;