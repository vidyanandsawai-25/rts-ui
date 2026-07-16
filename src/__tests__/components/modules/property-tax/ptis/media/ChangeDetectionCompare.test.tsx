import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangeDetectionCompare } from '@/components/modules/property-tax/ptis/media/ChangeDetectionCompare';
import React from 'react';

// Mock next-intl to avoid translation errors during testing
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'media.backToGrid') return 'Back to Grid';
    return key;
  },
  useLocale: () => 'en',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'> & { fill?: boolean }) => {
    const { fill: _f, ...rest } = props;
    const ImgTag = 'img';
    return <ImgTag {...rest} />;
  },
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: () => {
    const DynamicComponent = () => <div data-testid="mock-dynamic-component" />;
    return DynamicComponent;
  },
}));

const mockActiveCategory = {
  photoTypeId: 9999,
  photoTypeCode: 'CHANGE_DETECTION',
  photoTypeName: 'Change Detection',
  images: [
    {
      src: '',
      fullSrc: '',
      alt: 'Before (Old)',
      title: 'Before (Old)',
      photoTypeId: 9999,
      photoTypeCode: 'CHANGE_DETECTION',
      propertyPhotoId: 9998,
      hasPhoto: false,
      displayOrder: 1,
    },
    {
      src: '',
      fullSrc: '',
      alt: 'After (New)',
      title: 'After (New)',
      photoTypeId: 9999,
      photoTypeCode: 'CHANGE_DETECTION',
      propertyPhotoId: 9999,
      hasPhoto: false,
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
      />
    );

    // Check back to grid button
    expect(screen.getByText('Back to Grid')).toBeInTheDocument();
    
    // Check for Change Detection title/header path
    expect(screen.getByText('Change Detection')).toBeInTheDocument();
  });
});
