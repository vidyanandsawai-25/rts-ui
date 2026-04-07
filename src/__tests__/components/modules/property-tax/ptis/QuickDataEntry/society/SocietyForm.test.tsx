import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    };
    return translations[key] || key;
  },
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
    render(<SocietyForm societyData={mockData as any} propertyIdSearch={123} />);
    
    expect(screen.getByDisplayValue('Gokuldham')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jethalal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bhide')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Powai')).toBeInTheDocument();
  });

  it('submits form with valid data successfully', async () => {
    (updatePropertySocietyDetailsAction as any).mockResolvedValue({ success: true });
    
    render(<SocietyForm societyData={mockData as any} propertyIdSearch={123} />);

    // Click submit button (the test will pass original mockData which is valid)
    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Society details updated successfully");
    });
  });

  it('handles server action error correctly', async () => {
    (updatePropertySocietyDetailsAction as any).mockRejectedValue(new Error('Update failed'));

    render(<SocietyForm societyData={mockData as any} propertyIdSearch={123} />);
    
    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An error occurred during update.");
    });
  });

  it('stops submission and shows validation error for invalid name', async () => {
    render(<SocietyForm societyData={mockData as any} propertyIdSearch={123} />);
    
    // Change builderName to something containing invalid characters
    const builderInput = screen.getByDisplayValue('Asit Modi');
    fireEvent.change(builderInput, { target: { value: 'Asit123', name: 'builderName' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid Builder Name'));
    });
  });

  it('stops submission and shows validation error for invalid email format', async () => {
    render(<SocietyForm societyData={mockData as any} propertyIdSearch={123} />);
    
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
    render(<SocietyForm societyData={{...mockData, managerMobileNo: '123'} as any} propertyIdSearch={123} />);
    
    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertySocietyDetailsAction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Manager Mobile Number must be 10 digits'));
    });
  });

});
