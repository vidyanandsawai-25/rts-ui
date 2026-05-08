import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PropertyDetailsEditScreen from '@/components/modules/property-tax/ptis/appartmentQC/PropertyDetailsEditScreen';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
  usePathname: () => '/test-path',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    const map: Record<string, string> = {
      "apartmentQC.edit.title": "Property Details",
      "apartmentQC.edit.basicInfo": "Basic Information",
      "apartmentQC.edit.floorQC": "Floor QC",
      "fields.wardNo": "Ward",
      "fields.blockNo": "Bldg",
      "fields.propertyNo": "Prop",
      "fields.societyName": "Society",
      "apartmentQC.edit.floorsCount": values ? `${values.count} floors` : "0 floors",
    };
    return map[key] || key;
  },
}));

// Mock custom hook
vi.mock('@/hooks/apartmentQc/useApartmentQCEdit', () => ({
  useApartmentQCEdit: () => ({
    floorData: [{ id: 'row-1', floorId: '1', area: '100' }],
    updateRow: vi.fn(),
    floorOptions: [],
    conTypeOptions: [],
    useTypeOptions: [],
    getSubTypeOptions: () => [],
    handleFloorDropdownClick: vi.fn(),
    handleConTypeDropdownClick: vi.fn(),
    handleUseTypeDropdownClick: vi.fn(),
    loadingStates: { floors: false, conTypes: false, useTypes: false, subTypes: false },
  }),
}));

// Mock Drawer to render its children directly for easier testing
vi.mock('@/components/common/Drawer', () => ({
  Drawer: ({ children, title }: any) => (
    <div data-testid="drawer">
      <div>{title}</div>
      {children}
    </div>
  ),
}));

describe('PropertyDetailsEditScreen', () => {
  const mockProps = {
    open: true,
    onClose: vi.fn(),
    propertyData: { wardId: 13, buildingNo: 'B-12', propertyNo: 'RP001', society: 'Green Valley' } as any,
  };

  it('renders property details in the title', () => {
    render(<PropertyDetailsEditScreen {...mockProps} />);
    expect(screen.getByText(/Ward: 13/)).toBeInTheDocument();
    expect(screen.getByText(/Bldg: B-12/)).toBeInTheDocument();
  });

  it('renders sub-sections', () => {
    render(<PropertyDetailsEditScreen {...mockProps} />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Floor QC')).toBeInTheDocument();
  });

  it('can toggle sections', () => {
    render(<PropertyDetailsEditScreen {...mockProps} />);
    const basicInfoBtn = screen.getByText('Basic Information').closest('button');
    if (basicInfoBtn) {
      fireEvent.click(basicInfoBtn);
    }
  });
});
