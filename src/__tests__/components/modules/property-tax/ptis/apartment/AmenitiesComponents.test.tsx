import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AmenitiesRateable from '@/components/modules/property-tax/ptis/apartment/amenities/components/AmenitiesRateable';
import AmenitiesCapital from '@/components/modules/property-tax/ptis/apartment/amenities/components/AmenitiesCapital';
import AmenitiesDual from '@/components/modules/property-tax/ptis/apartment/amenities/components/AmenitiesDual';
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
];

describe('Amenities Components', () => {
  describe('AmenitiesRateable', () => {
    it('renders table with data', () => {
      render(<AmenitiesRateable data={mockData} />);
      expect(screen.getByText('PROP001')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<AmenitiesRateable data={[]} loading={true} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('renders error state', () => {
      render(<AmenitiesRateable data={[]} error="Error occurred" />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('renders no data message when empty', () => {
      render(<AmenitiesRateable data={[]} />);
      expect(screen.getByText('noData')).toBeInTheDocument();
    });

    it('shows rateable-specific columns', () => {
      render(<AmenitiesRateable data={mockData} />);
      // Check for rateable value column header
      expect(screen.getByText('columns.newRV')).toBeInTheDocument();
    });
  });

  describe('AmenitiesCapital', () => {
    it('renders table with data', () => {
      render(<AmenitiesCapital data={mockData} />);
      expect(screen.getByText('PROP001')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<AmenitiesCapital data={[]} loading={true} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('renders error state', () => {
      render(<AmenitiesCapital data={[]} error="Error occurred" />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('renders no data message when empty', () => {
      render(<AmenitiesCapital data={[]} />);
      expect(screen.getByText('noData')).toBeInTheDocument();
    });

    it('shows capital-specific columns', () => {
      render(<AmenitiesCapital data={mockData} />);
      // Check for capital value column header
      expect(screen.getByText('columns.cv')).toBeInTheDocument();
    });
  });

  describe('AmenitiesDual', () => {
    it('renders table with data', () => {
      render(<AmenitiesDual data={mockData} />);
      expect(screen.getByText('PROP001')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<AmenitiesDual data={[]} loading={true} />);
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('renders error state', () => {
      render(<AmenitiesDual data={[]} error="Error occurred" />);
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('renders no data message when empty', () => {
      render(<AmenitiesDual data={[]} />);
      expect(screen.getByText('noData')).toBeInTheDocument();
    });

    it('shows both rateable and capital columns', () => {
      render(<AmenitiesDual data={mockData} />);
      // Check for both rateable and capital value column headers
      expect(screen.getByText('columns.newRV')).toBeInTheDocument();
      expect(screen.getByText('columns.cv')).toBeInTheDocument();
    });
  });
});
