import { vi, describe, test, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicableTaxes from '@/components/modules/property-tax/ptis/applicable-taxes/ApplicableTaxes';
import ApplicableTaxesTabNavigation from '@/components/modules/property-tax/ptis/applicable-taxes/ApplicableTaxesTabNavigation';
import { updateTaxApplicabilityAction } from '@/app/[locale]/property-tax/ptis/applicable-taxes/action';
import { toast } from 'sonner';

// Setup Mock Spies
const mockConfirm = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();
let mockPathname = '/en/property-tax/ptis/applicable-taxes/applicable';
const mockParams = { locale: 'en' };
let mockSearchParams = new URLSearchParams('propertyId=123&wardNo=W-01&propertyNo=P-100&asseYear=1&floorUse=2');

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string, values?: Record<string, unknown>) => {
    if (values && values.name) return `applicableTaxes.${key}:${values.name}`;
    return `applicableTaxes.${key}`;
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
  useParams: () => mockParams,
}));

// Mock useDebounce hook to execute instantly
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (val: unknown) => val,
}));

// Mock action file
vi.mock('@/app/[locale]/property-tax/ptis/applicable-taxes/action', () => ({
  updateTaxApplicabilityAction: vi.fn(),
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

interface SearchSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (e: unknown, val: string) => void;
  placeholder: string;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

// Mock common UI components to simplify render tree
vi.mock('@/components/common', () => {
  return {
    SearchSelect: ({ options, value, onChange, placeholder }: SearchSelectProps) => (
      <select
        data-testid={`search-select-${placeholder}`}
        value={value}
        onChange={(e) => onChange(null, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
    useConfirm: () => ({
      confirm: mockConfirm,
    }),
    ToggleSwitch: ({ checked, onChange, id }: ToggleSwitchProps) => (
      <input
        type="checkbox"
        data-testid={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    ),
    Button: ({ children, onClick }: ButtonProps) => (
      <button data-testid="common-button" onClick={onClick}>{children}</button>
    )
  };
});

import type { Column } from '@/components/common';
import type {
  TaxApplicabilityItem,
  PagedResponse,
  AssessmentYearRangeItem,
  TypeOfUseGroupItem,
} from '@/types/applicable-taxes.types';

interface TaxesTableTemplateProps {
  columns: Column<TaxApplicabilityItem>[];
  data: TaxApplicabilityItem[];
  pageNumber: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

// Mock Taxes Table template for test visibility
vi.mock('@/components/modules/property-tax/ptis/applicable-taxes/TaxesTableTemplate', () => {
  return {
    TaxesTableTemplate: ({ columns, data, pageNumber, totalCount, onPageChange }: TaxesTableTemplateProps) => (
      <div data-testid="taxes-table">
        <span data-testid="page-number">{pageNumber}</span>
        <span data-testid="total-count">{totalCount}</span>
        <button data-testid="change-page-btn" onClick={() => onPageChange(2)}>Next Page</button>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key as string}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} data-testid="table-row">
                {columns.map((col) => (
                  <td key={col.key as string} data-testid={`cell-${col.key as string}`}>
                    {col.render ? col.render(row[col.key as keyof TaxApplicabilityItem], row, i) : String(row[col.key as keyof TaxApplicabilityItem] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  };
});

// Test Mock Inputs
const mockAsseYearsResponse: PagedResponse<AssessmentYearRangeItem> = {
  items: [
    { id: 1, fromYear: 2023, toYear: 2024, isActive: true },
    { id: 2, fromYear: 2024, toYear: 2025, isActive: true },
    { id: 3, fromYear: 2025, toYear: 2026, isActive: false },
  ],
  totalCount: 3,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

const mockUseGroupsResponse: PagedResponse<TypeOfUseGroupItem> = {
  items: [
    { id: 1, typeOfUseGroupCode: 'UG01', groupName: 'Residential', groupIcon: 'home', isActive: true },
    { id: 2, typeOfUseGroupCode: 'UG02', groupName: 'Commercial', groupIcon: 'building', isActive: true },
    { id: 3, typeOfUseGroupCode: 'UG03', groupName: 'Industrial', groupIcon: 'factory', isActive: false },
  ],
  totalCount: 3,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

const mockTaxApplicabilityResponse: TaxApplicabilityItem[] = [
  { taxId: 10, taxHead: 'Property Tax', taxCode: 'PT01', calculationType: 'Rate based', taxPercentage: 12.5, taxAmount: 0, isApplicable: true, isActive: true },
  { taxId: 11, taxHead: 'Water Tax', taxCode: 'WT01', calculationType: 'Flat rate', taxPercentage: 5.0, taxAmount: 0, isApplicable: false, isActive: false },
  { taxId: 12, taxHead: 'Education Cess', taxCode: 'EC01', calculationType: 'Percentage', taxPercentage: 2.0, taxAmount: 0, isApplicable: true, isActive: true },
];

describe('ApplicableTaxes Screen Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('propertyId=123&wardNo=W-01&propertyNo=P-100&asseYear=1&floorUse=2');
    mockPathname = '/en/property-tax/ptis/applicable-taxes/applicable';
  });

  test('Component mounts and renders structure correctly', () => {
    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    // Verify property information card
    expect(screen.getByText('applicableTaxes.property')).toBeInTheDocument();
    expect(screen.getByText('W-01 / P-100')).toBeInTheDocument();

    // Verify select dropdown components
    expect(screen.getByTestId('search-select-applicableTaxes.selectAsseYear')).toBeInTheDocument();
    expect(screen.getByTestId('search-select-applicableTaxes.selectFloorUse')).toBeInTheDocument();

    // Verify selection list lengths mapping only active items
    const yearSelect = screen.getByTestId('search-select-applicableTaxes.selectAsseYear');
    expect(yearSelect.children.length).toBe(3); // placeholder + 2 active years
    
    const useSelect = screen.getByTestId('search-select-applicableTaxes.selectFloorUse');
    expect(useSelect.children.length).toBe(3); // placeholder + 2 active use groups
  });

  test('Updates parameters on dropdown changes', () => {
    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    const yearSelect = screen.getByTestId('search-select-applicableTaxes.selectAsseYear');
    fireEvent.change(yearSelect, { target: { value: '2' } });

    expect(mockReplace).toHaveBeenCalledWith(
      '/en/property-tax/ptis/applicable-taxes/applicable?propertyId=123&wardNo=W-01&propertyNo=P-100&asseYear=2&floorUse=2'
    );
  });

  test('Renders correct columns and filters active rows inside the active tab', () => {
    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    const tableRows = screen.getAllByTestId('table-row');
    // Active tab filters out non-active taxes (Water Tax with isActive=false is hidden)
    expect(tableRows.length).toBe(2);

    expect(screen.getByText('Property Tax')).toBeInTheDocument();
    expect(screen.getByText('Education Cess')).toBeInTheDocument();
  });

  test('Pagination works and switches page lists', () => {
    // Generate 15 active taxes to test pagination
    const largeTaxes: TaxApplicabilityItem[] = Array.from({ length: 15 }, (_, i) => ({
      taxId: i,
      taxHead: `Tax ${i}`,
      taxCode: `T${i}`,
      calculationType: 'Rate based',
      taxPercentage: 1.0,
      taxAmount: 0,
      isApplicable: true,
      isActive: true,
    }));

    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={largeTaxes}
        applicableCount={15}
        exemptedCount={0}
      />
    );

    expect(screen.getByTestId('page-number').textContent).toBe('1');
    expect(screen.getAllByTestId('table-row').length).toBe(10); // Page size is 10

    // Click next page button
    fireEvent.click(screen.getByTestId('change-page-btn'));
    expect(screen.getByTestId('page-number').textContent).toBe('2');
    expect(screen.getAllByTestId('table-row').length).toBe(5); // Remaining 5 items
  });

  test('Search filter restricts mapped items correctly', () => {
    mockSearchParams = new URLSearchParams('propertyId=123&search=Education');
    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    expect(screen.getAllByTestId('table-row').length).toBe(1);
    expect(screen.getByText('Education Cess')).toBeInTheDocument();
    expect(screen.queryByText('Property Tax')).toBeNull();
  });

  test('Toggle triggers confirm dialog, calls action, and refreshes page on success', async () => {
    vi.mocked(updateTaxApplicabilityAction).mockResolvedValue({ success: true });
    mockConfirm.mockImplementation(({ onConfirm }) => onConfirm());

    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    const toggle = screen.getByTestId('toggle-10');
    fireEvent.click(toggle);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(updateTaxApplicabilityAction).toHaveBeenCalledWith('en', {
        propertyId: 123,
        taxes: [{ taxId: 10, isApplicable: false }],
        userId: 0,
      });
      expect(toast.success).toHaveBeenCalledWith(
        'applicableTaxes.success.updateTaxApplicability:Property Tax'
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  test('Toggle displays toast error if API call fails', async () => {
    vi.mocked(updateTaxApplicabilityAction).mockResolvedValue({
      success: false,
      error: 'Backend Failure API Error Message',
    });
    mockConfirm.mockImplementation(({ onConfirm }) => onConfirm());

    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    const toggle = screen.getByTestId('toggle-10');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Backend Failure API Error Message');
    });
  });

  test('Close button in fixed footer pushes to parent view screen', () => {
    render(
      <ApplicableTaxes
        asseYearsResponse={mockAsseYearsResponse}
        useGroupsResponse={mockUseGroupsResponse}
        valuationTab=""
        taxApplicabilityResponse={mockTaxApplicabilityResponse}
        applicableCount={2}
        exemptedCount={1}
      />
    );

    fireEvent.click(screen.getByTestId('common-button')); // Fixed footer button has no direct label in mock
    expect(mockPush).toHaveBeenCalledWith(
      '/en/property-tax/ptis?propertyId=123&wardNo=W-01&propertyNo=P-100&asseYear=1&floorUse=2'
    );
  });
});

describe('ApplicableTaxesTabNavigation component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('propertyId=123&asseYear=1&floorUse=2');
  });

  test('Renders navigation counts and search input', () => {
    render(
      <ApplicableTaxesTabNavigation
        applicableCount={5}
        exemptedCount={9}
      />
    );

    expect(screen.getByPlaceholderText('applicableTaxes.searchPlaceholder')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  test('Updates local search input and replaces url params via debouncing', async () => {
    render(
      <ApplicableTaxesTabNavigation
        applicableCount={5}
        exemptedCount={9}
      />
    );

    const searchInput = screen.getByPlaceholderText('applicableTaxes.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'custom-search' } });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/en/property-tax/ptis/applicable-taxes/applicable?propertyId=123&asseYear=1&floorUse=2&search=custom-search'
      );
    });
  });
});
