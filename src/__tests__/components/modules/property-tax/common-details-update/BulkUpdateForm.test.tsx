import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkUpdateForm } from '@/components/modules/property-tax/common-details-update/BulkUpdateForm';
import { BulkUpdateMaster, BulkUpdateFieldConfig } from '@/types/common-details-update/common-details-update.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('BulkUpdateForm', () => {
  const mockT = (key: string) => key;
  const mockSelectedMenuItem: BulkUpdateMaster = {
    id: 1,
    updateCode: 'UPDATE_ADDRESS',
    updateName: 'Update Address',
    updateNameMarathi: 'पत्ता अपडेट करा',
    iconName: 'MapPin',
    targetTable: 'Property',
    isActive: true,
    displaySequence: 1,
    apiRoute: '/api/bulk-update/address',
  };

  const mockFieldConfigs: BulkUpdateFieldConfig[] = [
    {
      id: 1,
      bulkUpdateMasterId: 1,
      fieldName: 'addressEnglish',
      displayName: 'Address (English)',
      displayNameMarathi: 'पत्ता (इंग्रजी)',
      controlType: 'textbox',
      dataType: 'string',
      isRequired: true,
      defaultValue: '',
      validationRegex: null,
      sequenceNo: 1,
      isActive: true,
      isReadonly: false,
      bindApi: null,
    },
    {
      id: 2,
      bulkUpdateMasterId: 1,
      fieldName: 'addressMarathi',
      displayName: 'Address (Marathi)',
      displayNameMarathi: 'पत्ता (मराठी)',
      controlType: 'textbox',
      dataType: 'string',
      isRequired: true,
      defaultValue: '',
      validationRegex: null,
      sequenceNo: 2,
      isActive: true,
      isReadonly: false,
      bindApi: null,
    },
  ];

  const defaultProps = {
    t: mockT,
    selectedMenuItem: mockSelectedMenuItem,
    fieldConfigs: mockFieldConfigs,
    loadingConfigs: false,
    formValues: {},
    formSubmitted: false,
    saving: false,
    selectedCount: 0,
    onFieldChange: vi.fn(),
    onUpdate: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render prompt when no menu item is selected', () => {
    render(<BulkUpdateForm {...defaultProps} selectedMenuItem={undefined} />);
    
    expect(screen.getByText('form.selectMenuPrompt')).toBeInTheDocument();
  });

  it('should show loading state when configs are loading', () => {
    render(
      <BulkUpdateForm
        {...defaultProps}
        loadingConfigs={true}
      />
    );
    
    expect(screen.getByText('loading.message')).toBeInTheDocument();
  });

  it('should show no fields message when configs are empty', () => {
    render(
      <BulkUpdateForm
        {...defaultProps}
        fieldConfigs={[]}
      />
    );
    
    expect(screen.getByText('form.noFields')).toBeInTheDocument();
  });

  it('should render form fields when configs are loaded', () => {
    render(<BulkUpdateForm {...defaultProps} />);
    
    expect(screen.getByText('Address (English)')).toBeInTheDocument();
    expect(screen.getByText('Address (Marathi)')).toBeInTheDocument();
  });

  it('should show selection count with singular property', () => {
    render(<BulkUpdateForm {...defaultProps} selectedCount={1} />);
    
    expect(screen.getByText(/1 preview.property preview.selected/)).toBeInTheDocument();
  });

  it('should show selection count with plural properties', () => {
    render(<BulkUpdateForm {...defaultProps} selectedCount={5} />);
    
    expect(screen.getByText(/5 preview.properties preview.selected/)).toBeInTheDocument();
  });

  it('should not show selection count when no properties selected', () => {
    render(<BulkUpdateForm {...defaultProps} selectedCount={0} />);
    
    expect(screen.queryByText(/preview.selected/)).not.toBeInTheDocument();
  });

  it('should call onUpdate when update button is clicked', async () => {
    const user = userEvent.setup();
    render(<BulkUpdateForm {...defaultProps} selectedCount={3} />);
    
    const updateButton = screen.getByRole('button', { name: 'form.update' });
    await user.click(updateButton);
    
    expect(defaultProps.onUpdate).toHaveBeenCalledTimes(1);
  });

  it('should call onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<BulkUpdateForm {...defaultProps} selectedCount={3} />);
    
    const clearButton = screen.getByRole('button', { name: 'form.clear' });
    await user.click(clearButton);
    
    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it('should disable update button when no properties selected', () => {
    render(<BulkUpdateForm {...defaultProps} selectedCount={0} />);
    
    const updateButton = screen.getByRole('button', { name: 'form.update' });
    expect(updateButton).toBeDisabled();
  });

  it('should disable update button when saving', () => {
    render(<BulkUpdateForm {...defaultProps} selectedCount={3} saving={true} />);
    
    const updateButton = screen.getByRole('button', { name: 'form.updating' });
    expect(updateButton).toBeDisabled();
  });

  it('should show updating text when saving', () => {
    render(<BulkUpdateForm {...defaultProps} selectedCount={3} saving={true} />);
    
    expect(screen.getByText('form.updating')).toBeInTheDocument();
  });

  it('should render form title', () => {
    render(<BulkUpdateForm {...defaultProps} />);
    
    expect(screen.getByText('form.title')).toBeInTheDocument();
  });
});
