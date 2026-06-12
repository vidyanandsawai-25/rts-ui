import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';

/**
 * Maps system photo type codes to localized translation keys in ptis.json (media.*).
 * Uses the next-intl translation function 't'.
 */
export function getLocalizedCategoryName(code: string, fallbackName: string, t: (key: string) => string): string {
  if (!code) return fallbackName;
  const codeUpper = code.toUpperCase();
  const mapping: Record<string, string> = {
    'PROPERTY_PHOTO': 'media.propertyPhoto',
    'PROPERTY': 'media.propertyPhoto',
    'PHOTO_PLAN': 'media.photoPlan',
    'PHOTO PLAN': 'media.photoPlan',
    'PHOTOPLAN': 'media.photoPlan',
    'BUILDING': 'media.buildingPhoto',
    'BUILDING_PHOTO': 'media.buildingPhoto',
    'FRONT': 'media.buildingPhoto',
    'FLOOR': 'media.floorPlan',
    'GIS': 'media.satelliteView',
    'BACK': 'media.rearElevation',
    'LIVING': 'media.livingRoom',
    'KITCHEN': 'media.kitchen',
    'BEDROOM': 'media.bedroom',
    'BATHROOM': 'media.bathroom',
    'BALCONY': 'media.balcony',
    'TERRACE': 'media.terraceView',
    'PARKING': 'media.parkingView',
    'SIGN_BOARD': 'media.signBoardPhoto',
    'SIGN_BOARD_PHOTO': 'media.signBoardPhoto',
    'SIGNBOARD': 'media.signBoardPhoto',
    'ADVERTISEMENT': 'media.advertisementBoardPhoto',
    'ADVERTISEMENT_BOARD': 'media.advertisementBoardPhoto',
    'ADVERTISEMENT_BOARD_PHOTO': 'media.advertisementBoardPhoto',
    'OWNER_SIGNATURE': 'media.ownerSignaturePhoto',
    'OWNER_SIGNATURE_PHOTO': 'media.ownerSignaturePhoto',
    'SIGNATURE': 'media.ownerSignaturePhoto',
    'OTHER': 'media.otherPhoto',
    'OTHER_PHOTO': 'media.otherPhoto',
  };

  const key = mapping[codeUpper];
  // Safe translation retrieval: next-intl translation function check
  if (key) {
    try {
      const hasKey = typeof (t as unknown as { has?: (k: string) => boolean }).has === 'function'
        ? !!(t as unknown as { has: (k: string) => boolean }).has(key)
        : true;
      if (hasKey) {
        const val = t(key);
        if (val && val !== key) {
          return val;
        }
      }
    } catch {
      // Fallback if key is missing in translation file
    }
  }
  return fallbackName;
}

/**
 * Returns the standard English category/slot name for a given photoTypeCode.
 * If the code is not standard, it defaults to the fallbackName.
 */
export function getEnglishCategoryName(code: string, fallbackName: string): string {
  if (!code) return fallbackName;
  const codeUpper = code.toUpperCase();
  const mapping: Record<string, string> = {
    'PROPERTY_PHOTO': 'Property Photo',
    'PROPERTY': 'Property Photo',
    'PHOTO_PLAN': 'Photo Plan',
    'PHOTO PLAN': 'Photo Plan',
    'PHOTOPLAN': 'Photo Plan',
    'BUILDING': 'Building Photo',
    'BUILDING_PHOTO': 'Building Photo',
    'FRONT': 'Building Photo',
    'FLOOR': 'Floor Plan',
    'GIS': 'GIS / Satellite View',
    'BACK': 'Rear Elevation',
    'LIVING': 'Living Room',
    'KITCHEN': 'Kitchen',
    'BEDROOM': 'Bedroom',
    'BATHROOM': 'Bathroom',
    'BALCONY': 'Balcony',
    'TERRACE': 'Terrace View',
    'PARKING': 'Parking View',
    'SIGN_BOARD': 'Sign Board Photo',
    'SIGN_BOARD_PHOTO': 'Sign Board Photo',
    'SIGNBOARD': 'Sign Board Photo',
    'ADVERTISEMENT': 'Advertisement Board Photo',
    'ADVERTISEMENT_BOARD': 'Advertisement Board Photo',
    'ADVERTISEMENT_BOARD_PHOTO': 'Advertisement Board Photo',
    'OWNER_SIGNATURE': 'Owner Signature Photo',
    'OWNER_SIGNATURE_PHOTO': 'Owner Signature Photo',
    'SIGNATURE': 'Owner Signature Photo',
    'OTHER': 'Other Photo',
    'OTHER_PHOTO': 'Other Photo',
  };
  return mapping[codeUpper] || fallbackName;
}

export function patchCategory(cats: PhotoCategory[], idx: number, images: AdditionalImage[]): PhotoCategory[] {
  return cats.map((c, i) => (i === idx ? { ...c, images, photoCount: images.length } : c));
}

export function sortByOrder(imgs: AdditionalImage[]): AdditionalImage[] {
  return [...imgs].sort((a, b) => {
    const diff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
    if (diff !== 0) return diff;
    return (a.propertyPhotoId ?? 0) - (b.propertyPhotoId ?? 0);
  });
}

export function hasCategoryChanged(cached: PhotoCategory, incoming: PhotoCategory): boolean {
  if (cached.images.length !== incoming.images.length) return true;
  return cached.images.some((img, i) => {
    const next = incoming.images[i];
    return !next || img.propertyPhotoId !== next.propertyPhotoId || img.src !== next.src;
  });
}

export function mergeCategories(prev: PhotoCategory[], incoming: PhotoCategory[]): PhotoCategory[] {
  return incoming.map((inc) => {
    const existing = prev.find((p) => p.photoTypeId === inc.photoTypeId);
    if (!existing || hasCategoryChanged(existing, inc)) return { ...inc, images: inc.images || [] };
    return existing;
  });
}


