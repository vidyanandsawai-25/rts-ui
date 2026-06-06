import { apiClient } from '@/services/api.service';
import { OperatorItem, DataType } from '@/types/rule-engine.types';

interface ApiRuleOperator {
  operator: string;
  operatorDescription: string;
  id: number;
  isActive: boolean;
}

interface ApiRuleOperatorResponse {
  items: ApiRuleOperator[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Fetches and maps operators dynamically from /RuleOperator endpoint.
 * Maps raw operator symbols to typed codes for frontend use.
 */
export async function getRuleOperators(): Promise<OperatorItem[]> {
  const response = await apiClient.get<ApiRuleOperatorResponse>('/RuleOperator');
  if (!response.success || !response.data?.items) return [];

  return response.data.items
    .filter((item) => item.isActive)
    .map((item) => {
      let code = item.operator.toUpperCase().replace(/\s+/g, '_');
      let label = item.operator;

      if (item.operator === '=') { code = 'EQUALS'; }
      else if (item.operator === '?') { code = 'NOT_EQUALS'; label = '!='; }
      else if (item.operator === '>') { code = 'GREATER_THAN'; }
      else if (item.operator === '<') { code = 'LESS_THAN'; }
      else if (item.operator === '>=') { code = 'GREATER_THAN_OR_EQUALS'; }
      else if (item.operator === '<=') { code = 'LESS_THAN_OR_EQUALS'; }
      else if (item.operator.toLowerCase() === 'in') { code = 'IN'; }
      else if (item.operator.toLowerCase() === 'not in') { code = 'NOT_IN'; }
      else if (item.operator.toLowerCase() === 'contains any') { code = 'CONTAINS_ANY'; }
      else if (item.operator.toLowerCase() === 'contains all') { code = 'CONTAINS_ALL'; }

      return { id: item.id, code, label, isDefault: item.operator === '=' };
    });
}

/** Returns operator items applicable to a given data type (all operators by default). */
export function getOperatorsForDataType(allOperators: OperatorItem[], _dataType: DataType): OperatorItem[] {
  return allOperators;
}
