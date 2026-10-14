'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAllRtsServices, getRtsServiceById } from '@/lib/api/rts/rtsservices.service';
import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getAllRtsFieldDefinitions } from '@/lib/api/rts/rtsfielddefinition.service';
import {
  getApprovalFlowByServiceId,
  getApprovalFlowStages,
  getStageUserAllocations,
} from '@/lib/api/rts/rts-workflow.service';
import { getRtsUsers, RTS_WORKFLOW_USERS_DEPARTMENT_ID } from '@/lib/api/rts/rtsusers.service';
import {
  createRtsRuleMasterRules,
  getRtsRuleMasterRuleById,
  getRtsRuleMasterRules,
  getRtsRuleServiceCards,
  permanentlyDeleteRtsRuleMasterRule,
  setRtsRuleMasterActive,
  updateRtsRuleMasterRules,
  updateRtsRuleMasterPriorities,
} from '@/lib/api/rts/rtsRulemater.service';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import {
  fieldOptions,
  operatorsForField,
  parseStageAllocationActionValue,
  RULE_ACTIONS,
  ruleTab,
  serializeStageAllocationActionValue,
} from '@/lib/utils/rts/rts-rule-master';
import type {
  RtsFeeRule,
  RtsRuleCondition,
  RtsRuleMasterRule,
  RtsRuleMasterRuleInput,
  SaveRtsFeeRulePayload,
} from '@/types/rts/rts-rulemaster.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';
import type { RtsFieldDefinitionApiItem } from '@/types/rts/field-definition.types';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsRuleServiceCardPage } from '@/types/rts/rts-rulemaster.types';
import type {
  RtsApprovalFlowStageMasterApiItem,
  RtsStageUserAllocationApiItem,
} from '@/types/rts/workflow.types';
import type { RuleQuery } from './query';

export interface RuleDraft extends RtsRuleMasterRuleInput {
  isActive: boolean;
}

export interface RuleMasterPageData {
  query: RuleQuery;
  services: RtsServiceApiItem[];
  departments: RtsDepartmentApiItem[];
  cards: RtsRuleServiceCardPage | null;
  ruleActions: string[];
  service: RtsServiceApiItem | null;
  rules: RtsRuleMasterRule[];
  feeRules: RtsFeeRule[];
  fields: RtsFieldDefinitionApiItem[];
}

export interface RuleEligibleUser {
  id: number;
  name: string;
  userName: string;
}

export interface RuleStageOfficer extends RuleEligibleUser {
  priority: number;
}

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function run<T>(operation: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    return {
      success: false,
      error: getCleanErrorMessage(error, 'Unable to complete rule request.'),
    };
  }
}

async function auditUserId() {
  const id = getUserIdFromCookies(await cookies());
  if (!id) throw new Error('Sign in again to save rules.');
  return id;
}

function revalidateRules() {
  revalidatePath('/[locale]/rts/configuration-settings/rts-rule', 'page');
}

function toStageOfficer(allocation: RtsStageUserAllocationApiItem): RuleStageOfficer | null {
  const userId = allocation.userId;
  if (
    !allocation.isActive ||
    typeof userId !== 'number' ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  )
    return null;

  return {
    id: userId,
    name:
      [allocation.firstName, allocation.middleName, allocation.lastName]
        .filter(Boolean)
        .join(' ') ||
      allocation.userName ||
      `User #${userId}`,
    userName: allocation.userName || `user-${userId}`,
    priority: allocation.priority ?? 0,
  };
}

async function serviceForRule(serviceId: number) {
  const service = await getRtsServiceById(serviceId);
  if (!service.isActive) throw new Error('The selected service is inactive.');
  return service;
}

function toFeeRule(rule: RtsRuleMasterRule): RtsFeeRule {
  if (
    rule.ruleGroup !== 'FEE' ||
    (rule.ruleActionType !== 'BASE_FEE' && rule.ruleActionType !== 'ADDON_FEE') ||
    !rule.calculationType ||
    rule.rateAmount === null
  ) {
    throw new Error(`Fee rule ${rule.id} has an invalid shared rule-engine response.`);
  }
  return {
    id: rule.id,
    serviceId: rule.serviceId,
    ruleDescription: rule.ruleDescription,
    ruleActionType: rule.ruleActionType,
    conditionMatchType: rule.conditionMatchType,
    calculationType: rule.calculationType,
    rateAmount: rule.rateAmount,
    quantityFieldDefinitionId: rule.quantityFieldDefinitionId,
    priority: rule.priority,
    isActive: rule.isActive,
    conditions: rule.conditions,
  };
}

