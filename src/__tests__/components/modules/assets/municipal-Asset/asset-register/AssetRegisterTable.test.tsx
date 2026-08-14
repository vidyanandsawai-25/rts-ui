/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ── Mock all external dependencies ──────────────────────────────
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/en/assets/municipal-Asset/asset-register/1',
  useSearchParams: () => ({ get: vi.fn(() => null) }),
}));

vi.mock('@/hooks/asset/asset-register/useMediaPanelVisibility', () => ({
  useMediaPanelVisibility: () => ({ isPanelVisible: false, togglePanel: vi.fn() }),
}));

vi.mock('@/app/[locale]/assets/municipal-Asset/asset-register/[categoryId]/action', () => ({
  fetchGroupedAssetPhotosAction: vi.fn(),
  fetchSubUnitsByAsset: vi.fn(),
}));

vi.mock('@/hooks/useQueryTransition', () => ({
  useQueryTransition: () => ({ updateQueries: vi.fn() }),
}));

vi.mock('@/components/modules/assets/municipal-Asset/asset-register/media/PropertyMediaPanel', () => ({
  default: () => <div data-testid="property-media-panel" />,
}));

vi.mock('@/components/common', () => ({
  MasterTable: ({ columns, data, emptyText }: { columns: unknown[]; data: unknown[]; emptyText: string }) => (
    <div data-testid="master-table">
      <span data-testid="empty-text">{emptyText}</span>
      <span data-testid="row-count">{data.length}</span>
      <span data-testid="col-count">{columns.length}</span>
    </div>
  ),
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Tooltip: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SortableColumnHeader: ({ label, ...props }: any) => <div {...props}>{label}</div>,
}));

import { AssetRegisterTable } from '@/components/modules/assets/municipal-Asset/asset-register/AssetRegisterTable';
import type { AssetRegisterRow, AssetRegisterTableProps } from '@/types/asset/asset-register/municipal-asset-register.types';

// ──────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────
const mockRow: AssetRegisterRow = {
  id: 1,
  assetId: 'ASSET-001',
  assetCode: 'ASSET-001',
  assetName: 'Main Building',
  categoryName: 'Building',
  assetTypeName: 'Commercial',
  authorityName: 'Authority A',
  organizationName: 'Org B',
  departmentName: 'Dept C',
  address: '123 Main St',
  wardName: 'Ward 1',
  zoneName: 'Zone A',
  latitude: '18.5',
  longitude: '73.8',
  capitalValue: '5000000',
  isRevenueGenerating: 'Yes',
  operationalControl: 'Self',
  occupancyStatus: 'Occupied',
  ownershipType: 'Government',
  assetCondition: 'Good',
  parentAssetName: '-',
  csn: '-',
  hasLift: 'No',
  purchaseDate: '',
  marketValueDate: '',
  lastCVCalculationDate: '',
  currentBookValue: '-',
  depreciation: '-',
  netBookValue: '5000000',
  lifeYears: '-',
  depreciationRate: '-',
  fieldValues: '-',
  purchaseValue: '-',
  marketValue: '-',
  builtUpAreaSqMeter: '100',
  carpetAreaSqMeter: '80',
  landAreaSqMeter: '-',
  createdDate: '2024-01-01',
  assetCategoryId: 10,
  assetTypeId: 20,
  assetDocumentId: null,
  totalSubUnits: 0,
};

const defaultProps: AssetRegisterTableProps = {
  assets: [mockRow],
  totalCount: 1,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
};

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────
describe('AssetRegisterTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders MasterTable', () => {
    render(<AssetRegisterTable {...defaultProps} />);
    expect(screen.getByTestId('master-table')).toBeInTheDocument();
  });

  it('passes correct row count to MasterTable', () => {
    render(<AssetRegisterTable {...defaultProps} />);
    expect(screen.getByTestId('row-count').textContent).toBe('1');
  });

  it('renders with empty assets array', () => {
    render(<AssetRegisterTable {...defaultProps} assets={[]} totalCount={0} />);
    expect(screen.getByTestId('row-count').textContent).toBe('0');
  });

  it('passes multiple rows to MasterTable', () => {
    const assets = [
      mockRow,
      { ...mockRow, id: 2, assetCode: 'ASSET-002', assetName: 'Annex Building' },
    ];
    render(<AssetRegisterTable {...defaultProps} assets={assets} totalCount={2} />);
    expect(screen.getByTestId('row-count').textContent).toBe('2');
  });

  it('renders MediaPanel (PropertyMediaPanel) in DOM', () => {
    render(<AssetRegisterTable {...defaultProps} />);
    expect(screen.getByTestId('property-media-panel')).toBeInTheDocument();
  });

  it('renders controls slot when provided', () => {
    render(
      <AssetRegisterTable
        {...defaultProps}
        controls={<div data-testid="controls-slot">Filters</div>}
      />
    );
    expect(screen.getByTestId('controls-slot')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('does not crash without controls', () => {
    expect(() => render(<AssetRegisterTable {...defaultProps} />)).not.toThrow();
  });
});
