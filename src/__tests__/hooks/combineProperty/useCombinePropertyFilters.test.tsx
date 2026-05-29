import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCombinePropertyFilters } from '@/hooks/combineProperty/useCombinePropertyFilters';
import { CombinePropertyItem } from '@/types/combine-property.types';
import { toast } from 'sonner';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParamsData = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => mockSearchParamsData,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useCombinePropertyFilters', () => {
  const mockBaseList = [
    { id: 1, wardId: 10, wardNo: 'W1', propertyNo: 'P1' } as CombinePropertyItem
  ];
  const mockSubList = [
    { id: 2, fromProperty: 'P2', propertyNo: 'P2' } as CombinePropertyItem,
    { id: 3, fromProperty: 'P3', propertyNo: 'P3' } as CombinePropertyItem,
    { id: 4, fromProperty: 'P4', propertyNo: 'P4' } as CombinePropertyItem
  ];
  const mockT = vi.fn((k) => k);
  const mockOnClearReview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsData = new URLSearchParams();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    expect(result.current.selectionMethod).toBe('range');
    expect(result.current.rangeFrom).toBe('');
    expect(result.current.rangeTo).toBe('');
    expect(result.current.selectedProperties).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isRangeInvalid).toBe(false);
  });

  it('handles base property change', () => {
    const { result } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    act(() => {
      result.current.handleBasePropertyChange('baseProperty', '1');
    });

    expect(mockOnClearReview).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/test-path?basePropertyId=1&wardId=10&wardNo=W1&propertyNo=P1');
  });

  it('handles method change', () => {
    const { result } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    act(() => {
      result.current.handleMethodChange('individual');
    });

    expect(mockOnClearReview).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/test-path?method=individual');
  });

  it('handles range changes and calculates properties correctly', () => {
    const { result, rerender } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    act(() => {
      result.current.handleRangeFromChange('from', '2');
    });
    
    expect(mockReplace).toHaveBeenCalledWith('/test-path?from=2', { scroll: false });
    expect(mockOnClearReview).toHaveBeenCalled();

    // Now pretend searchParams updated
    mockSearchParamsData = new URLSearchParams('from=2');
    rerender();
    
    act(() => {
      result.current.handleRangeToChange('to', '4');
    });

    // P2 to P4 includes IDs 2, 3, 4
    expect(mockReplace).toHaveBeenCalledWith('/test-path?from=2&to=4&partitionNo=P2%2CP3%2CP4&propertyNos=P2%2CP3%2CP4', { scroll: false });
  });

  it('shows error if range is invalid', () => {
    mockSearchParamsData = new URLSearchParams('from=4');
    const { result } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    act(() => {
      result.current.handleRangeToChange('to', '2');
    });

    expect(toast.error).toHaveBeenCalledWith('rangeInvalidError');
  });

  it('handles individual changes', () => {
    const { result } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    act(() => {
      result.current.handleIndividualChange(['2', '4']);
    });

    expect(mockReplace).toHaveBeenCalledWith('/test-path?individual=2%2C4&partitionNo=P2%2CP4&propertyNos=P2%2CP4', { scroll: false });
  });

  it('clears filters correctly', () => {
    mockSearchParamsData = new URLSearchParams('basePropertyId=1&wardId=10&method=individual&individual=2');
    const { result } = renderHook(() => 
      useCombinePropertyFilters(mockBaseList, mockSubList, mockT, mockOnClearReview)
    );

    act(() => {
      result.current.clearFilters();
    });

    expect(mockPush).toHaveBeenCalledWith('/test-path?method=individual');
  });
});