async function activeWorkflowStagesForService(serviceId: number) {
  const workflow = await getApprovalFlowByServiceId(serviceId);
  if (!workflow) return [];
  return getApprovalFlowStages(workflow.id);
}

export async function getAssignmentWorkflowStagesAction(
  serviceId: number
): Promise<ActionResult<RtsApprovalFlowStageMasterApiItem[]>> {
  return run(async () => {
    await serviceForRule(serviceId);
    const stages = await activeWorkflowStagesForService(serviceId);
    if (!stages.length)
      throw new Error('No active approval workflow stages are configured for this service.');
    return stages;
  });
}

export async function getStageRuleOfficersAction(
  serviceId: number,
  approvalFlowStageId: number
): Promise<ActionResult<RuleStageOfficer[]>> {
  return run(async () => {
    await serviceForRule(serviceId);
    const stages = await activeWorkflowStagesForService(serviceId);
    if (!stages.some((stage) => stage.id === approvalFlowStageId)) {
      throw new Error('Select an approval stage belonging to this service.');
    }

    const allocations = await getStageUserAllocations(approvalFlowStageId);
    return allocations
      .map(toStageOfficer)
      .filter((officer): officer is RuleStageOfficer => officer !== null)
      .sort((left, right) => left.priority - right.priority || left.name.localeCompare(right.name));
  });
}

export async function getRuleMasterPageAction(
  query: RuleQuery
): Promise<ActionResult<RuleMasterPageData>> {
  return run(async () => {
    const [allServices, allDepartments] = await Promise.all([
      getAllRtsServices(),
      getAllRtsDepartments(),
    ]);
    const services = allServices.filter((item) => item.isActive);
    const departments = allDepartments.filter((item) => item.isActive);
    const service = query.serviceId
      ? services.find((item) => item.id === query.serviceId)
      : undefined;
    if (query.serviceId && !service) throw new Error('Selected service is unavailable.');
    if (!service) {
      const group = query.tab === 'assignment' ? 'USER_ALLOCATION' : 'FEE';
      const cards = await getRtsRuleServiceCards({
        RuleGroup: group,
        DepartmentId: query.departmentId,
        SearchTerm: query.cardSearch,
        PageNumber: query.page,
        PageSize: 12,
      });
      return {
        query,
        services,
        departments,
        cards,
        ruleActions: [],
        service: null,
        rules: [],
        feeRules: [],
        fields: [],
      };
    }

    const group = query.tab === 'assignment' ? 'USER_ALLOCATION' : 'FEE';
    const [rulePage, definitions] = await Promise.all([
      getRtsRuleMasterRules({
        ServiceId: service.id,
        RuleGroup: group,
        PageNumber: 1,
        PageSize: -1,
      }),
      getAllRtsFieldDefinitions({ ServiceId: service.id, DepartmentId: service.departmentId }),
    ]);
    if (rulePage.items.length < rulePage.totalCount) throw new Error('Rule lookup was truncated.');
    const feeRules = query.tab === 'fee' ? rulePage.items.map(toFeeRule) : [];
    return {
      query,
      services,
      departments,
      cards: null,
      ruleActions: RULE_ACTIONS.filter((action) => ruleTab(action) === query.tab),
      service,
      rules: query.tab === 'assignment' ? rulePage.items : [],
      feeRules,
      fields: definitions.filter(
        (field) =>
          field.isActive &&
          field.serviceId === service.id &&
          field.departmentId === service.departmentId
      ),
    };
  });
}

export async function saveFeeRuleAction(
  serviceId: number,
  id: number | undefined,
  draft: SaveRtsFeeRulePayload
): Promise<ActionResult> {
  return run(async () => {
    const audit = await auditUserId();
    if (draft.serviceId !== serviceId) throw new Error('This rule belongs to another service.');
    if (!draft.conditions.length) throw new Error('Add at least one condition.');
    const service = await serviceForRule(serviceId);
    const fields = await getAllRtsFieldDefinitions({
      ServiceId: serviceId,
      DepartmentId: service.departmentId,
    });
    const conditions = normalizeConditions(
      draft.conditions,
      fields,
      serviceId,
      service.departmentId
    );
    const rule: RtsRuleMasterRuleInput = {
      ruleDescription: draft.ruleDescription,
      conditionMatchType: draft.conditionMatchType,
      conditions,
      ruleActionType: draft.ruleActionType,
      calculationType: draft.calculationType,
      rateAmount: draft.rateAmount,
      quantityFieldDefinitionId: draft.quantityFieldDefinitionId,
      userId: null,
      priority: draft.priority,
      ruleGroup: 'FEE',
      actionValue: null,
      isCumulative: false,
    };
    if (id) {
      const existing = await getRtsRuleMasterRuleById(id);
      if (existing.serviceId !== serviceId || existing.ruleGroup !== 'FEE')
        throw new Error('This fee rule belongs to another service.');
      const result = await updateRtsRuleMasterRules(serviceId, {
        isActive: draft.isActive,
        updatedBy: audit,
        serviceId,
        rules: [{ ...rule, id, isActive: draft.isActive }],
      });
      if (result.ruleCount !== 1 || !result.rules.some((item) => item.id === id))
        throw new Error('The fee rule was not updated.');
    } else {
      const result = await createRtsRuleMasterRules({
        isActive: true,
        createdBy: audit,
        serviceId,
        rules: [rule],
      });
      if (result.ruleCount !== 1) throw new Error('The fee rule was not created.');
    }
    revalidateRules();
  });
}

