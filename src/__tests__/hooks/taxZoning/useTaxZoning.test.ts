import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaxZoning } from '@/hooks/taxZoning/useTaxZoning';
import type { TaxZoningPageProps, TaxZone, Ward } from '@/types/taxzoning.types';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() } }));
vi.mock('@/app/[locale]/property-tax/taxzoning/actions', () => ({
  createTaxZoningAction: vi.fn(),
  updateTaxZoningAction: vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
  getTaxZoningPagedAction: vi.fn().mockResolvedValue({ success: true, data: { items: [], totalCount: 0 } }),
}));

const mockTaxZones = {
  items: [
    { id: 1, taxZoneNo: '1', taxZoneType: 'R', remark: null, createdDate: '', updatedDate: null, isActive: true },
    { id: 2, taxZoneNo: '2', taxZoneType: 'C', remark: null, createdDate: '', updatedDate: null, isActive: true },
  ] as TaxZone[],
  pageNumber: 1, pageSize: 10, totalCount: 2, totalPages: 1, hasPrevious: false, hasNext: false,
};
const mockWardsData = {
  items: [
    { id: 89, wardNo: 'MM11', zoneNo: '1', description: null, descriptionEnglish: null, sequenceNo: null, isActive: true, createdBy: null, createdDate: '', updatedBy: null, updatedDate: null },
  ] as Ward[],
  pageNumber: 1, pageSize: 10, totalCount: 1, totalPages: 1, hasPrevious: false, hasNext: false,
};

const baseProps: TaxZoningPageProps = {
  data: [
    { taxZoneId: 1, wardId: 89, taxZone: '1', wardNo: 'MM11', propertyNo: '16', fromProperty: '3', toProperty: '3', isActive: true, createdDate: null, updatedDate: null },
  ],
  pageNumber: 1,
  pageSize: 5,
  totalCount: 1,
  totalPages: 1,
  taxZones: mockTaxZones,
  wardsData: mockWardsData,
};

describe('useTaxZoning', () => {
  it('should initialize with correct defaults', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.zone).toBe('');
    expect(result.current.ward).toEqual([]);
    expect(result.current.fromProps).toBe('');
    expect(result.current.toProps).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.submitted).toBe(false);
  });

  it('should compute zoneOptions from taxZones', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.zoneOptions).toEqual([
      { label: '1', value: '1' },
      { label: '2', value: '2' },
    ]);
  });

  it('should not show ward options when no zone selected', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.wardOptions).toEqual([]);
  });

  it('should map data to records correctly', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.tableRecords).toHaveLength(1);
    expect(result.current.tableRecords[0]).toEqual(expect.objectContaining({
      taxZoneId: 1,
      taxZoneNo: '1',
      wardId: 89,
      wardNo: 'MM11',
      fromProperty: '3',
      toProperty: '3',
    }));
  });

  it('should return empty records when data is empty', () => {
    const { result } = renderHook(() => useTaxZoning({ ...baseProps, data: [] }));
    expect(result.current.tableRecords).toEqual([]);
  });

  it('should set zone and update URL on setZone', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    act(() => { result.current.setZone('1'); });
    expect(result.current.zone).toBe('1');
    expect(mockReplace).toHaveBeenCalled();
  });

  it('should clear fromProps and toProps when multiple wards selected', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    act(() => { result.current.setZone('1'); });
    act(() => { result.current.setFromProps('10'); });
    act(() => { result.current.setToProps('20'); });
    act(() => { result.current.setWard(['1', '2']); });
    expect(result.current.fromProps).toBe('');
    expect(result.current.toProps).toBe('');
  });

  it('should generate preview data when zone, ward, from, to are set', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    act(() => { result.current.setZone('1'); });
    act(() => { result.current.setWard(['89']); });
    act(() => { result.current.setFromProps('10'); });
    act(() => { result.current.setToProps('12'); });
    expect(result.current.previewData).toHaveLength(3);
    expect(result.current.previewData[0]).toEqual({ taxZoneNo: '1', wardNo: 'MM11', propertyNo: '10' });
    expect(result.current.previewData[2]).toEqual({ taxZoneNo: '1', wardNo: 'MM11', propertyNo: '12' });
  });

  it('should return empty previewData when from > to', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    act(() => { result.current.setZone('1'); });
    act(() => { result.current.setWard(['89']); });
    act(() => { result.current.setFromProps('20'); });
    act(() => { result.current.setToProps('10'); });
    expect(result.current.previewData).toEqual([]);
  });

  it('should clear form state on onFormClear', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    act(() => { result.current.setZone('1'); });
    act(() => { result.current.setWard(['89']); });
    act(() => { result.current.onFormClear(); });
    expect(result.current.zone).toBe('');
    expect(result.current.ward).toEqual([]);
  });

  it('should compute validation flags correctly', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.isTaxZoneValid).toBe(false); // no zone
    expect(result.current.isWardValid).toBe(false); // no ward
    expect(result.current.isFormValid).toBe(false);
  });

  it('should return correct column definitions', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.columns).toHaveLength(4);
    expect(result.current.previewColumns).toHaveLength(3);
  });

  it('should provide correct page size options', () => {
    const { result } = renderHook(() => useTaxZoning(baseProps));
    expect(result.current.pageSizeOptions).toEqual([5, 10, 20, 50, 100]);
  });
});
