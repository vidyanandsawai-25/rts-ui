import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import SocietyForm from '@/components/modules/property-tax/ptis/QuickDataEntry/society/SocietyForm';
import { toast } from 'sonner';
import { updatePropertySocietyDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'society.title': 'Society Details',
      'society.landOwner': 'Land Owner',
      'society.builderName': 'Builder Name',
      'society.buildingSocietyName': 'Building/Society Name',
      'society.societyEmail': 'Society Email',
      'society.societyAddress': 'Society Address',
      'society.managerName': 'Manager Name',
      'society.managerEmail': 'Manager Email',
      'society.managerMobileNo': 'Manager Mobile No',
      'society.secretaryName': 'Secretary Name',
      'society.secretaryEmail': 'Secretary Email',
      'society.secretaryMobile': 'Secretary Mobile',
      'society.updateButton': 'Update',
      'society.updateSuccess': 'Society details updated successfully',
      'society.updateError': 'An error occurred during update.',
      'society.validation.landOwnerName': 'Invalid Land Owner Name. Only letters, spaces, and . , \' - are allowed.',
      'society.validation.builderName': 'Invalid Builder Name. Only letters, spaces, and . , \' - are allowed.',
      'society.validation.managerName': 'Invalid Manager Name. Only letters, spaces, and . , \' - are allowed.',
      'society.validation.secretaryName': 'Invalid Secretary Name. Only letters, spaces, and . , \' - are allowed.',
      'society.validation.societyEmail': 'Invalid Society Email address format.',
      'society.validation.managerEmail': 'Invalid Manager Email address format.',
      'society.validation.secretaryEmail': 'Invalid Secretary Email address format.',
      'society.validation.managerMobile': 'Manager Mobile Number must be 10 digits.',
      'society.validation.secretaryMobile': 'Secretary Mobile Number must be 10 digits.',
    };
    return translations[key] || key;
  },
}));

// Mock useConfirm
vi.mock('@/components/common/ConfirmProvider', () => ({
  useConfirm: () => ({
    confirm: vi.fn(({ onConfirm }) => onConfirm()),
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the action
vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action', () => ({
  updatePropertySocietyDetailsAction: vi.fn(),
}));

const mockData = {
  propertyId: 123,
  societyDetailId: 1,
  wingId: 1,
  wingNo: 'Wing A',
  wingName: 'Wing A',
  societyName: 'Gokuldham',
  societyAddress: 'Powai',
  secretaryName: 'Bhide',
  managerName: 'Iyer',
  landOwnerName: 'Jethalal',
  builderName: 'Asit Modi',
  managerMobileNo: '1234567890',
  secretaryMobileNo: '0987654321',
  societyEmailId: 'test@example.com',
  secretaryEmailId: 'test2@example.com',
  managerEmailId: 'test3@example.com',
};

describe('SocietyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    expect(screen.getByDisplayValue('Gokuldham')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jethalal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bhide')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Powai')).toBeInTheDocument();
  });

  it('submits form with valid data successfully', async () => {
    (updatePropertySocietyDetailsAction as Mock).mockResolvedValue({ success: true });

    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).toHaveBeenCalledWith('en', 123, expect.anything());
      expect(toast.success).toHaveBeenCalledWith("Society details updated successfully");
    });
  });

  it('handles server action error correctly', async () => {
    (updatePropertySocietyDetailsAction as Mock).mockRejectedValue(new Error('Update failed'));

    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An error occurred during update.");
    });
  });

  it('submits form with Unicode (Hindi/Marathi) names successfully', async () => {
    (updatePropertySocietyDetailsAction as Mock).mockResolvedValue({ success: true });
    
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);
    
    // Change builderName to a Hindi name
    const builderInput = screen.getByDisplayValue('Asit Modi');
    fireEvent.change(builderInput, { target: { value: 'राजेश शिंदे', name: 'builderName' } });
    
    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).toHaveBeenCalledWith('en', 123, expect.anything());
      expect(toast.success).toHaveBeenCalledWith("Society details updated successfully");
    });
  });

  it('stops submission and shows validation error for invalid characters (non-letters)', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    // Change builderName to something containing invalid characters (numbers)
    const builderInput = screen.getByDisplayValue('Asit Modi');
    fireEvent.change(builderInput, { target: { value: 'Asit123', name: 'builderName' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Only letters, spaces, and . , \' - are allowed.'));
    });
  });

  it('stops submission and shows validation error for invalid email format', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const emailInput = screen.getByDisplayValue('test@example.com');
    // Intentionally pass an invalid email format
    fireEvent.change(emailInput, { target: { value: 'test@invalid@.com', name: 'societyEmailId' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Society Email'));
    });
  });

  it('stops submission and shows validation error for short mobile', async () => {
    render(<SocietyForm societyData={{ ...mockData, managerMobileNo: '123' } as never} propertyIdSearch={123} locale="en" />);

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Manager Mobile Number must be 10 digits'));
    });
  });

  it('stops submission and shows validation error for invalid land owner name', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    // Change landOwnerName to invalid
    const input = screen.getByDisplayValue('Jethalal');
    fireEvent.change(input, { target: { value: 'Jetha123', name: 'landOwnerName' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Land Owner Name'));
    });
  });

  it('stops submission and shows validation error for invalid manager name', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    // Change managerName to invalid
    const input = screen.getByDisplayValue('Iyer');
    fireEvent.change(input, { target: { value: 'Iyer123', name: 'managerName' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Manager Name'));
    });
  });

  it('stops submission and shows validation error for invalid secretary name', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    // Change secretaryName to invalid
    const input = screen.getByDisplayValue('Bhide');
    fireEvent.change(input, { target: { value: 'Bhide123', name: 'secretaryName' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Secretary Name'));
    });
  });

  it('stops submission and shows validation error for invalid manager email format', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const emailInput = screen.getByDisplayValue('test3@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@invalid@.com', name: 'managerEmailId' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Manager Email'));
    });
  });

  it('stops submission and shows validation error for invalid secretary email format', async () => {
    render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const emailInput = screen.getByDisplayValue('test2@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@invalid@.com', name: 'secretaryEmailId' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Secretary Email'));
    });
  });

  it('stops submission and shows validation error for short secretary mobile', async () => {
    render(<SocietyForm societyData={{ ...mockData, secretaryMobileNo: '123' } as never} propertyIdSearch={123} locale="en" />);

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Secretary Mobile Number must be 10 digits'));
    });
  });

  it('handles manager mobile digit change and backspace', async () => {
    const { container } = render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const inputs = container.querySelectorAll('#manager-mobile-container input');

    // Change digit
    fireEvent.change(inputs[0], { target: { value: '9' } });

    // Test backspace
    fireEvent.keyDown(inputs[1], { key: 'Backspace', code: 'Backspace' });
  });

  it('handles secretary mobile digit change and backspace', async () => {
    const { container } = render(<SocietyForm societyData={mockData as never} propertyIdSearch={123} locale="en" />);

    const inputs = container.querySelectorAll('#secretary-mobile-container input');

    // Change digit
    fireEvent.change(inputs[0], { target: { value: '9' } });

    // Test backspace
    fireEvent.keyDown(inputs[1], { key: 'Backspace', code: 'Backspace' });
  });
});