export async function deleteFeeRuleAction(serviceId: number, id: number): Promise<ActionResult> {
  return run(async () => {
    await auditUserId();
    const existing = await getRtsRuleMasterRuleById(id);
    if (existing.serviceId !== serviceId || existing.ruleGroup !== 'FEE')
      throw new Error('This fee rule belongs to another service.');
    await permanentlyDeleteRtsRuleMasterRule(id);
    revalidateRules();
  });
}

export async function updateRulePrioritiesAction(
  serviceId: number,
  ruleGroup: 'FEE' | 'USER_ALLOCATION',
  ruleIdsInOrder: number[]
): Promise<ActionResult> {
  return run(async () => {
    const updatedBy = await auditUserId();
    if (!Number.isSafeInteger(serviceId) || serviceId <= 0)
      throw new Error('Select a valid service.');
    if (!ruleIdsInOrder.length || new Set(ruleIdsInOrder).size !== ruleIdsInOrder.length)
      throw new Error('The rule order is invalid. Refresh and try again.');

    await updateRtsRuleMasterPriorities({
      serviceId,
      ruleGroup,
      updatedBy,
      priorities: ruleIdsInOrder.map((ruleId, index) => ({ ruleId, priority: index + 1 })),
    });
    revalidateRules();
  });
}

function normalizeConditions(
  conditions: RtsRuleCondition[],
  fields: RtsFieldDefinitionApiItem[],
  serviceId: number,
  departmentId: number,
  depth = 1
): RtsRuleCondition[] {
  if (depth > 5) throw new Error('Condition groups cannot exceed five levels.');
  if (!conditions.length) throw new Error('Every condition group needs at least one condition.');

  return conditions.map((condition, index) => {
    if (condition.conditionType === 'GROUP') {
      if (!['ALL', 'ANY'].includes(condition.conditionMatchType ?? ''))
        throw new Error('Every condition group must use ALL or ANY logic.');
      return {
        id: condition.id,
        conditionType: 'GROUP',
        conditionMatchType: condition.conditionMatchType,
        fieldDefinitionId: null,
        comparisonOperator: null,
        expectedValue: null,
        conditionOrder: index + 1,
        children: normalizeConditions(condition.children ?? [], fields, serviceId, departmentId, depth + 1),
      };
    }

    const field = fields.find(
      (item) =>
        item.id === condition.fieldDefinitionId &&
        item.isActive &&
        item.serviceId === serviceId &&
        item.departmentId === departmentId
    );
    if (!field) throw new Error('Select an active field belonging to this service.');
    if (!condition.comparisonOperator || !operatorsForField(field.fieldType).includes(condition.comparisonOperator))
      throw new Error('Select a comparison operator supported by this field.');
    const expectedValue = condition.expectedValue?.trim() ?? '';
    if (!expectedValue || expectedValue.length > 500)
      throw new Error('Enter an expected value (up to 500 characters).');
    if (['select', 'dropdown', 'radio'].includes(field.fieldType.toLowerCase())) {
      const options = fieldOptions(field);
      if (options.length && !options.some((option) => option.value === expectedValue))
        throw new Error('Select a configured field option.');
    }
    if (condition.children?.length)
      throw new Error('A field condition cannot contain a nested group.');
    return {
      id: condition.id,
      conditionType: 'PREDICATE',
      conditionMatchType: null,
      fieldDefinitionId: condition.fieldDefinitionId,
      comparisonOperator: condition.comparisonOperator,
      expectedValue,
      conditionOrder: index + 1,
      children: [],
    };
  });
}

