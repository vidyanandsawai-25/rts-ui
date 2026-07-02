import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  useLocale: () => 'en',
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

// Mock server actions
vi.mock('@/app/[locale]/property-tax/ptis/actions', () => ({
  fetchSocialDetailsOnlyAction: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        items: [
          {
            id: 4001,
            propertyId: 549442,
            socialAttributeId: 45,
            bitValue: true,
            intValue: null,
            decimalValue: null,
            textValue: null,
            dateValue: null,
            documentBindingId: null,
            remark: null,
            socialAttributeCode: 'DYNAMIC_SOCIAL',
            socialAttributeName: 'Dynamic Social Field',
            isActive: true,
            createdDate: '',
            updatedDate: null,
          },
        ],
      },
    })
  ),
}));

describe('DiscountDataTab', () => {
  it('should render fallback when items is empty', () => {
    const mockData: DiscountData = { items: [] };
    render(<DiscountDataTab initialData={mockData} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should filter out items with all null values regardless of isActive status', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 1,
          propertyId: 549442,
          socialAttributeId: 1,
          bitValue: null,
          intValue: null,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: null,
          remark: null,
          socialAttributeCode: 'TEST',
          socialAttributeName: 'Should be hidden',
          isActive: false,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };
    render(<DiscountDataTab initialData={mockData} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should filter out items when bitValue is false and other value fields are null', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 5,
          propertyId: 549442,
          socialAttributeId: 5,
          bitValue: false,
          intValue: null,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: null,
          remark: null,
          socialAttributeCode: 'HAS_BOREWELL_FALSE',
          socialAttributeName: 'Borewell Available False',
          isActive: true,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };
    render(<DiscountDataTab initialData={mockData} />);
    expect(screen.queryByText('Borewell Available False')).not.toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should display item when isActive is false but at least one value field is present', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 2,
          propertyId: 549442,
          socialAttributeId: 2,
          bitValue: true,
          intValue: null,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: null,
          remark: null,
          socialAttributeCode: 'TEST_INACTIVE_WITH_VAL',
          socialAttributeName: 'Show even if inactive',
          isActive: false,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };
    render(<DiscountDataTab initialData={mockData} />);
    expect(screen.getByText('Show even if inactive')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
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
          percentage: 10,
          amount: 500,
        },
      ] as PropertySocialDetailItem[],
    };

    render(<DiscountDataTab initialData={mockData} />);

    // Verify field label
    expect(screen.getByText('Green Property Star Rating')).toBeInTheDocument();
    // Verify display value (should be 3 instead of Yes)
    expect(screen.getByText('3')).toBeInTheDocument();

    // Verify percentage and amount are displayed side-by-side
    expect(screen.getByText('fields.percentage')).toBeInTheDocument();
    expect(screen.getByText('fields.amount')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
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
    expect(screen.getByText('45')).toBeInTheDocument();
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

    render(<DiscountDataTab initialSocialData={mockData} />);
    fireEvent.click(screen.getByText('tabs.social'));

    expect(screen.getByText('Club House Available')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should filter out items when all value fields are null even if isActive is true', () => {
    const mockData: DiscountData = {
      items: [
        {
          id: 3030,
          propertyId: 549442,
          socialAttributeId: 39,
          bitValue: null,
          intValue: null,
          decimalValue: null,
          textValue: null,
          dateValue: null,
          documentBindingId: null,
          remark: null,
          socialAttributeCode: 'HAS_PLAYGROUND',
          socialAttributeName: 'Playground Available',
          isActive: true,
          createdDate: '',
          updatedDate: null,
        },
      ] as PropertySocialDetailItem[],
    };

    render(<DiscountDataTab initialSocialData={mockData} />);
    fireEvent.click(screen.getByText('tabs.social'));

    expect(screen.queryByText('Playground Available')).not.toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should fetch social details dynamically when social sub-tab is clicked and socialItems is empty', async () => {
    const mockData: DiscountData = { items: [] };

    render(<DiscountDataTab propertyId={549442} initialData={mockData} />);

    // Click on social tab to trigger fetching
    fireEvent.click(screen.getByText('tabs.social'));

    // Wait for the dynamic card to appear
    const dynamicCardLabel = await screen.findByText('Dynamic Social Field');
    expect(dynamicCardLabel).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
