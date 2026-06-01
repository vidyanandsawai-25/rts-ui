import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyDetailsEditScreen from '@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditScreen';
import type { ApartmentQCDetail } from '@/types/apartmentQC.types';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/property-tax/ptis',
}));

// Mock next-intl translations (identity fn returns the key)
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock the action module. The drawer + its hooks eager-fetch master dropdown
// data and may also fire room-data / sync-rooms / old-property actions, so we
// stub every export the drawer tree might reach.
vi.mock('@/app/[locale]/property-tax/ptis/appartmentQC/action', () => ({
  getRoomWiseSubmissionsAction: vi.fn(() =>
    Promise.resolve({ success: true, data: [] })
  ),
  fetchAllFloorsAction: vi.fn(() =>
    Promise.resolve({ success: true, data: [] })
  ),
  fetchAllConstructionTypesAction: vi.fn(() =>
    Promise.resolve({ success: true, data: [] })
  ),
  fetchAllUseTypesAction: vi.fn(() =>
    Promise.resolve({ success: true, data: [] })
  ),
  fetchAllSubTypesAction: vi.fn(() =>
    Promise.resolve({ success: true, data: [] })
  ),
  fetchAllPropertyTypesAction: vi.fn(() =>
    Promise.resolve({ success: true, data: [] })
  ),
  fetchOldPropertyDataAction: vi.fn(() =>
    Promise.resolve({ success: true, data: null })
  ),
  fetchFloorQCByPropertyIdSafeAction: vi.fn(() =>
    Promise.resolve([])
  ),
  syncRoomsForPropertyDetailsAction: vi.fn(() =>
    Promise.resolve({ success: true })
  ),
  updateBasicDetailsAction: vi.fn(() =>
    Promise.resolve({ success: true })
  ),
  updateFloorQCDetailsBulkAction: vi.fn(() =>
    Promise.resolve({ success: true })
  ),
}));

// Mock RoomWiseSubmission component
vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/RoomSubmission', () => ({
  RoomWiseSubmission: () => <div data-testid="room-wise-submission">RoomWiseSubmission</div>,
}));

describe('PropertyDetailsEditScreen', () => {
  const mockPropertyData: ApartmentQCDetail = {
    id: 1,
    propertyId: 550296,
    wardId: '1',
    zoneNo: 'Zone-A',
    propertyNo: '12345',
    ownerName: 'John Doe',
    occupierName: 'Jane Doe',
    renterName: '',
    flatOrShopNo: 'A-101',
    wingName: 'A',
  } as unknown as ApartmentQCDetail;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render drawer when open prop is true', () => {
    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
      />
    );

    expect(screen.getAllByText('drawer.title')[0]).toBeInTheDocument();
  });

  it('should display property data in the drawer', () => {
    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
      />
    );

    expect(screen.getByText(/Ward: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Zone: Zone-A/)).toBeInTheDocument();
    expect(screen.getByText(/Prop: 12345/)).toBeInTheDocument();
  });

  it('should render "No property data found" when propertyData is null', () => {
    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={null}
      />
    );

    expect(screen.getByText('drawer.noPropertyData')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /drawer\.goBack/i })).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(
      <PropertyDetailsEditScreen
        open={true}
        onClose={mockOnClose}
        propertyData={mockPropertyData}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /drawer\.cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should expand/collapse Basic Information section', async () => {
    const user = userEvent.setup();

    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
      />
    );

    // Both sections default to open, so the field is visible initially.
    expect(screen.getByLabelText(/Owner Name/i)).toBeInTheDocument();

    // Clicking the toggle button collapses the section.
    const basicInfoButton = screen.getByRole('button', { name: /drawer\.basicInformation/i });
    await user.click(basicInfoButton);

    await waitFor(() => {
      expect(screen.queryByLabelText(/Owner Name/i)).not.toBeInTheDocument();
    });
  });

  it('should expand/collapse Floor QC section', async () => {
    const user = userEvent.setup();

    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
      />
    );

    // Floor QC defaults to open, so the table is visible initially.
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Clicking the toggle button collapses the section.
    const floorQCButton = screen.getByRole('button', { name: /drawer\.floorQC/i });
    await user.click(floorQCButton);

    await waitFor(() => {
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  it('should accept initialFloorQCData prop', () => {
    const mockFloorData: ApartmentQCDetail[] = [
      {
        id: 1,
        pdnId: 206142,
        floorDescription: 'Ground Floor',
      } as unknown as ApartmentQCDetail,
    ];

    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
        initialFloorQCData={mockFloorData}
      />
    );

    expect(screen.getByText(/1 floors/)).toBeInTheDocument();
  });

  it('should accept initialPropertyTypes prop', () => {
    const mockPropertyTypes = [
      { value: '1', label: 'Residential' },
      { value: '2', label: 'Commercial' },
    ];

    render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
        initialPropertyTypes={mockPropertyTypes}
      />
    );

    // Component should render without errors
    expect(screen.getAllByText('drawer.title')[0]).toBeInTheDocument();
  });

  it('should handle different subTab values', () => {
    const { rerender } = render(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
        subTab="rateable"
      />
    );

    expect(screen.getAllByText('drawer.title')[0]).toBeInTheDocument();

    rerender(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
        subTab="capital"
      />
    );

    expect(screen.getAllByText('drawer.title')[0]).toBeInTheDocument();

    rerender(
      <PropertyDetailsEditScreen
        open={true}
        propertyData={mockPropertyData}
        subTab="dual-method"
      />
    );

    expect(screen.getAllByText('drawer.title')[0]).toBeInTheDocument();
  });
});
