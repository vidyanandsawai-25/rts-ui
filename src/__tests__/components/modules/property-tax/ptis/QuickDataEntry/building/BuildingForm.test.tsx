import { vi } from 'vitest';

// HOISTED MOCKS
vi.mock('server-only', () => ({}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@/services/api.service', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('@/lib/api/document.service', () => ({ uploadDocument: vi.fn(), getViewDocumentUrl: vi.fn(() => 'mock-url') }));
vi.mock('@/lib/api/building.service', () => ({ getCertificateTypesWithStatus: vi.fn(), replaceCertificateDocument: vi.fn(), bulkSaveCertificates: vi.fn() }));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, Mock } from 'vitest';
import BuildingForm from '@/components/modules/property-tax/ptis/QuickDataEntry/building/BuildingForm';
import { PropertyCertificateWithStatusDto } from '@/types/building-permission.types';
import { toast } from 'sonner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
  useParams: vi.fn(() => ({ locale: 'en', propertyId: '123' })),
  usePathname: vi.fn(() => '/en/property-tax/ptis/QuickDataEntry/123/Building'),
  useSearchParams: vi.fn(() => new URLSearchParams('')),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => ({
    'building.title': 'Building Permissions & Documents',
    'building.buildingPermit': 'Building Permit',
    'building.certificateNumber': 'Document Number',
    'building.certificateNumberPlaceholder': 'Enter document number',
    'building.certificateDate': 'Document Date',
    'building.certificateDatePlaceholder': 'Select date',
    'building.uploadDocument': 'Upload Document',
    'building.viewDocument': 'View Document',
    'building.saveSuccess': 'Building permissions saved successfully!',
    'building.saveError': 'Error saving building permissions!',
    'common.saveChanges': 'Save Changes',
    'building.errors.allZeros': 'Document number cannot be all zeros.',
    'building.errors.dummyText': 'Dummy, sequential, or repetitive placeholder text is not allowed.',
    'building.errors.invalidCharacters': 'Document number contains invalid characters.',
    'building.errors.futureDate': 'Issue date cannot be in the future.',
    'building.pendingSave': 'Pending Save',
    'building.activeAttachment': 'Active Attachment',
  }[key] || key),
  useLocale: () => 'en',
}));

// Mock useConfirm
vi.mock('@/components/common/ConfirmProvider', () => ({
  useConfirm: () => ({ confirm: vi.fn(({ onConfirm }) => onConfirm()) }),
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action', () => ({
  getBuildingPermissionsAction: vi.fn(),
  replaceCertificateDocumentAction: vi.fn(),
  saveBuildingPermissionsAction: vi.fn(),
  saveCertificateAction: vi.fn(),
}));

