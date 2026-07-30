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
    vi.useRealTimers();
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
        expect(toast.success).toHaveBeenCalledWith('floor.floorAddSuccess');
        expect(testParams.setIsAddingNewFloor).toHaveBeenCalledWith(true);
        expect(testParams.setSelectedFloor).toHaveBeenCalledWith(null);
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
        expect(toast.success).toHaveBeenCalledWith('floor.floorUpdateSuccess');
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

      act(() => {
        result.current.handleSave();
      });

      act(() => {
        result.current.handleSave();
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(submitFloorSubmissionNoRedirectAction).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('handleDeleteFloor', () => {
    it('should delete a floor successfully', async () => {
      vi.mocked(deleteFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: true,
      });

      const floorToDelete = createMockFloorData({ id: 1 });
      const localFloors = [floorToDelete, createMockFloorData({ id: 2 })];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors,
      })));

      await act(async () => {
        result.current.handleDeleteFloor(floorToDelete);
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
        expect(deleteFloorSubmissionNoRedirectAction).toHaveBeenCalledWith(expect.anything(), 'en', '123');
        expect(toast.success).toHaveBeenCalledWith('floor.floorDeletedSuccess');
      });
    });

    it('should handle floor deletion failure', async () => {
      vi.mocked(deleteFloorSubmissionNoRedirectAction).mockResolvedValue({
        success: false,
        error: 'Cannot delete last floor',
      });

      const floorToDelete = createMockFloorData({ id: 1 });
      const localFloors = [floorToDelete];

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        localFloors,
      })));

      await act(async () => {
        result.current.handleDeleteFloor(floorToDelete);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
        expect(testParams.setLocalFloors).toHaveBeenCalledWith(localFloors);
      });
    });
  });

  describe('handleOpenRenterManagement', () => {
    it('should show toast error when no floor is selected during add mode', async () => {
      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        selectedFloor: null,
        isAddingNewFloor: true,
      })));

      await act(async () => {
        result.current.handleOpenRenterManagement();
      });

      expect(toast.error).toHaveBeenCalledWith('floor.saveFloorBeforeRenterManagement');
    });

    it('should show toast info when floor is selected', async () => {
      const selectedFloor = createMockFloorData({ id: 1 });

      const { result } = renderHook(() => useFloorDataHandlers(getDefaultParams({
        selectedFloor,
        isAddingNewFloor: false,
      })));

      await act(async () => {
        result.current.handleOpenRenterManagement();
      });

      expect(toast.info).toHaveBeenCalledWith('floor.renterManagementNotAvailable');
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

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isSaving).toBe(false);
      expect(testParams.setIsAddingNewFloor).toHaveBeenCalledWith(true);

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
        expect(toast.error).toHaveBeenCalled();
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
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });
});
