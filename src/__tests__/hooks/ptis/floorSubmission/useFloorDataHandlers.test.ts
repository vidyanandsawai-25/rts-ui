import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFloorDataHandlers } from '@/hooks/ptis/floorSubmission/useFloorDataHandlers';
import { toast } from 'sonner';
import type { FloorData } from '@/types/room-details.types';
import {
  createMockFloorData,
  createDefaultFloorDataHandlersParams,
} from '@/__tests__/utils/floorSubmissionTestUtils';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions', () => ({
  submitFloorSubmissionNoRedirectAction: vi.fn(),
  updateFloorSubmissionNoRedirectAction: vi.fn(),
  deleteFloorSubmissionNoRedirectAction: vi.fn(),
}));

vi.mock('@/lib/utils/floorSubmission/floor-mappers', () => ({
  mapFormToPayload: vi.fn(() => ({
    floorID: 1,
    propertyID: 123,
    constructionYear: 2020,
  })),
}));

import {
  submitFloorSubmissionNoRedirectAction,
  updateFloorSubmissionNoRedirectAction,
  deleteFloorSubmissionNoRedirectAction,
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

describe('useFloorDataHandlers', () => {
  // Store mocks for assertions
  let testParams: ReturnType<typeof createDefaultFloorDataHandlersParams>;

  beforeEach(() => {
    vi.clearAllMocks();
    testParams = createDefaultFloorDataHandlersParams();
    
    // Mock window.location.reload to prevent JSDOM errors
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        reload: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // Ensure timers are reset after each test
  });

  const getDefaultParams = (overrides = {}) => ({
    ...testParams,
    ...overrides,
  });

  describe('handleSave', () => {
    it('should save a new floor successfully', async () => {
      vi.mocked(submitFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: true,
        data: { id: 100 },
      });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: true,
      })));

      await act(async () => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(testParams.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'add',
            title: 'floor.addConfirmTitle',
          })
        );
      });

      await waitFor(() => {
        expect(submitFloorSubmissionNoRedirectAction).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('floor.floorAddedSuccess');
        expect(testParams.setIsAddingNewFloor).toHaveBeenCalledWith(false);
        expect(testParams.setSelectedFloor).toHaveBeenCalledWith(null);
        expect(testParams.router.refresh).toHaveBeenCalled();
      });
    });

    it('should update an existing floor successfully', async () => {
      vi.mocked(updateFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: true,
        data: { id: 1 },
      });

      const selectedFloor = createMockFloorData({ id: 1 });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: false,
        selectedFloor,
      })));

      await act(async () => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(testParams.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'update',
            title: 'floor.updateConfirmTitle',
          })
        );
      });

      await waitFor(() => {
        expect(updateFloorSubmissionNoRedirectAction).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('floor.floorUpdatedSuccess');
        expect(testParams.router.refresh).toHaveBeenCalled();
      });
    });

    it('should handle API errors during save', async () => {
      vi.mocked(submitFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const localFloors = [createMockFloorData()];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: true,
        localFloors,
      })));

      await act(async () => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
        // Should revert optimistic update
        expect(testParams.setLocalFloors).toHaveBeenCalledWith(localFloors);
      });
    });

    it('should prevent double-click race condition', async () => {
      vi.useFakeTimers();

      vi.mocked(submitFloorSubmissionNoRedirectAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100))
      );

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: true,
      })));

      // First call
      act(() => {
        result.current.handleSave();
      });

      // Second call (should be ignored due to isSavingRef)
      act(() => {
        result.current.handleSave();
      });

      // Fast-forward timers
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should only be called once
      expect(vi.mocked(submitFloorSubmissionNoRedirectAction)).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should perform optimistic update', async () => {
      vi.mocked(submitFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: true,
        data: { id: 100 },
      });

      const localFloors: FloorData[] = [];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: true,
        localFloors,
      })));

      await act(async () => {
        result.current.handleSave();
      });

      await waitFor(() => {
        // Check optimistic update was performed
        expect(testParams.setLocalFloors).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              floor: testParams.editingFloorForm.floor,
              id: expect.any(Number),
            }),
          ])
        );
      });
    });
  });

  describe('handleDeleteFloor', () => {
    it('should delete a temporary floor without API call', async () => {
      const tempFloor: FloorData = createMockFloorData({ id: Date.now() });
      const localFloors = [tempFloor];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors,
      })));

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          search: '?floorId=123',
          pathname: '/test',
        },
        writable: true,
      });

      await act(async () => {
        result.current.handleDeleteFloor(tempFloor);
      });

      await waitFor(() => {
        expect(testParams.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'delete',
            title: 'floor.deleteConfirmTitle',
          })
        );
      });

      await waitFor(() => {
        expect(deleteFloorSubmissionNoRedirectAction).not.toHaveBeenCalled();
        expect(testParams.setLocalFloors).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('floor.floorDeletedSuccess');
      });
    });

    it('should delete a persistent floor with API call', async () => {
      vi.mocked(deleteFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: true,
      });

      const persistentFloor: FloorData = createMockFloorData({ id: 1 });
      const localFloors = [persistentFloor];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors,
      })));

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          search: '?floorId=1',
          pathname: '/test',
        },
        writable: true,
      });

      await act(async () => {
        result.current.handleDeleteFloor(persistentFloor);
      });

      await waitFor(() => {
        expect(deleteFloorSubmissionNoRedirectAction).toHaveBeenCalledWith('1', 'en', '123');
        expect(testParams.setLocalFloors).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('floor.floorDeletedSuccess');
        expect(testParams.router.replace).toHaveBeenCalled();
      });
    });

    it('should handle delete API errors', async () => {
      vi.mocked(deleteFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: false,
        error: 'Cannot delete floor',
      });

      const persistentFloor: FloorData = createMockFloorData({ id: 1 });
      const localFloors = [persistentFloor];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors,
      })));

      await act(async () => {
        result.current.handleDeleteFloor(persistentFloor);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
        // Should revert optimistic update
        expect(testParams.setLocalFloors).toHaveBeenCalledWith(localFloors);
      });
    });

    it('should prevent deleting the same floor twice', async () => {
      vi.useFakeTimers();

      vi.mocked(deleteFloorSubmissionNoRedirectAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const persistentFloor: FloorData = createMockFloorData({ id: 1 });
      const localFloors = [persistentFloor];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors,
      })));

      // First delete
      act(() => {
        result.current.handleDeleteFloor(persistentFloor);
      });

      // Second delete (should be ignored)
      act(() => {
        result.current.handleDeleteFloor(persistentFloor);
      });

      // Fast-forward timers
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should only be called once
      expect(vi.mocked(deleteFloorSubmissionNoRedirectAction)).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('handleOpenRenterManagement', () => {
    it('should show error when floor is not selected', async () => {
      const editingForm = createMockFloorData({ floor: '' });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        editingFloorForm: editingForm,
      })));

      await act(async () => {
        result.current.handleOpenRenterManagement();
      });

      expect(testParams.setFormErrors).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(toast.error).toHaveBeenCalledWith('floor.selectFloorFirst');
    });



    it('should navigate to Renter Management page', async () => {
      const editingForm = createMockFloorData({ id: 1 });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        editingFloorForm: editingForm,
      })));

      await act(async () => {
        result.current.handleOpenRenterManagement();
      });

      expect(testParams.router.push).toHaveBeenCalledWith(
        expect.stringContaining('FloorSubmission/Renter')
      );
    });

    it('should accept custom form data', async () => {
      const customForm = createMockFloorData({ floor: '' });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams()));

      await act(async () => {
        result.current.handleOpenRenterManagement(customForm);
      });

      expect(toast.error).toHaveBeenCalledWith('floor.selectFloorFirst');
    });
  });

  describe('isSaving state', () => {
    it('should track saving state correctly', async () => {
      vi.useFakeTimers();

      vi.mocked(submitFloorSubmissionNoRedirectAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 50))
      );

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: true,
      })));

      expect(result.current.isSaving).toBe(false);

      act(() => {
        result.current.handleSave();
      });

      // Fast-forward timers to complete the async operation
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // After completion, isSaving should be false
      expect(result.current.isSaving).toBe(false);
      expect(testParams.setIsAddingNewFloor).toHaveBeenCalledWith(false);

      vi.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined floor ID gracefully', async () => {
      const floorWithoutId: FloorData = createMockFloorData({ id: undefined });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors: [floorWithoutId],
      })));

      await act(async () => {
        result.current.handleDeleteFloor(floorWithoutId);
      });

      // Should not crash
      expect(testParams.confirm).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(submitFloorSubmissionNoRedirectAction).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: true,
      })));

      await act(async () => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });

    it('should handle API timeout errors', async () => {
      vi.mocked(updateFloorSubmissionNoRedirectAction).mockRejectedValue(
        new Error('Request timeout')
      );

      const selectedFloor = createMockFloorData({ id: 1 });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        isAddingNewFloor: false,
        selectedFloor,
      })));

      await act(async () => {
        result.current.handleSave();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Request timeout');
      });
    });
  });
});
