import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropertyMediaPanel from '@/components/modules/property-tax/ptis/media/PropertyMediaPanel';
import { launchPhotoPlanDrawingToolAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { toast } from 'sonner';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(() => 'toast-id-123'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/app/[locale]/property-tax/ptis/PhotoPlan.action', () => ({
  launchPhotoPlanDrawingToolAction: vi.fn(),
}));

vi.mock('@/hooks/ptis/photoplan/useMediaDrawerState', () => ({
  useMediaDrawerState: () => ({
    isDrawerOpen: false,
    drawerInitialCategoryIndex: 0,
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
  }),
}));

vi.mock('@/hooks/ptis/photoplan/useMediaPanelVisibility', () => ({
  useMediaPanel: () => ({
    togglePanel: vi.fn(),
  }),
}));

vi.mock('@/hooks/ptis/photoplan/usePropertyMedia', () => ({
  usePropertyMedia: () => ({
    showMoreImages: false,
    setShowMoreImages: vi.fn(),
    hoverPreview: null,
    resetHoverPreview: vi.fn(),
    categories: [
      {
        photoTypeId: 1,
        photoTypeCode: 'PHOTO_PLAN',
        photoTypeName: 'Photo Plan',
        hasPhoto: false,
        images: [],
      },
    ],
    handleCategoriesChange: vi.fn(),
    photoPlanCategory: {
      photoTypeId: 1,
      photoTypeCode: 'PHOTO_PLAN',
      photoTypeName: 'Photo Plan',
      hasPhoto: false,
      images: [],
    },
    propertyPhotoCategory: null,
    photoPlanPhoto: null,
    propertyPhoto: null,
    remainingImages: [],
    handleImageHover: vi.fn(),
    handleImageLeave: vi.fn(),
    cancelImageLeave: vi.fn(),
    fullyLoadedIds: [],
    setFullyLoadedIds: vi.fn(),
    setPhotos: vi.fn(),
    gisPhoto: null,
    t: (key: string) => key,
  }),
}));

describe('PropertyMediaPanel - Draw Plan Redirect Flow', () => {
  const assignMock = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/en/property-tax/ptis?wardNo=UK1&propertyNo=182&propertyId=101',
        assign: assignMock,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('shows error toast if propertyId is missing when clicking "+ Draw Plan"', async () => {
    render(
      <PropertyMediaPanel
        wardNo="UK1"
        propertyNo="182"
        partitionNo=""
      />
    );

    const drawPlanButtons = screen.getAllByRole('button', { name: /Create new plan|Draw Plan/i });
    expect(drawPlanButtons.length).toBeGreaterThan(0);

    fireEvent.click(drawPlanButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('error.propertyIdMissing');
    });
    expect(launchPhotoPlanDrawingToolAction).not.toHaveBeenCalled();
  });

  it('invokes launchPhotoPlanDrawingToolAction and redirects window.location on success', async () => {
    vi.mocked(launchPhotoPlanDrawingToolAction).mockResolvedValue({
      success: true,
      data: { launchUrl: 'https://ptisplanapp.tabamc.in/launch?token=mock-token' },
    });

    render(
      <PropertyMediaPanel
        propertyId={101}
        wardNo="UK1"
        propertyNo="182"
        partitionNo="0"
      />
    );

    const drawPlanButtons = screen.getAllByRole('button', { name: /Create new plan|Draw Plan/i });
    fireEvent.click(drawPlanButtons[0]);

    await waitFor(() => {
      expect(launchPhotoPlanDrawingToolAction).toHaveBeenCalledWith(
        101,
        'THANE_Survey',
        expect.any(String),
        undefined,
        undefined,
        undefined,
        'UK1',
        '182',
        '0',
        undefined
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('media.redirectingDrawingTool', { id: 'toast-id-123' });
      expect(assignMock).toHaveBeenCalledWith('https://ptisplanapp.tabamc.in/launch?token=mock-token');
    });
  });

  it('shows toast error if returned launch URL is not a valid HTTP/HTTPS protocol', async () => {
    vi.mocked(launchPhotoPlanDrawingToolAction).mockResolvedValue({
      success: true,
      data: { launchUrl: 'ftp://invalid-url.com' },
    });

    render(
      <PropertyMediaPanel
        propertyId={202}
        wardNo="MM11"
        propertyNo="1"
      />
    );

    const drawPlanButtons = screen.getAllByRole('button', { name: /Create new plan|Draw Plan/i });
    fireEvent.click(drawPlanButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid launch URL protocol.', { id: 'toast-id-123' });
    });
    expect(assignMock).not.toHaveBeenCalled();
  });

  it('shows toast error if launchPhotoPlanDrawingToolAction returns success: false', async () => {
    vi.mocked(launchPhotoPlanDrawingToolAction).mockResolvedValue({
      success: false,
      error: 'Council THANE_Survey not found',
    });

    render(
      <PropertyMediaPanel
        propertyId={303}
        wardNo="MM11"
        propertyNo="1"
      />
    );

    const drawPlanButtons = screen.getAllByRole('button', { name: /Create new plan|Draw Plan/i });
    fireEvent.click(drawPlanButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Council THANE_Survey not found', { id: 'toast-id-123' });
    });
  });

  it('shows toast error if launchPhotoPlanDrawingToolAction throws an exception', async () => {
    vi.mocked(launchPhotoPlanDrawingToolAction).mockRejectedValue(new Error('Network error during redirect'));

    render(
      <PropertyMediaPanel
        propertyId={404}
        wardNo="MM11"
        propertyNo="1"
      />
    );

    const drawPlanButtons = screen.getAllByRole('button', { name: /Create new plan|Draw Plan/i });
    fireEvent.click(drawPlanButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error during redirect', { id: 'toast-id-123' });
    });
  });
});
