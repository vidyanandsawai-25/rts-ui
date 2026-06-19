import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Column } from '@/components/common/MasterTable';
import type { TaxDetailsData, TaxRow } from '@/types/ptisMain-taxdetails.types';
import { getTaxRowStyleByLabel } from './config';
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

  // Generate tax rows data dynamically based on the returned policies
  const taxRows = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];

    // Deduplicate policies by case-insensitive policyCode
    const seenPolicyCodes = new Set<string>();
    const uniquePolicies: typeof policies = [];

    policies.forEach((policy) => {
      if (policy && policy.policyCode) {
        const upperCode = policy.policyCode.toUpperCase();
        if (!seenPolicyCodes.has(upperCode)) {
          seenPolicyCodes.add(upperCode);
          uniquePolicies.push(policy);
        }
      }
    });

    return uniquePolicies.map((policy, index) => {
      // Use Object.create(null) to prevent prototype pollution from API-provided taxName keys
      const row: TaxRow = Object.assign(Object.create(null), {
        id: 100 + index,
        taxes: policy.policyCode,
        labelKey: policy.policyCode,
        totalTax: String(policy.taxTotal || 0),
      });

      policy.taxAmounts.forEach((item) => {
        // Safe to assign taxName as key since row has null prototype
        row[item.taxName] = String(item.taxAmount || 0);
      });

      return row;
    });
  }, [initialTaxDetails]);

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

