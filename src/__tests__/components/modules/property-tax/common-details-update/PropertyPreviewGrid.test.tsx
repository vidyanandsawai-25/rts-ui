import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyPreviewGrid } from '@/components/modules/property-tax/common-details-update/PropertyPreviewGrid';
import { PropertyPreviewRow, BulkUpdateMaster, BulkUpdateFieldConfig } from '@/types/common-details-update/common-details-update.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('PropertyPreviewGrid', () => {
  const mockT = (key: string) => key;
  const mockSelectedMenuItem: BulkUpdateMaster = {
    id: 1,
    updateCode: 'UPDATE_ADDRESS',
    updateName: 'Update Address',
    updateNameMarathi: 'पत्ता अपडेट करा',
    iconName: 'MapPin',
    targetTable: 'Property',
    isActive: true,
    displaySequence: 1,
    apiRoute: '/api/bulk-update/address',
  };

  const mockFieldConfigs: BulkUpdateFieldConfig[] = [
    {
      id: 1,
      bulkUpdateMasterId: 1,
      fieldName: 'AddressEnglish',
      displayName: 'Address (English)',
      displayNameMarathi: 'पत्ता (इंग्रजी)',
      controlType: 'textbox',
      dataType: 'string',
      isRequired: true,
      sequenceNo: 1,
      isActive: true,
      isReadonly: false,
    },
    {
      id: 2,
      bulkUpdateMasterId: 1,
      fieldName: 'Address',
      displayName: 'Address (Marathi)',
      displayNameMarathi: 'पत्ता (मराठी)',
      controlType: 'textbox',
      dataType: 'string',
      isRequired: true,
      sequenceNo: 2,
      isActive: true,
      isReadonly: false,
    }
  ];

  const mockProperties: PropertyPreviewRow[] = [
    {
      id: 1,
      wardNo: '1',
      propertyNo: 'P001',
      partitionNo: '0',
      addressEnglish: '123 Main St',
      address: '१२३ मेन स्ट्रीट',
    },
    {
      id: 2,
      wardNo: '1',
      propertyNo: 'P002',
      partitionNo: '0',
      addressEnglish: '456 Oak Ave',
      address: '४५६ ओक एव्हेन्यू',
    },
  ];

  const defaultProps = {
    t: mockT,
    properties: mockProperties,
    filteredProperties: mockProperties,
    pagedProperties: mockProperties,
    totalCount: 2,
    loading: false,
    selectedPropertyIds: new Set<number>(),
    allSelected: false,
    onSelectAll: vi.fn(),
    onPropertySelect: vi.fn(),
    propertiesPage: 1,
    setPropertiesPage: vi.fn(),
    pageSize: 10,
    onPageSizeChange: vi.fn(),
    pageSizeOptions: [10, 20, 50, 100],
    searchTerm: '',
    onSearchChange: vi.fn(),
    selectedMenuItem: mockSelectedMenuItem,
    selectedCode: 'UPDATE_ADDRESS',
    fieldConfigs: mockFieldConfigs,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no menu item is selected', () => {
    render(<PropertyPreviewGrid {...defaultProps} selectedMenuItem={undefined} />);
    
    expect(screen.getByText('preview.selectFilters')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(<PropertyPreviewGrid {...defaultProps} loading={true} />);
    
    expect(screen.getByText('preview.loading')).toBeInTheDocument();
  });

  it('should render properties in MasterTable', () => {
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    expect(screen.getByText('P001')).toBeInTheDocument();
    expect(screen.getByText('P002')).toBeInTheDocument();
  });

  it('should show property count badge', () => {
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    expect(screen.getByText('2 preview.propertiesLoaded')).toBeInTheDocument();
  });

  it('should call onSelectAll when select all checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // First checkbox is select all
    
    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should call onPropertySelect when individual property checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Second checkbox is first property
    
    expect(defaultProps.onPropertySelect).toHaveBeenCalledWith(1, true);
  });

  it('should apply selected row styling', () => {
    const selectedIds = new Set([1]);
    const { container } = render(
      <PropertyPreviewGrid {...defaultProps} selectedPropertyIds={selectedIds} />
    );
    
    const selectedRow = container.querySelector('.bg-blue-50');
    expect(selectedRow).toBeInTheDocument();
  });

  it('should render empty state when no properties found', () => {
    render(
      <PropertyPreviewGrid
        {...defaultProps}
        properties={[]}
        filteredProperties={[]}
        pagedProperties={[]}
        totalCount={0}
      />
    );
    
    expect(screen.getByText('preview.noProperties')).toBeInTheDocument();
  });

  it('should enable pagination when totalPages > 1', () => {
    const manyProperties = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      wardNo: '1',
      propertyNo: `P${String(i + 1).padStart(3, '0')}`,
      partitionNo: '0',
      addressEnglish: `${i + 1} Main St`,
      address: `${i + 1} मेन स्ट्रीट`,
    }));

    render(
      <PropertyPreviewGrid
        {...defaultProps}
        properties={manyProperties}
        filteredProperties={manyProperties}
        pagedProperties={manyProperties.slice(0, 10)}
        totalCount={20}
      />
    );
    
    // MasterTable should show pagination controls
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display correct column headers', () => {
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    expect(screen.getByText('columns.wardNo')).toBeInTheDocument();
    expect(screen.getByText('columns.propertyNo')).toBeInTheDocument();
    expect(screen.getByText('columns.partitionNo')).toBeInTheDocument();
    expect(screen.getByText('columns.currentValuePrefix Address (English)')).toBeInTheDocument();
    expect(screen.getByText('columns.currentValuePrefix Address (Marathi)')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('preview.searchPlaceholder');
    expect(searchInput).toBeInTheDocument();
  });

  it('should call onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    render(<PropertyPreviewGrid {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('preview.searchPlaceholder');
    await user.type(searchInput, 'P001');
    
    expect(defaultProps.onSearchChange).toHaveBeenCalled();
  });

  it('should display search term in search input', () => {
    render(<PropertyPreviewGrid {...defaultProps} searchTerm="test search" />);
    
    const searchInput = screen.getByPlaceholderText('preview.searchPlaceholder') as HTMLInputElement;
    expect(searchInput.value).toBe('test search');
  });
});
