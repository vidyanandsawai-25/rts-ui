import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaxationBreakdownForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/TaxationBreakdown/TaxationBreakdownForm';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { saveOldTaxesDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action';

import { OldTaxesDetails } from '@/types/property-old-details.types';

// Mock dependencies
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
  useLocale: () => 'en',
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ propertyId: '123', locale: 'en' }),
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/common/ConfirmProvider', () => ({
  useConfirm: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action', () => ({
  saveOldTaxesDetailsAction: vi.fn(),
}));

describe('TaxationBreakdownForm Component', () => {
  const mockConfirm = vi.fn();
  const mockInitialData = {
    propertyId: 123,
    taxYears: [
      {
        year: 2023,
        interest: 100,
        taxTotal: 1000,
        netTotal: 1100,
        financeYearId: 5,
        yearCode: '23-24',
        rVorCV: 'RV',
        rVorCVValue: 5000,
        taxes: [
          { taxId: 1, taxName: 'Property Tax', taxAmount: 1000 },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConfirm).mockReturnValue({ confirm: mockConfirm } as unknown as { confirm: Mock });
  });

  it('renders correctly with initial data', () => {
    render(<TaxationBreakdownForm initialData={mockInitialData as unknown as OldTaxesDetails} />);
    
    expect(screen.getByText('quickDataEntry.oldDetails.taxationBreakdown.title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Property Tax')).toHaveValue(1000);
    expect(screen.getByText('Property Tax')).toBeInTheDocument();
  });

  it('calculates totals correctly when tax amount changes', () => {
    render(<TaxationBreakdownForm initialData={mockInitialData as unknown as OldTaxesDetails} />);
    
    const taxInput = screen.getByPlaceholderText('Property Tax');
    fireEvent.change(taxInput, { target: { value: '2000' } });
    
    // Check total and net total
    expect(screen.getByPlaceholderText('quickDataEntry.oldDetails.taxationBreakdown.aggregateTaxSum')).toHaveValue(2000);
    expect(screen.getByPlaceholderText('quickDataEntry.oldDetails.taxationBreakdown.netPayableTotal')).toHaveValue(2100);
  });

  it('calculates net total correctly when interest changes', () => {
    render(<TaxationBreakdownForm initialData={mockInitialData as unknown as OldTaxesDetails} />);
    
    const interestInput = screen.getByDisplayValue('100');
    fireEvent.change(interestInput, { target: { value: '200' } });
    
    expect(screen.getByPlaceholderText('quickDataEntry.oldDetails.taxationBreakdown.netPayableTotal')).toHaveValue(1200);
  });

  it('calls confirm dialog when update button is clicked', () => {
    render(<TaxationBreakdownForm initialData={mockInitialData as unknown as OldTaxesDetails} />);
    
    const updateButton = screen.getByRole('button', { name: /quickDataEntry.oldDetails.taxationBreakdown.update/i });
    fireEvent.click(updateButton);
    
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers API call and shows success toast on successful confirmation', async () => {
    vi.mocked(saveOldTaxesDetailsAction).mockResolvedValue({ success: true, data: {} as unknown } as unknown as Awaited<ReturnType<typeof saveOldTaxesDetailsAction>>);
    
    // Simulate onConfirm call
    mockConfirm.mockImplementation(({ onConfirm }: { onConfirm: () => void }) => onConfirm());
    
    render(<TaxationBreakdownForm initialData={mockInitialData as unknown as OldTaxesDetails} />);
    
    const updateButton = screen.getByRole('button', { name: /quickDataEntry.oldDetails.taxationBreakdown.update/i });
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(saveOldTaxesDetailsAction).toHaveBeenCalled();
    });
  });
});
