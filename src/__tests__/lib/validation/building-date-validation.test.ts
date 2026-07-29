import { describe, it, expect } from 'vitest';
import { parseDateString, validateDocumentDate, validateDocumentNumber } from '@/lib/validation/building/validation-rules';
import { validateBuildingForm } from '@/lib/utils/validateBuildingForm';
import { mapBuildingStateToApi, mapTypeNameToKey } from '@/lib/utils/building-helpers';
import { BuildingPermissionState } from '@/types/building-permission.types';

describe('Building Form Validation & Date Semantics', () => {
    describe('parseDateString', () => {
        it('should parse YYYY-MM-DD into a UTC date object', () => {
            const date = parseDateString('2026-01-01');
            expect(date).not.toBeNull();
            expect(date?.getUTCFullYear()).toBe(2026);
            expect(date?.getUTCMonth()).toBe(0); // January
            expect(date?.getUTCDate()).toBe(1);
        });

        it('should return null for empty or invalid date strings', () => {
            expect(parseDateString('')).toBeNull();
            expect(parseDateString('invalid-date')).toBeNull();
            expect(parseDateString('2026-02-31')).toBeNull();
        });
    });

    describe('validateDocumentDate', () => {
        it('should validate past or present dates without timezone shifts', () => {
            const result = validateDocumentDate('2025-05-15');
            expect(result).toBeNull();
        });

        it('should reject future dates', () => {
            const futureYear = new Date().getFullYear() + 5;
            const result = validateDocumentDate(`${futureYear}-01-01`);
            expect(result).toEqual({ key: 'validation.dateFuture' });
        });
    });

    describe('validateDocumentNumber', () => {
        it('should reject document numbers with spaces', () => {
            const result = validateDocumentNumber('OC 12345', 'Occupancy Certificate (OC)');
            expect(result).toEqual({ key: 'validation.numberNoSpaces' });
        });

        it('should accept valid space-free document numbers', () => {
            const result = validateDocumentNumber('OC-12345', 'Occupancy Certificate (OC)');
            expect(result).toBeNull();
        });
    });

    describe('validateBuildingForm - CC vs OC Date Logic', () => {
        const mockT = (key: string) => key;

        it('should ALLOW Occupancy Certificate (OC) on the SAME DAY as Commencement Certificate (CC)', () => {
            const state: BuildingPermissionState = {
                1: {
                    certificateTypeId: 1,
                    enabled: true,
                    certificateTypeName: 'Commencement Certificate (CC)',
                    number: 'CC-10001',
                    date: '2026-01-01',
                    documentGuid: 'doc-guid-1',
                },
                2: {
                    certificateTypeId: 2,
                    enabled: true,
                    certificateTypeName: 'Occupancy Certificate (OC)',
                    number: 'OC-20002',
                    date: '2026-01-01', // Same day
                    documentGuid: 'doc-guid-2',
                },
            };

            const result = validateBuildingForm(state, mockT);
            expect(result.isValid).toBe(true);
            expect(result.incompleteCertificates).toHaveLength(0);
        });

        it('should REJECT Occupancy Certificate (OC) date strictly BEFORE Commencement Certificate (CC) date', () => {
            const state: BuildingPermissionState = {
                1: {
                    certificateTypeId: 1,
                    enabled: true,
                    certificateTypeName: 'Commencement Certificate (CC)',
                    number: 'CC-10001',
                    date: '2026-06-01',
                    documentGuid: 'doc-guid-1',
                },
                2: {
                    certificateTypeId: 2,
                    enabled: true,
                    certificateTypeName: 'Occupancy Certificate (OC)',
                    number: 'OC-20002',
                    date: '2026-01-01', // Before CC
                    documentGuid: 'doc-guid-2',
                },
            };

            const result = validateBuildingForm(state, mockT);
            expect(result.isValid).toBe(false);
            expect(result.fieldErrors?.[2]?.date).toBe('validation.occupancyDateAfterCommencement');
        });
    });

    describe('mapBuildingStateToApi - Normalization', () => {
        it('should strip spaces from certificate numbers deterministically', () => {
            const state: BuildingPermissionState = {
                1: {
                    certificateTypeId: 1,
                    enabled: true,
                    certificateTypeName: 'Occupancy Certificate (OC)',
                    number: '  OC  -  123 456  ',
                    date: '2026-01-01',
                    documentGuid: 'doc-guid-1',
                },
            };

            const payload = mapBuildingStateToApi(state, 549441);
            expect(payload.certificates[0].certificateNumber).toBe('OC-123456');
        });
    });

    describe('mapTypeNameToKey', () => {
        it('should map various certificate type names to canonical keys', () => {
            expect(mapTypeNameToKey('Commencement Certificate (CC)')).toBe('commencementCertificate');
            expect(mapTypeNameToKey('Occupancy Certificate (OC)')).toBe('occupancyCertificate');
            expect(mapTypeNameToKey('Electric Bill')).toBe('electricBill');
            expect(mapTypeNameToKey('Index 2')).toBe('index2');
        });
    });
});
