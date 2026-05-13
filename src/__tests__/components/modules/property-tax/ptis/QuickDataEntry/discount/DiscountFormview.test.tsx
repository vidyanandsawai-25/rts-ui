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
vi.mock('@/lib/api/discount.service', () => ({
    updateDiscountDetails: vi.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, Mock } from 'vitest';
import DiscountFormview from '@/components/modules/property-tax/ptis/QuickDataEntry/discount/DiscountFormview';
import { DiscountApiResponse } from '@/types/discount.types';
import { toast } from 'sonner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ locale: 'en', propertyId: '123' })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'discount.title': 'Discount Information',
      'discount.description': 'Configure discount eligibility',
      'discount.solarPanel': 'Solar Panel System',
      'discount.solarHeater': 'Solar Water Heater',
      'discount.uploadDocument': 'Upload Document',
      'discount.viewDocument': 'View Document',
      'discount.saveSuccess': 'Discount details saved successfully!',
      'discount.saveError': 'Failed to save discount details',
      'common.saveChanges': 'Save Changes',
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

// We need to mock the action as well because it's imported by the hook
vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/action', () => ({
  updateDiscountDetailsAction: vi.fn(),
}));

// Now we can safely import the action for our tests since it's mocked
import { updateDiscountDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/action';

const mockInitialData = {
  success: true,
  message: "Success",
  items: {
    propertyId: 123,
    solarPanelSystemEnabled: true,
    solarPanelSystemAmount: 1000,
    solarPanelSystemPercentage: 5,
    solarPanelSystemDocumentGuid: "guid-solar",
    solarWaterHeaterEnabled: false,
    solarWaterHeaterAmount: 0,
    solarWaterHeaterPercentage: 0,
    solarWaterHeaterDocumentGuid: null,
  }
};

describe('DiscountFormview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <DiscountFormview
        initialDiscountData={mockInitialData as unknown as DiscountApiResponse}
        propertyId="123"
      />
    );

    expect(screen.getByText('Discount Information')).toBeInTheDocument();
    expect(screen.getByText('Solar Panel System')).toBeInTheDocument();
  });

  it('disables save button initially', () => {
    render(
      <DiscountFormview
        initialDiscountData={mockInitialData as unknown as DiscountApiResponse}
        propertyId="123"
      />
    );

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).toBeDisabled();
  });

  it('enables save button when a toggle is changed', async () => {
    render(
      <DiscountFormview
        initialDiscountData={mockInitialData as unknown as DiscountApiResponse}
        propertyId="123"
      />
    );

    const switches = screen.getAllByRole('switch');
    // Find the solarWaterHeater toggle (which is initially false)
    fireEvent.click(switches[1]);

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it('calls updateDiscountDetailsAction when saving', async () => {
    (updateDiscountDetailsAction as Mock).mockResolvedValue({ success: true });

    render(
      <DiscountFormview
        initialDiscountData={mockInitialData as unknown as DiscountApiResponse}
        propertyId="123"
      />
    );

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[1]);

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateDiscountDetailsAction).toHaveBeenCalledWith(
        'en',
        '123',
        expect.objectContaining({
          solarWaterHeaterEnabled: true,
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Discount details saved successfully!");
    });
  });

  it('handles submission error correctly', async () => {
    (updateDiscountDetailsAction as Mock).mockResolvedValue({ success: false, error: 'Save failed' });

    render(
      <DiscountFormview
        initialDiscountData={mockInitialData as unknown as DiscountApiResponse}
        propertyId="123"
      />
    );

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[1]);

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Save failed");
    });
  });
});
