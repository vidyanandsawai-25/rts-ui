import { describe, it, expect, vi } from 'vitest';
import { getCombinePropertyColumns, PropertyRow } from '@/components/modules/property-tax/combineproperty/combinePropertyColumns';
import { render } from '@testing-library/react';

describe('combinePropertyColumns', () => {
  const mockT = vi.fn((key) => key);
  
  const mockReviewData: PropertyRow[] = [
    { propertyId: 1, wardId: 1, wardNo: 'W1', propertyNo: 'P1', partitionNo: '1', oldPropertyNo: 'O1', ownerName: 'John Doe', occupierName: 'Jane Doe', taxAmount: 1000, pendingAmount: 500 },
    { propertyId: 2, wardId: 1, wardNo: 'W1', propertyNo: 'P2', partitionNo: '2', oldPropertyNo: 'O2', ownerName: 'John Doe', occupierName: '', taxAmount: 2000, pendingAmount: 1000 },
    { propertyId: 3, wardId: 1, wardNo: 'W1', propertyNo: 'P3', partitionNo: '3', oldPropertyNo: 'O3', ownerName: 'Mismatch Owner', occupierName: null as unknown as string, taxAmount: 3000, pendingAmount: 0 },
  ];

  it('should return correct number of columns', () => {
    const columns = getCombinePropertyColumns(mockT, mockReviewData);
    expect(columns.length).toBe(9);
  });

  it('should render serial number correctly', () => {
    const columns = getCombinePropertyColumns(mockT, mockReviewData);
    const srNoCol = columns.find(c => c.key === 'propertyId');
    expect(srNoCol).toBeDefined();
    
    if (srNoCol?.render) {
      const { container } = render(srNoCol.render(1, mockReviewData[0], 0) as React.ReactElement);
      expect(container.textContent).toBe('1');
    }
  });

  it('should render wardNo correctly', () => {
    const columns = getCombinePropertyColumns(mockT, mockReviewData);
    const wardNoCol = columns.find(c => c.key === 'wardNo');
    
    if (wardNoCol?.render) {
      const { container } = render(wardNoCol.render('W1', mockReviewData[0], 0) as React.ReactElement);
      expect(container.textContent).toBe('W1');
    }
  });

  it('should render ownerName correctly and highlight mismatches', () => {
    const columns = getCombinePropertyColumns(mockT, mockReviewData);
    const ownerCol = columns.find(c => c.key === 'ownerName');
    
    if (ownerCol?.render) {
      // First row (reference owner)
      const { container: container1 } = render(ownerCol.render('John Doe', mockReviewData[0], 0) as React.ReactElement);
      expect(container1.textContent).toBe('John Doe');
      expect(container1.querySelector('.text-red-500')).toBeNull();

      // Second row (matching owner)
      const { container: container2 } = render(ownerCol.render('John Doe', mockReviewData[1], 1) as React.ReactElement);
      expect(container2.querySelector('.text-red-500')).toBeNull();

      // Third row (mismatch owner)
      const { container: container3 } = render(ownerCol.render('Mismatch Owner', mockReviewData[2], 2) as React.ReactElement);
      expect(container3.querySelector('.text-red-500')).not.toBeNull();
    }
  });

  it('should format amounts correctly', () => {
    const columns = getCombinePropertyColumns(mockT, mockReviewData);
    const taxCol = columns.find(c => c.key === 'taxAmount');
    
    if (taxCol?.render) {
      const { container } = render(taxCol.render(1000, mockReviewData[0], 0) as React.ReactElement);
      // Depending on locale config, typically includes commas
      expect(container.textContent).toContain('₹1,000');
    }
  });

  it('should handle missing values gracefully', () => {
    const columns = getCombinePropertyColumns(mockT, mockReviewData);
    
    const occupierCol = columns.find(c => c.key === 'occupierName');
    if (occupierCol?.render) {
      const { container } = render(occupierCol.render(null, mockReviewData[2], 2) as React.ReactElement);
      expect(container.textContent).toBe('—');
    }
    
    const wardCol = columns.find(c => c.key === 'wardNo');
    if (wardCol?.render) {
      const { container } = render(wardCol.render(null, mockReviewData[2], 2) as React.ReactElement);
      expect(container.textContent).toBe('-');
    }
  });
});
