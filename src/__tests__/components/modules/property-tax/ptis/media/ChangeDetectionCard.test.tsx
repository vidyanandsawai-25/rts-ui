/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeDetectionCard } from '@/components/modules/property-tax/ptis/media/ChangeDetectionCard';
import React from 'react';

// Mock next-intl to avoid translation errors during testing
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'media.changeDetection') return 'Change Detection';
    return key;
  },
}));

// Mock next/image as it uses server-side optimizations
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('ChangeDetectionCard', () => {
  it('renders correctly with default props', () => {
    render(<ChangeDetectionCard />);
    
    // Check for images
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', '/images/thane-earth-2018.jpg');
    expect(images[1]).toHaveAttribute('src', '/images/thane-earth-2026.jpg');

    // Check for badges
    expect(screen.getByText('2018')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();

    // Check for change detection label
    expect(screen.getByText('Change Detection')).toBeInTheDocument();
  });

  it('renders correctly with custom props', () => {
    render(
      <ChangeDetectionCard
        beforeImageSrc="/test-before.jpg"
        afterImageSrc="/test-after.jpg"
        beforeLabel="2010"
        afterLabel="2020"
      />
    );

    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', '/test-before.jpg');
    expect(images[1]).toHaveAttribute('src', '/test-after.jpg');

    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<ChangeDetectionCard onClick={handleClick} />);

    const card = screen.getByText('Change Detection').closest('div');
    expect(card).toBeInTheDocument();
    
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });
});
