import type { PagedResponse } from '@/types/common.types';

/** Query parameters accepted by GET /RTSRuleEngine. */
export interface RtsRuleMasterQueryParams {
  ServiceId?: number;
  RuleGroup?: 'FEE' | 'USER_ALLOCATION' | 'STAGE_ALLOCATION';
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
}

export interface RtsFeeEvaluationFieldValue {
  fieldDefinitionId: number;
  fieldCode?: string;
  value?: string | null;
}

export interface RtsFeeMatchedRule {
  ruleId: number;
  ruleActionType: 'BASE_FEE' | 'ADDON_FEE';
  calculationType?: 'FIXED' | 'PER_UNIT' | 'PER_SQUARE_METER' | 'PER_SQUARE_FOOT' | 'PERCENTAGE' | null;
  conditionFieldDefinitionId: number | null;
  conditionField: string | null;
  expectedValue: string | null;
  rateAmount?: number | null;
  quantityFieldDefinitionId?: number | null;
  quantityValue?: number | null;
  percentageBaseAmount?: number | null;
  matchedConditions?: RtsFeeMatchedCondition[];
  amount: number;
  priority: number;
}

export interface RtsFeeMatchedCondition {
  fieldDefinitionId: number;
  comparisonOperator: string;
  actualValue: string;
  expectedValue: string;
}

export interface RtsFeeEvaluationResult {
  serviceId: number;
  evaluationDate?: string;
  staticServiceFee: number;
  baseFee: number;
  addonFee: number;
  payableAmount: number;
  usedServiceFeeFallback: boolean;
  matchedRules: RtsFeeMatchedRule[];
}

/** Safe identity data returned for a configured USER_ALLOCATION rule. */
export interface RtsRuleUserDetails {
  id: number;
  userName: string;
  userFullName: string;
}

/** A persisted rule returned by the RTS Rule Engine API. */
export interface RtsRuleMasterRule {
  [key: string]: unknown;
  id: number;
  serviceId: number;
  ruleDescription: string;
  conditionMatchType: 'ALL' | 'ANY';
  conditions: RtsRuleCondition[];
  ruleActionType: string;
  calculationType: RtsFeeCalculationType | null;
  rateAmount: number | null;
  quantityFieldDefinitionId: number | null;
  userDetails: RtsRuleUserDetails | null;
  priority: number;
  ruleGroup: string | null;
  actionValue: string | null;
  isCumulative: boolean;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/** Shared rule fields used when creating a rule batch. */
export interface RtsRuleMasterRuleInput {
  ruleDescription: string;
  conditionMatchType: 'ALL' | 'ANY';
  conditions: RtsRuleCondition[];
  ruleActionType: string;
  calculationType: RtsFeeCalculationType | null;
  rateAmount: number | null;
  quantityFieldDefinitionId: number | null;
  userId: number | null;
  priority: number;
  ruleGroup: string | null;
  actionValue: string | null;
  isCumulative: boolean;
}

export interface RtsRuleCondition {
  id?: number;
  parentConditionId?: number | null;
  conditionType?: 'GROUP' | 'PREDICATE';
  conditionMatchType?: 'ALL' | 'ANY' | null;
  fieldDefinitionId?: number | null;
  comparisonOperator?: string | null;
  expectedValue?: string | null;
  conditionOrder: number;
  children?: RtsRuleCondition[];
}

export type RtsFeeRuleAction = 'BASE_FEE' | 'ADDON_FEE';
export type RtsFeeCalculationType = 'FIXED' | 'PER_UNIT' | 'PER_SQUARE_METER' | 'PER_SQUARE_FOOT' | 'PERCENTAGE';

export interface RtsFeeRule {
  id: number;
  serviceId: number;
  ruleDescription: string;
  ruleActionType: RtsFeeRuleAction;
  conditionMatchType: 'ALL' | 'ANY';
  calculationType: RtsFeeCalculationType;
  rateAmount: number;
  quantityFieldDefinitionId: number | null;
  priority: number;
  isActive: boolean;
  conditions: RtsRuleCondition[];
}

export type SaveRtsFeeRulePayload = Omit<RtsFeeRule, 'id'> & { updatedBy?: number };

/** Request body for POST /RTSRuleEngine. */
export interface CreateRtsRuleMasterPayload {
  isActive: boolean;
  createdBy: number;
  serviceId: number;
  rules: RtsRuleMasterRuleInput[];
}

/** One editable rule in the PUT /RTSRuleEngine/{id} request body. */
export interface UpdateRtsRuleMasterRuleInput extends RtsRuleMasterRuleInput {
  id: number;
  isActive: boolean;
}

/** Request body for PUT /RTSRuleEngine/{id}. */
export interface UpdateRtsRuleMasterPayload {
  isActive: boolean;
  updatedBy: number;
  serviceId: number;
  rules: UpdateRtsRuleMasterRuleInput[];
}

export interface UpdateRtsRulePrioritiesPayload {
  serviceId: number;
  ruleGroup: 'FEE' | 'USER_ALLOCATION';
  updatedBy: number;
  priorities: Array<{ ruleId: number; priority: number }>;
}

/** The `items` payload returned after a successful create or update. */
export interface RtsRuleMasterMutationResult {
  serviceId: number;
  ruleCount: number;
  rules: RtsRuleMasterRule[];
}

/** Backend response envelope used by RTS Rule Engine mutations. */
export interface RtsRuleMasterMutationApiResponse {
  success: boolean;
  message?: string | null;
  items?: RtsRuleMasterMutationResult;
  totalCount?: number | null;
  errors?: unknown;
  correlationId?: string | null;
}

export interface RtsFeeEvaluationApiResponse {
  success: boolean;
  message?: string | null;
  items?: RtsFeeEvaluationResult;
}

export type RtsRuleMasterPage = PagedResponse<RtsRuleMasterRule>;

export interface RtsRuleServiceCard {
  serviceId: number;
  serviceName: string;
  departmentId: number;
  departmentName: string;
  ruleGroup: string;
  ruleCount: number;
  activeRuleCount: number;
}

export interface RtsRuleServiceCardQuery {
  RuleGroup: 'FEE' | 'USER_ALLOCATION';
  DepartmentId?: number;
  ServiceId?: number;
  IsActive?: boolean;
  SearchTerm?: string;
  SortBy?: 'ServiceName' | 'DepartmentName' | 'RuleCount' | 'ActiveRuleCount';
  SortOrder?: 'asc' | 'desc';
  PageNumber?: number;
  PageSize?: number;
}

export type RtsRuleServiceCardPage = PagedResponse<RtsRuleServiceCard>;
