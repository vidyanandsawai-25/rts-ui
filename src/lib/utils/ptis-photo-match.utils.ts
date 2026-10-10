import { getViewDocumentUrl } from './document-utils';

export interface PhotoItemLike {
  photoTypeCode?: string | null;
  photoTypeName?: string | null;
  photoTypeId?: number | null;
  documentGuid?: string | number | null;
  viewUrl?: string | null;
  src?: string | null;
  fullSrc?: string | null;
  hasPhoto?: boolean | null;
  photoScope?: string | null;
}

/**
 * Checks whether a given photo type code and name represent a Property Front Photo.
 * Strictly excludes other property-scope media such as Photo Plans, Side Photos,
 * Inside Photos, Signboards, Amenities, GIS/Satellite, Signatures, Society & Wing photos.
 */
export function isPropertyFrontPhoto(
  itemOrCode?: PhotoItemLike | string | null,
  nameOrNull?: string | null
): boolean {
  if (!itemOrCode && !nameOrNull) return false;

  let code = '';
  let name = '';
  let scope = '';

  if (typeof itemOrCode === 'object' && itemOrCode !== null) {
    code = (itemOrCode.photoTypeCode || '').toUpperCase().trim();
    name = (itemOrCode.photoTypeName || '').toUpperCase().trim();
    scope = (itemOrCode.photoScope || '').toUpperCase().trim();
  } else {
    code = String(itemOrCode || '').toUpperCase().trim();
    name = String(nameOrNull || '').toUpperCase().trim();
  }

  // If explicitly society or wing scoped, it is not an individual property front photo
  if (scope === 'SOCIETY' || scope === 'WING') {
    return false;
  }

  // Explicit exclusions for non-front property media categories
  const excludedKeywords = [
    'PLAN',
    'SIDE',
    'INSIDE',
    'BOARD',
    'SIGN',
    'SIGNATURE',
    'AMENITY',
    'GIS',
    'SATELLITE',
    'FLOOR',
    'CHANGE_DETECTION',
    'SOCIETY',
    'WING',
    'OTHER',
    'TAX',
  ];

  for (const keyword of excludedKeywords) {
    if (code.includes(keyword) || name.includes(keyword)) {
      return false;
    }
  }

  // Positive match: Front photo type codes or names
  const isFrontCode =
    code === 'PROPERTY_FRONT' ||
    code === 'PROPERTY_FRONT_PHOTO' ||
    code === 'FRONT_PHOTO' ||
    code === 'PROPERTY_PHOTO' ||
    code === 'PROPERTY' ||
    code === 'FRONT' ||
    code.includes('FRONT');

  const isFrontName =
    name.includes('FRONT') ||
    name === 'PROPERTY PHOTO' ||
    name === 'PROPERTY FRONT PHOTO' ||
    name === 'FRONT PHOTO' ||
    name === 'PROPERTY FRONT';

  return isFrontCode || isFrontName;
}

/**
 * Checks whether a given photo type code and name represent a Society Photo.
 * Matches Society Place, Society Building, Society Photo, Society Board, etc.
 */
export function isSocietyPhoto(
  itemOrCode?: PhotoItemLike | string | null,
  nameOrNull?: string | null
): boolean {
  if (!itemOrCode && !nameOrNull) return false;

  let code = '';
  let name = '';
  let scope = '';

  if (typeof itemOrCode === 'object' && itemOrCode !== null) {
    code = (itemOrCode.photoTypeCode || '').toUpperCase().trim();
    name = (itemOrCode.photoTypeName || '').toUpperCase().trim();
    scope = (itemOrCode.photoScope || '').toUpperCase().trim();
  } else {
    code = String(itemOrCode || '').toUpperCase().trim();
    name = String(nameOrNull || '').toUpperCase().trim();
  }

  if (scope === 'SOCIETY') {
    return true;
  }

  // Exclude individual unit photos or property plans
  if (
    code.startsWith('PROPERTY_') &&
    !code.includes('SOCIETY') &&
    (code.includes('FRONT') || code.includes('PLAN') || code.includes('SIDE') || code.includes('INSIDE'))
  ) {
    return false;
  }

  if (code.startsWith('WING_') || name.startsWith('WING')) {
    return false;
  }

  return (
    code.startsWith('SOCIETY_') ||
    code === 'SOCIETY' ||
    code.includes('SOCIETY') ||
    name.includes('SOCIETY')
  );
}

