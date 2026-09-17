import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyMediaPanelContent } from '@/components/modules/property-tax/ptis/media/PropertyMediaPanelContent';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('PropertyMediaPanelContent - Wing Name Display', () => {
  const mockCategories: PhotoCategory[] = [
    {
      photoTypeId: 1,
      photoTypeCode: 'SOCIETY_BUILDING',
      photoTypeName: 'Society Photo',
      isCustom: false,
      hasPhoto: false,
      photoCount: 0,
      images: [],
    },
    {
      photoTypeId: 2,
      photoTypeCode: 'WING_BUILDING',
      photoTypeName: 'Wing Photo',
      isCustom: false,
      hasPhoto: false,
      photoCount: 0,
      images: [],
    },
    {
      photoTypeId: 3,
      photoTypeCode: 'GIS',
      photoTypeName: 'GIS Photo',
      isCustom: false,
      hasPhoto: false,
      photoCount: 0,
      images: [],
    },
  ];

  const defaultProps = {
    categories: mockCategories,
    t: (key: string) => {
      const dict: Record<string, string> = {
        'media.societyPhoto': 'Society Photo',
        'media.wingPhoto': 'Wing Photo',
        'media.propertyPhoto': 'Property Photo',
        'media.satelliteView': 'Satellite View',
        'media.changeDetection': 'Change Detection',
        'media.more': 'More',
      };
      return dict[key] || key;
    },
    openDrawer: vi.fn(),
    handleImageHover: vi.fn(),
    handleImageLeave: vi.fn(),
    cancelImageLeave: vi.fn(),
    hoverPreview: null,
    handleCreateClick: vi.fn(),
    cdBeforeImg: '',
    cdAfterImg: '',
    cdBeforeLabel: 'Before',
    cdAfterLabel: 'After',
    fallbackBeforeUrl: '',
    fallbackAfterUrl: '',
    cdCategory: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Wing Photo (B)" on wing card when wingName="B" is selected without uploaded photo', () => {
    render(
      <PropertyMediaPanelContent
        {...defaultProps}
        wingName="B"
        wingPhotoCategory={mockCategories[1]}
      />
    );

    expect(screen.getByText('Wing Photo (B)')).toBeInTheDocument();
  });

  it('renders "Wing Photo (B)" when wingName="Wing B" is passed', () => {
    render(
      <PropertyMediaPanelContent
        {...defaultProps}
        wingName="Wing B"
        wingPhotoCategory={mockCategories[1]}
      />
    );

    expect(screen.getByText('Wing Photo (B)')).toBeInTheDocument();
  });

  it('passes formatted wing title to handleImageHover on mouse enter', () => {
    const handleHover = vi.fn();
    render(
      <PropertyMediaPanelContent
        {...defaultProps}
        wingName="B"
        wingPhotoCategory={mockCategories[1]}
        handleImageHover={handleHover}
      />
    );

    const wingLabel = screen.getByText('Wing Photo (B)');
    // Find the card container
    const card = wingLabel.closest('div[class*="cursor-pointer"]');
    if (card) {
      fireEvent.mouseEnter(card);
      expect(handleHover).toHaveBeenCalledWith('', 'Wing Photo (B)');
    }
  });

  it('falls back to "Wing Photo" when wingName is not provided', () => {
    render(
      <PropertyMediaPanelContent
        {...defaultProps}
        wingPhotoCategory={mockCategories[1]}
      />
    );

    expect(screen.getByText('Wing Photo')).toBeInTheDocument();
  });
});
