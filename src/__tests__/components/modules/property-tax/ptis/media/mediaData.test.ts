import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatWingCardLabel, mapSlotsToCategories } from '@/components/modules/property-tax/ptis/media/mediaData';

describe('mediaData - formatWingCardLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('appends simple wing letter to base label', () => {
    expect(formatWingCardLabel('Wing Photo', 'B')).toBe('Wing Photo (B)');
    expect(formatWingCardLabel('Wing Photo', 'A')).toBe('Wing Photo (A)');
  });

  it('normalizes wing names that already include "Wing" prefix or suffix', () => {
    expect(formatWingCardLabel('Wing Photo', 'Wing B')).toBe('Wing Photo (B)');
    expect(formatWingCardLabel('Wing Photo', 'B Wing')).toBe('Wing Photo (B)');
  });

  it('works with localized labels (Marathi and Hindi)', () => {
    expect(formatWingCardLabel('विंग फोटो', 'B')).toBe('विंग फोटो (B)');
    expect(formatWingCardLabel('विंग फोटो', 'Wing A')).toBe('विंग फोटो (A)');
    expect(formatWingCardLabel('विंग फ़ोटो', 'C')).toBe('विंग फ़ोटो (C)');
  });

  it('preserves named society wings (e.g. Ganga, Tulsi)', () => {
    expect(formatWingCardLabel('Wing Photo', 'Ganga')).toBe('Wing Photo (Ganga)');
    expect(formatWingCardLabel('Wing Photo', 'Ganga Wing')).toBe('Wing Photo (Ganga)');
  });

  it('does not duplicate wing name if already present in base label', () => {
    expect(formatWingCardLabel('Wing Photo (B)', 'B')).toBe('Wing Photo (B)');
    expect(formatWingCardLabel('Wing Photo (B)', 'Wing B')).toBe('Wing Photo (B)');
  });

  it('updates wing name cleanly when switching wings (e.g. from Wing A to Wing B)', () => {
    expect(formatWingCardLabel('Wing Photo (A)', 'B')).toBe('Wing Photo (B)');
    expect(formatWingCardLabel('विंग फोटो (A)', 'Wing B')).toBe('विंग फोटो (B)');
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

  it('includes selected wing name in wing category photoTypeName', () => {
    const categories = mapSlotsToCategories(
      mockSlots,
      [],
      undefined,
      undefined,
      'B'
    );

    const wingCat = categories.find((c) => c.photoTypeCode === 'WING_BUILDING');
    expect(wingCat).toBeDefined();
    expect(wingCat?.photoTypeName).toBe('Wing Photo (B)');
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
    expect(wingCat?.photoTypeName).toBe('Wing Photo (B)');
  });
});
