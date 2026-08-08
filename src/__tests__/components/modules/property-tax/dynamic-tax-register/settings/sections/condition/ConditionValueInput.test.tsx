import { render, screen } from '@testing-library/react';
import { ConditionValueInput } from '@/components/modules/property-tax/dynamic-tax-register/settings/sections/condition/ConditionValueInput';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/[locale]/property-tax/dynamic-tax-register/action', () => ({
  fetchDynamicConditionFieldOptionsAction: vi.fn(() => Promise.resolve([])),
}));

describe('ConditionValueInput', () => {
  it('renders standard text input when config is undefined', () => {
    render(<ConditionValueInput config={undefined} value="test" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('renders number input when dataType is INTEGER', () => {
    const config = { fieldId: 'f1', inputType: 'TEXTBOX', dataType: 'INTEGER' } as unknown as Parameters<typeof ConditionValueInput>[0]['config'];
    render(<ConditionValueInput config={config} value="10" onChange={vi.fn()} />);
    const input = screen.getByDisplayValue('10');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
  });
});
