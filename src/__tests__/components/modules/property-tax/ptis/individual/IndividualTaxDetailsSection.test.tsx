import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndividualTaxDetailsSection } from '@/components/modules/property-tax/ptis/individual/individual-tax-details/IndividualTaxDetailsSection';
import type { ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, opts?: { type?: string }) => {
    if (key === 'taxDetailsTab') return `Tax Details (${opts?.type || ''})`;
    if (key === 'arrearsTab') return 'Arrears';
    return key;
  },
}));

const mockGetIndividualTaxDetailsAction = vi.fn();

vi.mock('@/app/[locale]/property-tax/ptis/individual/action', () => ({
  getIndividualTaxDetailsAction: (...args: unknown[]) => mockGetIndividualTaxDetailsAction(...args),
}));

const mockTaxDetails: ApartmentTaxDetailsItem = {
  wardId: 101,
  propertyNo: 'PROP-001',
  wingMasterId: null,
  wingName: null,
  wingNo: null,
  societyName: null,
  propertyCount: 1,
  currentTaxes: [
    {
      taxType: 'RV',
      taxHeads: [
        {
          taxId: 1,
          taxName: 'General Tax',
          taxAmount: 12500,
          policyCode: 'NETTAX',
        },
        {
          taxId: 2,
          taxName: 'Water Tax',
          taxAmount: 3200,
          policyCode: 'NETTAX',
        },
        {
          taxId: 3,
          taxName: 'Drainage Tax',
          taxAmount: 1800,
          policyCode: 'NETTAX',
        },
      ],
    },
  ],
  arrears: [
    {
      taxId: 1,
      taxName: 'General Tax Arrears',
      taxAmount: 5000,
      policyCode: 'ARREARS',
    },
    {
      taxId: 2,
      taxName: 'Water Tax Arrears',
      taxAmount: 1200,
      policyCode: 'ARREARS',
    },
  ],
};

describe('IndividualTaxDetailsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no data and no wardId/propertyNo are provided', () => {
    render(<IndividualTaxDetailsSection />);

    expect(screen.getByText('taxes')).toBeInTheDocument();
    expect(screen.getByText('noTaxDetailsAvailable')).toBeInTheDocument();
    expect(screen.getByText('Tax Details (RV)')).toBeInTheDocument();
    expect(screen.getByText('Arrears')).toBeInTheDocument();
    expect(screen.getByText('Mode: Rateable Value (RV)')).toBeInTheDocument();
  });

  it('renders skeleton loader when isLoading is true', () => {
    const { container } = render(<IndividualTaxDetailsSection isLoading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders tax details table with dynamic columns and amounts', () => {
    render(<IndividualTaxDetailsSection taxDetails={mockTaxDetails} taxMode="rateable" />);

    expect(screen.getByText('Tax Details (RV)')).toBeInTheDocument();
    expect(screen.getByText('Mode: Rateable Value (RV)')).toBeInTheDocument();

    // Tax Head Headers
    expect(screen.getByText('General Tax')).toBeInTheDocument();
    expect(screen.getByText('Water Tax')).toBeInTheDocument();
    expect(screen.getByText('Drainage Tax')).toBeInTheDocument();

    // Policy Code Row
    expect(screen.getByText('NETTAX')).toBeInTheDocument();

    // Amounts
    expect(screen.getByText('12,500')).toBeInTheDocument();
    expect(screen.getByText('3,200')).toBeInTheDocument();
    expect(screen.getByText('1,800')).toBeInTheDocument();
  });

  it('switches to Arrears tab and displays arrears breakdown', () => {
    render(<IndividualTaxDetailsSection taxDetails={mockTaxDetails} taxMode="rateable" />);

    // Arrears badge count
    expect(screen.getByText('2')).toBeInTheDocument();

    const arrearsBtn = screen.getByText('Arrears');
    fireEvent.click(arrearsBtn);

    // Arrears columns & rows
    expect(screen.getByText('General Tax Arrears')).toBeInTheDocument();
    expect(screen.getByText('Water Tax Arrears')).toBeInTheDocument();
    expect(screen.getAllByText('Arrears').length).toBeGreaterThan(0);
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  it('updates mode badge correctly for capital and dual modes', () => {
    const { rerender } = render(
      <IndividualTaxDetailsSection taxDetails={mockTaxDetails} taxMode="capital" />
    );
    expect(screen.getByText('Mode: Capital Value (CV)')).toBeInTheDocument();
    expect(screen.getByText('Tax Details (CV)')).toBeInTheDocument();

    rerender(
      <IndividualTaxDetailsSection taxDetails={mockTaxDetails} taxMode="dual" />
    );
    expect(screen.getByText('Mode: Dual Method (RV + CVM)')).toBeInTheDocument();
    expect(screen.getByText('Tax Details (Dual)')).toBeInTheDocument();
  });

  it('fetches tax details dynamically when wardId and propertyNo are provided', async () => {
    mockGetIndividualTaxDetailsAction.mockResolvedValueOnce({
      success: true,
      items: mockTaxDetails,
    });

    render(
      <IndividualTaxDetailsSection
        wardId="101"
        propertyNo="PROP-001"
        taxMode="rateable"
      />
    );

    expect(mockGetIndividualTaxDetailsAction).toHaveBeenCalledWith('101', 'PROP-001', 'RV');

    await waitFor(() => {
      expect(screen.getByText('General Tax')).toBeInTheDocument();
      expect(screen.getByText('12,500')).toBeInTheDocument();
    });
  });
});
