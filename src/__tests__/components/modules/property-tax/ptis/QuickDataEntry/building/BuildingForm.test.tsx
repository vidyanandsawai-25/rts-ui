import { vi } from 'vitest';

// HOISTED MOCKS - Must be at the very top to prevent Vite from resolving the real modules
vi.mock('server-only', () => ({}));
vi.mock('@/services/api.service', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));
vi.mock('@/lib/api/document.service', () => ({
  uploadDocument: vi.fn(),
  getViewDocumentUrl: vi.fn(() => 'mock-url'),
}));
vi.mock('@/lib/api/building.service', () => ({
  getBuildingPermissions: vi.fn(),
  createBuildingPermission: vi.fn(),
  updateBuildingPermission: vi.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, Mock } from 'vitest';
import BuildingForm from '@/components/modules/property-tax/ptis/QuickDataEntry/building/BuildingForm';
import { BuildingPermissionApiResponse } from '@/types/building-permission.types';
import { toast } from 'sonner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
  useParams: vi.fn(() => ({ locale: 'en', propertyId: '123' })),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
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

// We need to mock the actions as well because they are imported by the hook
vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action', () => ({
  createBuildingPermissionsAction: vi.fn(),
  updateBuildingPermissionsAction: vi.fn(),
}));

// Now we can safely import the actions for our tests since they are mocked
import {
  createBuildingPermissionsAction,
  updateBuildingPermissionsAction
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action';

const mockInitialData = {
  success: true,
  message: "Success",
  items: {
    propertyId: 123,
    propertySocialId: 456,
    buildingPermitNo: "BP-001",
    buildingPermitDate: "2023-01-01T00:00:00",
    buildingPermitDocumentGuid: "guid-123",
    commencementNo: null,
    commencementDate: null,
    commencementDocumentGuid: null,
    occupancyCertNo: null,
    occupancyCertDate: null,
    occupancyCertDocumentGuid: null,
    possessionCertNo: null,
    possessionCertDate: null,
    possessionCertDocumentGuid: null,
    index2No: null,
    index2Date: null,
    index2DocumentGuid: null,
    electricBillNo: null,
    electricBillDate: null,
    electricBillDocumentGuid: null,
    buildCompletionCertNo: null,
    buildCompletionDate: null,
    buildCompletionCertDocumentGuid: null,
  }
};

describe('BuildingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <BuildingForm
        initialBuildingPermission={mockInitialData as unknown as BuildingPermissionApiResponse}
        propertyId="123"
      />
    );

    expect(screen.getByText('Building Permissions & Certificates')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BP-001')).toBeInTheDocument();
  });

  it('disables save button initially', () => {
    render(
      <BuildingForm
        initialBuildingPermission={mockInitialData as unknown as BuildingPermissionApiResponse}
        propertyId="123"
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).toBeDisabled();
  });

  it('enables save button when data is modified', async () => {
    render(
      <BuildingForm
        initialBuildingPermission={mockInitialData as unknown as BuildingPermissionApiResponse}
        propertyId="123"
      />
    );

    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it('calls updateBuildingPermissionsAction when saving existing data', async () => {
    (updateBuildingPermissionsAction as Mock).mockResolvedValue({ success: true });

    render(
      <BuildingForm
        initialBuildingPermission={mockInitialData as unknown as BuildingPermissionApiResponse}
        propertyId="123"
      />
    );

    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-UPDATED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateBuildingPermissionsAction).toHaveBeenCalledWith(
        'en',
        '123',
        expect.objectContaining({
          buildingPermitNo: 'BP-UPDATED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Building permissions saved successfully!");
    });
  });

  it('calls createBuildingPermissionsAction when saving new data', async () => {
    (createBuildingPermissionsAction as Mock).mockResolvedValue({ success: true });

    render(
      <BuildingForm
        initialBuildingPermission={null}
        propertyId="123"
      />
    );

    // Toggle one certificate to enable it
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'NEW-BP' } });

    // Set date to pass validation
    const dateInputs = screen.getAllByPlaceholderText(/Select date/i);
    fireEvent.change(dateInputs[0], { target: { value: '2023-01-01' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createBuildingPermissionsAction).toHaveBeenCalledWith(
        'en',
        '123',
        expect.objectContaining({
          buildingPermitNo: 'NEW-BP',
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Building permissions saved successfully!");
    });
  });

  it('handles submission error correctly', async () => {
    (updateBuildingPermissionsAction as Mock).mockResolvedValue({ success: false, error: 'Save failed' });

    render(
      <BuildingForm
        initialBuildingPermission={mockInitialData as unknown as BuildingPermissionApiResponse}
        propertyId="123"
      />
    );

    const inputs = screen.getAllByPlaceholderText(/Enter certificate number/i);
    fireEvent.change(inputs[0], { target: { value: 'BP-FAILED' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Save failed");
    });
  });
});
