import type {
  RetrospectiveRule,
  RetrospectiveRuleStats,
  RuleLibraryApiItem,
  RuleLibraryApiResponse,
  RetrospectiveRuleMasterDetail,
  RetrospectiveRuleDetailApiResponse,
} from '@/types/retrospective-rule.types';
import { fetchWithCertSupport } from '@/lib/api/ptis/tab/base-api';

export const INITIAL_RETROSPECTIVE_RULES: RetrospectiveRule[] = [];

export const INITIAL_RETROSPECTIVE_STATS: RetrospectiveRuleStats = {
  importedRulesCount: 0,
  readyActiveCount: 0,
  needReviewCount: 0,
  lookbackGuardrailYears: 6,
};

export async function fetchRetrospectiveRulesServer(): Promise<{
  data: RetrospectiveRule[];
  stats: RetrospectiveRuleStats;
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetchWithCertSupport<RuleLibraryApiResponse>('/RuleLibrary?pageSize=100&PageSize=100');
    if (res.success && res.data?.items?.rules?.items) {
      const mappedRules: RetrospectiveRule[] = res.data.items.rules.items.map((item: RuleLibraryApiItem) => {
        const isAuthorized =
          item.authorizationStatus === 'AUTHORIZED' ||
          (item.conditionTag && item.conditionTag.toLowerCase().includes('authorized'));
        return {
          id: String(item.id),
          ruleCode: item.ruleCode || `RULE-${item.id}`,
          ruleTitle: item.ruleName,
          conditionDescription: item.conditionDescription,
          evidenceCategory: isAuthorized ? 'Authorized: OC or CC available' : 'Unauthorized: OC & CC unavailable',
          startLogicTitle: item.startLogicSummary,
          startLogicBoundary: item.startLogicBoundary,
          commonTaxationBadge: res.data?.items?.commonTaxation?.rateModeLabel || 'Current-year for all years',
          commonTaxationDescription: res.data?.items?.commonTaxation?.percentageModeLabel || 'Current-year percentage for all years',
          unauthorizedPenalty: item.penaltySummary || (isAuthorized ? 'Not applicable — OC/CC available' : 'Apply penalty as per the Act'),
          status: item.ruleStatus || 'Active',
        };
      });

      const activeCount = mappedRules.filter((r) => r.status === 'Active').length;
      const reviewCount = mappedRules.filter((r) => r.status === 'Review' || r.status === 'Draft').length;

      return {
        data: mappedRules,
        stats: {
          importedRulesCount: res.data.items.rules.totalCount || mappedRules.length,
          readyActiveCount: activeCount,
          needReviewCount: reviewCount,
          lookbackGuardrailYears: 6,
        },
        success: true,
      };
    }

    return {
      data: [],
      stats: INITIAL_RETROSPECTIVE_STATS,
      success: false,
      error: res.error?.message || 'Failed to fetch retrospective rules from API',
    };
  } catch (error) {
    return {
      data: [],
      stats: INITIAL_RETROSPECTIVE_STATS,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch retrospective rules',
    };
  }
}

export async function saveRetrospectiveRuleServer(
  input: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetchWithCertSupport('/RetrospectiveRuleMaster/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (res.success) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to save retrospective rule',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save retrospective rule',
    };
  }
}

export async function fetchTaxPolicyServer(): Promise<{
  success: boolean;
  item?: {
    rateMode: string;
    percentageMode: string;
    [key: string]: unknown;
  };
  error?: string;
}> {
  try {
    const res = await fetchWithCertSupport<{
      items?: Array<{
        rateMode: string;
        percentageMode: string;
        [key: string]: unknown;
      }>;
    }>('/RetrospectiveTaxPolicy');
    if (res.success && res.data?.items && res.data.items.length > 0) {
      return { success: true, item: res.data.items[0] };
    }
    return { success: true, item: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tax policy',
    };
  }
}

export async function saveTaxPolicyServer(
  input: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetchWithCertSupport('/RetrospectiveTaxPolicy/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (res.success) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to save retrospective tax policy',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save retrospective tax policy',
    };
  }
}

export async function deleteRetrospectiveRuleServer(
  ruleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchWithCertSupport(`/RetrospectiveRuleMaster/${ruleId}`, {
      method: 'DELETE',
    });
    if (res.success) {
      return { success: true };
    }
    return {
      success: false,
      error: res.error?.message || 'Failed to delete rule',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete rule',
    };
  }
}

export async function fetchRuleDetailServer(ruleId: string | number): Promise<{
  success: boolean;
  data?: RetrospectiveRuleMasterDetail;
  error?: string;
}> {
  try {
    const res = await fetchWithCertSupport<RetrospectiveRuleDetailApiResponse>(
      `/RetrospectiveRuleMaster/${ruleId}/detail`
    );
    if (res.success && res.data) {
      const detailData =
        (res.data as unknown as { items?: RetrospectiveRuleMasterDetail }).items ||
        (res.data as unknown as RetrospectiveRuleMasterDetail);
      return { success: true, data: detailData };
    }
    return {
      success: false,
      error: res.error?.message || `Failed to fetch detail for rule ${ruleId}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to fetch detail for rule ${ruleId}`,
    };
  }
}

export * from './retrospective-rule-lookup.service';
