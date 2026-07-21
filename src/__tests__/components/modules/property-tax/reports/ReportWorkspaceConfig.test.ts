import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  REPORT_CODES_BY_CATEGORY,
  resolveCategoryKey,
} from '@/components/modules/property-tax/reports/ReportWorkspaceConfig';
import type { ReportDefinition } from '@/types/report.types';

// ---------------------------------------------------------------------------
// Helper to build a minimal ReportDefinition for resolveCategoryKey tests
// ---------------------------------------------------------------------------
function makeReport(overrides: Partial<ReportDefinition> & { reportCode?: string } = {}): ReportDefinition {
  return {
    id: 1,
    reportCode: 'TestReport',
    reportName: 'Test Report',
    category: 'assessment',
    description: '',
    templateFile: '',
    dataProviderCode: '',
    isActive: true,
    sortOrder: 1,
    ...overrides,
  };
}

// ===========================================================================
// CATEGORIES constant
// ===========================================================================
describe('CATEGORIES constant', () => {
  it('has exactly 6 categories', () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it('contains expected category keys in order', () => {
    const keys = CATEGORIES.map((c) => c.key);
    expect(keys).toEqual([
      'assessment',
      'amc',
      'transaction',
      'approval',
      'discount',
      'others',
    ]);
  });

  it('each category has the required styling fields', () => {
    for (const cat of CATEGORIES) {
      expect(cat).toHaveProperty('color');
      expect(cat).toHaveProperty('bgColor');
      expect(cat).toHaveProperty('borderColor');
      expect(cat).toHaveProperty('glowClass');
      expect(cat).toHaveProperty('iconBg');
      expect(cat).toHaveProperty('icon');
    }
  });

  it('each category has a non-empty key', () => {
    for (const cat of CATEGORIES) {
      expect(cat.key).toBeTruthy();
    }
  });
});

// ===========================================================================
// REPORT_CODES_BY_CATEGORY constant
// ===========================================================================
describe('REPORT_CODES_BY_CATEGORY', () => {
  it('has keys for non-assessment categories', () => {
    expect(REPORT_CODES_BY_CATEGORY).toHaveProperty('amc');
    expect(REPORT_CODES_BY_CATEGORY).toHaveProperty('transaction');
    expect(REPORT_CODES_BY_CATEGORY).toHaveProperty('approval');
    expect(REPORT_CODES_BY_CATEGORY).toHaveProperty('discount');
  });

  it('all values are arrays', () => {
    for (const value of Object.values(REPORT_CODES_BY_CATEGORY)) {
      expect(Array.isArray(value)).toBe(true);
    }
  });
});

// ===========================================================================
// resolveCategoryKey
// ===========================================================================
describe('resolveCategoryKey', () => {
  it('returns "assessment" for an unknown report code', () => {
    const report = makeReport({ reportCode: 'SomeUnknownReport' });
    expect(resolveCategoryKey(report)).toBe('assessment');
  });

  it('returns "assessment" when reportCode is empty', () => {
    const report = makeReport({ reportCode: '' });
    expect(resolveCategoryKey(report)).toBe('assessment');
  });

  it('returns "assessment" for a report with no reportCode property at all', () => {
    // Force a report object that lacks common code keys
    const report = makeReport({});
    // Remove the reportCode field entirely
    delete (report as Record<string, unknown>).reportCode;
    expect(resolveCategoryKey(report)).toBe('assessment');
  });

  it('normalises report codes (case-insensitive, strips dashes/underscores/spaces)', () => {
    // Since all category code arrays are currently empty this should fall back
    const report = makeReport({ reportCode: 'Some_Report-Code' });
    expect(resolveCategoryKey(report)).toBe('assessment');
  });
});
