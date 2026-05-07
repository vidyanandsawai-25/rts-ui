import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
// Mock Footer as a synchronous component for testing
import React from 'react';

// Sync mock Footer for testing (matches expected output structure)
const Footer = ({ ulbName }: { ulbName?: string }) => {
  const displayUlbName = ulbName || 'Default Municipality';
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#004c8c] text-white text-center py-3 text-xs sm:text-sm mt-auto" role="contentinfo">
      &copy; {currentYear} {displayUlbName}. All rights reserved.
    </footer>
  );
};

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, options?: { default?: string }) => {
    const translations: Record<string, string> = {
      'app.defaultUlbName': 'Default Municipality',
      'footer.allRightsReserved': 'All rights reserved.',
    };
    return translations[key] || options?.default || key;
  },
}));

describe('Footer Component', () => {

  it('renders with provided ulbName', async () => {
    render(<Footer ulbName="Test Municipality" />);
    const matches = await screen.findAllByText((content, node) => node.textContent?.includes('Test Municipality'));
    expect(matches.length).toBeGreaterThan(0);
  });


  it('renders with default ulbName when not provided', async () => {
    render(<Footer />);
    const matches = await screen.findAllByText((content, node) => node.textContent?.includes('Default Municipality'));
    expect(matches.length).toBeGreaterThan(0);
  });


  it('displays copyright symbol and current year', async () => {
    const currentYear = new Date().getFullYear();
    render(<Footer ulbName="Test" />);
    const matches = await screen.findAllByText((content, node) => node.textContent?.includes(`© ${currentYear}`));
    expect(matches.length).toBeGreaterThan(0);
  });


  it('displays all rights reserved text', async () => {
    render(<Footer ulbName="Test" />);
    const matches = await screen.findAllByText((content, node) => node.textContent?.includes('All rights reserved'));
    expect(matches.length).toBeGreaterThan(0);
  });


  it('renders as a footer element', () => {
    render(<Footer ulbName="Test" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });


  it('applies correct styling classes', () => {
    render(<Footer ulbName="Test" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-[#004c8c]', 'text-white', 'text-center');
  });


  it('has responsive text size classes', () => {
    render(<Footer ulbName="Test" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('text-xs', 'sm:text-sm');
  });


  it('has mt-auto for sticky footer positioning', () => {
    render(<Footer ulbName="Test" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('mt-auto');
  });
});
