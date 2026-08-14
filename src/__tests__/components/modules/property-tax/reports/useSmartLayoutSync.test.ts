import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildCanonicalSmartLayoutParameters,
  parseSelectedPropertyValue,
  prepareReportSubmissionParameters,
  useSmartLayoutSync,
} from '@/hooks/reports/useSmartLayoutSync';
import type { ReportParameterDefinition } from '@/types/report.types';

function reportParameter(parameterKey: string, label: string): ReportParameterDefinition {
  return {
    id: 1,
    reportDefinitionId: 1,
    parameterKey,
    label,
    parameterType: 'text',
    optionsSource: null,
    cascadeFromKey: null,
    isRequired: false,
    sortOrder: 1,
  };
}

describe('parseSelectedPropertyValue', () => {
  it('separates the exact property id and partition from a selected option', () => {
    expect(parseSelectedPropertyValue('1/1|456', '1')).toEqual({
      propertyNo: '1',
      propertyId: '456',
    });
  });

  it('preserves slashes that are part of the property number', () => {
    expect(parseSelectedPropertyValue('101/A/1|789', '1')).toEqual({
      propertyNo: '101/A',
      propertyId: '789',
    });
  });

  it('supports an unpartitioned property', () => {
    expect(parseSelectedPropertyValue('25|123', '')).toEqual({
      propertyNo: '25',
      propertyId: '123',
    });
  });

  it('builds property number and id directly for an individual submission', () => {
    expect(buildCanonicalSmartLayoutParameters({
      financialYear: '2026',
      zoneId: '15',
      wardId: ['60'],
      fromProperty: '',
      toProperty: '',
      propertyNo: '1/A4|552377',
      partitionNo: 'A4',
      ownerIdList: '',
      selectedProperties: [],
      selectionMode: 'property',
      amountOperator: 'greater_than',
      amountValue: '',
      propertyDescription: [],
      assessmentStatus: [],
    })).toMatchObject({
      propertyNo: '1',
      propertyId: '552377',
      ownerId: '552377',
      partitionNo: 'A4',
    });
  });

  it('uses the active-year sentinel only for an individual WarrentNotice', () => {
    const parameters = prepareReportSubmissionParameters('WarrentNotice', 'property', {
      financeyear: '2026',
      zoneId: '15',
      wardId: '60',
      propertyNo: '1',
      propertyId: '552377',
      ownerId: '552377',
      partitionNo: 'A4',
    });

    expect(parameters).toHaveProperty('financeyear', '0');
    expect(parameters).toMatchObject({
      propertyNo: '1',
      propertyId: '552377',
      ownerId: '552377',
      partitionNo: 'A4',
    });
  });

  it('keeps the year for other reports and WarrentNotice range mode', () => {
    expect(prepareReportSubmissionParameters('DocumentNotice', 'property', {
      financeyear: '2026',
    })).toHaveProperty('financeyear', '2026');

    expect(prepareReportSubmissionParameters('WarrentNotice', 'range', {
      financeyear: '2026',
    })).toHaveProperty('financeyear', '2026');
  });

  it('maps an individual selection to the exact property id and partition filters', async () => {
    const handleParamChange = vi.fn();
    const parameters = [
      reportParameter('PropertyNo', 'Property No'),
      reportParameter('PropertyPartitionNo', 'Partition No'),
      reportParameter('PropertyId', 'Property Id'),
    ];

    renderHook(() => useSmartLayoutSync({
      financialYear: '2026',
      zoneId: '10',
      wardId: ['20'],
      fromProperty: '',
      toProperty: '',
      propertyNo: '1/2|456',
      partitionNo: '2',
      ownerIdList: '',
      selectedProperties: [],
      selectionMode: 'property',
      amountOperator: 'greater_than',
      amountValue: '',
      propertyDescription: [],
      assessmentStatus: [],
      parameters,
      handleParamChange,
    }));

    await waitFor(() => {
      expect(handleParamChange).toHaveBeenCalledWith('PropertyNo', '1');
      expect(handleParamChange).toHaveBeenCalledWith('PropertyPartitionNo', '2');
      expect(handleParamChange).toHaveBeenCalledWith('PropertyId', '456');
    });
  });
});
