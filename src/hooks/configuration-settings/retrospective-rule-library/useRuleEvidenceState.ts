'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RuleEvidenceStateItem } from '@/types/retrospective-rule.types';
import { getRuleEvidenceStateAction } from '@/app/[locale]/configuration-settings/retrospective-rule-library/action';

export interface UseRuleEvidenceStateReturn {
  evidenceItems: RuleEvidenceStateItem[];
  isLoading: boolean;
  error: string | null;
  refetchEvidenceState: () => Promise<void>;
}

export function useRuleEvidenceState(ruleId: string = '1'): UseRuleEvidenceStateReturn {
  const [evidenceItems, setEvidenceItems] = useState<RuleEvidenceStateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidenceState = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getRuleEvidenceStateAction(ruleId);
      if (res.success && res.data && res.data.length > 0) {
        setEvidenceItems(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch evidence conditions');
    } finally {
      setIsLoading(false);
    }
  }, [ruleId]);

  useEffect(() => {
    let isCancelled = false;
    queueMicrotask(() => {
      if (!isCancelled) {
        setIsLoading(true);
        setError(null);
      }
    });

    getRuleEvidenceStateAction(ruleId)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.data && res.data.length > 0) {
          setEvidenceItems(res.data);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch evidence conditions');
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
  }, [ruleId]);

  return {
    evidenceItems,
    isLoading,
    error,
    refetchEvidenceState: fetchEvidenceState,
  };
}
