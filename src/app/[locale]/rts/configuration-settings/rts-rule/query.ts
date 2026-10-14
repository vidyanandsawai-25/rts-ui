export interface RuleQuery {
  drawer?: 'service-picker' | 'rule-editor';
  ruleId?: number;
  serviceId?: number;
  departmentId?: number;
  filterServiceId?: number;
  cardSearch?: string;
  tab: 'fee' | 'assignment';
  search: string;
  page: number;
}

function positive(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

export function parseRuleQuery(params: Record<string, string | string[] | undefined>): RuleQuery {
  const one = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');
  return {
    drawer:
      one('drawer') === 'service-picker' || one('drawer') === 'rule-editor'
        ? (one('drawer') as RuleQuery['drawer'])
        : one('create') === '1'
          ? 'rule-editor'
          : undefined,
    ruleId: positive(one('ruleId')),
    serviceId: positive(one('serviceId')),
    departmentId: positive(one('departmentId')),
    filterServiceId: positive(one('filterServiceId')),
    cardSearch: one('cardSearch').trim().slice(0, 200),
    tab: one('tab') === 'assignment' ? 'assignment' : 'fee',
    search: one('search').trim().slice(0, 200),
    page: positive(one('page')) ?? 1,
  };
}
