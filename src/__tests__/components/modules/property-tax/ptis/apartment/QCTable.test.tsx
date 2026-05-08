import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  QCTable,
  formatArea,
  getBaseColumns,
  getRateableColumns,
  getCapitalColumns,
  getDualColumns,
  type QCTableColumn,
} from '@/components/modules/property-tax/ptis/apartment/shared/QCTable';
import type { ApartmentQCDetail } from '@/types/apartmentQC.types';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Sample test data
const mockData: ApartmentQCDetail[] = [
  {
    id: 1,
    taxZoneId: 1,
    zoneNo: 'Z001',
    propertyNo: 'PROP001',
    oldPropertyNo: 'OLD001',
    wardId: 1,
    mobileNo: '9876543210',
    emailId: 'test@example.com',
    ocDate: '2024-01-01',
    flatOrShopNo: 'A-101',
    flatOrShopName: 'Flat 101',
    flatOrShopNoEnglish: 'A-101',
    flatOrShopNameEnglish: 'Flat 101',
    ownerName: 'Test Owner',
    ownerNameEnglish: 'Test Owner',
    occupierName: 'Test Occupier',
    occupierNameEnglish: 'Test Occupier',
    rentYearly: 120000,
    rentMonthly: 10000,
    renterName: 'Test Renter',
    renterNameEnglish: 'Test Renter',
    typeOfUse: 'Residential',
    type: 'Flat',
    partType: 'Part1',
    floor: 'Ground',
    subFloor: '',
    constructionYear: '2020',
    assessmentYear: '2024',
    constructionType: 'RCC',
    carpetASqFt: 1000,
    carpetASqMtr: 92.9,
    builtupASqFt: 1200,
    builtupASqMtr: 111.48,
    oldConstArea: 900,
    oldRV: 50000,
    oldTotalTax: 5000,
    rVorCVValue: 60000,
    rateableValue: 60000,
    capitalValue: 5000000,
    newTaxTotalRV: 6000,
    newTaxTotalCV: 50000,
    newTaxTotal: 56000,
  },
  {
    id: 2,
    taxZoneId: 1,
    zoneNo: 'Z001',
    propertyNo: 'PROP002',
    oldPropertyNo: 'OLD002',
    wardId: 1,
    mobileNo: '9876543211',
    emailId: 'test2@example.com',
    ocDate: '2024-02-01',
    flatOrShopNo: 'A-102',
    flatOrShopName: 'Flat 102',
    flatOrShopNoEnglish: 'A-102',
    flatOrShopNameEnglish: 'Flat 102',
    ownerName: 'Test Owner 2',
    ownerNameEnglish: 'Test Owner 2',
    occupierName: 'Test Occupier 2',
    occupierNameEnglish: 'Test Occupier 2',
    rentYearly: 144000,
    rentMonthly: 12000,
    renterName: 'Test Renter 2',
    renterNameEnglish: 'Test Renter 2',
    typeOfUse: 'Commercial',
    type: 'Shop',
    partType: 'Part2',
    floor: 'First',
    subFloor: '',
    constructionYear: '2021',
    assessmentYear: '2024',
    constructionType: 'RCC',
    carpetASqFt: 500,
    carpetASqMtr: 46.45,
    builtupASqFt: 600,
    builtupASqMtr: 55.74,
    oldConstArea: 450,
    oldRV: 25000,
    oldTotalTax: 2500,
    rVorCVValue: 30000,
    rateableValue: 30000,
    capitalValue: 2500000,
    newTaxTotalRV: 3000,
    newTaxTotalCV: 25000,
    newTaxTotal: 28000,
  },
];

const testColumns: QCTableColumn[] = [
  { key: 'propertyNo', label: 'Property No' },
  { key: 'floor', label: 'Floor' },
  { key: 'typeOfUse', label: 'Type of Use' },
];

