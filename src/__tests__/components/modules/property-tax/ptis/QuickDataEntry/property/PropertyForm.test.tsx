import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import PropertyFormView from '@/components/modules/property-tax/ptis/QuickDataEntry/property/PropertyForm';
import { toast } from 'sonner';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(), // ✅ add this
  })),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'property.title': 'Property Details',
      'property.division': 'Division',
      'property.category': 'Category',
      'property.wing': 'Wing',
      'property.select': 'Select option',
      'property.flatShopNo': 'Flat/Shop No',
      'property.plotNo': 'Plot No',
      'property.plotArea': 'Plot Area',
      'property.propertyDescription': 'Property Description',
      'property.taxZoneNo': 'Tax Zone No',
      'property.surveyNo': 'Survey No',
      'property.subZoneNo': 'Sub Zone No',
      'property.upicId': 'UPIC ID',
      'property.residentialToilet': 'Residential Toilet',
      'property.commercialToilet': 'Commercial Toilet',
      'property.totalCarpetAreaWithUnit': 'Total Carpet Area (sq.ft / sq.m)',
      'property.buildupAreaWithUnit': 'Total Buildup Area (sq.ft / sq.m)',
      'property.updateSuccess': 'Property basic details updated successfully',
      'property.updateError': 'An error occurred during update.',
      'property.errors.updatePropertyBasicDetails': 'Failed to update property basic details',
      'property.updateConfirmTitle': 'Confirm Update',
      'property.updateConfirmText': 'Are you sure?',
      'property.updateConfirmButton': 'Yes, Update',
      'commonbuttonmessages.UpdateChanges': 'Update Changes',
      'footer.saving': 'Saving...',
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
vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action', () => ({
  updatePropertyBasicDetailsAction: vi.fn(),
}));

const mockMoujaMaster = [
  { id: 1, moujaNo: '1', moujaName: 'Susgaon', isActive: true, createdDate: '', updatedDate: null },
];

const mockPropertyCategories = [
  { id: 1, propertyCategoryName: 'Residential', isActive: true, createdDate: '', updatedDate: null },
];

const mockPropertyDescriptions = [
  { id: 1, propertyDescription: 'Empty Plot', type: 'Residential', propertyTypeGroup: '', searchKey: '', searchSequence: 1, propertyTypeCategoryId: null, isActive: true, createdDate: '', updatedDate: null },
  { id: 2, propertyDescription: 'Normal Home', type: 'Residential', propertyTypeGroup: '', searchKey: '', searchSequence: 2, propertyTypeCategoryId: null, isActive: true, createdDate: '', updatedDate: null },
];

const mockPropertyData = {
  propertyId: 123,
  wardId: 10,
  wardNo: 'W10',
  zoneId: 5,
  division: 'D1',
  propertyNo: 'P001',
  partitionNo: '0',
  flatOrShopNo: '101',
  plotNo: '15',
  surveyNo: '45/2',
  taxZoneId: 3,
  taxZoneNo: 'Z03',
  categoryId: 1,
  categoryName: 'Residential',
  propertyTypeId: 2,
  propertyDescription: 'Normal Home',
  upicId: 'UPIC123',
  subZoneNo: 'SZ1',
  wingNo: 'Wing A',
  wingId: 1,
  wingName: 'Wing A',
  noOfResidentialToilets: 2,
  noOfCommercialToilets: 0,
  totalCarpetAreaSqMeter: 100,
  totalBuiltupAreaSqMeter: 120,
  totalCarpetAreaSqFeet: 1000,
  totalBuiltupAreaSqFeet: 1500,
  plotArea: 2000,
  plotAreaFtLength: 50,
  plotAreaFtWidth: 40,
  plotAreaMtrLength: 15,
  plotAreaMtrWidth: 12,
};

const mockSocietyDetails = {
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
  societyNameEnglish: 'Gokuldham',
  societyAddressEnglish: 'Powai',
  secretaryNameEnglish: 'Bhide',
  managerNameEnglish: 'Iyer',
  landOwnerNameEnglish: 'Jethalal',
  builderNameEnglish: 'Asit Modi',
  managerMobileNo: '1234567890',
  secretaryMobileNo: '0987654321',
  societyEmailId: 'test@example.com',
  secretaryEmailId: 'test2@example.com',
  managerEmailId: 'test3@example.com',
};

