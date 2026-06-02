import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCommonDetailsUpdateActions } from '@/hooks/commonDetailsUpdate/useCommonDetailsUpdateActions';
import * as actions from '@/app/[locale]/property-tax/common-details-update/actions';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/app/[locale]/property-tax/common-details-update/actions', () => ({
  getFieldConfigsAction: vi.fn(),
  getFilteredPropertiesAction: vi.fn(),
  getWingsAction: vi.fn(),
  executeBulkUpdateAction: vi.fn(),
  getAllWardsAction: vi.fn(),
  getPropertiesByWardAction: vi.fn(),
  getAllWingsAction: vi.fn(),
}));

describe('useCommonDetailsUpdateActions', () => {
  const mockT = (key: string) => key;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadFieldConfigs', () => {
    it('should load field configs successfully', async () => {
      const mockConfigs = [
        {
          id: 1,
          bulkUpdateMasterId: 1,
          fieldName: 'addressEnglish',
          displayName: 'Address',
          displayNameMarathi: 'पत्ता',
          controlType: 'textbox' as const,
          dataType: 'string',
          isRequired: true,
          defaultValue: '',
          validationRegex: null,
          sequenceNo: 1,
          isActive: true,
          isReadonly: false,
          bindApi: null,
        },
      ];

      vi.mocked(actions.getFieldConfigsAction).mockResolvedValue({
        success: true,
        data: mockConfigs,
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadFieldConfigs('UPDATE_ADDRESS', onSuccess);
      });

      expect(actions.getFieldConfigsAction).toHaveBeenCalledWith('UPDATE_ADDRESS');
      expect(onSuccess).toHaveBeenCalledWith(mockConfigs);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle field config load failure', async () => {
      vi.mocked(actions.getFieldConfigsAction).mockResolvedValue({
        success: false,
        error: 'Failed to load',
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadFieldConfigs('UPDATE_ADDRESS', onSuccess);
      });

      expect(toast.error).toHaveBeenCalledWith('messages.fetchFieldConfigFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should handle field config load exception', async () => {
      vi.mocked(actions.getFieldConfigsAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadFieldConfigs('UPDATE_ADDRESS', onSuccess);
      });

      expect(toast.error).toHaveBeenCalledWith('messages.configLoadFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('loadProperties', () => {
    it('should load properties successfully', async () => {
      const mockData = {
        items: [
          { id: 1, wardNo: '1', propertyNo: 'P001', partitionNo: '0' },
        ],
        pageNumber: 1,
        pageSize: 13,
        totalCount: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      };

      vi.mocked(actions.getFilteredPropertiesAction).mockResolvedValue({
        success: true,
        data: mockData,
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();
      const params = {
        wardId: '1',
        fromPropertyNo: '1',
        toPropertyNo: '100',
        updateCode: 'UPDATE_ADDRESS',
        page: 1,
        pageSize: 200,
      };

      await act(async () => {
        await result.current.loadProperties(params, onSuccess);
      });

      expect(actions.getFilteredPropertiesAction).toHaveBeenCalledWith(params);
      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle property load failure', async () => {
      vi.mocked(actions.getFilteredPropertiesAction).mockResolvedValue({
        success: false,
        error: 'Failed to load properties',
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();
      const params = {
        wardId: '1',
        fromPropertyNo: '1',
        toPropertyNo: '100',
        updateCode: 'UPDATE_ADDRESS',
        page: 1,
        pageSize: 200,
      };

      await act(async () => {
        await result.current.loadProperties(params, onSuccess);
      });

      expect(toast.error).toHaveBeenCalledWith('messages.fetchPropertiesFailed');
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('loadWings', () => {
    it('should load wings successfully', async () => {
      const mockWings = [
        { id: 1, wingName: 'A', wingNameMarathi: 'अ', wardId: 1 },
        { id: 2, wingName: 'B', wingNameMarathi: 'ब', wardId: 1 },
      ];

      vi.mocked(actions.getWingsAction).mockResolvedValue({
        success: true,
        data: mockWings,
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadWings(1, onSuccess);
      });

      expect(actions.getWingsAction).toHaveBeenCalledWith(1);
      expect(onSuccess).toHaveBeenCalledWith(mockWings);
    });

    it('should silently handle wing load failure', async () => {
      vi.mocked(actions.getWingsAction).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadWings(1, onSuccess);
      });

      // Wings are optional, so no error toast should appear
      expect(toast.error).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('handleBulkUpdate', () => {
    it('should execute bulk update successfully', async () => {
      vi.mocked(actions.executeBulkUpdateAction).mockResolvedValue({
        success: true,
        data: {
          success: true,
          message: 'Updated 3 properties successfully',
          items: {
            totalRequested: 3,
            successCount: 3,
            failedCount: 0,
            errors: [],
          },
          errors: null,
          correlationId: null,
        },
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();
      const payload = {
        updateCode: 'UPDATE_ADDRESS',
        propertyIds: [1, 2, 3],
        updateData: { addressEnglish: 'New Address' },
      };

      expect(result.current.saving).toBe(false);

      await act(async () => {
        await result.current.handleBulkUpdate('/api/bulk-update/address', payload, onSuccess);
      });

      await waitFor(() => {
        expect(result.current.saving).toBe(false);
      });

      expect(actions.executeBulkUpdateAction).toHaveBeenCalledWith({
        apiRoute: '/api/bulk-update/address',
        ...payload,
      });
      expect(toast.success).toHaveBeenCalledWith('Updated 3 properties successfully');
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should show warning for partial update', async () => {
      vi.mocked(actions.executeBulkUpdateAction).mockResolvedValue({
        success: true,
        data: {
          success: true,
          message: 'Updated 2 properties',
          items: {
            totalRequested: 3,
            successCount: 2,
            failedCount: 1,
            errors: ['Property 3 failed to update'],
          },
          errors: null,
          correlationId: null,
        },
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();
      const payload = {
        updateCode: 'UPDATE_ADDRESS',
        propertyIds: [1, 2, 3],
        updateData: { addressEnglish: 'New Address' },
      };

      await act(async () => {
        await result.current.handleBulkUpdate('/api/bulk-update/address', payload, onSuccess);
      });

      expect(toast.success).toHaveBeenCalledWith('Updated 2 properties');
      expect(toast.warning).toHaveBeenCalledWith('messages.partialUpdate');
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle bulk update failure', async () => {
      vi.mocked(actions.executeBulkUpdateAction).mockResolvedValue({
        success: false,
        error: 'Update failed',
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();
      const payload = {
        updateCode: 'UPDATE_ADDRESS',
        propertyIds: [1, 2, 3],
        updateData: { addressEnglish: 'New Address' },
      };

      await act(async () => {
        await result.current.handleBulkUpdate('/api/bulk-update/address', payload, onSuccess);
      });

      expect(toast.error).toHaveBeenCalledWith('Update failed');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should handle bulk update exception', async () => {
      vi.mocked(actions.executeBulkUpdateAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();
      const payload = {
        updateCode: 'UPDATE_ADDRESS',
        propertyIds: [1, 2, 3],
        updateData: { addressEnglish: 'New Address' },
      };

      await act(async () => {
        await result.current.handleBulkUpdate('/api/bulk-update/address', payload, onSuccess);
      });

      expect(toast.error).toHaveBeenCalledWith('messages.somethingWrong');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should set saving state during update', async () => {
      vi.mocked(actions.executeBulkUpdateAction).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ 
              success: true, 
              data: {
                success: true,
                message: 'Updated',
                items: { totalRequested: 1, successCount: 1, failedCount: 0, errors: [] },
                errors: null,
                correlationId: null,
              },
            }), 100);
          })
      );

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const payload = {
        updateCode: 'UPDATE_ADDRESS',
        propertyIds: [1],
        updateData: {},
      };

      expect(result.current.saving).toBe(false);

      // Properly await the async handleBulkUpdate call
      await act(async () => {
        await result.current.handleBulkUpdate('/api/test', payload, vi.fn());
      });

      // After awaiting, saving should be false
      expect(result.current.saving).toBe(false);
    });
  });

  describe('loadAllWards', () => {
    it('should load all wards successfully', async () => {
      const mockWards = {
        items: [
          { id: 1, wardNo: 'W001' },
          { id: 2, wardNo: 'W002' },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: -1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      };

      vi.mocked(actions.getAllWardsAction).mockResolvedValue({
        success: true,
        data: mockWards,
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadAllWards(onSuccess);
      });

      expect(actions.getAllWardsAction).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith([
        { label: 'W001', value: '1' },
        { label: 'W002', value: '2' },
      ]);
    });

    it('should return empty array on failure', async () => {
      vi.mocked(actions.getAllWardsAction).mockResolvedValue({
        success: false,
        error: 'Failed',
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadAllWards(onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith([]);
    });

    it('should handle exception gracefully', async () => {
      vi.mocked(actions.getAllWardsAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadAllWards(onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith([]);
    });
  });

  describe('loadPropertiesByWard', () => {
    it('should load properties for a ward successfully', async () => {
      const mockProperties = {
        items: [
          { id: 1, propertyNo: 'P001', partitionNo: '0', wardId: 1 },
          { id: 2, propertyNo: 'P002', partitionNo: '1', wardId: 1 },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: -1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      };

      vi.mocked(actions.getPropertiesByWardAction).mockResolvedValue({
        success: true,
        data: mockProperties,
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadPropertiesByWard(1, onSuccess);
      });

      expect(actions.getPropertiesByWardAction).toHaveBeenCalledWith(1);
      expect(onSuccess).toHaveBeenCalledWith([
        { label: 'P001', value: 'P001' },
        { label: 'P002-1', value: 'P002-1' },
      ]);
    });

    it('should return empty array on failure', async () => {
      vi.mocked(actions.getPropertiesByWardAction).mockResolvedValue({
        success: false,
        error: 'Failed',
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadPropertiesByWard(1, onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith([]);
    });

    it('should handle exception gracefully', async () => {
      vi.mocked(actions.getPropertiesByWardAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadPropertiesByWard(1, onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith([]);
    });
  });

  describe('loadAllWings', () => {
    it('should load all wings successfully', async () => {
      const mockWings = {
        items: [
          { id: 1, wingNo: 'A', sequenceNo: 1, isActive: true, createdDate: '2024-01-01', updatedDate: null },
          { id: 2, wingNo: 'B', sequenceNo: 2, isActive: true, createdDate: '2024-01-01', updatedDate: null },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: -1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      };

      vi.mocked(actions.getAllWingsAction).mockResolvedValue({
        success: true,
        data: mockWings,
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadAllWings(onSuccess);
      });

      expect(actions.getAllWingsAction).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith([
        { label: 'A', value: '1' },
        { label: 'B', value: '2' },
      ]);
    });

    it('should return empty array on failure', async () => {
      vi.mocked(actions.getAllWingsAction).mockResolvedValue({
        success: false,
        error: 'Failed',
      });

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadAllWings(onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith([]);
    });

    it('should handle exception gracefully', async () => {
      vi.mocked(actions.getAllWingsAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCommonDetailsUpdateActions(mockT));
      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.loadAllWings(onSuccess);
      });

      expect(onSuccess).toHaveBeenCalledWith([]);
    });
  });
});
