import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Column } from '@/components/common/MasterTable';
import type { TaxDetailsData, TaxRow } from '@/types/ptisMain-taxdetails.types';
import { TAX_ROWS_DEFINITIONS, getTaxRowStyleByLabel } from './config';
import { getTaxDetailsColumns } from './TaxDetailsColumns';

/**
 * Custom hook to handle business logic for TaxDetails table.
 * Handles optional tax details data and generates empty structure when not provided.
 */
export const useTaxDetailsTable = (initialTaxDetails?: TaxDetailsData) => {
  const t = useTranslations('ptisMainTaxDetails');

  // Utility to get tax label style based on label key
  const getTaxLabelStyle = useCallback((labelKey: string): string => {
    return getTaxRowStyleByLabel(labelKey);
  }, []);

  // Generate tax rows data
  const taxRows = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];

    return TAX_ROWS_DEFINITIONS.map((rowDef) => {
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
  }, [initialTaxDetails, t]);

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
