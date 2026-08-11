/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/document-utils', () => ({
  getViewDocumentUrl: vi.fn((guid: string) => `/view/${guid}`),
}));

import {
  formatDate,
  formatMoney,
  formatBoolean,
  formatFieldValue,
  mapAssetToRow,
  mapExpandedSubUnitItems,
  mapGroupedAssetPhotosToPanelPhotos,
  mapSubUnitToAssetRegisterRow,
} from '@/components/modules/assets/municipal-Asset/asset-register/registerMappers';
import type { AssetRegisterApiRecord } from '@/types/asset/asset-register/municipal-asset-service.types';

describe('registerMappers', () => {
  // ──────────────────────────────────────────────────────────────
  // formatDate
  // ──────────────────────────────────────────────────────────────
  describe('formatDate', () => {
    it('returns "-" for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('returns "-" for empty string', () => {
      expect(formatDate('')).toBe('-');
    });

    it('formats a valid ISO date string to en-IN locale', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/1/);
      expect(result).toMatch(/2024/);
    });

    it('returns original value for an invalid date string', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // formatMoney
  // ──────────────────────────────────────────────────────────────
  describe('formatMoney', () => {
    it('returns "-" for empty string', () => {
      expect(formatMoney('')).toBe('-');
    });

    it('returns "-" for "-"', () => {
      expect(formatMoney('-')).toBe('-');
    });

    it('formats a numeric string with en-IN localization', () => {
      const result = formatMoney('1000000');
      expect(result).toContain('00');
    });

    it('returns original string for non-numeric value', () => {
      expect(formatMoney('abc')).toBe('abc');
    });

    it('formats zero correctly', () => {
      expect(formatMoney('0')).toBe('0');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // formatBoolean
  // ──────────────────────────────────────────────────────────────
  describe('formatBoolean', () => {
    it('returns "Yes" for boolean true', () => {
      expect(formatBoolean(true)).toBe('Yes');
    });

    it('returns "Yes" for string "true"', () => {
      expect(formatBoolean('true')).toBe('Yes');
    });

    it('returns "No" for boolean false', () => {
      expect(formatBoolean(false)).toBe('No');
    });

    it('returns "No" for string "false"', () => {
      expect(formatBoolean('false')).toBe('No');
    });

    it('returns "-" for undefined', () => {
      expect(formatBoolean(undefined)).toBe('-');
    });

    it('returns "-" for null', () => {
      expect(formatBoolean(null)).toBe('-');
    });

    it('returns "-" for unknown string', () => {
      expect(formatBoolean('maybe')).toBe('-');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // formatFieldValue
  // ──────────────────────────────────────────────────────────────
  describe('formatFieldValue', () => {
    it('formats booleans and nested field values', () => {
      expect(formatFieldValue({ floor: 2, active: true })).toContain('floor: 2');
      expect(formatFieldValue(['A', 'B'])).toBe('A, B');
    });

    it('returns "-" for null', () => {
      expect(formatFieldValue(null)).toBe('-');
    });

    it('returns "-" for undefined', () => {
      expect(formatFieldValue(undefined)).toBe('-');
    });

    it('returns "-" for empty string', () => {
      expect(formatFieldValue('')).toBe('-');
    });

    it('returns the string as-is', () => {
      expect(formatFieldValue('hello')).toBe('hello');
    });

    it('converts number to string', () => {
      expect(formatFieldValue(42)).toBe('42');
    });

    it('converts boolean to string', () => {
      expect(formatFieldValue(true)).toBe('true');
    });

    it('returns "-" for empty array', () => {
      expect(formatFieldValue([])).toBe('-');
    });

    it('formats array of strings with comma separator', () => {
      expect(formatFieldValue(['a', 'b', 'c'])).toBe('a, b, c');
    });

    it('returns "-" for empty object', () => {
      expect(formatFieldValue({})).toBe('-');
    });

    it('formats object key-value pairs', () => {
      expect(formatFieldValue({ area: '100', type: 'Commercial' })).toContain('area: 100');
      expect(formatFieldValue({ area: '100', type: 'Commercial' })).toContain('type: Commercial');
    });

    it('omits object keys whose values format to "-"', () => {
      const result = formatFieldValue({ area: '', type: 'Commercial' });
      expect(result).not.toContain('area');
      expect(result).toContain('type: Commercial');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // mapAssetToRow
  // ──────────────────────────────────────────────────────────────
  const baseRecord: AssetRegisterApiRecord = {
    id: 1,
    assetNo: 'ASSET-001',
    assetName: 'Main Building',
    assetCategoryName: 'Building',
    assetTypeName: 'Commercial',
    authorityName: 'Authority A',
    organizationName: 'Org B',
    departmentName: 'Dept C',
    address: '123 Main St',
    wardName: 'Ward 1',
    zoneName: 'Zone A',
    latitude: 18.5,
    longitude: 73.8,
    capitalValue: 5000000,
    isActive: true,
    assetCategoryId: 10,
    assetTypeId: 20,
  };

  describe('mapAssetToRow', () => {
    it('maps basic fields correctly', () => {
      const row = mapAssetToRow(baseRecord, 'Building');
      expect(row.id).toBe(1);
      expect(row.assetCode).toBe('ASSET-001');
      expect(row.assetName).toBe('Main Building');
      expect(row.categoryName).toBe('Building');
      expect(row.authorityName).toBe('Authority A');
    });

    it('uses fallbackCategoryName when assetCategoryName is missing', () => {
      const record = { ...baseRecord, assetCategoryName: undefined };
      const row = mapAssetToRow(record, 'Fallback Category');
      expect(row.categoryName).toBe('Fallback Category');
    });

    it('returns null id for invalid/zero id', () => {
      const record = { ...baseRecord, id: 0 };
      const row = mapAssetToRow(record, 'Building');
      expect(row.id).toBeNull();
    });

    it('returns null id for non-numeric id', () => {
      const record = { ...baseRecord, id: 'invalid' as unknown as number };
      const row = mapAssetToRow(record, 'Building');
      expect(row.id).toBeNull();
    });

    it('formats latitude and longitude as strings', () => {
      const row = mapAssetToRow(baseRecord, 'Building');
      expect(row.latitude).toBe('18.5');
      expect(row.longitude).toBe('73.8');
    });

    it('returns "-" for latitude/longitude when null', () => {
      const record = { ...baseRecord, latitude: undefined, longitude: undefined };
      const row = mapAssetToRow(record, 'Building');
      expect(row.latitude).toBe('-');
      expect(row.longitude).toBe('-');
    });

    it('capitalValue defaults to "-" when null', () => {
      const record = { ...baseRecord, capitalValue: null as any };
      const row = mapAssetToRow(record, 'Building');
      expect(row.capitalValue).toBe('-');
    });

    it('netBookValue uses currentBookValue first', () => {
      const record = { ...baseRecord, currentBookValue: 1000, capitalValue: 2000, marketValue: 3000 };
      const row = mapAssetToRow(record, 'Building');
      expect(row.netBookValue).toBe('1000');
    });

    it('netBookValue falls back to capitalValue when currentBookValue is null', () => {
      const record = { ...baseRecord, currentBookValue: null as any, capitalValue: 2000, marketValue: 3000 };
      const row = mapAssetToRow(record, 'Building');
      expect(row.netBookValue).toBe('2000');
    });

    it('netBookValue falls back to marketValue when both currentBookValue and capitalValue are null', () => {
      const record = { ...baseRecord, currentBookValue: null as any, capitalValue: null as any, marketValue: 3000 };
      const row = mapAssetToRow(record, 'Building');
      expect(row.netBookValue).toBe('3000');
    });

    it('returns "-" for missing optional string fields', () => {
      const record: AssetRegisterApiRecord = { id: 2, assetNo: 'X', assetName: 'Y', isActive: true };
      const row = mapAssetToRow(record, 'Fallback');
      expect(row.wardName).toBe('-');
      expect(row.zoneName).toBe('-');
      expect(row.ownershipType).toBe('-');
    });

    it('falls back to details.address when address is missing', () => {
      const record = {
        ...baseRecord,
        address: undefined,
        details: { address: 'Details Street' },
      };
      const row = mapAssetToRow(record, 'Building');
      expect(row.address).toBe('Details Street');
    });

    it('totalSubUnits defaults to 0 when null', () => {
      const record = { ...baseRecord, totalSubUnits: null as any };
      const row = mapAssetToRow(record, 'Building');
      expect(row.totalSubUnits).toBe(0);
    });

    it('totalSubUnits maps correctly when provided', () => {
      const record = { ...baseRecord, totalSubUnits: 5 };
      const row = mapAssetToRow(record, 'Building');
      expect(row.totalSubUnits).toBe(5);
    });

    it('hasLift formats boolean correctly', () => {
      const rowTrue = mapAssetToRow({ ...baseRecord, hasLift: true }, 'Building');
      const rowFalse = mapAssetToRow({ ...baseRecord, hasLift: false }, 'Building');
      const rowNull = mapAssetToRow({ ...baseRecord, hasLift: undefined }, 'Building');
      expect(rowTrue.hasLift).toBe('Yes');
      expect(rowFalse.hasLift).toBe('No');
      expect(rowNull.hasLift).toBe('-');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // mapGroupedPhotos & Subunits
  // ──────────────────────────────────────────────────────────────
  it('maps grouped photos, filtering invalid entries and building view URL', () => {
    const photos = mapGroupedAssetPhotosToPanelPhotos({
      photoTypes: [
        {
          photos: [
            {
              photoId: 1,
              assetId: 2,
              photoTypeId: 3,
              photoTypeCode: 'FRONT',
              photoTypeName: 'Front',
              documentGuid: 'abc-guid',
            },
            {
              photoId: undefined,
              assetId: 2,
              photoTypeId: 3,
              photoTypeCode: 'SIDE',
              photoTypeName: 'Side',
              documentGuid: undefined as any,
            },
          ],
        } as any,
      ],
    } as any);

    expect(photos).toHaveLength(1);
    expect(photos[0].viewUrl).toBe('/view/abc-guid');
  });

  it('maps subunits for expansion and row conversion', () => {
    const expanded = mapExpandedSubUnitItems([{ id: 5 }] as never, 10);
    expect(expanded[0].isSubUnit).toBe(true);
    expect(expanded[0].parentId).toBe(10);

    const row = mapSubUnitToAssetRegisterRow(
      {
        id: 5,
        assetNo: 'SUB-5',
        assetName: 'Sub Hall',
        names: { category: 'Building', type: 'Office', ward: 'W2', zone: 'Z2' },
        occupancy: 'Occupied',
        status: 'Good',
        assetLife: 10,
      } as never,
      {
        id: 10,
        authorityName: 'ULB',
        organizationName: 'NTIS',
        departmentName: 'Engg',
        assetName: 'Main Hall',
        address: 'Road',
        latitude: '0',
        longitude: '0',
        csn: 'C1',
        hasLift: 'Yes',
        purchaseDate: '',
        marketValueDate: '',
        isRevenueGenerating: 'No',
        operationalControl: 'Self',
        ownershipType: 'Owned',
        assetCategoryId: 1,
        assetTypeId: 2,
      } as never
    );

    expect(row.isSubUnit).toBe(true);
    expect(row.parentId).toBe(10);
    expect(row.assetCode).toBe('SUB-5');
    expect(row.lifeYears).toBe('10');
  });
});
