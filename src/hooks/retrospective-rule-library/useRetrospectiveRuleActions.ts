'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RuleActionModeItem } from '@/types/retrospective-rule.types';
import {
  getTaxStartModesAction,
  getUseDateOptionsAction,
  getRetrospectiveLimitTypesAction,
  getTaxCalculationModesAction,
} from '@/app/[locale]/property-tax/retrospective-rule-library/action';

export interface UseRetrospectiveRuleActionsReturn {
  taxStartModes: RuleActionModeItem[];
  useDateOptions: RuleActionModeItem[];
  limitTypes: RuleActionModeItem[];
  taxCalculationModes: RuleActionModeItem[];
  isLoading: boolean;
  error: string | null;
  refetchActions: () => Promise<void>;
}

export function useRetrospectiveRuleActions(): UseRetrospectiveRuleActionsReturn {
  const [taxStartModes, setTaxStartModes] = useState<RuleActionModeItem[]>([]);
  const [useDateOptions, setUseDateOptions] = useState<RuleActionModeItem[]>([]);
  const [limitTypes, setLimitTypes] = useState<RuleActionModeItem[]>([]);
  const [taxCalculationModes, setTaxCalculationModes] = useState<RuleActionModeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [startRes, useDateRes, limitRes, calcRes] = await Promise.all([
        getTaxStartModesAction(),
        getUseDateOptionsAction(),
        getRetrospectiveLimitTypesAction(),
        getTaxCalculationModesAction(),
      ]);

      if (startRes.success && startRes.data && startRes.data.length > 0) {
        setTaxStartModes(startRes.data);
      }
      if (useDateRes.success && useDateRes.data && useDateRes.data.length > 0) {
        setUseDateOptions(useDateRes.data);
      }
      if (limitRes.success && limitRes.data && limitRes.data.length > 0) {
        setLimitTypes(limitRes.data);
      }
      if (calcRes.success && calcRes.data && calcRes.data.length > 0) {
        setTaxCalculationModes(calcRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rule actions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    queueMicrotask(() => {
      if (!isCancelled) {
        setIsLoading(true);
        setError(null);
      }
    });

    Promise.all([
      getTaxStartModesAction(),
      getUseDateOptionsAction(),
      getRetrospectiveLimitTypesAction(),
      getTaxCalculationModesAction(),
    ])
      .then(([startRes, useDateRes, limitRes, calcRes]) => {
        if (isCancelled) return;
        if (startRes.success && startRes.data && startRes.data.length > 0) {
          setTaxStartModes(startRes.data);
        }
        if (useDateRes.success && useDateRes.data && useDateRes.data.length > 0) {
          setUseDateOptions(useDateRes.data);
        }
        if (limitRes.success && limitRes.data && limitRes.data.length > 0) {
          setLimitTypes(limitRes.data);
        }
        if (calcRes.success && calcRes.data && calcRes.data.length > 0) {
          setTaxCalculationModes(calcRes.data);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch rule actions');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    taxStartModes,
    useDateOptions,
    limitTypes,
    taxCalculationModes,
    isLoading,
    error,
    refetchActions: fetchActions,
  };
}
