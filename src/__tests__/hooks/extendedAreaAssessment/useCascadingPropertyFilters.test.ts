import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCascadingPropertyFilters } from '@/hooks/extendedAreaAssessment/useCascadingPropertyFilters';
import { getWardsDropdownAction, getApartmentQCSuggestionsAction } from '@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action';
import type { WardDropdownOption, ApartmentQcSearchSuggestionDto } from '@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/app/[locale]/property-tax/extended-area-assesment/single-assessment/action', () => ({
  getWardsDropdownAction: vi.fn(),
  getApartmentQCSuggestionsAction: vi.fn(),
}));

// Hoisted, stable references — a real caller (SingleAssessmentScreen) passes these as component
// props that don't change identity every render. Recreating an inline array literal directly
// inside the renderHook() callback would give the hook's "sync from initial props" effect
// (keyed on array reference) a new identity on every render, looping it forever.
const oneWard: WardDropdownOption[] = [{ id: 1, wardNo: 'MM11', description: null }];

const t = ((key: string, values?: Record<string, string>) =>
  key === 'dropdowns.partitionLabel' ? `Partition ${values?.partitionNo}` : key) as unknown as Parameters<
  typeof useCascadingPropertyFilters
>[0]['t'];

describe('useCascadingPropertyFilters', () => {
  const push = vi.fn();
  const onPartitionResolved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push } as never);
    vi.mocked(usePathname).mockReturnValue('/en/property-tax/extended-area-assesment/single-assessment');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('') as never);
    // Resolved by default (fallback wards-fetch effect fires whenever initialWards is empty) —
    // an unresolved/undefined mock here throws synchronously inside a passive effect, which
    // crashes the whole worker instead of failing just one test.
    vi.mocked(getWardsDropdownAction).mockResolvedValue({ success: true, data: [] });
  });

  it('seeds selected ward/property/partition from explicit initial props over URL params', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('wardId=99') as never);
    const { result } = renderHook(() =>
      useCascadingPropertyFilters({
        t,
        initialWardId: '1',
        initialPropertyNo: 'P1',
        initialPartitionNo: 'A1',
        onPartitionResolved,
      })
    );
    expect(result.current.selectedWardId).toBe('1');
    expect(result.current.selectedPropertyNo).toBe('P1');
    expect(result.current.selectedPartitionNo).toBe('A1');
  });

  it('falls back to reading wardId/propertyNo/partitionNo from the URL when no initial props are given', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('wardId=2&propertyNo=P2&partitionNo=A2') as never);
    const { result } = renderHook(() => useCascadingPropertyFilters({ t, onPartitionResolved }));
    expect(result.current.selectedWardId).toBe('2');
    expect(result.current.selectedPropertyNo).toBe('P2');
    expect(result.current.selectedPartitionNo).toBe('A2');
  });

  it('fetches wards from the fallback action when initialWards is empty', async () => {
    vi.mocked(getWardsDropdownAction).mockResolvedValue({
      success: true,
      data: [{ id: 1, wardNo: 'MM11', description: null }],
    });
    const { result } = renderHook(() => useCascadingPropertyFilters({ t, onPartitionResolved }));
    await waitFor(() => expect(getWardsDropdownAction).toHaveBeenCalled());
    await waitFor(() => expect(result.current.wardOptions).toHaveLength(2));
    expect(result.current.wardOptions[1]).toEqual({ label: 'MM11', value: '1' });
  });

  it('does not fetch wards when initialWards is already populated', () => {
    renderHook(() => useCascadingPropertyFilters({ t, initialWards: oneWard, onPartitionResolved }));
    expect(getWardsDropdownAction).not.toHaveBeenCalled();
  });

  describe('handleWardChange', () => {
    it('resets downstream selections, updates the URL, and loads property numbers for the new ward', async () => {
      const suggestions: ApartmentQcSearchSuggestionDto[] = [
        { propertyId: 1, zoneId: 1, wardId: 1, category: 1, categoryLabel: 'Residential', displayLabel: '', propertyNo: 'P1' },
        { propertyId: 2, zoneId: 1, wardId: 1, category: 1, categoryLabel: 'Residential', displayLabel: '', propertyNo: 'P1' },
        { propertyId: 3, zoneId: 1, wardId: 1, category: 1, categoryLabel: 'Residential', displayLabel: '', propertyNo: 'P2' },
      ];
      vi.mocked(getApartmentQCSuggestionsAction).mockResolvedValue({ success: true, data: suggestions });
      const { result } = renderHook(() => useCascadingPropertyFilters({ t, initialWards: oneWard, onPartitionResolved }));

      await act(async () => {
        await result.current.handleWardChange('1');
      });

      expect(push).toHaveBeenCalledWith('/en/property-tax/extended-area-assesment/single-assessment?wardId=1');
      expect(result.current.selectedWardId).toBe('1');
      // Deduplicated property numbers, in first-seen order
      expect(result.current.propertyNoOptions.slice(1)).toEqual([
        { label: 'P1', value: 'P1' },
        { label: 'P2', value: 'P2' },
      ]);
    });

    it('navigates to the bare pathname and skips fetching properties when the ward is cleared', async () => {
      const { result } = renderHook(() => useCascadingPropertyFilters({ t, initialWards: oneWard, onPartitionResolved }));
      await act(async () => {
        await result.current.handleWardChange('');
      });
      expect(push).toHaveBeenCalledWith('/en/property-tax/extended-area-assesment/single-assessment');
      expect(getApartmentQCSuggestionsAction).not.toHaveBeenCalled();
    });
  });

  describe('handlePropertyNoChange', () => {
    it('loads partition suggestions for the selected ward + property', async () => {
      const suggestions: ApartmentQcSearchSuggestionDto[] = [
        { propertyId: 1, zoneId: 1, wardId: 1, category: 1, categoryLabel: 'Residential', displayLabel: 'Flat 1', partitionNo: 'A1' },
      ];
      vi.mocked(getApartmentQCSuggestionsAction).mockResolvedValue({ success: true, data: suggestions });
      const { result } = renderHook(() =>
        useCascadingPropertyFilters({ t, initialWardId: '1', initialWards: oneWard, onPartitionResolved })
      );

      await act(async () => {
        await result.current.handlePropertyNoChange('P1');
      });

      expect(getApartmentQCSuggestionsAction).toHaveBeenCalledWith(1, 'P1');
      expect(result.current.selectedPropertyNo).toBe('P1');
      expect(result.current.partitionOptions.slice(1)).toEqual([{ label: 'Partition A1 (Flat 1)', value: 'A1' }]);
    });
  });

  describe('handlePartitionChange', () => {
    const partitions: ApartmentQcSearchSuggestionDto[] = [
      { propertyId: 42, zoneId: 1, wardId: 1, category: 1, categoryLabel: 'Residential', displayLabel: 'Flat 1', partitionNo: 'A1', upicId: 'MM1100150000' },
    ];

    it('resolves the matching suggestion and calls onPartitionResolved with its UPIC', () => {
      const { result } = renderHook(() =>
        useCascadingPropertyFilters({ t, initialWards: oneWard, initialPartitions: partitions, onPartitionResolved })
      );

      act(() => {
        result.current.handlePartitionChange('A1');
      });

      expect(result.current.selectedPartitionNo).toBe('A1');
      expect(onPartitionResolved).toHaveBeenCalledWith('MM1100150000');
      expect(push).toHaveBeenCalledWith(expect.stringContaining('upic=MM1100150000'));
    });

    it('falls back to the raw value itself when no suggestion matches', () => {
      const { result } = renderHook(() => useCascadingPropertyFilters({ t, initialWards: oneWard, onPartitionResolved }));

      act(() => {
        result.current.handlePartitionChange('UNMATCHED');
      });

      expect(onPartitionResolved).toHaveBeenCalledWith('UNMATCHED');
    });
  });
});
