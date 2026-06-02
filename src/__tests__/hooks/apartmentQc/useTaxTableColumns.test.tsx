import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaxTableColumns } from '@/hooks/apartmentQc/useTaxTableColumns';
import type { TaxColumnDef } from '@/hooks/apartmentQc/useApartmentTaxDetailsTable';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'taxDetails.method': 'Method',
      'taxDetails.methodLabel': 'Property Type',
      'taxDetails.total': 'Total',
    };
    return translations[key] || key;
  },
}));

/* ============================================================
   TEST DATA
 ============================================================ */

const mockTaxColumns: TaxColumnDef[] = [
  { taxName: 'Property Tax', displayOrder: 1 },
  { taxName: 'Water Tax', displayOrder: 2 },
  { taxName: 'Service Tax', displayOrder: 3 },
];

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'taxDetails.method': 'Method',
    'taxDetails.methodLabel': 'Property Type',
    'taxDetails.total': 'Total',
  };
  return translations[key] || key;
};

/* ============================================================
   TESTS
 ============================================================ */

describe('useTaxTableColumns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when hasData is true', () => {
    it('should return columns array with Method, tax columns, and Total', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      // Method + 3 tax columns + Total = 5 columns
      expect(result.current).toHaveLength(5);
    });

    it('should have Method column as first column', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current[0].key).toBe('methodLabel');
      expect(result.current[0].label).toBe('Property Type');
    });

    it('should use "Method" label for dual-method tab', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'dual-method',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current[0].label).toBe('Method');
    });

    it('should have Tax columns in the middle', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current[1].key).toBe('Property Tax');
      expect(result.current[1].label).toBe('Property Tax');
      expect(result.current[2].key).toBe('Water Tax');
      expect(result.current[3].key).toBe('Service Tax');
    });

    it('should have Total column as last column', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      const lastColumn = result.current[result.current.length - 1];
      expect(lastColumn.key).toBe('total');
      expect(lastColumn.label).toBe('Total');
    });

    it('should have sticky Method column with proper className', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current[0].headerClassName).toContain('sticky');
      expect(result.current[0].cellClassName).toContain('sticky');
    });

    it('should have center-aligned tax columns', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      // Tax columns are at indices 1, 2, 3
      expect(result.current[1].align).toBe('center');
      expect(result.current[2].align).toBe('center');
      expect(result.current[3].align).toBe('center');
    });

    it('should have amber background on Total header', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      const totalColumn = result.current[result.current.length - 1];
      expect(totalColumn.headerClassName).toContain('bg-amber-100');
    });
  });

  describe('when hasData is false', () => {
    it('should return empty array', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: false,
        })
      );

      expect(result.current).toHaveLength(0);
    });
  });

  describe('with empty taxColumns', () => {
    it('should return only Method and Total columns when hasData is true', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: [],
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      // Method + Total = 2 columns
      expect(result.current).toHaveLength(2);
      expect(result.current[0].key).toBe('methodLabel');
      expect(result.current[1].key).toBe('total');
    });
  });

  describe('column render functions', () => {
    it('should have render function for methodLabel column', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      const methodColumn = result.current[0];
      expect(methodColumn.render).toBeDefined();
    });

    it('should have render function for tax columns', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      const taxColumn = result.current[1];
      expect(taxColumn.render).toBeDefined();
    });

    it('should have render function for total column', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      const totalColumn = result.current[result.current.length - 1];
      expect(totalColumn.render).toBeDefined();
    });
  });

  describe('memoization', () => {
    it('should return same reference when inputs unchanged', () => {
      const props = {
        taxColumns: mockTaxColumns,
        activeSubTab: 'rateable',
        t: mockT,
        hasData: true,
      };

      const { result, rerender } = renderHook(
        (currentProps) => useTaxTableColumns(currentProps),
        { initialProps: props }
      );

      const firstResult = result.current;
      rerender(props);
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should return different reference when activeSubTab changes', () => {
      const { result, rerender } = renderHook(
        (props) => useTaxTableColumns(props),
        {
          initialProps: {
            taxColumns: mockTaxColumns,
            activeSubTab: 'rateable',
            t: mockT,
            hasData: true,
          },
        }
      );

      const firstResult = result.current;
      rerender({
        taxColumns: mockTaxColumns,
        activeSubTab: 'capital',
        t: mockT,
        hasData: true,
      });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe('active sub-tab variations', () => {
    it('should handle rateable sub-tab', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'rateable',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should handle capital sub-tab', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'capital',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should handle dual-method sub-tab', () => {
      const { result } = renderHook(() => 
        useTaxTableColumns({
          taxColumns: mockTaxColumns,
          activeSubTab: 'dual-method',
          t: mockT,
          hasData: true,
        })
      );

      expect(result.current.length).toBeGreaterThan(0);
    });
  });
});
