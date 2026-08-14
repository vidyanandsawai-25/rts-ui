import { getConditionOverviewColumns } from '@/components/modules/property-tax/dynamic-tax-register/overview/conditionOverviewColumns';
import type { ConditionOverviewRow } from '@/types/dynamic-tax-register.types';
import type { FieldConfig } from '@/types/rule-engine';

describe('getConditionOverviewColumns', () => {
  const mockT = vi.fn((key: string) => key);
  const fields: FieldConfig[] = [];

  it('returns columns length 7', () => {
    const columns = getConditionOverviewColumns({ t: mockT, fields });
    expect(columns).toHaveLength(7);
    expect(columns.map((c) => c.key)).toEqual([
      'sortOrder',
      'taxName',
      'conditions',
      'resultValue',
      'yearRangeLabel',
      'assessmentBasis',
      'isActive',
    ]);
  });

  it('renders status badge correctly', () => {
    const columns = getConditionOverviewColumns({ t: mockT, fields });
    const statusCol = columns.find((c) => c.key === 'isActive');
    const dummyRow = { isActive: true } as ConditionOverviewRow;
    const res = statusCol?.render?.(true, dummyRow, 0);
    expect(res).toBeDefined();
  });
});
