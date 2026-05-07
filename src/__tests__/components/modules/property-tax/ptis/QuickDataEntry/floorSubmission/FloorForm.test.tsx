import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FloorForm from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/FloorForm';

// Mock all section components
vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components', () => ({
  BasicInfoSection: () => <div data-testid="basic-info-section">Basic Info</div>,
  UsageSection: () => <div data-testid="usage-section">Usage</div>,
  RenterSection: () => <div data-testid="renter-section">Renter</div>,
  AreaSection: () => <div data-testid="area-section">Area</div>,
}));

vi.mock('@/components/common', () => ({
  Button: ({ label, children, onClick, disabled, isLoading }: { label?: string; children?: React.ReactNode; onClick: () => void; disabled?: boolean; isLoading?: boolean }) => (
    <button onClick={onClick} disabled={disabled || isLoading}>{children || label}</button>
  ),
  IconButton: ({ onClick, icon: Icon }: { onClick: () => void; icon: React.ComponentType }) => (
    <button onClick={onClick} data-testid="icon-button"><Icon /></button>
  ),
}));

vi.mock('lucide-react', () => ({
  Edit2: () => <div>Edit Icon</div>,
  X: () => <div>X Icon</div>,
}));

describe('FloorForm', () => {
  const mockProps = {
    t: (key: string) => key,
    isAddingNewFloor: false,
    editingFloorForm: {
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
    setEditingFloorForm: vi.fn(),
    formErrors: {},
    setFormErrors: vi.fn(),
    resetForm: vi.fn(),
    handleOpenDropdown: vi.fn(),
    handleOpenRenterManagement: vi.fn(),
    updateUrlParams: vi.fn(),
    isOperationLoading: false,
    startTransition: vi.fn((fn: () => void) => fn()),
    roomsInputRef: { current: null },
    areaInputRef: { current: null },
    floorOptions: ['Ground Floor', 'First Floor'],
    floorLookup: [],
    subFloorOptions: ['None', 'Mezzanine'],
    subFloorLookup: [],
    constructionTypeOptions: ['RCC', 'PCC'],
    constructionLookup: [],
    useOptions: ['Residential', 'Commercial'],
    useLookup: [],
    subTypeOptionsFromData: ['Apartment', 'Villa'],
    subTypeData: [],
    setShowRoomSubmission: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form sections', () => {
    render(<FloorForm {...mockProps} />);
    
    expect(screen.getByTestId('basic-info-section')).toBeInTheDocument();
    expect(screen.getByTestId('usage-section')).toBeInTheDocument();
    expect(screen.getByTestId('renter-section')).toBeInTheDocument();
    expect(screen.getByTestId('area-section')).toBeInTheDocument();
  });

  it('displays correct title when adding new floor', () => {
    const propsForAdding = { ...mockProps, isAddingNewFloor: true };
    render(<FloorForm {...propsForAdding} />);
    
    expect(screen.getByText('floor.addFloorDetails')).toBeInTheDocument();
  });

  it('displays correct title when editing floor', () => {
    render(<FloorForm {...mockProps} />);
    
    expect(screen.getByText('floor.editFloorDetails')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<FloorForm {...mockProps} />);
    
    expect(screen.getByText('floor.updateFloor')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<FloorForm {...mockProps} />);
    
    const cancelButtons = screen.getAllByRole('button');
    expect(cancelButtons.length).toBeGreaterThan(0);
  });

  it('calls onSave when save button is clicked', () => {
    render(<FloorForm {...mockProps} />);
    
    const saveButton = screen.getByText('floor.updateFloor');
    fireEvent.click(saveButton);
    
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('calls resetForm when cancel button is clicked', () => {
    render(<FloorForm {...mockProps} />);
    
    // Find X icon button (cancel button)
    const cancelButton = screen.getByTestId('icon-button');
    fireEvent.click(cancelButton);
    
    expect(mockProps.resetForm).toHaveBeenCalled();
  });

  it('disables save button when operation is loading', () => {
    const propsWithLoading = { ...mockProps, isOperationLoading: true };
    render(<FloorForm {...propsWithLoading} />);
    
    const saveButton = screen.getByText('floor.updateFloor');
    expect(saveButton).toBeDisabled();
  });

  it('shows correct button text when saving', () => {
    const propsWithLoading = { ...mockProps, isOperationLoading: true };
    render(<FloorForm {...propsWithLoading} />);
    
    // Button text stays the same but shows loading spinner
    expect(screen.getByText('floor.updateFloor')).toBeInTheDocument();
    expect(screen.getByText('floor.updateFloor')).toBeDisabled();
  });

  it('uses correct button label for new floor', () => {
    const propsForAdding = { ...mockProps, isAddingNewFloor: true };
    render(<FloorForm {...propsForAdding} />);
    
    expect(screen.getByText('floor.add')).toBeInTheDocument();
  });
});
