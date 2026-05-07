import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FloorTable from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/FloorTable';
import { FloorData } from '@/types/room-details.types';

interface MockColumn {
  key: string;
  label?: string;
  render?: (val: unknown) => React.ReactNode;
}

interface MockMasterTableProps {
  data: FloorData[];
  columns: MockColumn[];
  renderActions?: (row: FloorData) => React.ReactNode;
  getRowKey: (row: FloorData) => string | number;
  rowClassName?: string | ((row: FloorData) => string);
  emptyText?: string;
}

// Mock all dependencies
vi.mock('@/components/common', () => ({
  AddButton: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} data-testid="add-floor-button">{label}</button>
  ),
  MasterTable: ({ data, columns, renderActions, getRowKey, rowClassName, emptyText }: MockMasterTableProps) => (
    <div data-testid="master-table">
      {data.length === 0 ? (
        <div data-testid="empty-text">{emptyText}</div>
      ) : (
        <table>
          <tbody>
            {data.map((row: FloorData, _index: number) => (
              <tr key={getRowKey(row)} className={typeof rowClassName === 'function' ? rowClassName(row) : rowClassName}>
                {columns.map((col: MockColumn) => (
                  <td key={col.key}>{col.render ? col.render(row[col.key as keyof FloorData]) : String(row[col.key as keyof FloorData] ?? '')}</td>
                ))}
                {renderActions && <td>{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  ),
  SearchInput: ({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder: string }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
  DeleteButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} data-testid="delete-button">Delete</button>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Layers: () => <div>Layers Icon</div>,
}));

vi.mock('@/lib/utils/floorSubmission/floor-mappers', () => ({
  getFloorDescription: (val: string) => `Floor ${val}`,
  getSubFloorDescription: (val: string) => `SubFloor ${val}`,
  getConstructionDescription: (val: string) => `Construction ${val}`,
  getUseDescription: (val: string) => `Use ${val}`,
  getSubTypeDescription: (val: string) => `SubType ${val}`,
  getTypeOfUseId: (floor: FloorData) => floor.use || null,
  normalizeFloorFormData: (floor: FloorData) => floor,
}));


vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/FloorTableColumns', () => ({
  useFloorTableColumns: () => [
    { key: 'floor', label: 'Floor', render: (val: unknown) => val },
    { key: 'areaSqFt', label: 'Area', render: (val: unknown) => val },
  ],
  renderFloorActions: (_t: (key: string) => string, handleDelete: (row: FloorData) => void) => (row: FloorData) => (
    <button onClick={() => handleDelete(row)} data-testid="delete-action">Delete</button>
  ),
}));

describe('FloorTable', () => {
  const mockFloorData: FloorData[] = [
    {
      id: 1,
      floor: 'Ground Floor',
      subFloor: 'None',
      conYr: '2020',
      asstYr: '2021',
      conTyp: 'RCC',
      use: 'Residential',
      subTyp: 'Apartment',
      rooms: '5',
      areaSqFt: '1000',
      areaSqM: '92.9',
      builtupAreaSqFt: '1200',
      builtupAreaSqM: '111.5',
      renter: false,
    },
    {
      id: 2,
      floor: 'First Floor',
      subFloor: 'None',
      conYr: '2020',
      asstYr: '2021',
      conTyp: 'RCC',
      use: 'Commercial',
      subTyp: 'Office',
      rooms: '3',
      areaSqFt: '800',
      areaSqM: '74.3',
      builtupAreaSqFt: '900',
      builtupAreaSqM: '83.6',
      renter: true,
    },
  ];

  const mockProps = {
    t: (key: string) => key,
    filteredFloors: mockFloorData,
    floorSearch: '',
    setFloorSearch: vi.fn(),
    selectedFloor: null,
    setSelectedFloor: vi.fn(),
    isAddingNewFloor: false,
    setIsAddingNewFloor: vi.fn(),
    handleAddFloor: vi.fn(),
    updateUrlParams: vi.fn(),
    handleDeleteFloor: vi.fn(),
    startTransition: vi.fn((fn: () => void) => fn()),
    setFormErrors: vi.fn(),
    floorLookup: [],
    subFloorLookup: [],
    constructionLookup: [],
    useLookup: [],
    subTypeData: [],
    setEditingFloorForm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floor table with data', () => {
    render(<FloorTable {...mockProps} />);
    
    expect(screen.getByTestId('master-table')).toBeInTheDocument();
    expect(screen.getByText('floor.allFloors')).toBeInTheDocument();
  });

  it('displays floor count badge', () => {
    render(<FloorTable {...mockProps} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 floors in mockFloorData
  });

  it('renders search input', () => {
    render(<FloorTable {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'floor.searchFloors');
  });

  it('calls setFloorSearch when search input changes', () => {
    render(<FloorTable {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Ground' } });
    
    expect(mockProps.setFloorSearch).toHaveBeenCalledWith('Ground');
  });

  it('renders add floor button', () => {
    render(<FloorTable {...mockProps} />);
    
    const addButton = screen.getByTestId('add-floor-button');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('floor.addFloor');
  });

  it('calls handleAddFloor when add button is clicked', () => {
    render(<FloorTable {...mockProps} />);
    
    const addButton = screen.getByTestId('add-floor-button');
    fireEvent.click(addButton);
    
    expect(mockProps.handleAddFloor).toHaveBeenCalled();
  });

  it('handles row click to select floor', () => {
    render(<FloorTable {...mockProps} />);
    
    const table = screen.getByTestId('master-table');
    const firstRow = table.querySelector('tbody tr');
    
    if (firstRow) {
      fireEvent.click(firstRow);
      
      expect(mockProps.setEditingFloorForm).toHaveBeenCalledWith(mockFloorData[0]);
      expect(mockProps.setSelectedFloor).toHaveBeenCalledWith(mockFloorData[0]);
      expect(mockProps.setIsAddingNewFloor).toHaveBeenCalledWith(false);
    }
  });

  it('calls handleDeleteFloor when delete action is clicked', () => {
    render(<FloorTable {...mockProps} />);
    
    const deleteButtons = screen.getAllByTestId('delete-action');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockProps.handleDeleteFloor).toHaveBeenCalledWith(mockFloorData[0]);
  });

  it('displays no floors message when filteredFloors is empty', () => {
    const emptyProps = { ...mockProps, filteredFloors: [] };
    render(<FloorTable {...emptyProps} />);
    
    expect(screen.getByText('floor.noFloorsFound')).toBeInTheDocument();
  });

  it('highlights selected floor row', () => {
    const propsWithSelection = { 
      ...mockProps, 
      selectedFloor: mockFloorData[0],
      isAddingNewFloor: false,
    };
    render(<FloorTable {...propsWithSelection} />);
    
    const table = screen.getByTestId('master-table');
    const firstRow = table.querySelector('tbody tr');
    
    expect(firstRow?.className).toContain('bg-blue-100/70');
  });

  it('does not highlight row when adding new floor', () => {
    const propsWithNewFloor = { 
      ...mockProps, 
      selectedFloor: mockFloorData[0],
      isAddingNewFloor: true,
    };
    render(<FloorTable {...propsWithNewFloor} />);
    
    const table = screen.getByTestId('master-table');
    const firstRow = table.querySelector('tbody tr');
    
    expect(firstRow?.className).not.toContain('bg-blue-100/70');
  });

  it('updates URL params when floor is selected', () => {
    render(<FloorTable {...mockProps} />);
    
    const table = screen.getByTestId('master-table');
    const firstRow = table.querySelector('tbody tr');
    
    if (firstRow) {
      fireEvent.click(firstRow);
      
      expect(mockProps.updateUrlParams).toHaveBeenCalledWith({
        floorId: '1',
        typeOfUseId: 'Residential',
      });
    }
  });

  it('clears form errors when floor is selected', () => {
    render(<FloorTable {...mockProps} />);
    
    const table = screen.getByTestId('master-table');
    const firstRow = table.querySelector('tbody tr');
    
    if (firstRow) {
      fireEvent.click(firstRow);
      
      expect(mockProps.setFormErrors).toHaveBeenCalledWith({});
    }
  });
});
