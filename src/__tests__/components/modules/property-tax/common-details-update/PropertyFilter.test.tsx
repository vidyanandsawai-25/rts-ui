import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyFilter } from '@/components/modules/property-tax/common-details-update/PropertyFilter';
import { PropertyFilterFormValues } from '@/types/common-details-update/common-details-update.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('PropertyFilter', () => {
  const mockT = (key: string) => key;
  const mockFilterValues: PropertyFilterFormValues = {
    wardId: '',
    fromPropertyNo: '',
    toPropertyNo: '',
    wingId: '',
  };

  const defaultProps = {
    t: mockT,
    filterValues: mockFilterValues,
    setFilterValues: vi.fn(),
    filterSubmitted: false,
    wardOptions: [{ label: 'Ward 1', value: '1' }],
    wingOptions: [{ label: 'Wing A', value: 'A' }],
    propertyOptions: [{ label: 'P001', value: 'P001' }],
    onWardChange: vi.fn(),
    onPropertyDropdownFocus: vi.fn(),
    onShow: vi.fn(),
    onBack: vi.fn(),
    loading: false,
    loadingPropertyOptions: false,
    canShowProperties: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter inputs', () => {
    render(<PropertyFilter {...defaultProps} />);
    
    expect(screen.getByText('filter.title')).toBeInTheDocument();
    expect(screen.getByText('filter.wardNumber')).toBeInTheDocument();
    expect(screen.getByText('filter.fromPropertyNo')).toBeInTheDocument();
    expect(screen.getByText('filter.toPropertyNo')).toBeInTheDocument();
    expect(screen.getByText('filter.wing')).toBeInTheDocument();
  });

  it('should show validation messages when submitted without required values', () => {
    render(<PropertyFilter {...defaultProps} filterSubmitted={true} />);
    
    expect(screen.getByText('messages.wardRequired')).toBeInTheDocument();
    expect(screen.getByText('messages.fromPropertyRequired')).toBeInTheDocument();
    expect(screen.getByText('messages.toPropertyRequired')).toBeInTheDocument();
  });

  it('should call onShow when show button is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyFilter {...defaultProps} />);
    
    const showBtn = screen.getByRole('button', { name: 'filter.show' });
    await user.click(showBtn);
    
    expect(defaultProps.onShow).toHaveBeenCalledTimes(1);
  });

  it('should call onBack when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyFilter {...defaultProps} />);
    
    const clearBtn = screen.getByRole('button', { name: 'filter.clear' });
    await user.click(clearBtn);
    
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('should show loading text and disable button when loading', () => {
    render(<PropertyFilter {...defaultProps} loading={true} />);
    
    const showBtn = screen.getByRole('button', { name: 'loading.message' });
    expect(showBtn).toBeDisabled();
  });
});
