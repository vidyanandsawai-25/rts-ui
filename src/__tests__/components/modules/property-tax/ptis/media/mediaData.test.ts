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
