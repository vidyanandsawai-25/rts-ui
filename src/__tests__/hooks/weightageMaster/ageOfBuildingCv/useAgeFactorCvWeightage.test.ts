import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAgeFactorCvWeightage } from '@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvWeightage';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock sub-hooks to test orchestration
vi.mock('@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvToasts', () => ({
  useAgeFactorCvToasts: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));

vi.mock('@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvFilters', () => ({
  useAgeFactorCvFilters: () => ({ 
    selectedYear: '2024',
    clearFilters: vi.fn(),
    getMissingRecordsCount: () => 5,
  }),
}));

vi.mock('@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvRowOps', () => ({
  useAgeFactorCvRowOps: () => ({ isUpdating: false, handleUpdate: vi.fn(), handleCancelRow: vi.fn() }),
}));

vi.mock('@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvBulkOps', () => ({
  useAgeFactorCvBulkOps: () => ({ isBulkUpdating: false, isGeneratingAll: false, handleApplyFilter: vi.fn(), handleBulkUpdate: vi.fn(), handleGenerateAll: vi.fn() }),
}));

vi.mock('@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvSessionTracking', () => ({
  useAgeFactorCvSessionTracking: () => ({ 
    editableRows: {}, 
    setEditableRows: vi.fn(), 
    sessionCreatedUids: new Set(), 
    setSessionCreatedUids: vi.fn(), 
    getRowUid: vi.fn(() => '1'), 
    findRowByUid: vi.fn() 
  }),
}));

describe('useAgeFactorCvWeightage', () => {
  const defaultProps = {
    paginationData: {
      data: [],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    },
    options: {
      constructionTypeOptions: [],
      initialAgeRangeOptions: [],
    },
    allAgeFactors: [],
  };

  it('should initialize and expose sub-hook states', () => {
    const { result } = renderHook(() => useAgeFactorCvWeightage(defaultProps));

    expect(result.current).toHaveProperty('editableRows');
    expect(result.current).toHaveProperty('toasts');
    expect(result.current.selectedYear).toBe('2024');
  });

  it('canGenerateAll should be true when missing records exist', () => {
    const { result } = renderHook(() => useAgeFactorCvWeightage(defaultProps));
    expect(result.current.canGenerateAll).toBe(true);
  });
});