async function validatedDraft(
  serviceId: number,
  draft: RuleDraft
): Promise<RtsRuleMasterRuleInput> {
  const service = await serviceForRule(serviceId);
  const fields = await getAllRtsFieldDefinitions({
    ServiceId: serviceId,
    DepartmentId: service.departmentId,
  });
  if (draft.ruleActionType !== 'STAGE_ALLOCATION') throw new Error('Unsupported rule action.');
  if (!draft.ruleDescription.trim() || draft.ruleDescription.trim().length > 200)
    throw new Error('Enter a rule description (up to 200 characters).');
  if (!['ALL', 'ANY'].includes(draft.conditionMatchType) || draft.conditions.length === 0)
    throw new Error('Choose ALL or ANY and add at least one condition.');
  const normalizedConditions = normalizeConditions(
    draft.conditions,
    fields,
    serviceId,
    service.departmentId
  );
  if (!Number.isSafeInteger(draft.priority) || draft.priority < 1)
    throw new Error('Priority must be a positive whole number.');
  if ((draft.ruleGroup?.length ?? 0) > 100 || (draft.actionValue?.length ?? 0) > 500)
    throw new Error('Rule group or action value is too long.');

  const assignment = parseStageAllocationActionValue(draft.actionValue);
  if (!assignment) throw new Error('Select an approval workflow stage.');
  const stages = await activeWorkflowStagesForService(serviceId);
  const stage = stages.find((item) => item.id === assignment.approvalFlowStageId);
  if (!stage || stage.stageOrder !== assignment.stageOrder)
    throw new Error('Select an approval stage belonging to this service.');
  const [eligibleUser, stageAllocations] = await Promise.all([
    getRtsUsers({
      UserId: draft.userId ?? undefined,
      DepartmentId: RTS_WORKFLOW_USERS_DEPARTMENT_ID,
      IsActive: true,
      PageNumber: 1,
      PageSize: 1,
    }),
    getStageUserAllocations(stage.id),
  ]);
  if (!draft.userId || !eligibleUser.items.some((user) => user.id === draft.userId))
    throw new Error('Select an active workflow officer.');
  if (
    !stageAllocations.some(
      (allocation) => allocation.isActive && allocation.userId === draft.userId
    )
  )
    throw new Error('Select an active officer assigned to the selected approval stage.');
  return {
    ruleDescription: draft.ruleDescription.trim(),
    conditionMatchType: draft.conditionMatchType,
    conditions: normalizedConditions,
    ruleActionType: 'STAGE_ALLOCATION',
    calculationType: null,
    rateAmount: null,
    quantityFieldDefinitionId: null,
    userId: draft.userId,
    priority: draft.priority,
    ruleGroup: 'USER_ALLOCATION',
    actionValue: serializeStageAllocationActionValue(assignment),
    isCumulative: false,
  };
}

export async function saveRuleAction(
  serviceId: number,
  id: number | undefined,
  draft: RuleDraft
): Promise<ActionResult> {
  return run(async () => {
    const audit = await auditUserId();
    const rule = await validatedDraft(serviceId, draft);
    if (id) {
      const existing = await getRtsRuleMasterRuleById(id);
      if (existing.serviceId !== serviceId)
        throw new Error('This rule belongs to another service.');
      const result = await updateRtsRuleMasterRules(serviceId, {
        isActive: draft.isActive,
        updatedBy: audit,
        serviceId,
        rules: [{ ...rule, id, isActive: draft.isActive }],
      });
      if (result.ruleCount !== 1 || !result.rules.some((item) => item.id === id))
        throw new Error('The rule was not updated.');
    } else {
      const result = await createRtsRuleMasterRules({
        isActive: true,
        createdBy: audit,
        serviceId,
        rules: [rule],
      });
      if (result.ruleCount !== 1) throw new Error('The rule was not created.');
    }
    revalidateRules();
  });
}

export async function deleteRuleAction(serviceId: number, id: number): Promise<ActionResult> {
  return run(async () => {
    await auditUserId();
    const existing = await getRtsRuleMasterRuleById(id);
    if (existing.serviceId !== serviceId) throw new Error('This rule belongs to another service.');
    await permanentlyDeleteRtsRuleMasterRule(id);
    revalidateRules();
  });
}

export async function setRuleActiveAction(
  serviceId: number,
  id: number,
  isActive: boolean
): Promise<ActionResult> {
  return run(async () => {
    const updatedBy = await auditUserId();
    const existing = await getRtsRuleMasterRuleById(id);
    if (existing.serviceId !== serviceId) throw new Error('This rule belongs to another service.');
    await setRtsRuleMasterActive(id, { isActive, updatedBy });
    revalidateRules();
  });
}