/**
 * Assigns priority ranking to society photo types:
 * 1. Society Place Photo
 * 2. Society Photo / Building
 * 3. Society Board / Signboard
 * 4. Other society photos
 */
export function getSocietyPhotoPriority(item: PhotoItemLike): number {
  const code = (item.photoTypeCode || '').toUpperCase().trim();
  const name = (item.photoTypeName || '').toUpperCase().trim();

  if (code === 'SOCIETY_PLACE' || code === 'SOCIETY_PLACE_PHOTO' || name.includes('PLACE')) {
    return 1;
  }
  if (
    code === 'SOCIETY_PHOTO' ||
    code === 'SOCIETY_BUILDING' ||
    code === 'SOCIETY' ||
    name.includes('PHOTO') ||
    name.includes('BUILDING')
  ) {
    return 2;
  }
  if (
    code === 'SOCIETY_BOARD' ||
    code === 'SOCIETY_BOARD_PHOTO' ||
    code === 'SOCIETY_SIGN_BOARD' ||
    code === 'SOCIETY_SIGNBOARD' ||
    name.includes('BOARD') ||
    name.includes('SIGN')
  ) {
    return 3;
  }
  if (isSocietyPhoto(item)) {
    return 4;
  }
  return 999;
}

/**
 * Resolves the primary Property Front Photo document GUID and URL dynamically.
 * Returns undefined if no Front Photo exists (strictly never falls back to Plan, Signature, etc.).
 */
export function resolvePropertyFrontPhoto(
  initialPhotos?: unknown,
  initialPhotoSlots?: unknown
): { guid?: string; url?: string } {
  const photoList = (Array.isArray(initialPhotos) ? initialPhotos : []) as PhotoItemLike[];
  const slotList = (Array.isArray(initialPhotoSlots) ? initialPhotoSlots : []) as PhotoItemLike[];

  // 1. Check actual photos first for Property Front Photo
  const matchingPhoto = photoList.find((p) => isPropertyFrontPhoto(p) && (p.documentGuid || p.viewUrl || p.src));
  if (matchingPhoto) {
    const guid = matchingPhoto.documentGuid ? String(matchingPhoto.documentGuid) : undefined;
    const url = matchingPhoto.viewUrl || matchingPhoto.src || matchingPhoto.fullSrc || (guid ? getViewDocumentUrl(guid) : undefined);
    return { guid, url };
  }

  // 2. Check slots with uploaded photo for Property Front Photo
  const matchingSlot = slotList.find(
    (s) => Boolean(s.hasPhoto) && isPropertyFrontPhoto(s) && (s.documentGuid || s.viewUrl || s.src)
  );
  if (matchingSlot) {
    const guid = matchingSlot.documentGuid ? String(matchingSlot.documentGuid) : undefined;
    const url = matchingSlot.viewUrl || matchingSlot.src || matchingSlot.fullSrc || (guid ? getViewDocumentUrl(guid) : undefined);
    return { guid, url };
  }

  // Return undefined — no fallback to other property photo categories
  return { guid: undefined, url: undefined };
}

/**
 * Resolves the Society Photo document GUID and URL dynamically.
 * Prioritizes Society Place Photo > Society Photo > Society Board Photo.
 * Returns undefined if no Society Photo exists.
 */
export function resolveSocietyPhoto(
  initialPhotos?: unknown,
  initialPhotoSlots?: unknown
): { guid?: string; url?: string } {
  const photoList = (Array.isArray(initialPhotos) ? initialPhotos : []) as PhotoItemLike[];
  const slotList = (Array.isArray(initialPhotoSlots) ? initialPhotoSlots : []) as PhotoItemLike[];

  const validPhotos = photoList.filter((p) => isSocietyPhoto(p) && (p.documentGuid || p.viewUrl || p.src));
  const validSlots = slotList.filter(
    (s) => Boolean(s.hasPhoto) && isSocietyPhoto(s) && (s.documentGuid || s.viewUrl || s.src)
  );

  const allSocietyCandidates = [...validPhotos, ...validSlots].sort(
    (a, b) => getSocietyPhotoPriority(a) - getSocietyPhotoPriority(b)
  );

  const bestMatch = allSocietyCandidates[0];
  if (bestMatch) {
    const guid = bestMatch.documentGuid ? String(bestMatch.documentGuid) : undefined;
    const url = bestMatch.viewUrl || bestMatch.src || bestMatch.fullSrc || (guid ? getViewDocumentUrl(guid) : undefined);
    return { guid, url };
  }

  return { guid: undefined, url: undefined };
}
