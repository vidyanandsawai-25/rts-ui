import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaxDetails from '@/components/modules/property-tax/ptis/TaxDetails/TaxDetails';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'netTaxes': 'Net Taxes',
      'retain': 'Retain',
      'hearing': 'Hearing',
      'allTaxes': 'All Taxes',
      'taxes': 'Taxes',
      'totalTax': 'Total Tax',
    };
    return translations[key] || key;
  }),
}));

// Mock MasterTable component
vi.mock('@/components/common/MasterTable', () => ({
  MasterTable: vi.fn(({ columns, data, loading, getRowKey }) => (
    <div data-testid="master-table">
      <table>
        <thead>
          <tr>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {columns.map((col: any) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>Loading...</td>
            </tr>
          ) : (
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            data.map((row: any) => (
              <tr key={getRowKey(row)} data-testid={`tax-row-${getRowKey(row)}`}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {columns.map((col: any) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )),
}));

describe('TaxDetails Component', () => {
  const mockTaxDetailsData: TaxDetailsData = {
    propertyId: 12345,
    policies: [
      {
        policyCode: 'NETTAX',
        taxAmounts: [
          { taxName: 'General Tax', taxAmount: 5000 },
          { taxName: 'Water Tax', taxAmount: 1500 },
          { taxName: 'Education Cess', taxAmount: 500 },
        ],
        taxTotal: 7000,
      },
    ],
  };

  const emptyTaxDetailsData: TaxDetailsData = {
    propertyId: 0,
    policies: [
      {
        policyCode: 'NETTAX',
        taxAmounts: [],
        taxTotal: 0,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component without errors', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);
      expect(screen.getByTestId('master-table')).toBeInTheDocument();
    });

    it('should render MasterTable component', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);
      const table = screen.getByTestId('master-table');
      expect(table).toBeInTheDocument();
    });

    it('should have correct display name', () => {
      expect(TaxDetails.displayName).toBe('TaxDetails');
    });
  });

  describe('Table Structure', () => {
    it('should render correct number of columns', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      // Expected columns: Taxes + 3 tax amounts + Total Tax = 5 columns
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(5);
    });

    it('should render column headers with correct labels', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      expect(screen.getByText('Taxes')).toBeInTheDocument();
      expect(screen.getByText('General Tax')).toBeInTheDocument();
      expect(screen.getByText('Water Tax')).toBeInTheDocument();
      expect(screen.getByText('Education Cess')).toBeInTheDocument();
      expect(screen.getByText('Total Tax')).toBeInTheDocument();
    });

    it('should render only the tax rows present in policies', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const rows = screen.getAllByTestId(/tax-row-/);
      expect(rows).toHaveLength(1);
    });

    it('should render tax row labels correctly', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      expect(screen.getByText('NETTAX')).toBeInTheDocument();
      expect(screen.queryByText('RETAIN')).not.toBeInTheDocument();
      expect(screen.queryByText('HEARING')).not.toBeInTheDocument();
      expect(screen.queryByText('ALLTAXES')).not.toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display tax amounts correctly formatted', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      // Check for formatted numbers (Indian number format with 2 decimal places)
      expect(screen.getByText('5,000.00')).toBeInTheDocument();
      expect(screen.getByText('1,500.00')).toBeInTheDocument();
      expect(screen.getByText('500.00')).toBeInTheDocument();
    });

    it('should calculate and display total tax correctly', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      // Total should be 5000 + 1500 + 500 = 7000.00
      expect(screen.getByText('7,000.00')).toBeInTheDocument();
    });

    it('should display zeros for empty amounts', () => {
      render(<TaxDetails initialTaxDetails={emptyTaxDetailsData} />);

      const zeroValues = screen.getAllByText('0.00');
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tax amounts array gracefully', () => {
      render(<TaxDetails initialTaxDetails={emptyTaxDetailsData} />);

      expect(screen.getByTestId('master-table')).toBeInTheDocument();
      const rows = screen.getAllByTestId(/tax-row-/);
      expect(rows).toHaveLength(1); // Should render 1 row for NETTAX
    });

    it('should handle missing policies array', () => {
      const invalidData = {
        propertyId: 12345,
        policies: [],
      } as TaxDetailsData;

      render(<TaxDetails initialTaxDetails={invalidData} />);
      expect(screen.getByTestId('master-table')).toBeInTheDocument();
    });

    it('should handle undefined tax amounts in policies', () => {
      const dataWithUndefinedAmounts: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [],
            taxTotal: 0,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={dataWithUndefinedAmounts} />);
      const table = screen.getByTestId('master-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format large numbers with Indian locale', () => {
      const largeAmountData: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [
              { taxName: 'Property Tax', taxAmount: 123456.78 },
            ],
            taxTotal: 123456.78,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={largeAmountData} />);
      const formattedNumbers = screen.getAllByText('1,23,456.78');
      expect(formattedNumbers.length).toBeGreaterThan(0);
    });

    it('should handle decimal values correctly', () => {
      const decimalData: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [
              { taxName: 'Tax', taxAmount: 100.5 },
            ],
            taxTotal: 100.5,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={decimalData} />);
      const formattedNumbers = screen.getAllByText('100.50');
      expect(formattedNumbers.length).toBeGreaterThan(0);
    });

    it('should display zero values with proper formatting', () => {
      const zeroData: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [
              { taxName: 'Tax', taxAmount: 0 },
            ],
            taxTotal: 0,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={zeroData} />);
      const zeroValues = screen.getAllByText('0.00');
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });

  describe('Tax Label Styling', () => {
    it('should apply correct styles to Net Taxes label', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);
      const netTaxesLabel = screen.getByText('NETTAX');

      expect(netTaxesLabel).toHaveClass('bg-slate-100');
      expect(netTaxesLabel).toHaveClass('text-slate-700');
      expect(netTaxesLabel).toHaveClass('border-slate-300');
    });

    it('should apply correct styles to Retain label when present', () => {
      const data: TaxDetailsData = {
        propertyId: 123,
        policies: [{ policyCode: 'RETAIN', taxAmounts: [], taxTotal: 0 }],
      };
      render(<TaxDetails initialTaxDetails={data} />);
      const retainLabel = screen.getByText('RETAIN');

      expect(retainLabel).toHaveClass('bg-blue-50');
      expect(retainLabel).toHaveClass('text-blue-700');
      expect(retainLabel).toHaveClass('border-blue-200');
    });

    it('should apply correct styles to Hearing label when present', () => {
      const data: TaxDetailsData = {
        propertyId: 123,
        policies: [{ policyCode: 'HEARING', taxAmounts: [], taxTotal: 0 }],
      };
      render(<TaxDetails initialTaxDetails={data} />);
      const hearingLabel = screen.getByText('HEARING');

      expect(hearingLabel).toHaveClass('bg-purple-50');
      expect(hearingLabel).toHaveClass('text-purple-700');
      expect(hearingLabel).toHaveClass('border-purple-200');
    });

    it('should apply correct styles to All Taxes label when present', () => {
      const data: TaxDetailsData = {
        propertyId: 123,
        policies: [{ policyCode: 'ALLTAXES', taxAmounts: [], taxTotal: 0 }],
      };
      render(<TaxDetails initialTaxDetails={data} />);
      const allTaxesLabel = screen.getByText('ALLTAXES');

      expect(allTaxesLabel).toHaveClass('bg-rose-50');
      expect(allTaxesLabel).toHaveClass('text-rose-700');
      expect(allTaxesLabel).toHaveClass('border-rose-200');
    });

    it('should apply deterministic fallback styles to unknown policy codes like PRADIP using defined theme colors', () => {
      const data: TaxDetailsData = {
        propertyId: 123,
        policies: [{ policyCode: 'PRADIP', taxAmounts: [], taxTotal: 0 }],
      };
      render(<TaxDetails initialTaxDetails={data} />);
      const dynamicLabel = screen.getByText('PRADIP');

      // Assert that it resolves to one of the 4 defined theme colors and not the old gray-50 default fallback
      expect(dynamicLabel).not.toHaveClass('bg-gray-50');
      expect(dynamicLabel.className).toMatch(/bg-(purple-50|blue-50|slate-100|rose-50)/);
    });
  });

  describe('MasterTable Integration', () => {
    it('should pass loading false to MasterTable', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      // Verify table is rendered (indirectly confirms loading is false)
      expect(screen.getByTestId('master-table')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render correct row keys', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      // Verify row is rendered with correct key
      expect(screen.getByTestId('tax-row-100')).toBeInTheDocument();
      expect(screen.queryByTestId('tax-row-101')).not.toBeInTheDocument();
    });

    it('should pass data array with correct number of rows to MasterTable', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const rows = screen.getAllByTestId(/tax-row-/);
      expect(rows).toHaveLength(1);
    });
  });

  describe('Dynamic Column Generation', () => {
    it('should generate columns based on tax amounts array', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      // Should have columns for each tax type
      expect(screen.getByText('General Tax')).toBeInTheDocument();
      expect(screen.getByText('Water Tax')).toBeInTheDocument();
      expect(screen.getByText('Education Cess')).toBeInTheDocument();
    });

    it('should handle single tax type', () => {
      const singleTaxData: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [
              { taxName: 'Property Tax', taxAmount: 10000 },
            ],
            taxTotal: 10000,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={singleTaxData} />);

      // Should have 3 columns: Taxes + Property Tax + Total Tax
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3);
    });

    it('should handle multiple tax types', () => {
      const multiTaxData: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [
              { taxName: 'Tax1', taxAmount: 1000 },
              { taxName: 'Tax2', taxAmount: 2000 },
              { taxName: 'Tax3', taxAmount: 3000 },
              { taxName: 'Tax4', taxAmount: 4000 },
              { taxName: 'Tax5', taxAmount: 5000 },
            ],
            taxTotal: 15000,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={multiTaxData} />);

      // Should have 7 columns: Taxes + 5 tax types + Total Tax
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(7);
    });
  });

  describe('Total Calculation', () => {
    it('should correctly sum all tax amounts for Net Taxes row', () => {
      const multiTaxData: TaxDetailsData = {
        propertyId: 12345,
        policies: [
          {
            policyCode: 'NETTAX',
            taxAmounts: [
              { taxName: 'Tax1', taxAmount: 1234.56 },
              { taxName: 'Tax2', taxAmount: 2345.67 },
              { taxName: 'Tax3', taxAmount: 3456.78 },
            ],
            taxTotal: 7037.01,
          },
        ],
      };

      render(<TaxDetails initialTaxDetails={multiTaxData} />);

      // Total should be properly calculated and formatted
      // 1234.56 + 2345.67 + 3456.78 = 7037.01
      expect(screen.getByText('7,037.01')).toBeInTheDocument();
    });

    it('should show 0.00 total for empty tax amounts', () => {
      render(<TaxDetails initialTaxDetails={emptyTaxDetailsData} />);

      const zeroValues = screen.getAllByText('0.00');
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render table structure correctly', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should have proper table headers', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBeGreaterThan(0);
    });

    it('should have proper table rows', () => {
      render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const rows = screen.getAllByRole('row');
      // Should have header row + 1 data row
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Component Structure', () => {
    it('should render wrapper div with correct classes', () => {
      const { container } = render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const wrapper = container.querySelector('.tax-details-container');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('w-full', 'overflow-x-auto');
    });

    it('should render inner div with min-w-max class', () => {
      const { container } = render(<TaxDetails initialTaxDetails={mockTaxDetailsData} />);

      const innerDiv = container.querySelector('.min-w-max');
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe('Undefined Data Handling', () => {
    it('should render empty table when initialTaxDetails is undefined', () => {
      render(<TaxDetails initialTaxDetails={undefined} />);

      // Should render the table structure even with undefined data
      expect(screen.getByTestId('master-table')).toBeInTheDocument();
    });

    it('should not throw error when initialTaxDetails is undefined', () => {
      expect(() => {
        render(<TaxDetails initialTaxDetails={undefined} />);
      }).not.toThrow();
    });
  });
});
