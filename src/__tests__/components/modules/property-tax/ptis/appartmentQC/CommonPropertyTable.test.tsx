import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommonPropertyTable from '@/components/modules/property-tax/ptis/appartmentQC/CommonPropertyTable';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (key === 'apartmentTabs.showingData' && values) {
      return `Showing ${values.tab} data`;
    }
    if (key === 'searchPlaceholder') return 'Search properties...';
    return key;
  },
}));

describe('CommonPropertyTable', () => {
  const mockProps = {
    columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }] as any,
    data: [{ id: '1', name: 'Prop 1' }, { id: '2', name: 'Prop 2' }],
    title: 'Property List',
    activeTab: 'residential',
    searchQuery: '',
    onSearchChange: vi.fn(),
    onRowClick: vi.fn(),
    isAutoScrolling: false,
    onToggleAutoScroll: vi.fn(),
  };

  it('renders title and active tab info', () => {
    render(<CommonPropertyTable {...mockProps} />);
    expect(screen.getByText('Property List')).toBeInTheDocument();
    expect(screen.getByText(/Showing residential data/)).toBeInTheDocument();
  });

  it('renders table headers and data', () => {
    render(<CommonPropertyTable {...mockProps} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Prop 1')).toBeInTheDocument();
    expect(screen.getByText('Prop 2')).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', () => {
    render(<CommonPropertyTable {...mockProps} />);
    const searchInput = screen.getByPlaceholderText('Search properties...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls onRowClick when a row is clicked', () => {
    render(<CommonPropertyTable {...mockProps} />);
    const rowCell = screen.getByText('Prop 1');
    fireEvent.click(rowCell);
    expect(mockProps.onRowClick).toHaveBeenCalledWith(mockProps.data[0]);
  });
});
