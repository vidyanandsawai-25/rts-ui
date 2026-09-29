import { describe, it, expect } from 'vitest';
import { getLocalizedName } from '@/lib/utils/social-details';
import { getItemLevel, LEVEL_NAMES } from '@/lib/utils/ptis/social-details';

describe('getLocalizedName', () => {
  it('should return raw dynamic DB name when provided', () => {
    const mockT = (key: string) =>
      key === 'discount.socialAttributes.HAS_SOLAR' ? 'Solar Installed' : key;
    mockT.has = (key: string) => key === 'discount.socialAttributes.HAS_SOLAR';

    const result = getLocalizedName('HAS_SOLAR', 'Solar Installed on high', mockT);
    expect(result).toBe('Solar Installed on high');
  });

  it('should return non-English translation for Hindi/Marathi locale', () => {
    const mockT = (key: string) =>
      key === 'discount.socialAttributes.HAS_SOLAR' ? 'सौर स्थापित' : key;
    mockT.has = (key: string) => key === 'discount.socialAttributes.HAS_SOLAR';

    const result = getLocalizedName('HAS_SOLAR', 'Solar Installed on high', mockT);
    expect(result).toBe('सौर स्थापित');
  });

  it('should fallback to code translation if name is null or empty', () => {
    const mockT = (key: string) =>
      key === 'discount.socialAttributes.HAS_SOLAR' ? 'Solar Installed' : key;
    mockT.has = (key: string) => key === 'discount.socialAttributes.HAS_SOLAR';

    const result = getLocalizedName('HAS_SOLAR', null, mockT);
    expect(result).toBe('Solar Installed');
  });
});

describe('getItemLevel', () => {
  it('should classify unit records with propertyId and wingDetailId as UNIT', () => {
    const item = {
      propertyId: 2078970,
      wingDetailId: 105,
      societyDetailId: 50,
    };
    expect(getItemLevel(item)).toBe(LEVEL_NAMES.UNIT);
  });

  it('should classify wing records with only wingDetailId as WING', () => {
    const item = {
      wingDetailId: 105,
      societyDetailId: 50,
      propertyId: null,
    };
    expect(getItemLevel(item)).toBe(LEVEL_NAMES.WING);
  });

  it('should classify apartment records with only societyDetailId as APARTMENT', () => {
    const item = {
      societyDetailId: 50,
      wingDetailId: null,
      propertyId: null,
    };
    expect(getItemLevel(item)).toBe(LEVEL_NAMES.APARTMENT);
  });

  it("should honor explicit entityType 'P', 'W', and 'S'", () => {
    expect(getItemLevel({ entityType: 'P', wingDetailId: 105 })).toBe(LEVEL_NAMES.UNIT);
    expect(getItemLevel({ entityType: 'W', wingDetailId: 105 })).toBe(LEVEL_NAMES.WING);
    expect(getItemLevel({ entityType: 'S', societyDetailId: 50 })).toBe(LEVEL_NAMES.APARTMENT);
  });
});
