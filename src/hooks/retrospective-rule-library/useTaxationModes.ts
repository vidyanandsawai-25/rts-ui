'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PolicyModeItem } from '@/types/retrospective-rule.types';
import {
  getRateModesAction,
  getPercentageModesAction,
  getTaxPolicyAction,
} from '@/app/[locale]/property-tax/retrospective-rule-library/action';

export interface TaxPolicyItem {
  id?: number;
  rateMode: string;
  percentageMode: string;
  [key: string]: unknown;
}

export interface UseTaxationModesReturn {
  rateModes: PolicyModeItem[];
  percentageModes: PolicyModeItem[];
  activePolicy: TaxPolicyItem | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  refetchModes: () => Promise<void>;
}

export function useTaxationModes(): UseTaxationModesReturn {
  const [rateModes, setRateModes] = useState<PolicyModeItem[]>([]);
  const [percentageModes, setPercentageModes] = useState<PolicyModeItem[]>([]);
  const [activePolicy, setActivePolicy] = useState<TaxPolicyItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rateRes, percentageRes, policyRes] = await Promise.all([
        getRateModesAction(),
        getPercentageModesAction(),
        getTaxPolicyAction(),
      ]);

      if (rateRes.success && rateRes.data && rateRes.data.length > 0) {
        setRateModes(rateRes.data);
      }
      if (percentageRes.success && percentageRes.data && percentageRes.data.length > 0) {
        setPercentageModes(percentageRes.data);
      }
      if (policyRes.success && policyRes.data) {
        setActivePolicy(policyRes.data as TaxPolicyItem);
      } else {
        setActivePolicy(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch taxation modes');
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
      getRateModesAction(),
      getPercentageModesAction(),
      getTaxPolicyAction(),
    ])
      .then(([rateRes, percentageRes, policyRes]) => {
        if (isCancelled) return;
        if (rateRes.success && rateRes.data && rateRes.data.length > 0) {
          setRateModes(rateRes.data);
        }
        if (percentageRes.success && percentageRes.data && percentageRes.data.length > 0) {
          setPercentageModes(percentageRes.data);
        }
        if (policyRes.success && policyRes.data) {
          setActivePolicy(policyRes.data as TaxPolicyItem);
        } else {
          setActivePolicy(null);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch taxation modes');
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
    rateModes,
    percentageModes,
    activePolicy,
    isConfigured: activePolicy !== null,
    isLoading,
    error,
    refetchModes: fetchModes,
  };
}
