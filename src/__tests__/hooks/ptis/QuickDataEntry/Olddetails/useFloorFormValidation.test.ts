/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFloorFormValidation } from '@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormValidation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/lib/utils/validation-schemas', () => ({
  oldDetailsValidations: {
    validateFloorInformation: vi.fn((data) => {
      const errors: any = {};
      if (!data.oldFloorId) errors.oldFloorId = 'Required';
      return errors;
    }),
  },
}));

describe('useFloorFormValidation', () => {
  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useFloorFormValidation());

    expect(result.current.errors).toEqual({});
  });

  it('should validate data and set errors', () => {
    const { result } = renderHook(() => useFloorFormValidation());
    const invalidData = { oldFloorId: '' };

    act(() => {
      const errors = result.current.validate(invalidData as any);
      expect(errors.oldFloorId).toBeDefined();
    });

    expect(result.current.errors.oldFloorId).toBeDefined();
  });

  it('should reset validation errors', () => {
    const { result } = renderHook(() => useFloorFormValidation());

    act(() => {
      result.current.validate({ oldFloorId: '' } as any);
      result.current.resetValidation();
    });

    expect(result.current.errors).toEqual({});
  });
});
