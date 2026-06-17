import { vi } from 'vitest';

// HOISTED MOCKS
vi.mock('server-only', () => ({}));
vi.mock('@/services/api.service', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('@/lib/api/document.service', () => ({ uploadDocument: vi.fn(), getViewDocumentUrl: vi.fn(() => 'mock-url') }));
vi.mock('@/lib/api/building.service', () => ({ getCertificateTypesWithStatus: vi.fn(), uploadCertificateDocument: vi.fn(), replaceCertificateDocument: vi.fn(), bulkSaveCertificates: vi.fn() }));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, Mock } from 'vitest';
import BuildingForm from '@/components/modules/property-tax/ptis/QuickDataEntry/building/BuildingForm';
import { PropertyCertificateWithStatusDto } from '@/types/building-permission.types';
import { toast } from 'sonner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
  useParams: vi.fn(() => ({ locale: 'en', propertyId: '123' })),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => ({
    'building.title': 'Building Permissions & Certificates',
    'building.buildingPermit': 'Building Permit',
    'building.certificateNumber': 'Certificate Number',
    'building.certificateNumberPlaceholder': 'Enter certificate number',
    'building.certificateDate': 'Certificate Date',
    'building.certificateDatePlaceholder': 'Select date',
    'building.uploadDocument': 'Upload Document',
    'building.viewDocument': 'View Document',
    'building.saveSuccess': 'Building permissions saved successfully!',
    'building.saveError': 'Error saving building permissions!',
    'common.saveChanges': 'Save Changes',
  }[key] || key),
  useLocale: () => 'en',
}));

// Mock useConfirm
vi.mock('@/components/common/ConfirmProvider', () => ({
  useConfirm: () => ({ confirm: vi.fn(({ onConfirm }) => onConfirm()) }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action', () => ({
  getBuildingPermissionsAction: vi.fn(),
  uploadCertificateDocumentAction: vi.fn(),
  replaceCertificateDocumentAction: vi.fn(),
  saveBuildingPermissionsAction: vi.fn(),
}));

import {
  saveBuildingPermissionsAction
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
    expect(screen.getByText('Building Permissions & Certificates')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BP-001000')).toBeInTheDocument();
  });

  it('disables save button initially', () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).toBeDisabled();
  });

  it('enables save button when data is modified', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it('calls saveBuildingPermissionsAction when saving data', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({ success: true });
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(saveBuildingPermissionsAction).toHaveBeenCalledWith(
        'en',
        '123',
        expect.objectContaining({
          propertyId: 123,
          certificates: expect.arrayContaining([
            expect.objectContaining({
              certificateTypeId: 1,
              certificateNumber: 'BP-UPDATED'
            })
          ])
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Building permissions saved successfully!");
    });
  });

  it('handles submission error correctly', async () => {
    (saveBuildingPermissionsAction as Mock).mockResolvedValue({ success: false, error: 'Save failed' });
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-FAILED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

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

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("common.validation.numberRequired")).toBeInTheDocument();
    });
  });

  it('displays length validation error when certificate number violates constraints', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    
    // Category 2: Building Approval Certificate has min length 8. Set number to 'Short' (5 chars)
    fireEvent.change(inputs[0], { target: { value: 'Short' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberLength")[0]).toBeInTheDocument();
    });
  });

  it('displays error when certificate number contains spaces', async () => {
    render(<BuildingForm initialBuildingPermission={mockInitialData} propertyId="123" />);
    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    
    fireEvent.change(inputs[0], { target: { value: 'BP 123456' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText("common.validation.numberNoSpaces")[0]).toBeInTheDocument();
    });
  });
});
