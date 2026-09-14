import { describe, it, expect } from 'vitest';
import { mapApartmentQcTopSectionToPropertyMasterData } from '@/lib/api/ptis/apartment/apartment-qc-top-section.mapper';
import type { ApartmentQcTopSectionDto } from '@/types/property-tax/apartment';

describe('mapApartmentQcTopSectionToPropertyMasterData - Additional Revenue', () => {
  it('maps the newly added additionalRevenue parameters accurately', () => {
    const mockDto: ApartmentQcTopSectionDto = {
      propertyOverview: {
        propertyId: 'PROP-001',
        societyName: 'Test Society',
      },
      performanceSummary: {
        additionalRevenue: {
          currentTax: 22389,
          retroTax: 8205,
          totalTax: 30594,
          totalDemand: null,
          collection: null,
          totalBalance: null,
          oldCurrentTax: 681610,
          differenceAmount: -659221,
          changePercent: -96.71527706459706,
        },
      },
    };

    const result = mapApartmentQcTopSectionToPropertyMasterData(mockDto);

    expect(result.performance).toBeDefined();
    // Main revenue hero number is formatted differenceAmount without minus sign
    expect(result.performance?.thisAssessmentRevenue).toBe('₹6,59,221');
    // Percentage growth formatted nicely with down arrow for negative change
    expect(result.performance?.revenueGrowthPct).toBe('↓ 96.72%');
    expect(result.performance?.isGrowthNegative).toBe(true);

    // 6 Mini Cards
    expect(result.performance?.currentTax).toBe('₹22,389');
    expect(result.performance?.retroTax).toBe('₹8,205');
    expect(result.performance?.totalTax).toBe('₹30,594');
    expect(result.performance?.totalDemand).toBe('-');
    expect(result.performance?.currentDemand).toBe('₹22,389');
    expect(result.performance?.pendingDemand).toBe('₹8,205');
    expect(result.performance?.collectionAmount).toBe('-');
    expect(result.performance?.collectionPercent).toBe('0%');
    expect(result.performance?.totalBalance).toBe('-');

    // Additional fields
    expect(result.performance?.oldCurrentTax).toBe('₹6,81,610');
    expect(result.performance?.differenceAmount).toBe('-₹6,59,221');
    expect(result.performance?.rawDifferenceAmount).toBe(-659221);
    expect(result.performance?.changePercent).toBe(-96.71527706459706);
  });

  it('handles positive revenue growth correctly', () => {
    const mockDto: ApartmentQcTopSectionDto = {
      performanceSummary: {
        additionalRevenue: {
          currentTax: 50000,
          retroTax: 10000,
          totalTax: 60000,
          totalDemand: 60000,
          currentDemand: 50000,
          pendingDemand: 10000,
          collection: 30000,
          totalBalance: 30000,
          oldCurrentTax: 40000,
          differenceAmount: 10000,
          changePercent: 25,
        },
      },
    };

    const result = mapApartmentQcTopSectionToPropertyMasterData(mockDto);

    expect(result.performance?.thisAssessmentRevenue).toBe('₹10,000');
    expect(result.performance?.revenueGrowthPct).toBe('↑ 25%');
    expect(result.performance?.isGrowthNegative).toBe(false);
    expect(result.performance?.currentTax).toBe('₹50,000');
    expect(result.performance?.retroTax).toBe('₹10,000');
    expect(result.performance?.totalTax).toBe('₹60,000');
    expect(result.performance?.totalDemand).toBe('₹60,000');
    expect(result.performance?.currentDemand).toBe('₹50,000');
    expect(result.performance?.pendingDemand).toBe('₹10,000');
    expect(result.performance?.collectionAmount).toBe('₹30,000');
    expect(result.performance?.collectionPercent).toBe('50%');
    expect(result.performance?.totalBalance).toBe('₹30,000');
    expect(result.performance?.oldCurrentTax).toBe('₹40,000');
    expect(result.performance?.differenceAmount).toBe('+₹10,000');
  });

  it('handles null dto and empty additionalRevenue gracefully', () => {
    const nullResult = mapApartmentQcTopSectionToPropertyMasterData(null);
    expect(nullResult.performance?.thisAssessmentRevenue).toBe('₹0');
    expect(nullResult.performance?.currentTax).toBe('-');
    expect(nullResult.performance?.retroTax).toBe('-');
    expect(nullResult.performance?.totalTax).toBe('-');
    expect(nullResult.performance?.totalDemand).toBe('-');
    expect(nullResult.performance?.currentDemand).toBe('-');
    expect(nullResult.performance?.pendingDemand).toBe('-');
    expect(nullResult.performance?.collectionAmount).toBe('-');
    expect(nullResult.performance?.totalBalance).toBe('-');

    const emptyDtoResult = mapApartmentQcTopSectionToPropertyMasterData({});
    expect(emptyDtoResult.performance?.thisAssessmentRevenue).toBe('₹0');
    expect(emptyDtoResult.performance?.revenueGrowthPct).toBe('');
    expect(emptyDtoResult.performance?.currentTax).toBe('-');
  });
});
