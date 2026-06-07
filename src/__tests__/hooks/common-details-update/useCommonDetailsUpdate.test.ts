import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCommonDetailsUpdate } from '@/hooks/commonDetailsUpdate/useCommonDetailsUpdate';
import * as useActions from '@/hooks/commonDetailsUpdate/useCommonDetailsUpdateActions';
import { BulkUpdateMaster, WardOption } from '@/types/common-details-update/common-details-update.types';
import { PagedResponse } from '@/types/common.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ 
    replace: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en/property-tax/common-details-update',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/commonDetailsUpdate/useCommonDetailsUpdateActions');

describe('useCommonDetailsUpdate', () => {
  const mockMenuItems: BulkUpdateMaster[] = [
    {
      id: 1,
      updateCode: 'UPDATE_ADDRESS',
      updateName: 'Update Address',
      updateNameMarathi: 'पत्ता अपडेट करा',
      iconName: 'MapPin',
      targetTable: 'Property',
      isActive: true,
      displaySequence: 1,
      apiRoute: '/api/bulk-update/address',
    },
    {
      id: 2,
      updateCode: 'UPDATE_OWNER',
      updateName: 'Update Owner Name',
      updateNameMarathi: 'मालकाचे नाव अपडेट करा',
      iconName: 'User',
      targetTable: 'Property',
      isActive: true,
      displaySequence: 2,
      apiRoute: '/api/bulk-update/owner',
    },
  ];

  const mockWardsData: PagedResponse<WardOption> = {
    items: [
      { id: 1, wardNo: '1', wardName: 'Ward 1' },
      { id: 2, wardNo: '2', wardName: 'Ward 2' },
    ],
    pageNumber: 1,
    pageSize: 100,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const mockWardOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
  ];

  const mockWingOptions = [
    { label: 'A', value: '1' },
    { label: 'B', value: '2' },
  ];

  const mockWingsData = {
    items: [
      { id: 1, wingNo: 'A', sequenceNo: 1, isActive: true },
      { id: 2, wingNo: 'B', sequenceNo: 2, isActive: true },
    ],
    pageNumber: 1,
    pageSize: 100,
    totalCount: 2,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const mockActions = {
    saving: false,
    loadFieldConfigs: vi.fn(),
    loadProperties: vi.fn(),
    loadWings: vi.fn(),
    loadAllWards: vi.fn(),
    loadPropertiesByWard: vi.fn(),
    loadAllWings: vi.fn(),
    handleBulkUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockActions.loadAllWards.mockImplementation((callback) => {
      callback(mockWardOptions);
      return Promise.resolve();
    });
    
    mockActions.loadAllWings.mockImplementation((callback) => {
      callback(mockWingOptions);
      return Promise.resolve();
    });
    
    mockActions.loadFieldConfigs.mockImplementation((_code, callback) => {
      callback([]);
      return Promise.resolve();
    });
    
    mockActions.loadProperties.mockImplementation((_params, callback) => {
      callback({
        items: [],
        pageNumber: 1,
        pageSize: 100,
        totalCount: 0,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      });
      return Promise.resolve();
    });
    
    mockActions.loadPropertiesByWard.mockImplementation((_wardId, callback) => {
      callback([]);
      return Promise.resolve();
    });
    
    mockActions.loadWings.mockImplementation((_wardId, callback) => {
      callback([]);
      return Promise.resolve();
    });
    
    vi.mocked(useActions.useCommonDetailsUpdateActions).mockReturnValue(mockActions);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    expect(result.current.selectedCode).toBe('UPDATE_ADDRESS');
    expect(result.current.menuSearch).toBe('');
    expect(result.current.properties).toEqual([]);
    expect(result.current.selectedPropertyIds.size).toBe(0);
    expect(result.current.filterSubmitted).toBe(false);
  });

  it('should filter menu items based on search', () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    act(() => {
      result.current.setMenuSearch('Address');
    });

    expect(result.current.filteredMenuItems).toHaveLength(1);
    expect(result.current.filteredMenuItems[0].updateCode).toBe('UPDATE_ADDRESS');
  });

  it('should return all menu items when search is empty', () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    expect(result.current.filteredMenuItems).toEqual(mockMenuItems);
  });

  it('should convert wards data to select options', async () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    // Ward options are loaded via loadAllWards callback
    await waitFor(() => {
      expect(result.current.wardOptions).toEqual(mockWardOptions);
    });
  });

  it('should handle menu select and load field configs', async () => {
    mockActions.loadFieldConfigs.mockImplementation((_code, onSuccess) => {
      onSuccess([
        {
          id: 1,
          bulkUpdateMasterId: 1,
          fieldName: 'addressEnglish',
          displayName: 'Address',
          displayNameMarathi: 'पत्ता',
          controlType: 'textbox',
          dataType: 'string',
          isRequired: true,
          defaultValue: '',
          validationRegex: null,
          sequenceNo: 1,
          isActive: true,
          isReadonly: false,
          bindApi: null,
        },
      ]);
      return Promise.resolve();
    });

    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    await act(async () => {
      await result.current.handleMenuSelect('UPDATE_OWNER');
    });

    expect(result.current.selectedCode).toBe('UPDATE_OWNER');
    expect(mockActions.loadFieldConfigs).toHaveBeenCalledWith('UPDATE_OWNER', expect.any(Function));
  });

  it('should not reload configs when selecting same menu item', async () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockActions.loadFieldConfigs).toHaveBeenCalledTimes(1);
    });

    const initialCallCount = mockActions.loadFieldConfigs.mock.calls.length;

    // Try to select the same item
    await act(async () => {
      await result.current.handleMenuSelect('UPDATE_ADDRESS');
    });

    // Should not call loadFieldConfigs again since it's the same code
    expect(mockActions.loadFieldConfigs).toHaveBeenCalledTimes(initialCallCount);
  });

  it('should handle ward change and load wings', async () => {
    mockActions.loadWings.mockImplementation((_wardId, onSuccess) => {
      onSuccess([
        { id: 1, wingName: 'A', wingNameMarathi: 'अ', wardId: 1 },
        { id: 2, wingName: 'B', wingNameMarathi: 'ब', wardId: 1 },
      ]);
      return Promise.resolve();
    });

    mockActions.loadPropertiesByWard.mockImplementation((_wardId, onSuccess) => {
      onSuccess([
        { label: 'P001', value: '1' },
        { label: 'P002', value: '2' },
      ]);
      return Promise.resolve();
    });

    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    await act(async () => {
      await result.current.handleWardChange('1');
    });

    expect(result.current.filterValues.wardId).toBe('1');
    expect(mockActions.loadWings).toHaveBeenCalledWith(1, expect.any(Function));
    // wingOptions now comes from loadAllWings (global), not per-ward
    expect(result.current.wingOptions).toHaveLength(2);
  });

  it('should clear dependent fields when ward is deselected', async () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    await act(async () => {
      await result.current.handleWardChange('');
    });

    expect(result.current.filterValues.wardId).toBe('');
    // wingOptions comes from loadAllWings, so it's still populated
    // but propertyOptions should be cleared
    expect(result.current.propertyOptions).toEqual([]);
  });

  it('should handle show properties', async () => {
    mockActions.loadProperties.mockImplementation((_params, onSuccess) => {
      onSuccess({
        items: [
          { id: 1, wardNo: '1', propertyNo: 'P001', partitionNo: '0' },
        ],
        pageNumber: 1,
        pageSize: 200,
        totalCount: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      });
      return Promise.resolve();
    });

    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    // All filter fields are required for canShowProperties to be true
    act(() => {
      result.current.setFilterValues({
        wardId: '1',
        fromPropertyNo: '1',
        toPropertyNo: '100',
        wingId: '1', // wingId is now required
      });
    });

    await act(async () => {
      await result.current.handleShowProperties();
    });

    expect(result.current.properties).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.filterSubmitted).toBe(true);
  });

  it('should not load properties if required filters are missing', async () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    // No filter values set - all are required (wardId, fromPropertyNo, toPropertyNo, wingId)
    await act(async () => {
      await result.current.handleShowProperties();
    });

    expect(mockActions.loadProperties).not.toHaveBeenCalled();
    expect(result.current.filterSubmitted).toBe(true); // filterSubmitted is set even on failed validation
  });

  it('should handle select all properties', async () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    // Set filter values - wingId is required
    act(() => {
      result.current.setFilterValues({
        wardId: '1',
        fromPropertyNo: '1',
        toPropertyNo: '100',
        wingId: '1',
      });
    });

    mockActions.loadProperties.mockImplementation((_params, onSuccess) => {
      onSuccess({
        items: [
          { id: 1, wardNo: '1', propertyNo: 'P001', partitionNo: '0' },
          { id: 2, wardNo: '1', propertyNo: 'P002', partitionNo: '0' },
        ],
        pageNumber: 1,
        pageSize: 200,
        totalCount: 2,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      });
      return Promise.resolve();
    });

    await act(async () => {
      await result.current.handleShowProperties();
    });

    // Select all
    act(() => {
      result.current.handleSelectAll();
    });

    expect(result.current.selectedPropertyIds.size).toBe(2);
    expect(result.current.allSelected).toBe(true);

    // Deselect all
    act(() => {
      result.current.handleSelectAll();
    });

    expect(result.current.selectedPropertyIds.size).toBe(0);
    expect(result.current.allSelected).toBe(false);
  });

  it('should handle individual property selection', () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    act(() => {
      result.current.handlePropertySelect(1, true);
    });

    expect(result.current.selectedPropertyIds.has(1)).toBe(true);

    act(() => {
      result.current.handlePropertySelect(1, false);
    });

    expect(result.current.selectedPropertyIds.has(1)).toBe(false);
  });

  it('should handle back button', () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    act(() => {
      result.current.setFilterValues({
        wardId: '1',
        fromPropertyNo: '1',
        toPropertyNo: '100',
        wingId: '1',
      });
    });

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.filterValues).toEqual({
      wardId: '',
      fromPropertyNo: '',
      toPropertyNo: '',
      wingId: '',
    });
    expect(result.current.properties).toEqual([]);
    expect(result.current.selectedPropertyIds.size).toBe(0);
  });

  it('should handle form value changes', () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    act(() => {
      result.current.handleFormValueChange('addressEnglish', 'New Address');
    });

    expect(result.current.formValues.addressEnglish).toBe('New Address');
  });

  it('should handle form clear', () => {
    mockActions.loadFieldConfigs.mockImplementation((_code, onSuccess) => {
      onSuccess([
        {
          id: 1,
          bulkUpdateMasterId: 1,
          fieldName: 'addressEnglish',
          displayName: 'Address',
          displayNameMarathi: 'पत्ता',
          controlType: 'textbox',
          dataType: 'string',
          isRequired: true,
          defaultValue: '',
          validationRegex: null,
          sequenceNo: 1,
          isActive: true,
          isReadonly: false,
          bindApi: null,
        },
      ]);
      return Promise.resolve();
    });

    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    act(() => {
      result.current.handleMenuSelect('UPDATE_OWNER');
    });

    act(() => {
      result.current.handleFormValueChange('addressEnglish', 'Test');
    });

    act(() => {
      result.current.handleFormClear();
    });

    expect(result.current.formValues.addressEnglish).toBe('');
    expect(result.current.formSubmitted).toBe(false);
  });

  it('should calculate paged properties correctly', async () => {
    const { result } = renderHook(() =>
      useCommonDetailsUpdate({ menuItems: mockMenuItems, wardsData: mockWardsData, wingsData: mockWingsData })
    );

    const manyProperties = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      wardNo: '1',
      propertyNo: `P${String(i + 1).padStart(3, '0')}`,
      partitionNo: '0',
    }));

    mockActions.loadProperties.mockImplementation((_params, onSuccess) => {
      onSuccess({
        items: manyProperties,
        pageNumber: 1,
        pageSize: 200,
        totalCount: 30,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      });
      return Promise.resolve();
    });

    act(() => {
      result.current.setFilterValues({
        wardId: '1',
        fromPropertyNo: '1',
        toPropertyNo: '100',
        wingId: '1', // wingId is required
      });
    });

    await act(async () => {
      await result.current.handleShowProperties();
    });

    // Default page size is 10
    expect(result.current.pagedProperties).toHaveLength(10);

    act(() => {
      result.current.setPropertiesPage(2);
    });

    expect(result.current.pagedProperties).toHaveLength(10);

    act(() => {
      result.current.setPropertiesPage(3);
    });

    expect(result.current.pagedProperties).toHaveLength(10);
  });
});
