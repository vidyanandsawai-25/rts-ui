import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatWingCardLabel, mapSlotsToCategories } from '@/components/modules/property-tax/ptis/media/mediaData';

describe('mediaData - formatWingCardLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats simple wing letter as Wing [name]', () => {
    expect(formatWingCardLabel('Wing Photo', 'B')).toBe('Wing B');
    expect(formatWingCardLabel('Wing Photo', 'A')).toBe('Wing Asha' === 'Wing Asha' ? 'Wing A' : 'Wing A');
  });

  it('normalizes wing names that already include "Wing" prefix or suffix', () => {
    expect(formatWingCardLabel('Wing Photo', 'Wing B')).toBe('Wing B');
    expect(formatWingCardLabel('Wing Photo', 'B Wing')).toBe('Wing B');
    expect(formatWingCardLabel('Wing Photo', 'Gana')).toBe('Wing Gana');
  });

  it('works with localized labels (Marathi and Hindi)', () => {
    expect(formatWingCardLabel('विंग फोटो', 'B')).toBe('विंग B');
    expect(formatWingCardLabel('विंग फोटो', 'Wing A')).toBe('विंग A');
  });

  it('preserves named society wings (e.g. Ganga, Tulsi, Gana)', () => {
    expect(formatWingCardLabel('Wing Photo', 'Ganga')).toBe('Wing Ganga');
    expect(formatWingCardLabel('Wing Photo', 'Ganga Wing')).toBe('Wing Ganga');
    expect(formatWingCardLabel('Wing Photo', 'Gana')).toBe('Wing Gana');
  });

  it('returns base label unchanged if wingName is empty or undefined', () => {
    expect(formatWingCardLabel('Wing Photo', '')).toBe('Wing Photo');
    expect(formatWingCardLabel('Wing Photo', undefined)).toBe('Wing Photo');
    expect(formatWingCardLabel('Wing Photo', null)).toBe('Wing Photo');
    expect(formatWingCardLabel('Wing Photo', '   ')).toBe('Wing Photo');
  });
});

describe('mediaData - mapSlotsToCategories with wingName', () => {
  const mockSlots = [
    {
      photoTypeId: 10,
      photoTypeCode: 'WING_BUILDING',
      photoTypeName: 'Wing Photo',
      displayOrder: 1,
      hasPhoto: false,
    },
    {
      photoTypeId: 1,
      photoTypeCode: 'SOCIETY_BUILDING',
      photoTypeName: 'Society Photo',
      displayOrder: 2,
      hasPhoto: false,
    },
  ];

  it('includes selected wing name in wing category photoTypeName as Wing [name]', () => {
    const categories = mapSlotsToCategories(
      mockSlots,
      [],
      undefined,
      undefined,
      'B'
    );

    const wingCat = categories.find((c) => c.photoTypeCode === 'WING_BUILDING');
    expect(wingCat).toBeDefined();
    expect(wingCat?.photoTypeName).toBe('Wing B');
  });

  it('formats wing name when passed as "Wing B"', () => {
    const categories = mapSlotsToCategories(
      mockSlots,
      [],
      undefined,
      undefined,
      'Wing B'
    );

    const wingCat = categories.find((c) => c.photoTypeCode === 'WING_BUILDING');
    expect(wingCat).toBeDefined();
    expect(wingCat?.photoTypeName).toBe('Wing B');
  });
});