describe('QCTable', () => {
  describe('Component Rendering', () => {
    it('renders loading state correctly', () => {
      render(<QCTable data={[]} columns={testColumns} loading={true} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
      const errorMessage = 'Something went wrong';
      render(<QCTable data={[]} columns={testColumns} error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders no data message when data is empty', () => {
      render(<QCTable data={[]} columns={testColumns} />);
      expect(screen.getByText('noData')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      render(<QCTable data={mockData} columns={testColumns} />);
      expect(screen.getByText('Property No')).toBeInTheDocument();
      expect(screen.getByText('Floor')).toBeInTheDocument();
      expect(screen.getByText('Type of Use')).toBeInTheDocument();
    });

    it('renders table data correctly', () => {
      render(<QCTable data={mockData} columns={testColumns} />);
      expect(screen.getByText('PROP001')).toBeInTheDocument();
      expect(screen.getByText('Ground')).toBeInTheDocument();
      expect(screen.getByText('Residential')).toBeInTheDocument();
      expect(screen.getByText('PROP002')).toBeInTheDocument();
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Commercial')).toBeInTheDocument();
    });

    it('renders custom render function correctly', () => {
      const columnsWithRender: QCTableColumn[] = [
        {
          key: 'carpetArea',
          label: 'Carpet Area',
          render: (item) => `${item.carpetASqFt} sqft`,
        },
      ];
      render(<QCTable data={mockData} columns={columnsWithRender} />);
      expect(screen.getByText('1000 sqft')).toBeInTheDocument();
      expect(screen.getByText('500 sqft')).toBeInTheDocument();
    });

    it('renders dash for null or undefined values', () => {
      const dataWithNull: ApartmentQCDetail[] = [
        {
          ...mockData[0],
          id: 3,
          floor: undefined as unknown as string,
        },
      ];
      render(<QCTable data={dataWithNull} columns={testColumns} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Priority: loading > error > empty > data', () => {
    it('shows loading even when error is present', () => {
      render(<QCTable data={[]} columns={testColumns} loading={true} error="Error" />);
      expect(screen.getByText('loading')).toBeInTheDocument();
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });

    it('shows error over empty data', () => {
      render(<QCTable data={[]} columns={testColumns} error="Error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('noData')).not.toBeInTheDocument();
    });
  });
});

describe('formatArea', () => {
  it('formats area correctly with two decimal places', () => {
    expect(formatArea(1000, 92.9)).toBe('1000.00 / 92.90');
  });

  it('formats zero values correctly', () => {
    expect(formatArea(0, 0)).toBe('0.00 / 0.00');
  });

  it('formats decimal values correctly', () => {
    expect(formatArea(123.456, 11.111)).toBe('123.46 / 11.11');
  });
});

describe('Column Helper Functions', () => {
  const mockT = (key: string) => key;

  describe('getBaseColumns', () => {
    it('returns correct number of base columns', () => {
      const columns = getBaseColumns(mockT);
      expect(columns).toHaveLength(9);
    });

    it('returns columns with correct keys', () => {
      const columns = getBaseColumns(mockT);
      const keys = columns.map((c) => c.key);
      expect(keys).toContain('propertyNo');
      expect(keys).toContain('floor');
      expect(keys).toContain('assessmentYear');
      expect(keys).toContain('constructionYear');
      expect(keys).toContain('typeOfUse');
      expect(keys).toContain('carpetArea');
      expect(keys).toContain('builtupArea');
      expect(keys).toContain('oldConstArea');
      expect(keys).toContain('oldRV');
    });

    it('has render function for carpetArea and builtupArea', () => {
      const columns = getBaseColumns(mockT);
      const carpetCol = columns.find((c) => c.key === 'carpetArea');
      const builtupCol = columns.find((c) => c.key === 'builtupArea');
      expect(carpetCol?.render).toBeDefined();
      expect(builtupCol?.render).toBeDefined();
    });

    it('carpetArea render function formats correctly', () => {
      const columns = getBaseColumns(mockT);
      const carpetCol = columns.find((c) => c.key === 'carpetArea');
      const result = carpetCol?.render?.(mockData[0]);
      expect(result).toBe('1000.00 / 92.90');
    });
  });

  describe('getRateableColumns', () => {
    it('extends base columns with rateable-specific columns', () => {
      const columns = getRateableColumns(mockT);
      expect(columns.length).toBeGreaterThan(getBaseColumns(mockT).length);
    });

    it('includes newRV and totalTax columns', () => {
      const columns = getRateableColumns(mockT);
      const keys = columns.map((c) => c.key);
      expect(keys).toContain('rateableValue');
      expect(keys).toContain('newTaxTotalRV');
    });
  });

  describe('getCapitalColumns', () => {
    it('extends base columns with capital-specific columns', () => {
      const columns = getCapitalColumns(mockT);
      expect(columns.length).toBeGreaterThan(getBaseColumns(mockT).length);
    });

    it('includes capitalValue and totalTax columns', () => {
      const columns = getCapitalColumns(mockT);
      const keys = columns.map((c) => c.key);
      expect(keys).toContain('capitalValue');
      expect(keys).toContain('newTaxTotalCV');
    });
  });

  describe('getDualColumns', () => {
    it('extends base columns with dual-specific columns', () => {
      const columns = getDualColumns(mockT);
      expect(columns.length).toBeGreaterThan(getBaseColumns(mockT).length);
    });

    it('includes both rateable and capital columns', () => {
      const columns = getDualColumns(mockT);
      const keys = columns.map((c) => c.key);
      expect(keys).toContain('rateableValue');
      expect(keys).toContain('capitalValue');
      expect(keys).toContain('newTaxTotal');
    });

    it('has more columns than rateable or capital alone', () => {
      const dualColumns = getDualColumns(mockT);
      const rateableColumns = getRateableColumns(mockT);
      const capitalColumns = getCapitalColumns(mockT);
      expect(dualColumns.length).toBeGreaterThanOrEqual(rateableColumns.length);
      expect(dualColumns.length).toBeGreaterThanOrEqual(capitalColumns.length);
    });
  });
});
