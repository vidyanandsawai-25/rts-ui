/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaxationBreakdownForm } from '@/hooks/ptis/QuickDataEntry/Olddetails/useTaxationBreakdownForm';
import { toast } from 'sonner';
import { useConfirm } from '@/components/common';
import { useParams, useRouter } from 'next/navigation';
import { saveOldTaxesDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action';

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
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/taxation-breakdown/action', () => ({
  saveOldTaxesDetailsAction: vi.fn(),
}));

describe('useTaxationBreakdownForm', () => {
  const mockInitialData = {
    propertyId: 123,
    taxYears: [
      {
        financeYearId: 1,
        year: 2024,
        yearCode: '2024-25',
        rVorCV: 'RV',
        rVorCVValue: 1000,
        taxes: [
          { taxId: 1, taxName: 'Property Tax', taxAmount: 500 },
        ],
        taxTotal: 500,
        interest: 50,
        netTotal: 550,
      },
    ],
  };

  const mockConfirm = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConfirm).mockReturnValue({ confirm: mockConfirm } as any);
    vi.mocked(useParams).mockReturnValue({ propertyId: '123' } as any);
    vi.mocked(useRouter).mockReturnValue({ refresh: mockRefresh } as any);
  });

  it('should initialize with provided data', () => {
    const { result } = renderHook(() => useTaxationBreakdownForm(mockInitialData));

    expect(result.current.formData.year).toBe('2024');
    expect(result.current.taxes[0].taxAmount).toBe(500);
  });

  it('should calculate totals when tax amount changes', () => {
    const { result } = renderHook(() => useTaxationBreakdownForm(mockInitialData));

    act(() => {
      result.current.handleTaxChange(1, '700');
    });

    expect(result.current.formData.taxTotal).toBe(700);
    expect(result.current.formData.netTotal).toBe(750); // 700 + 50 interest
  });

  it('should validate year before saving', async () => {
    const { result } = renderHook(() => useTaxationBreakdownForm(mockInitialData));

    act(() => {
      result.current.handleMetaChange('year', '24'); // Invalid year
    });

    await act(async () => {
      result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalled();
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('should call saveOldTaxesDetailsAction on confirm', async () => {
    mockConfirm.mockImplementation(({ onConfirm }) => onConfirm());
    vi.mocked(saveOldTaxesDetailsAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() => useTaxationBreakdownForm(mockInitialData));

    await act(async () => {
      result.current.handleSave();
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(saveOldTaxesDetailsAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