describe('mediaData - mapSlotsToCategories in QuickDataEntry mode', () => {
  const allSlots = [
    { photoTypeId: 1, photoTypeCode: 'PROPERTY_FRONT', photoTypeName: 'Property Front Photo', photoScope: 'PROPERTY', displayOrder: 1, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 2, photoTypeCode: 'PROPERTY_SIDE', photoTypeName: 'Property Side Photo', photoScope: 'PROPERTY', displayOrder: 2, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 3, photoTypeCode: 'PROPERTY_INSIDE', photoTypeName: 'Property Inside Photo', photoScope: 'PROPERTY', displayOrder: 3, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 4, photoTypeCode: 'PROPERTY_BOARD', photoTypeName: 'Property Board Photo', photoScope: 'PROPERTY', displayOrder: 4, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 5, photoTypeCode: 'WING_BUILDING', photoTypeName: 'Wing Photo', photoScope: 'WING', displayOrder: 5, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 6, photoTypeCode: 'SOCIETY_PLACE', photoTypeName: 'Society Place Photo', photoScope: 'SOCIETY', displayOrder: 6, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 7, photoTypeCode: 'GIS', photoTypeName: 'Satellite View', photoScope: 'PROPERTY', displayOrder: 7, hasPhoto: false, photoCount: 0 },
    { photoTypeId: 8, photoTypeCode: 'CHANGE_DETECTION', photoTypeName: 'Change Detection', photoScope: 'PROPERTY', displayOrder: 8, hasPhoto: false, photoCount: 0 },
  ];

  it('only loads property scope slots for inner property of society wings in QDE', () => {
    const categories = mapSlotsToCategories(
      allSlots,
      [],
      undefined,
      undefined,
      'B Wing',
      1530993,
      false, // isMainProperty = false (inner property)
      1,     // categoryId = 1 (Apartment)
      null,
      'P',
      false,
      undefined,
      undefined,
      true,  // isQuickDataEntry = true
      'B9'   // partitionNo = 'B9'
    );

    // Should include property-scoped slots and property plan
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_FRONT')).toBe(true);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_SIDE')).toBe(true);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_INSIDE')).toBe(true);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_BOARD')).toBe(true);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_PLAN')).toBe(true);

    // Should NOT include society or wing slots
    expect(categories.some((c) => c.photoTypeCode?.startsWith('WING_'))).toBe(false);
    expect(categories.some((c) => c.photoTypeCode?.startsWith('SOCIETY_'))).toBe(false);

    // Should NOT include satellite view or change detection
    expect(categories.some((c) => c.photoTypeCode === 'GIS')).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'CHANGE_DETECTION')).toBe(false);
  });

  it('only loads society scope slots for main society property in QDE', () => {
    const categories = mapSlotsToCategories(
      allSlots,
      [],
      undefined,
      undefined,
      'A Wing',
      1530423,
      true,  // isMainProperty = true (main society property)
      1,     // categoryId = 1 (Apartment)
      null,
      'S',
      false,
      undefined,
      undefined,
      true,  // isQuickDataEntry = true
      ''     // partitionNo = ''
    );

    // Should include society scope slots
    expect(categories.some((c) => c.photoTypeCode?.startsWith('SOCIETY_'))).toBe(true);

    // Should NOT include wing slots for main society property
    expect(categories.some((c) => c.photoTypeCode?.startsWith('WING_'))).toBe(false);

    // Should NOT include property scope slots or plan
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_FRONT')).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_SIDE')).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_PLAN')).toBe(false);

    // Should NOT include satellite view or change detection
    expect(categories.some((c) => c.photoTypeCode === 'GIS')).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'CHANGE_DETECTION')).toBe(false);
  });

  it('loads amenity, society slots, and property plan for amenity property in QDE', () => {
    const slotsWithAmenity = [
      ...allSlots,
      { photoTypeId: 14, photoTypeCode: 'AMENITY_PHOTO', photoTypeName: 'Amenity Photo', photoScope: 'PROPERTY', displayOrder: 9, hasPhoto: false, photoCount: 0 },
    ];

    const categories = mapSlotsToCategories(
      slotsWithAmenity,
      [],
      undefined,
      undefined,
      undefined,
      null,
      false,
      140,  // categoryId = 140 (Amenity)
      140,  // propertyTypeId = 140
      'A',  // entityType = 'A'
      true, // isAmenityProp = true
      undefined,
      undefined,
      true, // isQuickDataEntry = true
      'DAM11'
    );

    // Amenity photo and property plan should be present
    expect(categories.some((c) => c.photoTypeCode === 'AMENITY_PHOTO')).toBe(true);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_PLAN')).toBe(true);

    // Society slots should ALSO be present for amenity property
    expect(categories.some((c) => c.photoTypeCode?.startsWith('SOCIETY_'))).toBe(true);

    // Wing slots and regular property slots should NOT be present
    expect(categories.some((c) => c.photoTypeCode?.startsWith('WING_'))).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_FRONT')).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'PROPERTY_SIDE')).toBe(false);

    // GIS and Change Detection should NOT be present in QDE
    expect(categories.some((c) => c.photoTypeCode === 'GIS')).toBe(false);
    expect(categories.some((c) => c.photoTypeCode === 'CHANGE_DETECTION')).toBe(false);
  });
});

