/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFloorInformationForm } from '@/hooks/ptis/QuickDataEntry/Olddetails/useFloorInformationForm';
import { useFloorFormState } from '@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormState';
import { useFloorFormValidation } from '@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormValidation';
import { useFloorFormApi } from '@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormApi';
import { toast } from 'sonner';

vi.mock('@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormState');
vi.mock('@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormValidation');
vi.mock('@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormApi');
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('useFloorInformationForm', () => {
  const mockState = {
    formData: { oldFloorId: '1' },
    setFormData: vi.fn(),
    handleUseTypeChange: vi.fn(),
    handleEdit: vi.fn(),
    handleReset: vi.fn(),
  };

  const mockValidation = {
    errors: {},
    validate: vi.fn(),
    resetValidation: vi.fn(),
    showError: vi.fn(),
  };

  const mockApi = {
    isSubmitting: false,
    handleSave: vi.fn(),
    handleDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFloorFormState as any).mockReturnValue(mockState);
    (useFloorFormValidation as any).mockReturnValue(mockValidation);
    (useFloorFormApi as any).mockReturnValue(mockApi);
  });

  it('should call apiSave if validation passes', async () => {
    mockValidation.validate.mockReturnValue({}); // No errors
    const { result } = renderHook(() => useFloorInformationForm({ propertyId: 123, locale: 'en', initialSubUseTypeOptions: [] }));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockApi.handleSave).toHaveBeenCalledWith(mockState.formData, expect.any(Function));
  });

  it('should not call apiSave if validation fails', async () => {
    mockValidation.validate.mockReturnValue({ oldFloorId: 'Required' }); // Errors
    const { result } = renderHook(() => useFloorInformationForm({ propertyId: 123, locale: 'en', initialSubUseTypeOptions: [] }));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockApi.handleSave).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
