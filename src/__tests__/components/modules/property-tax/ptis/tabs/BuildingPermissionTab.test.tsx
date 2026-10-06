import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BuildingPermissionTab from '@/components/modules/property-tax/ptis/tabs/BuildingPermissionTab';
import type { BuildingPermissionData, BuildingPermissionItem } from '@/types/ptis.types';
import * as documentUtils from '@/lib/utils/document-client-utils';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'building.certificateName': 'Certificate Name',
      'building.certificateNo': 'Certificate No.',
      'building.certificateDate': 'Certificate Date',
      'building.action': 'Action',
      'building.propertyScope': 'Property Level',
      'building.viewDocument': 'View Document',
      'building.noDocumentAttached': 'No document attached',
      'building.editCertificate': 'Edit Certificate',
      'building.noCertificatesAttached': 'No attached certificates available for this property.',
      'building.loadingCertificates': 'Loading Building Permission Data...',
      'building.loadError': 'Failed to load building permission records.',
      'common.retry': 'Retry',
      noDataAvailable: 'No data available',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock DocumentViewerModal
vi.mock('@/components/common', () => ({
  DocumentViewerModal: ({
    isOpen,
    fileName,
    onClose,
  }: {
    isOpen: boolean;
    fileName: string;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="doc-viewer-modal">
        <span>{fileName}</span>
        <button type="button" onClick={onClose}>
          Close Viewer
        </button>
      </div>
    ) : null,
}));

const createMockItem = (overrides?: Partial<BuildingPermissionItem>): BuildingPermissionItem => ({
  certificateTypeId: 101,
  certificateTypeName: 'Commencement Certificate',
  displayOrder: 1,
  hasCertificate: true,
  propertyCertificateId: 1,
  isActive: true,
  certificateNo: 'CC/2026/001',
  issueDate: '2026-01-15T00:00:00Z',
  documentGuid: 'doc-guid-1',
  fileName: 'commencement.pdf',
  ...overrides,
});

describe('BuildingPermissionTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when isLoading is true', () => {
    render(<BuildingPermissionTab isLoading={true} />);
    expect(screen.getByText('Loading Building Permission Data...')).toBeInTheDocument();
  });

  it('renders error state when error is provided and allows retry', () => {
    const onRetryMock = vi.fn();
    render(
      <BuildingPermissionTab
        error="Unable to fetch permissions"
        onRetry={onRetryMock}
      />
    );
    expect(screen.getByText('Unable to fetch permissions')).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when data has no items', () => {
    const emptyData: BuildingPermissionData = {
      items: [],
    };
    render(<BuildingPermissionTab data={emptyData} />);
    expect(
      screen.getByText('No attached certificates available for this property.')
    ).toBeInTheDocument();
  });

  it('renders table with 3-row scrollable container when certificates exist', () => {
    const mockData: BuildingPermissionData = {
      items: [
        createMockItem({
          propertyCertificateId: 1,
          certificateTypeId: 101,
          certificateTypeName: 'Commencement Certificate',
          certificateNo: 'CC/2026/001',
        }),
        createMockItem({
          propertyCertificateId: 2,
          certificateTypeId: 102,
          certificateTypeName: 'Occupancy Certificate',
          certificateNo: 'OC/2026/002',
          fileName: 'occupancy.pdf',
        }),
      ],
    };

    const { container } = render(
      <BuildingPermissionTab
        data={mockData}
        propertyId={123}
        wardNo="W01"
        wardId={5}
        propertyNo="P100"
      />
    );

    // Verify container has scrollable classes for 3 default rows
    const scrollContainer = container.querySelector('.max-h-\\[178px\\]');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('overflow-y-auto');
    expect(scrollContainer).toHaveClass('custom-scrollbar');

    // Verify table headers and items
    expect(screen.getByText('Commencement Certificate')).toBeInTheDocument();
    expect(screen.getByText('CC/2026/001')).toBeInTheDocument();
    expect(screen.getByText('Occupancy Certificate')).toBeInTheDocument();
    expect(screen.getByText('OC/2026/002')).toBeInTheDocument();
  });

  it('handles edit certificate navigation correctly', () => {
    const mockData: BuildingPermissionData = {
      items: [
        createMockItem({
          propertyCertificateId: 1,
          certificateTypeId: 101,
          certificateTypeName: 'Commencement Certificate',
          certificateNo: 'CC/2026/001',
        }),
      ],
    };

    render(
      <BuildingPermissionTab
        data={mockData}
        propertyId={123}
        wardNo="W01"
        wardId={5}
        propertyNo="P100"
      />
    );

    const editButton = screen.getByLabelText('Edit Certificate');
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/en/property-tax/ptis/QuickDataEntry/123/Building')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('certificateTypeId=101')
    );
  });

  it('opens document viewer when clicking view document button', async () => {
    vi.spyOn(documentUtils, 'getDocumentBlobUrl').mockResolvedValue({
      url: 'blob:http://localhost/test-blob',
      contentType: 'application/pdf',
    });

    const mockData: BuildingPermissionData = {
      items: [
        createMockItem({
          propertyCertificateId: 1,
          fileName: 'cert.pdf',
        }),
      ],
    };

    render(
      <BuildingPermissionTab
        data={mockData}
        propertyId={123}
      />
    );

    const viewButton = screen.getByLabelText('View Document');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByTestId('doc-viewer-modal')).toBeInTheDocument();
      expect(screen.getByText('cert.pdf')).toBeInTheDocument();
    });
  });

  it('renders Wing Level badge and navigates to Wing level on edit for wing covered certificates', () => {
    const mockData: BuildingPermissionData = {
      items: [
        createMockItem({
          propertyCertificateId: 10,
          certificateTypeId: 101,
          certificateTypeName: 'Commencement Certificate',
          certificateNo: 'wing-level-a',
          level: 'Wing',
          wingName: 'Wing A',
          wingDetailId: 501,
        }),
      ],
    };

    render(
      <BuildingPermissionTab
        data={mockData}
        propertyId={123}
        partitionNo="A4"
        societyDetailId={99}
      />
    );

    expect(screen.getByText('Wing Level (Wing A)')).toBeInTheDocument();

    const editButton = screen.getByLabelText('Edit Certificate');
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('level=Wing')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('wingDetailId=501')
    );
  });

  it('renders Apartment Level badge and navigates to Apartment level on edit for apartment certificates', () => {
    const mockData: BuildingPermissionData = {
      items: [
        createMockItem({
          propertyCertificateId: 20,
          certificateTypeId: 102,
          certificateTypeName: 'Occupancy Certificate',
          certificateNo: 'APT/2026/001',
          level: 'Apartment',
          societyDetailId: 99,
        }),
      ],
    };

    render(
      <BuildingPermissionTab
        data={mockData}
        propertyId={123}
        partitionNo="A4"
        societyDetailId={99}
      />
    );

    expect(screen.getByText('building.apartmentLevel')).toBeInTheDocument();

    const editButton = screen.getByLabelText('Edit Certificate');
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('level=Apartment')
    );
  });
});

