import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { getApartmentQCColumns } from '@/components/modules/property-tax/ptis/appartmentQC/apartmentQC.columns';

// Mock Tooltip component
vi.mock('@/components/common/Tooltip', () => ({
  Tooltip: ({ children, content }: { children?: React.ReactNode; content?: React.ReactNode }) => (
    <div data-testid="tooltip">
      {children}
      <div data-testid="tooltip-content">{content}</div>
    </div>
  ),
}));

describe('apartmentQC.columns', () => {
  const t = (key: string) => key;

  describe('getApartmentQCColumns', () => {
    it('should return commercial tab columns for rateable sub-tab', () => {
      const columns = getApartmentQCColumns('commercial', 'rateable', t);
      expect(columns.length).toBeGreaterThan(0);
      expect(columns.some(col => col.key === 'srNo')).toBe(true);
      expect(columns.some(col => col.key === 'propertyNo')).toBe(true);
    });

    it('should return commercial tab columns for capital sub-tab', () => {
      const columns = getApartmentQCColumns('commercial', 'capital', t);
      expect(columns.length).toBeGreaterThan(0);
      expect(columns.some(col => col.key === 'capitalValue')).toBe(true);
    });

    it('should return commercial tab columns for dual-method sub-tab', () => {
      const columns = getApartmentQCColumns('commercial', 'dual-method', t);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should return residential tab columns for rateable sub-tab', () => {
      const columns = getApartmentQCColumns('residential', 'rateable', t);
      expect(columns.length).toBeGreaterThan(0);
      expect(columns.some(col => col.key === 'bhk')).toBe(true);
    });

    it('should return residential tab columns for capital sub-tab', () => {
      const columns = getApartmentQCColumns('residential', 'capital', t);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should return residential tab columns for dual-method sub-tab', () => {
      const columns = getApartmentQCColumns('residential', 'dual-method', t);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should return amenities tab columns', () => {
      const columns = getApartmentQCColumns('amenities', 'rateable', t);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should include srNo column with correct numbering', () => {
      const columns = getApartmentQCColumns('residential', 'rateable', t, 2, 10);
      const srNoCol = columns.find(col => col.key === 'srNo');
      expect(srNoCol).toBeDefined();
      if (srNoCol?.render) {
        const row1 = srNoCol.render(null, {}, 0);
        const row2 = srNoCol.render(null, {}, 1);
        expect(row1).toBe(11); // (2-1)*10 +1
        expect(row2).toBe(12);
      }
    });

    it('should render multi-record values with tooltip', () => {
      const columns = getApartmentQCColumns('residential', 'rateable', t);
      const constructionYearCol = columns.find(col => col.key === 'constructionYear');
      expect(constructionYearCol).toBeDefined();
      if (constructionYearCol?.render) {
        const renderResult = constructionYearCol.render('2023, 2022, 2021');
        render(<div>{renderResult}</div>);
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      }
    });

    it('should render owner name with tooltip for long text', () => {
      const columns = getApartmentQCColumns('residential', 'rateable', t);
      const ownerNameCol = columns.find(col => col.key === 'ownerName');
      expect(ownerNameCol).toBeDefined();
      if (ownerNameCol?.render) {
        const longName = 'This is a very long owner name that should be truncated';
        const renderResult = ownerNameCol.render(longName);
        render(<div>{renderResult}</div>);
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      }
    });
  });
});