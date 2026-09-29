import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndividualTaxDetailsSection } from '@/components/modules/property-tax/ptis/individual/individual-tax-details/IndividualTaxDetailsSection';
import type { ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type { OldDetailsData } from '@/types/ptis.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, opts?: { type?: string; count?: number }) => {
    const map: Record<string, string> = {
      taxDetailsTab: `Tax Details (${opts?.type || ''})`,
      arrearsTab: 'Arrears',
      alv: 'ALV',
      area: 'AREA',
      changesOfUse: 'CHANGES OF USE',
      old: 'OLD:',
      new: 'NEW:',
      rv: 'RV:',
      cv: 'CV:',
      retained: 'RETAINED:',
      rvCvm: 'RV / CVM',
      beneficial: 'Beneficial',
      capitalValue: 'CAPITAL VALUE (CV)',
      rateableValue: 'RATEABLE VALUE (RV)',
      rvVsCv: 'RV vs CV',
      taxCurrent: 'TAX (CURRENT)',
      taxRetained: 'TAX (RETAINED)',
      changed: 'Changed',
      cvm: 'CVM',
    };
    if (key === 'updated') return `${opts?.count ?? 0} Updated`;
    return map[key] || key;
  },
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

const mockRateableData = {
  totalAnnualRentalValue: 2050000,
  totalRateableValue: 1845000,
  totalTax: 18752,
  rateableValueDetails: [
    {
      propertyDetailsId: 1,
      floor: 'Ground Floor',
      use: 'Commercial',
      subTypeOfUse: 'Shop',
      annualRentalValue: 1000000,
      rateableValue: 900000,
      taxTotal: 9000,
    },
    {
      propertyDetailsId: 2,
      floor: 'First Floor',
      use: 'Residential',
      subTypeOfUse: 'Flat',
      annualRentalValue: 1050000,
      rateableValue: 945000,
      taxTotal: 9752,
    },
  ],
} as unknown as RateableValueResponse;

const mockCapitalData = {
  totalCapitalValue: 5500000,
  totalTax: 32500,
  items: [
    {
      propertyDetailsId: 101,
      floorDescription: 'Ground Floor',
      typeOfUseDescription: 'Commercial',
      subTypeOfUseDescription: 'Office',
      capitalValue: 2750000,
      taxTotal: 16250,
    },
    {
      propertyDetailsId: 102,
      floorDescription: 'First Floor',
      typeOfUseDescription: 'Residential',
      subTypeOfUseDescription: 'Flat',
      capitalValue: 2750000,
      taxTotal: 16250,
    },
  ],
} as unknown as CapitalValueResponse;

const mockDualMethodData = {
  oldTaxesTotal: 1000,
  rvTaxesTotal: 1200,
  cvTaxesTotal: 1500,
  retainTaxesTotal: 1200,
  totalRv: 1845000,
  totalCv: 5500000,
  retainTaxTotal: 1200,
} as unknown as DualMethodResponse;

const mockOldDetailsData = {
  oldALV: '1800000',
  oldRV: '1620000',
  oldTotalTax: '16500',
  oldTypeOfUseId: 'Residential',
} as unknown as OldDetailsData;

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

  it('renders tax details when taxDetails prop is provided with wardId and propertyNo', () => {
    render(
      <IndividualTaxDetailsSection
        wardId="101"
        propertyNo="PROP-001"
        taxDetails={mockTaxDetails}
        taxMode="rateable"
      />
    );

    expect(screen.getByText('General Tax')).toBeInTheDocument();
    expect(screen.getByText('12,500')).toBeInTheDocument();
  });

  it('renders summary cards with rateable data and old details', () => {
    render(
      <IndividualTaxDetailsSection
        taxDetails={mockTaxDetails}
        taxMode="rateable"
        rateableData={mockRateableData}
        oldDetailsData={mockOldDetailsData}
      />
    );

    expect(screen.getByText('CHANGES OF USE')).toBeInTheDocument();
    expect(screen.getByText('ALV')).toBeInTheDocument();
    expect(screen.getByText('RATEABLE VALUE (RV)')).toBeInTheDocument();
    expect(screen.getByText('TAX (CURRENT)')).toBeInTheDocument();
    expect(screen.getByText('₹18,00,000')).toBeInTheDocument();
    expect(screen.getByText('₹20,50,000')).toBeInTheDocument();
    expect(screen.getByText('2 Updated')).toBeInTheDocument();
  });

  it('renders summary cards with capital data in capital mode', () => {
    render(
      <IndividualTaxDetailsSection
        taxDetails={mockTaxDetails}
        taxMode="capital"
        capitalData={mockCapitalData}
        oldDetailsData={mockOldDetailsData}
      />
    );

    expect(screen.getByText('CHANGES OF USE')).toBeInTheDocument();
    expect(screen.getByText('CAPITAL VALUE (CV)')).toBeInTheDocument();
    expect(screen.getByText('₹55,00,000')).toBeInTheDocument();
    expect(screen.getByText('₹32,500')).toBeInTheDocument();
    expect(screen.getByText('CVM')).toBeInTheDocument();
  });

  it('renders summary cards with dual method data in dual mode', () => {
    render(
      <IndividualTaxDetailsSection
        taxDetails={mockTaxDetails}
        taxMode="dual"
        rateableData={mockRateableData}
        capitalData={mockCapitalData}
        dualMethodData={mockDualMethodData}
        oldDetailsData={mockOldDetailsData}
      />
    );

    expect(screen.getByText('RV vs CV')).toBeInTheDocument();
    expect(screen.getByText('TAX (RETAINED)')).toBeInTheDocument();
    expect(screen.getByText('RV / CVM')).toBeInTheDocument();
    expect(screen.getByText('Beneficial')).toBeInTheDocument();
    expect(screen.getByText('₹18,45,000')).toBeInTheDocument();
    expect(screen.getByText('₹55,00,000')).toBeInTheDocument();
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹1,200')).toBeInTheDocument();
  });
});

