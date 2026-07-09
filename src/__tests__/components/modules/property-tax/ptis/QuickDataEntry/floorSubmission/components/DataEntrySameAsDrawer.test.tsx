import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataEntrySameAsDrawer } from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components/DataEntrySameAsDrawer';
import { useDataEntrySameAs } from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components/useDataEntrySameAs';

vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components/useDataEntrySameAs', () => ({
  useDataEntrySameAs: vi.fn(),
}));

vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components/TypeWiseTab', () => ({
  TypeWiseTab: ({ onApply, onApplyTypeSubmission }: any) => (
    <div data-testid="type-wise-tab">
      <button data-testid="apply-types-btn" onClick={onApply}>Apply Types</button>
      <button data-testid="apply-type-submission-btn" onClick={onApplyTypeSubmission}>Apply Submission</button>
    </div>
  ),
}));

vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components/PropertyWiseTab', () => ({
  PropertyWiseTab: ({ onApply }: any) => (
    <div data-testid="property-wise-tab">
      <button data-testid="apply-property-btn" onClick={onApply}>Apply Property</button>
    </div>
  ),
}));

vi.mock('@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/components/ParkingTab', () => ({
  ParkingTab: ({ onApply }: any) => (
    <div data-testid="parking-tab">
      <button data-testid="apply-parking-btn" onClick={onApply}>Apply Parking</button>
    </div>
  ),
}));

vi.mock('@/components/common', () => ({
  Drawer: ({ open, onClose, title, headerExtra, children }: any) => (
    open ? (
      <div data-testid="drawer">
        <div data-testid="drawer-title">{title}</div>
        <div data-testid="drawer-header-extra">{headerExtra}</div>
        <button data-testid="drawer-close" onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null
  ),
  Tabs: Object.assign(
    ({ value, children }: any) => {
      return (
        <div data-testid="tabs" data-value={value}>
          {children}
        </div>
      );
    },
    {
      TabList: ({ children }: any) => <div data-testid="tab-list">{children}</div>,
      Tab: ({ value, children, onClick }: any) => (
        <button data-testid={`tab-btn-${value}`} onClick={onClick}>
          {children}
        </button>
      ),
      TabPanel: ({ value, children }: any) => (
        <div data-testid={`tab-panel-${value}`}>{children}</div>
      ),
    }
  ),
}));

describe('DataEntrySameAsDrawer', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    t: (key: string) => key,
    wardId: 1,
    wardNo: 'W1',
    propertyNo: 'P1',
    partitionNo: '101',
    initialPropertyID: 123,
    filteredFloors: [],
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

  const defaultHookReturn = {
    dataEntrySameAsTab: 'type-wise',
    setDataEntrySameAsTab: vi.fn(),
    selectableProperties: [],
    selectedPropertyIds: new Set(),
    isLoadingProperties: false,
    currentPropertyType: 'Residential',
    searchWardId: '1',
    searchPropertyNo: 'P1',
    setSearchPropertyNo: vi.fn(),
    wardOptions: [],
    isFetchingWards: false,
    propertyOptions: [],
    isFetchingProperties: false,
    sanitizeWardNo: vi.fn((v) => v),
    sanitizePropertyNo: vi.fn((v) => v),
    handleWardChange: vi.fn(),
    handleSearchProperties: vi.fn(),
    isApplyingSameAs: false,
    handleApplySameAsDetails: vi.fn(),
    filterPropertiesForTable: vi.fn((props) => props),
    sourcePropertyIds: new Set([123]),
    typeWiseLockedPropertyIds: new Set([123]),
    activeLockedPropertyIds: new Set([123]),
    handleTogglePropertySelection: vi.fn(),
    handleToggleMultipleProperties: vi.fn(),
    handleClearPropertySelection: vi.fn(),
    changeTypeInput: 'Residential',
    setChangeTypeInput: vi.fn(),
    isApplyingTypeSubmission: false,
    handleApplyTypeSubmission: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDataEntrySameAs).mockReturnValue(defaultHookReturn as any);
  });

  it('renders title and tabs list when open', () => {
    render(<DataEntrySameAsDrawer {...mockProps} />);

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('floor.dataEntry');
    expect(screen.getByTestId('tab-btn-type-wise')).toBeInTheDocument();
    expect(screen.getByTestId('tab-btn-property-wise')).toBeInTheDocument();
    expect(screen.getByTestId('tab-btn-parking')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DataEntrySameAsDrawer {...mockProps} isOpen={false} />);
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    render(<DataEntrySameAsDrawer {...mockProps} />);
    fireEvent.click(screen.getByTestId('drawer-close'));
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders TypeWiseTab and propagates apply handlers', () => {
    const applyMock = vi.fn();
    const applySubmissionMock = vi.fn();
    vi.mocked(useDataEntrySameAs).mockReturnValue({
      ...defaultHookReturn,
      dataEntrySameAsTab: 'type-wise',
      handleApplySameAsDetails: applyMock,
      handleApplyTypeSubmission: applySubmissionMock,
    } as any);

    render(<DataEntrySameAsDrawer {...mockProps} />);

    expect(screen.getByTestId('type-wise-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('apply-types-btn'));
    expect(applyMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('apply-type-submission-btn'));
    expect(applySubmissionMock).toHaveBeenCalledTimes(1);
  });

  it('renders PropertyWiseTab and propagates apply handler', () => {
    const applyMock = vi.fn();
    vi.mocked(useDataEntrySameAs).mockReturnValue({
      ...defaultHookReturn,
      dataEntrySameAsTab: 'property-wise',
      handleApplySameAsDetails: applyMock,
    } as any);

    render(<DataEntrySameAsDrawer {...mockProps} />);

    expect(screen.getByTestId('property-wise-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('apply-property-btn'));
    expect(applyMock).toHaveBeenCalledTimes(1);
  });

  it('renders ParkingTab and propagates apply handler', () => {
    const applyMock = vi.fn();
    vi.mocked(useDataEntrySameAs).mockReturnValue({
      ...defaultHookReturn,
      dataEntrySameAsTab: 'parking',
      handleApplySameAsDetails: applyMock,
    } as any);

    render(<DataEntrySameAsDrawer {...mockProps} />);

    expect(screen.getByTestId('parking-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('apply-parking-btn'));
    expect(applyMock).toHaveBeenCalledTimes(1);
  });
});
