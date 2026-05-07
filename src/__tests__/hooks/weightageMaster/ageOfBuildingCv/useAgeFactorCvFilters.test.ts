import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAgeFactorCvFilters } from '@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvFilters';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

describe('useAgeFactorCvFilters', () => {
  const initialAgeRangeOptions = [
    { label: '0-5', value: '0-5' },
    { label: '5-10', value: '5-10' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('selectedYearRange');
    mockSearchParams.delete('constructionType');
    mockSearchParams.delete('page');
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAgeFactorCvFilters({ initialAgeRangeOptions }));

    expect(result.current.selectedYear).toBe('');
    expect(result.current.constructionType).toBe('');
    expect(result.current.factorValue).toBe('0.00');
    expect(result.current.ageRangeOptions).toEqual(initialAgeRangeOptions);
  });

  it('should handle assessment year change and update URL', () => {
    const { result } = renderHook(() => useAgeFactorCvFilters({ initialAgeRangeOptions }));

    act(() => {
      result.current.handleAssessmentYearChange('2024');
    });

    expect(result.current.selectedYear).toBe('2024');
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('selectedYearRange=2024'));
  });

  it('should handle construction type change and update URL', () => {
    const { result } = renderHook(() => useAgeFactorCvFilters({ initialAgeRangeOptions }));

    act(() => {
      result.current.handleConstructionTypeChange('1');
    });

    expect(result.current.constructionType).toBe('1');
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('constructionType=1'));
  });

  it('should handle age range change', () => {
    const { result } = renderHook(() => useAgeFactorCvFilters({ initialAgeRangeOptions }));

    act(() => {
      result.current.handleAgeRangeChange('5-10');
    });

    expect(result.current.selectedAgeRange).toBe('5-10');
    expect(result.current.ageFrom).toBe('5');
    expect(result.current.ageTo).toBe('10');
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useAgeFactorCvFilters({ initialAgeRangeOptions }));

    act(() => {
      result.current.setSelectedYear('2024');
      result.current.handleClearAll(vi.fn(), vi.fn());
    });

    expect(result.current.selectedYear).toBe('');
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/age-weightage'));
  });
});
