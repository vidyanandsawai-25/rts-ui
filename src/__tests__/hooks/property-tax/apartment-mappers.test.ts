import { describe, it, expect } from 'vitest';
import { parseApartmentItemNodes } from '@/hooks/property-tax/apartment/apartment-mappers';

describe('apartment-mappers — parseApartmentItemNodes property ID resolution', () => {
  it('correctly sets propertyId and oldPropertyId on both new and old units', () => {
    const rawItems = [
      {
        newSurvey: {
          id: 2078970,
          propertyNo: '116',
          carpetASqFt: 624,
          rateableValue: 3510,
          newTaxTotal: 10811,
        },
        oldSurvey: {
          id: 2565750,
          propertyNo: '8071629',
          carpetASqFt: 600,
          rateableValue: 69152,
          oldTotalTax: 72305,
          propertyMastOldId: 2565750,
        },
        difference: {
          carpetAreaSqFeetDiff: 24,
          totalTaxDiff: -61494,
        },
      },
    ];

    const { newUnits, oldUnits } = parseApartmentItemNodes(rawItems, 999);

    expect(newUnits).toHaveLength(1);
    expect(oldUnits).toHaveLength(1);

    const sUnit = newUnits[0];
    const pUnit = oldUnits[0];

    // sUnit receives the new property ID and the mapped old property ID
    expect(sUnit.propertyId).toBe(2078970);
    expect(sUnit.oldPropertyId).toBe(2565750);

    // pUnit receives the new property ID (used for mapped-old-properties API) and old property ID
    expect(pUnit.propertyId).toBe(2078970);
    expect(pUnit.oldPropertyId).toBe(2565750);
  });

  it('falls back to defaultPropertyId when newSurvey does not contain propertyId or id', () => {
    const rawItems = [
      {
        oldSurvey: {
          id: 2565750,
          oldPropertyId: 2565750,
        },
        difference: {},
      },
    ];

    const { newUnits, oldUnits } = parseApartmentItemNodes(rawItems, 456);

    expect(newUnits[0].propertyId).toBe(456);
    expect(pUnitResolved(oldUnits[0])).toBe(456);
    expect(oldUnits[0].oldPropertyId).toBe(2565750);
  });

  it('correctly includes partitionNo in prop string and sets partitionNo property', () => {
    const rawItems = [
      {
        newSurvey: {
          id: 101,
          propertyNo: '116',
          partitionNo: '1',
          flatOrShopNo: '202',
        },
        oldSurvey: {
          id: 102,
          propertyNo: '8071629',
          oldPartitionNo: '0',
          flatOrShopNo: '101',
        },
        difference: {},
      },
      {
        newSurvey: {
          id: 103,
          propertyNo: '116',
          partitionNo: '2',
        },
        oldSurvey: {
          id: 104,
          oldPropertyNo: '8071630',
        },
        difference: {},
      },
    ];

    const { newUnits, oldUnits } = parseApartmentItemNodes(rawItems);

    // With partition and flat: "116 / 1 / 202"
    expect(newUnits[0].prop).toBe('116 / 1 / 202');
    expect(newUnits[0].partitionNo).toBe('1');

    // With partition 0 and flat: "8071629 / 0 / 101"
    expect(oldUnits[0].prop).toBe('8071629 / 0 / 101');
    expect(oldUnits[0].partitionNo).toBe('0');

    // With partition only: "116 / 2"
    expect(newUnits[1].prop).toBe('116 / 2');
    expect(newUnits[1].partitionNo).toBe('2');

    // Without partition: "8071630"
    expect(oldUnits[1].prop).toBe('8071630');
    expect(oldUnits[1].partitionNo).toBeUndefined();
  });
});

function pUnitResolved(unit: { propertyId?: number | null }) {
  return unit.propertyId;
}