import {
  saveBuildingPermissionsAction,
  replaceCertificateDocumentAction,
  saveCertificateAction
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action';

const mockInitialData: PropertyCertificateWithStatusDto[] = [
  { certificateTypeId: 1, certificateTypeName: "Building Permission Certificate", displayOrder: 10, hasCertificate: true, propertyCertificateId: 1001, isActive: true, certificateNo: "BP-001000", issueDate: "2023-01-01T00:00:00", documentGuid: "guid-123", fileName: "bp.pdf" },
  { certificateTypeId: 2, certificateTypeName: "Commencement Certificate (CC)", displayOrder: 20, hasCertificate: false, propertyCertificateId: null, isActive: false, certificateNo: null, issueDate: null, documentGuid: null, fileName: null }
];

describe('BuildingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    expect(screen.getByText('Building Permissions & Documents')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BP-001000')).toBeInTheDocument();
  });

  it('disables save button initially', () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).toBeDisabled();
  });

  it('enables save button when data is modified', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it('disables save button when data is modified and then reverted to initial value', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // Modify value
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).not.toBeDisabled();

    // Revert value to original 'BP-001000'
    fireEvent.change(inputs[0], { target: { value: 'BP-001000' } });
    expect(saveBtn).toBeDisabled();
  });

  it('calls saveCertificateAction when saving data', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({ success: true });
    (saveCertificateAction as Mock).mockResolvedValue({ success: true, data: { propertyCertificateId: 100 } });
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);
    const confirmBtn = await screen.findByText('building.confirmReplaceOk');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(saveCertificateAction).toHaveBeenCalled();
      const call = (saveCertificateAction as Mock).mock.calls[0];
      expect(call[0]).toBe('en');
      expect(call[1]).toBe('123');
      expect(call[2]).toEqual(
        expect.objectContaining({
          propertyId: 123,
          certificateTypeId: 1,
          certificateNo: 'BP-UPDATED'
        })
      );
    });
  });

  it('handles submission error correctly', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({ success: false, error: 'Save failed' });
    (saveCertificateAction as Mock).mockResolvedValue({ success: false, error: 'Save failed' });
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-FAILED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);
    const confirmBtn = await screen.findByText('building.confirmReplaceOk');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Save failed");
    });
  });

  it('displays validation errors and highlights invalid fields when required data is missing', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);

    // Toggle Commencement Certificate to active (starts disabled in mockInitialData)
    const toggles = screen.getAllByRole('switch');
    // toggles[0] is Show Active First, toggles[1] is Building Permission, toggles[2] is Commencement Certificate
    fireEvent.click(toggles[2]);

    await waitFor(() => {
      expect(toggles[2]).toHaveAttribute('aria-checked', 'true');
    });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled();
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberRequired")[0]).toBeInTheDocument();
    });
  });

  it('displays length validation error when certificate number violates constraints', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // Category 2: Building Approval Certificate has min length 8. Set number to 'Short' (5 chars)
    fireEvent.change(inputs[0], { target: { value: 'Short' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberLength")[0]).toBeInTheDocument();
    });
  });

  it('automatically strips spaces when entering certificate number', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    fireEvent.change(inputs[0], { target: { value: 'BP 123456' } });

    // Certificate number input field automatically strips spaces on input
    expect(inputs[0]).toHaveValue('BP123456');
  });

  it('displays error when certificate number has repeated digits', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    fireEvent.change(inputs[0], { target: { value: '00000000' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberRepeated")[0]).toBeInTheDocument();
    });
  });

  it('displays error when certificate number is all zeros', async () => {
    const zeroData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 99, certificateTypeName: "Unknown Certificate", displayOrder: 99, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: "2023-01-01T00:00:00", documentGuid: "guid-999", fileName: "zero.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={zeroData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // single '0' doesn't trigger repeated digits (length < 2) and has valid length (min 1)
    fireEvent.change(inputs[0], { target: { value: '0' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Document number cannot be all zeros.")[0]).toBeInTheDocument();
    });
  });

  it('displays error when certificate number is dummy text', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // 'test12345' has length 9 (>= 8) and is not repeated, so it passes length check, then triggers dummyText check.
    fireEvent.change(inputs[0], { target: { value: 'test12345' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Dummy, sequential, or repetitive placeholder text is not allowed.")[0]).toBeInTheDocument();
    });
  });

  it('validates Commencement Certificate format correctly', async () => {
    const copData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 2, certificateTypeName: "Commencement Certificate (CC)", displayOrder: 20, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: "2023-01-01T00:00:00", documentGuid: "guid-456", fileName: "cc.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={copData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // TMC is too short (length 3, pattern requires 5-50 chars)
    fireEvent.change(inputs[0], { target: { value: 'TMC' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberInvalidCOP")[0]).toBeInTheDocument();
    });
  });

  it('displays error when certificate number has dirty/invalid characters', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // 'BP-123#45' has length 9 (>= 8) and has '#' which is invalid
    fireEvent.change(inputs[0], { target: { value: 'BP-123#45' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Document number contains invalid characters.")[0]).toBeInTheDocument();
    });
  });

  it('validates Index 2 format correctly', async () => {
    const indexData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 4, certificateTypeName: "Index 2", displayOrder: 40, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: "2023-01-01T00:00:00", documentGuid: "guid-789", fileName: "index2.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={indexData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    fireEvent.change(inputs[0], { target: { value: 'INVALID' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberInvalidIndex2")[0]).toBeInTheDocument();
    });
  });

  it('validates Electric Bill format correctly', async () => {
    const electricData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 5, certificateTypeName: "Electric Bill", displayOrder: 50, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: "2023-01-01T00:00:00", documentGuid: "guid-999", fileName: "bill.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={electricData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    fireEvent.change(inputs[0], { target: { value: '123' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberInvalidElectric")[0]).toBeInTheDocument();
    });
  });

  it('validates date boundaries correctly', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const dateInputs = screen.getAllByPlaceholderText(/Select date/i);
    
    // Future date
    fireEvent.change(dateInputs[0], { target: { value: '2099-12-31' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.dateFuture")[0]).toBeInTheDocument();
    });
  });

  it('validates Commencement Certificate number without spaces and saves successfully', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({ success: true });
    (saveCertificateAction as Mock).mockResolvedValue({ success: true, data: { propertyCertificateId: 100 } });
    const copData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 2, certificateTypeName: "Commencement Certificate (CC)", displayOrder: 20, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: "2023-01-01T00:00:00", documentGuid: "guid-456", fileName: "cc.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={copData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // Valid CC number containing slashes and hyphens without spaces
    fireEvent.change(inputs[0], { target: { value: 'TMC/TDD-0001/2023' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);
    const confirmBtn = await screen.findByText('building.confirmReplaceOk');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(saveCertificateAction).toHaveBeenCalled();
    });
  });

  it('enforces maxLength on input dynamically based on document type rules', async () => {
    const electricData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 5, certificateTypeName: "Electric Bill", displayOrder: 50, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: "2023-01-01T00:00:00", documentGuid: "guid-999", fileName: "bill.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={electricData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter document number/i);
    
    // The Electric Bill has maxLength 12
    expect(inputs[0]).toHaveAttribute('maxLength', '12');
  });

  it('rejects dates before 01-01-1900', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const dateInputs = screen.getAllByPlaceholderText(/Select date/i);
    
    // Date before 1900
    fireEvent.change(dateInputs[0], { target: { value: '1899-12-31' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/dateBefore1900/i)[0]).toBeInTheDocument();
    });
  });

  it('rejects occupancy date if it is less than or equal to Commencement Certificate date', async () => {
    const copAndCcData: PropertyCertificateWithStatusDto[] = [
      { certificateTypeId: 2, certificateTypeName: "Commencement Certificate (CC)", displayOrder: 20, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: "CC-12345", issueDate: "2023-06-01", documentGuid: "guid-456", fileName: "cc.pdf" },
      { certificateTypeId: 3, certificateTypeName: "Occupancy Certificate (OC)", displayOrder: 30, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: "OC-12345", issueDate: "2023-06-02", documentGuid: "guid-789", fileName: "oc.pdf" }
    ];
    render(<BuildingForm initialBuildingPermission={copAndCcData} propertyId="123" />);

    // Select the Occupancy Certificate in the sidebar to display it in the detail pane
    const ocSidebarItem = screen.getByText("Occupancy Certificate (OC)");
    fireEvent.click(ocSidebarItem);

    // Change the date to be less than or equal to Commencement Certificate (2023-06-01)
    const dateInputs = screen.getAllByPlaceholderText(/Select date/i);
    fireEvent.change(dateInputs[0], { target: { value: '2023-05-31' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/occupancyDateAfterCommencement|commencementDateBeforeOccupancy/i)[0]).toBeInTheDocument();
    });
  });

  it('holds a file in drop zone when selected and uploads on save changes', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({
      success: true,
      data: {
        updatedCertificates: [
          { certificateTypeId: 1, propertyCertificateId: 1001, isActive: true, certificateNo: "BP-12345", issueDate: "2023-01-01T00:00:00", documentGuid: "new-guid-123", fileName: "test-cc.pdf" }
        ]
      }
    });
    (saveCertificateAction as Mock).mockResolvedValue({
      success: true,
      data: {
        propertyCertificateId: 1001
      }
    });
    (replaceCertificateDocumentAction as Mock).mockResolvedValue({
      success: true,
      data: {
        documentGuid: "new-guid-123",
        propertyCertificateId: 1001,
        fileName: "test-cc.pdf"
      }
    });
    
    const customData = [
      { certificateTypeId: 1, certificateTypeName: "Building Permission Certificate", displayOrder: 10, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: "BP-12345", issueDate: "2023-01-01T00:00:00", documentGuid: null, fileName: null }
    ];
    
    const { container } = render(<BuildingForm initialBuildingPermission={customData} propertyId="123" />);
    
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    const file = new File(['dummy pdf'], 'test-cc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show as pending save and not call API yet
    await waitFor(() => {
      expect(screen.getByText("test-cc.pdf")).toBeInTheDocument();
      expect(screen.getByText("Pending Save")).toBeInTheDocument();
      expect(replaceCertificateDocumentAction).not.toHaveBeenCalled();
    });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);
    const confirmBtn = await screen.findByText('building.confirmReplaceOk');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(saveCertificateAction).toHaveBeenCalled();
    });
  });

  it('allows file upload when document number and date are empty and holds in drop zone', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({
      success: true,
      data: {
        updatedCertificates: [
          { certificateTypeId: 1, propertyCertificateId: 1001, isActive: true, certificateNo: null, issueDate: null, documentGuid: "new-guid-123", fileName: "test-cc.pdf" }
        ]
      }
    });
    (replaceCertificateDocumentAction as Mock).mockResolvedValue({
      success: true,
      data: {
        documentGuid: "new-guid-123",
        propertyCertificateId: 1001,
        fileName: "test-cc.pdf"
      }
    });
    
    const emptyData = [
      { certificateTypeId: 1, certificateTypeName: "Building Permission Certificate", displayOrder: 10, hasCertificate: false, propertyCertificateId: null, isActive: true, certificateNo: null, issueDate: null, documentGuid: null, fileName: null }
    ];
    
    const { container } = render(<BuildingForm initialBuildingPermission={emptyData} propertyId="123" />);
    
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    
    const file = new File(['dummy pdf'], 'test-cc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText("test-cc.pdf")).toBeInTheDocument();
      expect(screen.getByText("Pending Save")).toBeInTheDocument();
      expect(replaceCertificateDocumentAction).not.toHaveBeenCalled();
    });
  });
});
