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

function getFriendlyOperatorLabel(op: string): string {
  const clean = op.trim();
  const lower = clean.toLowerCase();
  switch (clean) {
    case '=':
      return 'Equal to';
    case '?':
    case '!=':
      return 'Not equal to';
    case '>':
      return 'Greater than';
    case '<':
      return 'Less than';
    case '>=':
      return 'Greater than or equal to';
    case '<=':
      return 'Less than or equal to';
    default:
      if (lower === 'in') return 'In';
      if (lower === 'not in') return 'Not in';
      if (lower === 'contains any') return 'Contains any';
      if (lower === 'contains all') return 'Contains all';
      return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}

function normalizeOperatorCode(op: string): string {
  const clean = op.trim().replace(/\s+/g, '_').toUpperCase();
  switch (clean) {
    case 'EQUALS':                  return '=';
    case 'NOT_EQUALS':              return '?';
    case 'GREATER_THAN':            return '>';
    case 'LESS_THAN':               return '<';
    case 'GREATER_THAN_OR_EQUALS':  return '>=';
    case 'LESS_THAN_OR_EQUALS':     return '<=';
    case 'IN':                      return 'In';
    case 'NOT_IN':                  return 'Not In';
    case 'CONTAINS_ANY':            return 'contains any';
    case 'CONTAINS_ALL':            return 'contains all';
    default: {
      const lower = op.trim().toLowerCase();
      if (lower === 'contains any' || lower === 'contains_any') return 'contains any';
      if (lower === 'contains all' || lower === 'contains_all') return 'contains all';
      if (lower === 'in') return 'In';
      if (lower === 'not in' || lower === 'not_in') return 'Not In';
      return op;
    }
  }
}

/**
 * Fetches and maps operators dynamically from /RuleOperator endpoint.
 * Maps raw operator symbols to friendly text for display, while keeping raw symbol as code.
 */
export async function getRuleOperators(): Promise<OperatorItem[]> {
  const response = await apiClient.get<ApiRuleOperatorResponse>('/RuleOperator');
  if (!response.success || !response.data?.items) return [];

  return response.data.items
    .filter((item) => item.isActive)
    .map((item) => {
      const code = normalizeOperatorCode(item.operator);
      const label = getFriendlyOperatorLabel(code);
      return { id: item.id, code, label, isDefault: code === '=' };
    });
}


/** Returns operator items applicable to a given data type */
export function getOperatorsForDataType(allOperators: OperatorItem[], dataType: DataType): OperatorItem[] {
  const code = (op: OperatorItem) => op.code.trim();

  switch (dataType) {
    case 'INTEGER':
    case 'DECIMAL':
      // Allow arithmetic comparison + inclusion checks (for dropdown/multiselect numbers)
      return allOperators.filter((op) =>
        ['=', '!=', '?', '>', '<', '>=', '<=', 'In', 'Not In'].includes(code(op))
      );

    case 'DATE':
      // Allow chronological comparisons
      return allOperators.filter((op) =>
        ['=', '!=', '?', '>', '<', '>=', '<='].includes(code(op))
      );

    case 'BOOLEAN':
      // Only check true/false equality
      return allOperators.filter((op) =>
        ['=', '!=', '?'].includes(code(op))
      );

    case 'STRING':
    default:
      // Allow equality, inclusion, and text matching
      return allOperators.filter((op) =>
        ['=', '!=', '?', 'In', 'Not In', 'contains any', 'contains all'].includes(code(op))
      );
  }
}