describe('PropertyFormView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <PropertyFormView
        MoujaMaster={mockMoujaMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as never}
        propertySocietyDetails={mockSocietyDetails as never}
        locale="en"
        taxZones={[]}
      />
    );

    expect(screen.getByLabelText(/Division/i)).toHaveValue('D1');
    expect(screen.getByDisplayValue('101')).toBeInTheDocument(); // Flat/Shop No
    expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Plot No
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument(); // Plot Area
    expect(screen.getByDisplayValue('Z03')).toBeInTheDocument(); // Tax Zone No
    expect(screen.getByDisplayValue('45/2')).toBeInTheDocument(); // Survey No
    expect(screen.getByDisplayValue('SZ1')).toBeInTheDocument(); // Sub Zone No
    expect(screen.getByDisplayValue('UPIC123')).toBeInTheDocument(); // UPIC ID
    expect(screen.getByDisplayValue('1000.00 / 100.00')).toBeInTheDocument(); // Total Carpet Area
    expect(screen.getByDisplayValue('1500.00 / 120.00')).toBeInTheDocument(); // Buildup Area
  });

  it('disables save button initially', () => {
    const { container } = render(
      <PropertyFormView
        MoujaMaster={mockMoujaMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as never}
        propertySocietyDetails={mockSocietyDetails as never}
        locale="en"
        taxZones={[]}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
    if (!submitBtn.hasAttribute('disabled')) {
      const form = container.querySelector('form');
      const formData = form ? new FormData(form) : null;
      throw new Error(`DEBUG_INFO:
        formData taxZoneId: "${formData?.get('taxZoneId')}" (propertyData: ${mockPropertyData.taxZoneId})
        formData plotNo: "${formData?.get('plotNo')}" (propertyData: "${mockPropertyData.plotNo}")
        formData flatOrShopNo: "${formData?.get('flatOrShopNo')}" (propertyData: "${mockPropertyData.flatOrShopNo}")
        formData surveyNo: "${formData?.get('surveyNo')}" (propertyData: "${mockPropertyData.surveyNo}")
        formData subZoneNo: "${formData?.get('subZoneNo')}" (propertyData: "${mockPropertyData.subZoneNo}")
        formData plotArea: "${formData?.get('plotArea')}" (propertyData: "${mockPropertyData.plotArea}")
      `);
    }
    expect(submitBtn).toBeDisabled();
  });

  it('enables save button when data is modified', async () => {
    render(
      <PropertyFormView
        MoujaMaster={mockMoujaMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as never}
        propertySocietyDetails={mockSocietyDetails as never}
        locale="en"
        taxZones={[]}
      />
    );

    const flatInput = screen.getByLabelText(/Flat\/Shop No/i);
    fireEvent.change(flatInput, { target: { value: '202' } });

    const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('submits form with updated data', async () => {
    (updatePropertyBasicDetailsAction as Mock).mockResolvedValue({ success: true });

    render(
      <PropertyFormView
        MoujaMaster={mockMoujaMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as never}
        propertySocietyDetails={mockSocietyDetails as never}
        locale="en"
        taxZones={[]}
      />
    );

    const flatInput = screen.getByLabelText(/Flat\/Shop No/i);
    fireEvent.change(flatInput, { target: { value: '202' } });

    const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertyBasicDetailsAction).toHaveBeenCalledWith(
        'en',
        mockPropertyData.propertyId,
        expect.objectContaining({
          flatOrShopNo: '202',
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Property basic details updated successfully");
    });
  });

  it('handles submission error correctly', async () => {
    (updatePropertyBasicDetailsAction as Mock).mockResolvedValue({ success: false, error: 'Update failed' });

    render(
      <PropertyFormView
        MoujaMaster={mockMoujaMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as never}
        propertySocietyDetails={mockSocietyDetails as never}
        locale="en"
        taxZones={[]}
      />
    );

    // Enable button first
    const flatInput = screen.getByLabelText(/Flat\/Shop No/i);
    fireEvent.change(flatInput, { target: { value: '202' } });

    const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update property basic details");
    });
  });

  it('ensures readonly fields cannot be modified', () => {
    render(
      <PropertyFormView
        MoujaMaster={mockMoujaMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as never}
        propertySocietyDetails={mockSocietyDetails as never}
        locale="en"
        taxZones={[]}
      />
    );

    const divisionInput = screen.getByLabelText(/Division/i);
    expect(divisionInput).toHaveAttribute('readOnly');

    const upicInput = screen.getByLabelText(/UPIC ID/i);
    expect(upicInput).toHaveAttribute('readOnly');

    const carpetAreaInputs = screen.getAllByLabelText(/Total Carpet Area/i);
    expect(carpetAreaInputs[0]).toHaveAttribute('readOnly');

    const buildUpAreaInputs = screen.getAllByLabelText(/Buildup Area/i);
    expect(buildUpAreaInputs[0]).toHaveAttribute('readOnly');
  });

  describe('Edge Cases', () => {
    it('shows error for negative numbers in numeric fields', async () => {
      render(
        <PropertyFormView
          MoujaMaster={mockMoujaMaster}
          propertyCategories={mockPropertyCategories}
          propertyDescriptions={mockPropertyDescriptions}
          propertyData={mockPropertyData as never}
          propertySocietyDetails={mockSocietyDetails as never}
          locale="en"
          taxZones={[]}
        />
      );

      const plotAreaInput = screen.getByLabelText(/Plot Area/i);
      fireEvent.change(plotAreaInput, { target: { value: '-100' } });

      const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('handles special characters in text fields correctly', async () => {
      (updatePropertyBasicDetailsAction as Mock).mockResolvedValue({ success: true });
      render(
        <PropertyFormView
          MoujaMaster={mockMoujaMaster}
          propertyCategories={mockPropertyCategories}
          propertyDescriptions={mockPropertyDescriptions}
          propertyData={mockPropertyData as never}
          propertySocietyDetails={mockSocietyDetails as never}
          locale="en"
          taxZones={[]}
        />
      );

      const flatInput = screen.getByLabelText(/Flat\/Shop No/i);
      const specialChars = 'Flat-#123!@$%^&*()';
      fireEvent.change(flatInput, { target: { value: specialChars } });

      const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(updatePropertyBasicDetailsAction).toHaveBeenCalledWith(
          'en',
          mockPropertyData.propertyId,
          expect.objectContaining({
            flatOrShopNo: 'Flat-123', // Expect the sanitized value
          })
        );
      });
    });

    it('handles extremely large numeric values', async () => {
      (updatePropertyBasicDetailsAction as Mock).mockResolvedValue({ success: true });
      render(
        <PropertyFormView
          MoujaMaster={mockMoujaMaster}
          propertyCategories={mockPropertyCategories}
          propertyDescriptions={mockPropertyDescriptions}
          propertyData={mockPropertyData as never}
          propertySocietyDetails={mockSocietyDetails as never}
          locale="en"
          taxZones={[]}
        />
      );

      const plotAreaInput = screen.getByLabelText(/Plot Area/i);
      const largeValue = '999999999';
      fireEvent.change(plotAreaInput, { target: { value: largeValue } });

      const submitBtn = screen.getByRole('button', { name: /Update Changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(updatePropertyBasicDetailsAction).toHaveBeenCalledWith(
          'en',
          mockPropertyData.propertyId,
          expect.objectContaining({
            plotArea: Number(largeValue),
          })
        );
      });
    });

    it('handles empty or partial carpet and buildup area values correctly', () => {
      const partialData = {
        ...mockPropertyData,
        totalCarpetAreaSqFeet: null,
        totalCarpetAreaSqMeter: null,
        totalBuiltupAreaSqFeet: 1200,
        totalBuiltupAreaSqMeter: null,
      };

      render(
        <PropertyFormView
          MoujaMaster={mockMoujaMaster}
          propertyCategories={mockPropertyCategories}
          propertyDescriptions={mockPropertyDescriptions}
          propertyData={partialData as never}
          propertySocietyDetails={mockSocietyDetails as never}
          locale="en"
          taxZones={[]}
        />
      );

      const carpetInput = screen.getByLabelText(/Total Carpet Area/i);
      expect(carpetInput).toHaveValue('');

      const buildupInput = screen.getByLabelText(/Buildup Area/i);
      expect(buildupInput).toHaveValue('1200.00 / 0.00');
    });

    it('handles reversed null values where feet is null and meter is present', () => {
      const partialData = {
        ...mockPropertyData,
        totalCarpetAreaSqFeet: null,
        totalCarpetAreaSqMeter: 85.5,
        totalBuiltupAreaSqFeet: null,
        totalBuiltupAreaSqMeter: null,
      };

      render(
        <PropertyFormView
          MoujaMaster={mockMoujaMaster}
          propertyCategories={mockPropertyCategories}
          propertyDescriptions={mockPropertyDescriptions}
          propertyData={partialData as never}
          propertySocietyDetails={mockSocietyDetails as never}
          locale="en"
          taxZones={[]}
        />
      );

      const carpetInput = screen.getByLabelText(/Total Carpet Area/i);
      expect(carpetInput).toHaveValue('0.00 / 85.50');
    });
  });
});

