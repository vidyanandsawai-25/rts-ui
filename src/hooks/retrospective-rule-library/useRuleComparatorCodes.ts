'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RuleComparatorCodeItem } from '@/types/retrospective-rule.types';
import { getComparatorCodesAction } from '@/app/[locale]/property-tax/retrospective-rule-library/action';

export interface UseRuleComparatorCodesReturn {
  comparatorCodes: RuleComparatorCodeItem[];
  isLoading: boolean;
  error: string | null;
  refetchComparatorCodes: () => Promise<void>;
}

export function useRuleComparatorCodes(): UseRuleComparatorCodesReturn {
  const [comparatorCodes, setComparatorCodes] = useState<RuleComparatorCodeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getComparatorCodesAction();
      if (res.success && res.data && res.data.length > 0) {
        setComparatorCodes(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparator codes');
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

    getComparatorCodesAction()
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data && res.data.length > 0) {
          setComparatorCodes(res.data);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch comparator codes');
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
    comparatorCodes,
    isLoading,
    error,
    refetchComparatorCodes: fetchCodes,
  };
}
