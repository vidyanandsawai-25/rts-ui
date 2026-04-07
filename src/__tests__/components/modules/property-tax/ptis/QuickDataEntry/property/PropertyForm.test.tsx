import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertyFormView from '@/components/modules/property-tax/ptis/QuickDataEntry/property/PropertyForm';
import { toast } from 'sonner';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';

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
      'property.totalCarpetArea': 'Total Carpet Area',
      'property.buildupArea': 'Buildup Area',
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
vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action', () => ({
  updatePropertyBasicDetailsAction: vi.fn(),
}));

const mockWingMaster = [
  { wingId: 1, wingNo: 'Wing A', sequenceNo: 1, isActive: true, createdDate: '', updatedDate: null },
];

const mockPropertyCategories = [
  { propertyCategoryId: 1, propertyCategoryName: 'Residential', isActive: true, createdDate: '', updatedDate: null },
];

const mockPropertyDescriptions = [
  { propertyTypeId: 1, propertyDescription: 'Empty Plot', type: 'Residential', propertyTypeGroup: '', searchKey: '', searchSequence: 1, propertyTypeCategoryId: null, isActive: true, createdDate: '', updatedDate: null },
  { propertyTypeId: 2, propertyDescription: 'Normal Home', type: 'Residential', propertyTypeGroup: '', searchKey: '', searchSequence: 2, propertyTypeCategoryId: null, isActive: true, createdDate: '', updatedDate: null },
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
        WingMaster={mockWingMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as any}
        propertySocietyDetails={mockSocietyDetails as any}
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
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // Residential Toilets
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument(); // Total Carpet Area
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument(); // Buildup Area
  });

  it('submits form with updated data', async () => {
    (updatePropertyBasicDetailsAction as any).mockResolvedValue({ success: true });

    render(
      <PropertyFormView
        WingMaster={mockWingMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as any}
        propertySocietyDetails={mockSocietyDetails as any}
      />
    );

    const flatInput = screen.getByLabelText(/Flat\/Shop No/i);
    fireEvent.change(flatInput, { target: { value: '202', name: 'flatOrShopNo' } });

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updatePropertyBasicDetailsAction).toHaveBeenCalledWith(
        mockPropertyData.propertyId,
        expect.objectContaining({
          flatOrShopNo: '202',
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Property basic details updated successfully");
    });
  });

  it('handles submission error correctly', async () => {
    (updatePropertyBasicDetailsAction as any).mockRejectedValue(new Error('Update failed'));

    render(
      <PropertyFormView
        WingMaster={mockWingMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as any}
        propertySocietyDetails={mockSocietyDetails as any}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("An error occurred during update.");
    });
  });


  it('ensures readonly fields cannot be modified', () => {
    render(
      <PropertyFormView
        WingMaster={mockWingMaster}
        propertyCategories={mockPropertyCategories}
        propertyDescriptions={mockPropertyDescriptions}
        propertyData={mockPropertyData as any}
        propertySocietyDetails={mockSocietyDetails as any}
      />
    );

    const divisionInput = screen.getByLabelText(/Division/i);
    expect(divisionInput).toHaveAttribute('readOnly');

    const upicInput = screen.getByLabelText(/UPIC ID/i);
    expect(upicInput).toHaveAttribute('readOnly');

    const carpetAreaInput = screen.getByLabelText(/Total Carpet Area/i);
    expect(carpetAreaInput).toHaveAttribute('readOnly');

    const buildUpAreaInput = screen.getByLabelText(/Buildup Area/i);
    expect(buildUpAreaInput).toHaveAttribute('readOnly');

  });

});
