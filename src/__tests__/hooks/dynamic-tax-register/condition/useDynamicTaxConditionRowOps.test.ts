import { renderHook, act } from '@testing-library/react';
import { useDynamicTaxConditionRowOps } from '@/hooks/dynamic-tax-register/condition/useDynamicTaxConditionRowOps';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/common', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/common')>();
  return {
    ...actual,
    useConfirm: () => ({ confirm: vi.fn() }),
  };
});

const emptyConditionRows: Parameters<typeof useDynamicTaxConditionRowOps>[0]['conditionRows'] = [];

describe('useDynamicTaxConditionRowOps', () => {
  const routerMock = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() } as unknown as Parameters<typeof useDynamicTaxConditionRowOps>[0]['router'];

  it('manages row operations correctly', () => {
    const { result } = renderHook(() =>
      useDynamicTaxConditionRowOps({
        numericId: 1,
        taxRow: null,
        conditionRows: emptyConditionRows,
        fields: [],
        generalRuleDefinitionId: '',
        router: routerMock,
      })
    );

    expect(result.current.rows).toEqual([]);

    act(() => {
      result.current.handleAddRow();
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.dirty).toBe(true);
  });
});
