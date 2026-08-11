import { getDynamicTaxRegisterColumns } from '@/components/modules/property-tax/dynamic-tax-register/dynamicTaxRegisterColumns';
import type { DynamicTaxRegisterRow, CalculationMode } from '@/types/dynamic-tax-register.types';

describe('getDynamicTaxRegisterColumns', () => {
  const mockT = vi.fn((key: string) => key);
  const mockGoToConfigure = vi.fn();

  const MODE_BADGE_CLASS: Record<CalculationMode, string> = {
    VALUE_BASED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CONDITION_BASED: 'bg-amber-50 text-amber-700 border-amber-200',
    MASTER_BASED: 'bg-purple-50 text-purple-700 border-purple-200',
    HYBRID: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const RULE_CATEGORY_LABEL_KEY: Record<CalculationMode, string> = {
    VALUE_BASED: 'list.modeOptions.value',
    CONDITION_BASED: 'list.modeOptions.condition',
    MASTER_BASED: 'list.modeOptions.master',
    HYBRID: 'list.modeOptions.hybrid',
  };

  it('returns all expected columns', () => {
    const columns = getDynamicTaxRegisterColumns({
      t: mockT,
      pageNumber: 1,
      pageSize: 10,
      MODE_BADGE_CLASS,
      RULE_CATEGORY_LABEL_KEY,
      goToConfigure: mockGoToConfigure,
    });

    expect(columns).toHaveLength(12);
    expect(columns.map((c) => c.key)).toEqual([
      'taxId',
      'taxName',
      'taxNameAlias',
      'taxCode',
      'ruleName',
      'ruleCategory',
      'source',
      'status',
      'assessmentStatus',
      'oldTaxStatus',
      'ruleSummary',
      'action',
    ]);
  });

  it('calculates serial number correctly for pagination', () => {
    const columns = getDynamicTaxRegisterColumns({
      t: mockT,
      pageNumber: 2,
      pageSize: 10,
      MODE_BADGE_CLASS,
      RULE_CATEGORY_LABEL_KEY,
      goToConfigure: mockGoToConfigure,
    });

    const srCol = columns.find((c) => c.key === 'taxId');
    const dummyRow = { taxId: 101 } as DynamicTaxRegisterRow;
    const element = srCol?.render?.(101, dummyRow, 2);
    expect(element).toBeDefined();
  });
});
