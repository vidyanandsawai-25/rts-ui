import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDataEntrySameAs } from '@/components/modules/property-tax/ptis/QuickDataEntry/floorSubmission/hooks/useDataEntrySameAs';
import { fetchDataEntrySameAsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import { getWardListAction } from '@/app/[locale]/property-tax/ptis/actions';
import type { SelectableProperty } from '@/types/floor-details.types';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('@/components/common', () => ({
  useConfirm: () => ({ confirm: vi.fn() }),
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions', () => ({
  fetchDataEntrySameAsAction: vi.fn(),
  applyDataEntrySameAsAction: vi.fn(),
  getPropertyBasicDetailsAction: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action', () => ({
  updatePropertyBasicDetailsAction: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/ptis/actions', () => ({
  getWardListAction: vi.fn(),
}));

describe('useDataEntrySameAs preloading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads property and ward data before opening and reuses it on first open', async () => {
    const properties: SelectableProperty[] = [
      {
        id: '755397-1',
        propertyId: 755397,
        wardId: 18,
        wardNo: 'UT1',
        propertyNo: '1',
        partitionNo: 'A2',
        categoryName: 'Apartment',
        type: 1,
        wing: '-',
        flatNo: '-',
      },
    ];

    vi.mocked(fetchDataEntrySameAsAction).mockResolvedValue(properties);
    vi.mocked(getWardListAction).mockResolvedValue({
      success: true,
      data: [{ wardId: 18, wardNo: 'UT1', zoneId: 1, description: 'Ward UT1' }],
    });

    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useDataEntrySameAs({
          isOpen,
          wardId: 18,
          propertyNo: '1',
          partitionNo: 'A2',
          initialPropertyID: 755397,
          categoryName: 'Apartment',
          t: (key) => key,
        }),
      { initialProps: { isOpen: false } }
    );

    await waitFor(() => {
      expect(fetchDataEntrySameAsAction).toHaveBeenCalledTimes(1);
      expect(getWardListAction).toHaveBeenCalledTimes(1);
      expect(result.current.isFetchingWards).toBe(false);
      expect(result.current.selectableProperties).toEqual(properties);
    });

    act(() => {
      rerender({ isOpen: true });
    });

    await waitFor(() => {
      expect(result.current.selectableProperties).toEqual(properties);
      expect(result.current.isLoadingProperties).toBe(false);
    });

    expect(fetchDataEntrySameAsAction).toHaveBeenCalledTimes(1);
    expect(result.current.wardOptions).toEqual([{ label: 'UT1', value: '18' }]);
  });
});
