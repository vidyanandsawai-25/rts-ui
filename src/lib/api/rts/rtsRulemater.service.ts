import 'server-only';

import { apiClient } from '@/services/api.service';
import type {
  CreateRtsRuleMasterPayload,
  RtsRuleMasterMutationApiResponse,
  RtsRuleMasterMutationResult,
  RtsRuleMasterPage,
  RtsRuleMasterQueryParams,
  RtsRuleMasterRule,
  RtsFeeEvaluationApiResponse,
  RtsFeeEvaluationFieldValue,
  RtsFeeEvaluationResult,
  UpdateRtsRuleMasterPayload,
  UpdateRtsRulePrioritiesPayload,
  RtsRuleServiceCardPage,
  RtsRuleServiceCardQuery,
} from '@/types/rts/rts-rulemaster.types';

const RTS_RULE_ENGINE_ENDPOINT = '/RTSRuleEngine';

/** Returns services with persisted rules for the requested fee or assignment tab. */
export async function getRtsRuleServiceCards(
  params: RtsRuleServiceCardQuery
): Promise<RtsRuleServiceCardPage> {
  const query = new URLSearchParams({ RuleGroup: params.RuleGroup });
  if (params.DepartmentId !== undefined) query.set('DepartmentId', String(params.DepartmentId));
  if (params.ServiceId !== undefined) query.set('ServiceId', String(params.ServiceId));
  if (params.IsActive !== undefined) query.set('IsActive', String(params.IsActive));
  if (params.SearchTerm?.trim()) query.set('SearchTerm', params.SearchTerm.trim());
  if (params.SortBy) query.set('SortBy', params.SortBy);
  if (params.SortOrder) query.set('SortOrder', params.SortOrder);
  if (params.PageNumber !== undefined) query.set('PageNumber', String(params.PageNumber));
  if (params.PageSize !== undefined) query.set('PageSize', String(params.PageSize));
  const response = await apiClient.get<RtsRuleServiceCardPage>(
    `${RTS_RULE_ENGINE_ENDPOINT}/ServiceCard?${query}`,
    { cache: 'no-store' }
  );
  if (!response.success || !response.data)
    throw new Error(response.error || 'Failed to fetch rule service cards.');
  return response.data;
}

/** Evaluates the active FEE rule set for normalized dynamic-form values. */
export async function evaluateRtsFee(
  serviceId: number,
  fieldValues: RtsFeeEvaluationFieldValue[]
): Promise<RtsFeeEvaluationResult> {
  const response = await apiClient.post<RtsFeeEvaluationApiResponse>(
    `${RTS_RULE_ENGINE_ENDPOINT}/evaluate-fee`,
    { serviceId, fieldValues }
  );
  if (!response.success || !response.data?.success || !response.data.items)
    throw new Error(response.error || response.data?.message || 'Failed to evaluate RTS fee.');
  return response.data.items;
}

function buildUrl(params: RtsRuleMasterQueryParams = {}): string {
  const query = new URLSearchParams();

  if (params.ServiceId !== undefined) query.set('ServiceId', String(params.ServiceId));
  if (params.RuleGroup !== undefined) query.set('RuleGroup', params.RuleGroup);
  if (params.PageNumber !== undefined) query.set('PageNumber', String(params.PageNumber));
  if (params.PageSize !== undefined) query.set('PageSize', String(params.PageSize));
  if (params.SearchTerm?.trim()) query.set('SearchTerm', params.SearchTerm.trim());

  const search = query.toString();
  return `${RTS_RULE_ENGINE_ENDPOINT}${search ? `?${search}` : ''}`;
}

function getMutationResult(data: unknown, fallbackError: string): RtsRuleMasterMutationResult {
  const response = data as RtsRuleMasterMutationApiResponse | undefined;

  if (!response || response.success === false || !response.items) {
    throw new Error(response?.message || fallbackError);
  }

  return response.items;
}

