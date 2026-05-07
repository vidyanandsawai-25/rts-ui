import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApartmentTabsSection from '@/components/modules/property-tax/ptis/apartment/components/ApartmentTabsSection';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the action
vi.mock('@/app/[locale]/property-tax/ptis/actions', () => ({
  fetchApartmentQCDetailsAction: vi.fn(),
}));

// Mock child components
vi.mock('@/components/modules/property-tax/ptis/apartment/amenities', () => ({
  AmenitiesRateable: ({ loading, error }: { loading?: boolean; error?: string | null }) => (
    <div data-testid="amenities-rateable">
      {loading && <span>Loading...</span>}
      {error && <span>{error}</span>}
      AmenitiesRateable
    </div>
  ),
  AmenitiesCapital: () => <div data-testid="amenities-capital">AmenitiesCapital</div>,
  AmenitiesDual: () => <div data-testid="amenities-dual">AmenitiesDual</div>,
}));

vi.mock('@/components/modules/property-tax/ptis/apartment/commercial', () => ({
  CommercialRateable: () => <div data-testid="commercial-rateable">CommercialRateable</div>,
  CommercialCapital: () => <div data-testid="commercial-capital">CommercialCapital</div>,
  CommercialDual: () => <div data-testid="commercial-dual">CommercialDual</div>,
}));

vi.mock('@/components/modules/property-tax/ptis/apartment/residential', () => ({
  ResidentialRateable: () => <div data-testid="residential-rateable">ResidentialRateable</div>,
  ResidentialCapital: () => <div data-testid="residential-capital">ResidentialCapital</div>,
  ResidentialDual: () => <div data-testid="residential-dual">ResidentialDual</div>,
}));

// Mock react-icons
vi.mock('react-icons/md', () => ({
  MdOtherHouses: () => <span data-testid="icon-amenities">🏠</span>,
  MdStoreMallDirectory: () => <span data-testid="icon-commercial">🏬</span>,
  MdHome: () => <span data-testid="icon-residential">🏡</span>,
}));

import { fetchApartmentQCDetailsAction } from '@/app/[locale]/property-tax/ptis/actions';

const mockFetchAction = fetchApartmentQCDetailsAction as ReturnType<typeof vi.fn>;

describe('ApartmentTabsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders with default amenities tab active', async () => {
      mockFetchAction.mockResolvedValue({
        success: true,
        data: { items: [] },
      });

      render(<ApartmentTabsSection locale="en" />);

      await waitFor(() => {
        expect(screen.getByTestId('amenities-rateable')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      mockFetchAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { items: [] } }), 100))
      );

      render(<ApartmentTabsSection locale="en" propertyId={123} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('fetches data on mount', async () => {
      mockFetchAction.mockResolvedValue({
        success: true,
        data: { items: [] },
      });

      render(<ApartmentTabsSection locale="en" propertyId={123} />);

      await waitFor(() => {
        expect(mockFetchAction).toHaveBeenCalledWith(123);
      });
    });

    it('handles API error gracefully', async () => {
      mockFetchAction.mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      render(<ApartmentTabsSection locale="en" propertyId={123} />);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('handles exception during fetch', async () => {
      mockFetchAction.mockRejectedValue(new Error('Network error'));

      render(<ApartmentTabsSection locale="en" propertyId={123} />);

      await waitFor(() => {
        expect(screen.getByText('error')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Rendering', () => {
    beforeEach(() => {
      mockFetchAction.mockResolvedValue({
        success: true,
        data: { items: [] },
      });
    });

    it('renders inner tabs (amenities, commercial, residential)', async () => {
      render(<ApartmentTabsSection locale="en" />);

      await waitFor(() => {
        // Check that the inner tabs exist by role and accessible name
        expect(screen.getByRole('tab', { name: /amenities/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /commercial/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /residential/i })).toBeInTheDocument();
      });
    });

    it('renders QC method tabs (rateable, capital, dual)', async () => {
      render(<ApartmentTabsSection locale="en" />);

      await waitFor(() => {
        // Check that the QC tabs exist by role and accessible name
        expect(screen.getByRole('tab', { name: /^rateable$/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /^capital$/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /^dual$/i })).toBeInTheDocument();
      });
    });
  });

  describe('Component Props', () => {
    it('accepts locale prop', () => {
      mockFetchAction.mockResolvedValue({
        success: true,
        data: { items: [] },
      });

      expect(() => render(<ApartmentTabsSection locale="hi" />)).not.toThrow();
    });

    it('accepts propertyId prop', async () => {
      mockFetchAction.mockResolvedValue({
        success: true,
        data: { items: [] },
      });

      render(<ApartmentTabsSection locale="en" propertyId={456} />);

      await waitFor(() => {
        expect(mockFetchAction).toHaveBeenCalledWith(456);
      });
    });

    it('works without propertyId', async () => {
      mockFetchAction.mockResolvedValue({
        success: true,
        data: { items: [] },
      });

      render(<ApartmentTabsSection locale="en" />);

      await waitFor(() => {
        // When propertyId is undefined, the action should not be called
        expect(mockFetchAction).not.toHaveBeenCalled();
      });
    });
  });
});
