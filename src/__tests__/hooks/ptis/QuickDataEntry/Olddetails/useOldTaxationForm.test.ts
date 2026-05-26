/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOldTaxationForm } from '@/hooks/ptis/QuickDataEntry/Olddetails/useOldTaxationForm';
import { toast } from 'sonner';
import { useConfirm } from '@/components/common';
import { useParams } from 'next/navigation';
import { updatePropertyOldDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/old-taxation/action';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/common', () => ({
  useConfirm: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/old-taxation/action', () => ({
  updatePropertyOldDetailsAction: vi.fn(),
}));

describe('useOldTaxationForm', () => {
  const mockPropertyOldDetails = {
    propertyId: 123,
    oldPlotNo: 'P1',
    oldCarpetAreaSqFeet: 100,
    oldRV: 500,
    oldALV: 600,
    oldGeneralTax: 100,
    oldTotalTax: 1000,
    oldWardNo: 'W1',
    oldPropertyNo: 'PN1',
    oldPartitionNo: 'PR1',
    oldEgovNo: 'E1',
    oldPlotArea: 200,
    oldZoneNo: 'Z1',
    oldCSN: null,
    oldConstructionArea: 250,
    oldConstructionYear: '2020',
    oldCarpetAreaSqMeter: 10,
    oldConstructionTypeId: 1,
    oldTypeOfUseId: 1,
  };

  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConfirm).mockReturnValue({ confirm: mockConfirm } as any);
    vi.mocked(useParams).mockReturnValue({ propertyId: '123', locale: 'en' } as any);
  });

  it('should initialize with provided data', () => {
    const { result } = renderHook(() => useOldTaxationForm(mockPropertyOldDetails));

    expect(result.current.formData.oldPlotNo).toBe('P1');
    expect(result.current.formData.oldRV).toBe('500');
  });

  it('should update form data when handleInputChange is called', () => {
    const { result } = renderHook(() => useOldTaxationForm(mockPropertyOldDetails));

    act(() => {
      result.current.handleInputChange('oldPlotNo', 'P2');
    });

    expect(result.current.formData.oldPlotNo).toBe('P2');
  });

  it('should call updatePropertyOldDetailsAction on confirm', async () => {
    mockConfirm.mockImplementation(({ onConfirm }) => onConfirm());
    (updatePropertyOldDetailsAction as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useOldTaxationForm(mockPropertyOldDetails));

    await act(async () => {
      result.current.handleUpdate();
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(updatePropertyOldDetailsAction).toHaveBeenCalledWith(123, expect.any(Object), 'en');
    expect(toast.success).toHaveBeenCalled();
  });

  it('should show error toast if update fails', async () => {
    mockConfirm.mockImplementation(({ onConfirm }) => onConfirm());
    (updatePropertyOldDetailsAction as any).mockResolvedValue({ success: false, error: 'API Error' });

    const { result } = renderHook(() => useOldTaxationForm(mockPropertyOldDetails));

    await act(async () => {
      result.current.handleUpdate();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('should compute isChanged correctly when fields are modified', () => {
    const { result } = renderHook(() => useOldTaxationForm(mockPropertyOldDetails));

    expect(result.current.isChanged).toBe(false);

    act(() => {
      result.current.handleInputChange('oldPlotNo', 'P2');
    });

    expect(result.current.isChanged).toBe(true);
  });
});