/** Retrieves paginated rules, optionally restricted to one RTS service. */
export async function getRtsRuleMasterRules(
  params: RtsRuleMasterQueryParams = {}
): Promise<RtsRuleMasterPage> {
  const response = await apiClient.get<RtsRuleMasterPage>(buildUrl(params), {
    cache: 'no-store',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch RTS rules.');
  }

  return response.data;
}

/** Retrieves one rule by its unique identifier. */
export async function getRtsRuleMasterRuleById(id: number): Promise<RtsRuleMasterRule> {
  const response = await apiClient.get<RtsRuleMasterRule>(
    `${RTS_RULE_ENGINE_ENDPOINT}/${encodeURIComponent(String(id))}`,
    { cache: 'no-store' }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch RTS rule ${id}.`);
  }

  return response.data;
}

/** Creates one or more rules for a service in one request. */
export async function createRtsRuleMasterRules(
  payload: CreateRtsRuleMasterPayload
): Promise<RtsRuleMasterMutationResult> {
  const response = await apiClient.post<unknown>(RTS_RULE_ENGINE_ENDPOINT, payload);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create RTS rules.');
  }

  return getMutationResult(response.data, 'Failed to create RTS rules.');
}

/** PUT route ID is the service ID; individual rule IDs live inside rules[]. */
export async function updateRtsRuleMasterRules(
  serviceId: number,
  payload: UpdateRtsRuleMasterPayload
): Promise<RtsRuleMasterMutationResult> {
  const response = await apiClient.put<unknown>(
    `${RTS_RULE_ENGINE_ENDPOINT}/${encodeURIComponent(String(serviceId))}`,
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to update RTS rules for service ${serviceId}.`);
  }

  return getMutationResult(response.data, `Failed to update RTS rules for service ${serviceId}.`);
}

/** Atomically replaces the consecutive priority order for one service rule group. */
export async function updateRtsRuleMasterPriorities(
  payload: UpdateRtsRulePrioritiesPayload
): Promise<void> {
  const response = await apiClient.put<RtsRuleMasterMutationApiResponse>(
    `${RTS_RULE_ENGINE_ENDPOINT}/priorities`,
    payload
  );

  if (!response.success || response.data?.success === false) {
    throw new Error(response.error || response.data?.message || 'Failed to update rule priorities.');
  }
}

/** Changes whether a rule participates in fee or officer-allocation evaluation. */
export async function setRtsRuleMasterActive(
  id: number,
  payload: { isActive: boolean; updatedBy: number }
): Promise<void> {
  const response = await apiClient.put<RtsRuleMasterMutationApiResponse>(
    `${RTS_RULE_ENGINE_ENDPOINT}/${encodeURIComponent(String(id))}/active`,
    payload
  );

  if (!response.success || response.data?.success === false) {
    throw new Error(response.error || response.data?.message || 'Failed to update RTS rule status.');
  }
}

/** Permanently removes one rule and its complete nested condition tree. */
export async function permanentlyDeleteRtsRuleMasterRule(id: number): Promise<void> {
  const response = await apiClient.delete<RtsRuleMasterMutationApiResponse>(
    `${RTS_RULE_ENGINE_ENDPOINT}/${encodeURIComponent(String(id))}/permanent`
  );

  if (!response.success || response.data?.success === false) {
    throw new Error(response.error || response.data?.message || `Failed to permanently delete RTS rule ${id}.`);
  }
}

/** Deletes one persisted RTS rule by ID. */
export async function deleteRtsRuleMasterRule(id: number): Promise<void> {
  const response = await apiClient.delete<RtsRuleMasterMutationApiResponse>(
    `${RTS_RULE_ENGINE_ENDPOINT}/${encodeURIComponent(String(id))}`
  );

  if (!response.success || response.data?.success === false) {
    throw new Error(response.error || response.data?.message || `Failed to delete RTS rule ${id}.`);
  }
}
