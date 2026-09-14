import { describe, it, expect } from 'vitest';
import {
  normalizeCertificateGridData,
  getActiveCertificateForLevel,
  flattenCertificateRecords,
} from '@/lib/utils/certificate-grid-mapper';

describe('Certificate Grid Mapper Utility', () => {
  const sampleUserApiResponse = {
    success: true,
    message: 'Record found successfully',
    items: {
      wingCount: 4,
      unitCount: 48,
      societyCertificates: [
        {
          rowNumber: 1,
          level: 'Apartment',
          societyDetailId: 1507857,
          wingDetailId: null,
          propertyId: null,
          propertyDetailsId: null,
          applicableToLabel: 'Entire Apartment',
          applicableToSubLabel: '4 wings · 48 units',
          unitsCoveredCount: null,
          unitsTotalCount: null,
          unitsMissingCount: null,
          coveredUnitNumbers: [],
          certificateTypeId: 1,
          certificateTypeCode: 'CC',
          certificateTypeName: 'Completion Certificate',
          certificateDate: '2026-09-01T00:00:00',
          certificateNumber: 'society_cert_123',
          status: 'Active',
          hasDocument: true,
          documentGuid: '97c00f3e-11a2-4615-93d5-1611eecc9803',
        },
      ],
      wingCertificates: [
        {
          rowNumber: 1,
          level: 'Wing',
          societyDetailId: 1507857,
          wingDetailId: 1530992,
          propertyId: null,
          propertyDetailsId: null,
          applicableToLabel: 'a',
          applicableToSubLabel: '13 units in this wing',
          unitsCoveredCount: null,
          unitsTotalCount: null,
          unitsMissingCount: null,
          coveredUnitNumbers: [],
          certificateTypeId: 1,
          certificateTypeCode: 'CC',
          certificateTypeName: 'Completion Certificate',
          certificateDate: '2026-09-01T00:00:00',
          certificateNumber: 'wing_cert_a',
          status: 'Active',
          hasDocument: true,
          documentGuid: '83395462-7eb5-433d-8e9c-d8a96a8c65ae',
        },
        {
          rowNumber: 2,
          level: 'Wing',
          societyDetailId: 1507857,
          wingDetailId: 1530994,
          propertyId: null,
          propertyDetailsId: null,
          applicableToLabel: 'C',
          applicableToSubLabel: '14 units in this wing',
          unitsCoveredCount: null,
          unitsTotalCount: null,
          unitsMissingCount: null,
          coveredUnitNumbers: [],
          certificateTypeId: 1,
          certificateTypeCode: 'CC',
          certificateTypeName: 'Completion Certificate',
          certificateDate: '2026-09-01T00:00:00',
          certificateNumber: 'wing_cert_c',
          status: 'Active',
          hasDocument: false,
          documentGuid: null,
        },
      ],
      unitCertificates: [
        {
          rowNumber: 1,
          level: 'Unit',
          societyDetailId: 1507857,
          wingDetailId: 1530992,
          propertyId: 2078966,
          propertyDetailsId: null,
          applicableToLabel: '',
          applicableToSubLabel: null,
          unitsCoveredCount: 2,
          unitsTotalCount: 48,
          unitsMissingCount: 46,
          coveredUnitNumbers: [],
          certificateTypeId: 1,
          certificateTypeCode: 'CC',
          certificateTypeName: 'Completion Certificate',
          certificateDate: '2026-09-01T00:00:00',
          certificateNumber: 'unit_cert_2078966',
          status: 'Active',
          hasDocument: false,
          documentGuid: null,
        },
      ],
      floorCertificates: [],
    },
  };

  it('normalizes nested items object correctly', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    expect(normalized.wingCount).toBe(4);
    expect(normalized.unitCount).toBe(48);
    expect(normalized.societyCertificates).toHaveLength(1);
    expect(normalized.wingCertificates).toHaveLength(2);
    expect(normalized.unitCertificates).toHaveLength(1);
  });

  it('flattens records cleanly', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    const flat = flattenCertificateRecords(normalized);
    expect(flat).toHaveLength(4);
  });

  it('retrieves direct Apartment certificate when level is Apartment', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    const result = getActiveCertificateForLevel(normalized, 'Apartment', 1);
    expect(result.certificate?.certificateNumber).toBe('society_cert_123');
    expect(result.inheritedFrom).toBe('Direct');
  });

  it('retrieves Wing certificate when level is Wing and wingDetailId matches', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    const result = getActiveCertificateForLevel(normalized, 'Wing', 1, 1530992);
    expect(result.certificate?.certificateNumber).toBe('wing_cert_a');
    expect(result.inheritedFrom).toBe('Direct');
  });

  it('falls back to Apartment certificate when level is Wing but selected wing has no wing certificate', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    // wingDetailId 999999 has no wing certificate in sample data
    const result = getActiveCertificateForLevel(normalized, 'Wing', 1, 999999);
    expect(result.certificate?.certificateNumber).toBe('society_cert_123');
    expect(result.inheritedFrom).toBe('Apartment');
  });

  it('retrieves direct Unit certificate when level is Unit and propertyId matches strictly', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    const result = getActiveCertificateForLevel(normalized, 'Unit', 1, 1530992, 2078966, 1507857);
    expect(result.certificate?.certificateNumber).toBe('unit_cert_2078966');
    expect(result.inheritedFrom).toBe('Direct');
  });

  it('does NOT map unit certificate to other units, but falls back to wingDetailId wise', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    // Unit 999999 is in wing 1530992, but unit_cert_2078966 is for propertyId 2078966 only
    const result = getActiveCertificateForLevel(normalized, 'Unit', 1, 1530992, 999999, 1507857);
    expect(result.certificate?.certificateNumber).toBe('wing_cert_a');
    expect(result.inheritedFrom).toBe('Wing');
  });

  it('falls back to societyDetailId wise when neither unit nor wing certificate matches', () => {
    const normalized = normalizeCertificateGridData(sampleUserApiResponse);
    // Unit 888888 is in wing 999999 (which has no wing certificate)
    const result = getActiveCertificateForLevel(normalized, 'Unit', 1, 999999, 888888, 1507857);
    expect(result.certificate?.certificateNumber).toBe('society_cert_123');
    expect(result.inheritedFrom).toBe('Apartment');
  });
});
