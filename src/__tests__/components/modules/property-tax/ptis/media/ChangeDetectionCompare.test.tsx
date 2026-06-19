/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeDetectionCompare } from '@/components/modules/property-tax/ptis/media/ChangeDetectionCompare';
import React from 'react';

// Mock next-intl to avoid translation errors during testing
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'media.backToGrid') return 'Back to Grid';
    if (key === 'media.compareModeSlider') return 'Slider';
    if (key === 'media.compareModeSideBySide') return 'Side-by-Side';
    return key;
  },
  useLocale: () => 'en',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock useConfirm
const mockConfirm = vi.fn();
vi.mock('@/components/common', () => ({
  useConfirm: () => ({
    confirm: mockConfirm,
  }),
}));

const mockActiveCategory = {
  photoTypeId: 9999,
  photoTypeCode: 'CHANGE_DETECTION',
  photoTypeName: 'Change Detection',
  images: [
    {
      src: '/images/thane-earth-2018.jpg',
      fullSrc: '/images/thane-earth-2018.jpg',
      alt: '2018 Satellite View',
      title: '2018 Satellite View',
      photoTypeId: 9999,
      photoTypeCode: 'CHANGE_DETECTION',
      propertyPhotoId: 9998,
      hasPhoto: true,
      displayOrder: 1,
    },
    {
      src: '/images/thane-earth-2026.jpg',
      fullSrc: '/images/thane-earth-2026.jpg',
      alt: '2026 Satellite View',
      title: '2026 Satellite View',
      photoTypeId: 9999,
      photoTypeCode: 'CHANGE_DETECTION',
      propertyPhotoId: 9999,
      hasPhoto: true,
      displayOrder: 2,
    }
  ],
};

describe('ChangeDetectionCompare', () => {
  it('renders correctly with default props', () => {
    const handleBackToGrid = vi.fn();
    const handleImagesChange = vi.fn();

    render(
      <ChangeDetectionCompare
        activeCategory={mockActiveCategory}
        onBackToGrid={handleBackToGrid}
        onImagesChange={handleImagesChange}
        propertyId={123}
      />
    );

    // Check back to grid button
    expect(screen.getByText('Back to Grid')).toBeInTheDocument();
    
    // Check mode buttons
    expect(screen.getByText('Slider')).toBeInTheDocument();
    expect(screen.getByText('Side-by-Side')).toBeInTheDocument();
  });

  it('allows switching view mode', () => {
    const handleBackToGrid = vi.fn();
    const handleImagesChange = vi.fn();

    render(
      <ChangeDetectionCompare
        activeCategory={mockActiveCategory}
        onBackToGrid={handleBackToGrid}
        onImagesChange={handleImagesChange}
        propertyId={123}
      />
    );

    const sideBySideBtn = screen.getByText('Side-by-Side');
    fireEvent.click(sideBySideBtn);

    // After switching, slider mode button should not be active/white styled in the same way (can be clicked)
    const sliderBtn = screen.getByText('Slider');
    fireEvent.click(sliderBtn);
  });
});
