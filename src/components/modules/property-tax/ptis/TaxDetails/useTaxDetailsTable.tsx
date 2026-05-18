import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Column } from '@/components/common/MasterTable';
import { TaxDetailsData, TaxRow } from '@/types/ptisMain-taxdetails.types';
import { TAX_POLICY_CODES, TAX_ROW_LABELS } from './constants';
import { getTaxDetailsColumns } from './TaxDetailsColumns';

/**
 * Custom hook to handle business logic for TaxDetails table.
 * Handles optional tax details data and generates empty structure when not provided.
 */
export const useTaxDetailsTable = (initialTaxDetails?: TaxDetailsData) => {
  const t = useTranslations('ptisMainTaxDetails');

  // Define fixed row structure with policy codes (locale-independent)
  const taxRowsDefinition = useMemo(
    () => [
      {
        id: 1,
        policyCode: TAX_POLICY_CODES.NETTAX,
        labelKey: TAX_ROW_LABELS.NET_TAXES,
        styleClass: 'bg-slate-100 text-slate-700 border-slate-300',
      },
      {
        id: 2,
        policyCode: TAX_POLICY_CODES.RETAIN,
        labelKey: TAX_ROW_LABELS.RETAIN,
        styleClass: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        id: 3,
        policyCode: TAX_POLICY_CODES.HEARING,
        labelKey: TAX_ROW_LABELS.HEARING,
        styleClass: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      {
        id: 4,
        policyCode: TAX_POLICY_CODES.ALLTAXES,
        labelKey: TAX_ROW_LABELS.ALL_TAXES,
        styleClass: 'bg-rose-50 text-rose-700 border-rose-200',
      },
    ],
    []
  );

  // Utility to get tax label style based on label key
  const getTaxLabelStyle = useCallback(
    (labelKey: string): string => {
      const rowDef = taxRowsDefinition.find((def) => def.labelKey === labelKey);
      return rowDef?.styleClass || 'bg-gray-50 border-gray-300 text-gray-700';
    },
    [taxRowsDefinition]
  );

  // Generate tax rows data
  const taxRows = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];

    return taxRowsDefinition.map((rowDef) => {
      const translatedLabel = t(rowDef.labelKey);
      // Use Object.create(null) to prevent prototype pollution from API-provided taxName keys
      const row: TaxRow = Object.assign(Object.create(null), {
        id: rowDef.id,
        taxes: translatedLabel,
        labelKey: rowDef.labelKey,
        totalTax: '0.00',
      });

      // Find policy by policyCode directly (locale-independent)
      const policy = policies.find((p) => p.policyCode === rowDef.policyCode);

      let total = 0;
      if (policy) {
        policy.taxAmounts.forEach((item) => {
          // Safe to assign taxName as key since row has null prototype
          row[item.taxName] = String(item.taxAmount || 0);
          total += Number(item.taxAmount || 0);
        });
      }

      row.totalTax = total.toFixed(2);
      return row;
    });
  }, [initialTaxDetails, taxRowsDefinition, t]);

  // Generate table columns using the utility
  const taxColumns = useMemo<Column<TaxRow>[]>(() => {
    const policies = initialTaxDetails?.policies || [];
    const allTaxNames = Array.from(
      new Set(policies.flatMap((p) => p.taxAmounts.map((a) => a.taxName)))
    );

    return getTaxDetailsColumns(allTaxNames, t, getTaxLabelStyle);
  }, [initialTaxDetails, getTaxLabelStyle, t]);

  return {
    taxRows,
    taxColumns,
  };
};
