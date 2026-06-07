import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DiscountDataTab from '@/components/modules/property-tax/ptis/tabs/DiscountDataTab';
import type { DiscountData, PropertySocialDetailItem } from '@/types/ptis.types';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      noDataAvailable: 'No data available',
      'fields.status': 'Status',
      'fields.dateLabel': 'Date',
      'fields.value': 'Value',
      'fields.yes': 'Yes',
      'fields.no': 'No',
    };
    return translations[key] || key;
  },
}));

// Mock FieldShell component
vi.mock('@/components/common/FieldShell', () => ({
  default: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div data-testid="field-shell" data-label={label}>
      <span className="field-label">{label}</span>
      {children}
    </div>
  ),
}));

describe('DiscountDataTab', () => {
  it('should render fallback when items is empty', () => {
    const mockData: DiscountData = { items: [] };
    render(<DiscountDataTab initialData={mockData} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should filter out items with bitValue === false', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 1,
          propertyId: 549442,
          socialAttributeId: 1,
          bitValue: false,
          intValue: null,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: null,
          remark: null,
          socialAttributeCode: 'TEST',
          socialAttributeName: 'Should be hidden',
          isActive: true,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };
    render(<DiscountDataTab initialData={mockData} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should display intValue when both bitValue and intValue are present', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 3036,
          propertyId: 549442,
          socialAttributeId: 34,
          bitValue: true,
          intValue: 3,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: 3134,
          remark: null,
          socialAttributeCode: 'GREEN_PROPERTY_STAR',
          socialAttributeName: 'Green Property Star Rating',
          isActive: true,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };

    render(<DiscountDataTab initialData={mockData} />);

    // Verify field label
    expect(screen.getByText('Green Property Star Rating')).toBeInTheDocument();
    // Verify prefix label (should be Value instead of Status)
    expect(screen.getByText('Value')).toBeInTheDocument();
    // Verify display value (should be 3 instead of Yes)
    expect(screen.getByRole('textbox')).toHaveTextContent('3');
  });

  it('should display decimalValue when both bitValue and decimalValue are present', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 3033,
          propertyId: 549442,
          socialAttributeId: 22,
          bitValue: true,
          intValue: null,
          decimalValue: 45,
          textValue: null,
          dateValue: null,
          documentBindingId: 3137,
          remark: null,
          socialAttributeCode: 'SOLAR_ELECTRIC_KW',
          socialAttributeName: 'Solar Electric Capacity (KW)',
          isActive: true,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };

    render(<DiscountDataTab initialData={mockData} />);

    expect(screen.getByText('Solar Electric Capacity (KW)')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveTextContent('45');
  });

  it('should display Yes/No when only bitValue is present', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 3029,
          propertyId: 549442,
          socialAttributeId: 38,
          bitValue: true,
          intValue: null,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: null,
          remark: null,
          socialAttributeCode: 'HAS_CLUB_HOUSE',
          socialAttributeName: 'Club House Available',
          isActive: true,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };

    render(<DiscountDataTab initialData={mockData} />);

    expect(screen.getByText('Club House Available')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveTextContent('Yes');
  });
});
