import type { AdditionalImage } from './MediaImageCards';
import type { PropertyPhotoDto, PropertyPhotoTypeWithStatusDto, PropertyPhotoGalleryDto } from '@/types/photoplan.types';
import type { PhotoCategory } from './PhotoPlanSidebar';
import { getViewDocumentUrl, getDownloadDocumentUrl } from '@/lib/utils/document-utils';

import { getLocalizedCategoryName } from '@/lib/utils/ptis-photo-plan-localization';

export interface PhotoCategoryPayloadInput {
  photoTypeCode: string;
  images: {
    file?: File;
    displayOrder?: number;
    remarks?: string;
    title?: string;
  }[];
}

/**
 * Utility to format nested 1:N folder state into FormData suitable for server API payload.
 */
export function formatPhotoPlanPayload(categories: PhotoCategoryPayloadInput[]): FormData {
  const formData = new FormData();
  categories.forEach(c => c.images.forEach((img, idx) => {
    if (img.file) formData.append(`files[${c.photoTypeCode}]`, img.file);
    formData.append(`metadata[${c.photoTypeCode}][${idx}][displayOrder]`, (img.displayOrder || idx + 1).toString());
    formData.append(`metadata[${c.photoTypeCode}][${idx}][remarks]`, img.remarks || '');
    formData.append(`metadata[${c.photoTypeCode}][${idx}][title]`, img.title || '');
  }));
  return formData;
}

export function mapPropertyPhotoToAdditionalImage(p: PropertyPhotoDto, categoryName: string): AdditionalImage {
  const remarksStr = p.remarks || '';
  let parsedTitle = categoryName, parsedRemarks = '';
  const defaultEnglishNames = [
    'property photo', 'property', 'photo plan', 'building photo', 'building', 'front', 'front view', 'front elevation',
    'sign board photo', 'sign board', 'signboard', 'advertisement board photo', 'advertisement board', 'advertisement',
    'owner signature photo', 'owner signature', 'signature', 'other photo', 'other', 'floor plan', 'floor',
    'gis / satellite view', 'gis', 'satellite view', 'gis / satellite', 'rear elevation', 'back', 'living room', 'living',
    'kitchen', 'bedroom', 'bathroom', 'balcony', 'terrace view', 'terrace', 'parking view', 'parking'
  ];

  if (remarksStr.includes(' | ')) {
    const [namePart, ...remarkParts] = remarksStr.split(' | ');
    const trimmedName = namePart?.trim() || '';
    const isDefault = !trimmedName || defaultEnglishNames.includes(trimmedName.toLowerCase()) || trimmedName.toLowerCase() === p.photoTypeCode?.toLowerCase() || trimmedName.toLowerCase().startsWith('wing building photo');
    parsedTitle = isDefault ? categoryName : trimmedName;
    parsedRemarks = remarkParts.join(' | ');
  } else if (remarksStr) {
    const trimmedRemarks = remarksStr.trim();
    const isDefault = defaultEnglishNames.includes(trimmedRemarks.toLowerCase()) || trimmedRemarks.toLowerCase() === p.photoTypeCode?.toLowerCase() || trimmedRemarks.toLowerCase().startsWith('wing building photo');
    parsedTitle = isDefault ? categoryName : trimmedRemarks;
  }

  parsedTitle = parsedTitle.replace(/(\([^)]+\))\s*\1+/g, '$1');

  const resolvedUrl = p.documentGuid ? getViewDocumentUrl(p.documentGuid) : p.viewUrl;
  return {
    src: resolvedUrl || '', fullSrc: resolvedUrl || '', alt: parsedTitle, title: parsedTitle,
    photoTypeId: p.photoTypeId, photoTypeCode: p.photoTypeCode, propertyPhotoId: p.propertyPhotoId,
    hasPhoto: true, remarks: parsedRemarks, displayOrder: p.displayOrder, documentGuid: p.documentGuid?.toString(),
    downloadUrl: p.downloadUrl || (p.documentGuid ? getDownloadDocumentUrl(p.documentGuid.toString()) : undefined),
    wingDetailId: p.wingDetailId,
    wingName: p.wingName,
  };
}

export function findCategory(categories: PhotoCategory[], codeKeywords: string[], nameKeywords: string[]) {
  return categories.find(c => {
    const code = c.photoTypeCode?.toUpperCase() || '', name = c.photoTypeName?.toLowerCase() || '';
    return codeKeywords.some(kw => code.includes(kw)) || nameKeywords.some(kw => name.includes(kw));
  });
}

export function mapSlotsToCategories(
  slots: PropertyPhotoTypeWithStatusDto[],
  uploadedPhotos: PropertyPhotoDto[] = [],
  fullyLoadedIds?: Set<number>,
  t?: ((key: string) => string) & { has?: (key: string) => boolean },
  wingName?: string,
  selectedWingDetailId?: number | null,
  isMainProperty: boolean = false,
  categoryId: number | null = null,
  _propertyTypeId: number | null = null,
  entityType?: string
): PhotoCategory[] {
  const systemCodes = [
    'FRONT', 'FLOOR', 'GIS', 'BACK', 'LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'BALCONY', 'TERRACE', 'PARKING', 'CHANGE_DETECTION',
    'WING_BUILDING', 'WING_PLACE', 'WING_BOARD', 'WING_SIGN_BOARD',
    'SOCIETY_PLACE', 'SOCIETY_BOARD', 'SOCIETY_SIGN_BOARD',
    'PROPERTY_FRONT', 'PROPERTY_SIDE', 'PROPERTY_INSIDE', 'PROPERTY_BOARD', 'PROPERTY_PLAN', 'PHOTO_PLAN'
  ];
  const isPhotoPlanCat = (c: { photoTypeCode?: string; photoTypeName?: string }) => {
    const code = c.photoTypeCode?.toUpperCase() || '';
    const name = c.photoTypeName?.toLowerCase() || '';
    return (
      code === 'PHOTO_PLAN' ||
      code === 'PROPERTY_PLAN' ||
      code === 'PLAN' ||
      code === 'DRAW_PLAN' ||
      name.includes('photo plan') ||
      name.includes('property plan') ||
      name.includes('photo_plan') ||
      name.includes('property_plan')
    );
  };
  const isPhotoMatch = (targetCode?: string, targetTypeId?: number, photoCode?: string, photoTypeId?: number) => {
    if (targetCode && photoCode && targetCode.toUpperCase() === photoCode.toUpperCase()) {
      return true;
    }
    if (targetTypeId && photoTypeId && Number(targetTypeId) === Number(photoTypeId)) {
      return true;
    }
    return false;
  };

  const baseCats = slots.map(s => {
    const nameFallback = s.photoTypeName || '';
    let nameVal = t ? getLocalizedCategoryName(s.photoTypeCode, nameFallback, t) : nameFallback;
    if (wingName && s.photoTypeCode?.toUpperCase().startsWith('WING_') && !nameVal.includes(`(${wingName})`)) {
      nameVal = `${nameVal} (${wingName})`;
    }
    nameVal = nameVal.replace(/(\([^)]+\))\s*\1+/g, '$1');

    let hasPhoto = s.hasPhoto;
    let documentGuid = s.documentGuid;
    let viewUrl = s.viewUrl;
    let propertyPhotoId = s.propertyPhotoId;

    const isWingCat = Boolean(
      s.photoTypeCode?.toUpperCase().includes('WING') ||
      s.photoTypeName?.toLowerCase().includes('wing')
    );
    const isSocietyCat = Boolean(
      s.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
      s.photoTypeCode?.toUpperCase().includes('AMENITY') ||
      s.photoTypeName?.toLowerCase().includes('society') ||
      s.photoTypeName?.toLowerCase().includes('amenity')
    );

    const checkIsWingPhoto = (p: PropertyPhotoDto) => Boolean(
      p.photoTypeCode?.toUpperCase().includes('WING') ||
      p.photoTypeName?.toLowerCase().includes('wing')
    );

    const checkIsSocietyPhoto = (p: PropertyPhotoDto) => Boolean(
      p.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
      p.photoTypeCode?.toUpperCase().includes('AMENITY') ||
      p.photoTypeName?.toLowerCase().includes('society') ||
      p.photoTypeName?.toLowerCase().includes('amenity')
    );

    let matchingPhoto: PropertyPhotoDto | undefined;
    if (isWingCat) {
      matchingPhoto = uploadedPhotos.find(p => {
        if (!checkIsWingPhoto(p)) return false;
        if (selectedWingDetailId && p.wingDetailId && p.wingDetailId !== selectedWingDetailId) return false;
        return isPhotoMatch(s.photoTypeCode, s.photoTypeId, p.photoTypeCode, p.photoTypeId);
      });
    } else if (isSocietyCat) {
      matchingPhoto = uploadedPhotos.find(p => {
        if (!checkIsSocietyPhoto(p)) return false;
        return isPhotoMatch(s.photoTypeCode, s.photoTypeId, p.photoTypeCode, p.photoTypeId);
      });
    } else {
      matchingPhoto = uploadedPhotos.find(p => {
        if (checkIsWingPhoto(p) || checkIsSocietyPhoto(p)) return false;
        const isPlanPhoto = isPhotoPlanCat(p) || p.remarks?.toLowerCase().includes('property plan') || p.remarks?.toLowerCase().includes('photo plan') || p.photoTypeCode?.toUpperCase().includes('PLAN');
        if (!isPhotoPlanCat(s) && isPlanPhoto) return false;
        if (isPhotoPlanCat(s) && isPlanPhoto) return true;
        return isPhotoMatch(s.photoTypeCode, s.photoTypeId, p.photoTypeCode, p.photoTypeId);
      });
    }

    const isPlanCat = isPhotoPlanCat(s) || s.photoTypeCode?.toUpperCase().includes('PLAN');
    if (matchingPhoto) {
      hasPhoto = true;
      documentGuid = matchingPhoto.documentGuid || documentGuid;
      viewUrl = matchingPhoto.documentGuid ? getViewDocumentUrl(matchingPhoto.documentGuid) : (matchingPhoto.viewUrl || viewUrl);
      propertyPhotoId = matchingPhoto.propertyPhotoId || propertyPhotoId;
    } else if (!isPlanCat) {
      // For non-plan slots, keep slot's initial values
    } else {
      // For plan slots without a matching uploaded plan, clear default fallback photo values to avoid fallback bleeding
      hasPhoto = false;
      documentGuid = undefined;
      viewUrl = undefined;
      propertyPhotoId = undefined;
    }

    return {
      photoTypeId: s.photoTypeId,
      photoTypeCode: s.photoTypeCode,
      photoTypeName: nameVal,
      isCustom: !systemCodes.includes(s.photoTypeCode.toUpperCase()),
      hasPhoto,
      photoCount: s.photoCount,
      propertyPhotoId,
      documentGuid,
      viewUrl,
    };
  });

  const hasCD = baseCats.some(c => c.photoTypeCode === 'CHANGE_DETECTION');
  if (!hasCD) {
    const cdName = t ? (t.has?.('media.changeDetection') ? t('media.changeDetection') : 'Change Detection') : 'Change Detection';
    baseCats.push({ photoTypeId: 9999, photoTypeCode: 'CHANGE_DETECTION', photoTypeName: cdName, isCustom: false, hasPhoto: true, photoCount: 2, propertyPhotoId: undefined, documentGuid: undefined, viewUrl: undefined });
  }

  const isWingMaster = (categoryId === 4 && isMainProperty) || (isMainProperty && Boolean(selectedWingDetailId)) || entityType === 'W';
  const isSocietyMaster = (categoryId === 3 && isMainProperty) || (isMainProperty && !selectedWingDetailId) || entityType === 'S';

  const filteredCats = baseCats.filter(c => {
    const code = c.photoTypeCode?.toUpperCase() || '';
    const isPlan = isPhotoPlanCat(c);
    const isPropScope = !c.isCustom && (code.startsWith('PROPERTY_') || isPlan);

    if (isWingMaster || isSocietyMaster) {
      if (isPropScope) return false;
      return true;
    }

    if (isMainProperty) {
      if (isPlan) return false;
      return true;
    }

    return true;
  });

  return filteredCats.map(cat => {
    const isWingCat = Boolean(
      cat.photoTypeCode?.toUpperCase().includes('WING') ||
      cat.photoTypeName?.toLowerCase().includes('wing')
    );
    const isSocietyCat = Boolean(
      cat.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
      cat.photoTypeCode?.toUpperCase().includes('AMENITY') ||
      cat.photoTypeName?.toLowerCase().includes('society') ||
      cat.photoTypeName?.toLowerCase().includes('amenity')
    );

    const checkIsWingPhoto = (p: PropertyPhotoDto) => Boolean(
      p.photoTypeCode?.toUpperCase().includes('WING') ||
      p.photoTypeName?.toLowerCase().includes('wing')
    );

    const checkIsSocietyPhoto = (p: PropertyPhotoDto) => Boolean(
      p.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
      p.photoTypeCode?.toUpperCase().includes('AMENITY') ||
      p.photoTypeName?.toLowerCase().includes('society') ||
      p.photoTypeName?.toLowerCase().includes('amenity')
    );

    let catPhotos = uploadedPhotos
      .filter(p => {
        const pIsWing = checkIsWingPhoto(p);
        const pIsSociety = checkIsSocietyPhoto(p);

        if (isWingCat) {
          if (!pIsWing) return false;
          if (selectedWingDetailId && p.wingDetailId && p.wingDetailId !== selectedWingDetailId) return false;
        } else if (isSocietyCat) {
          if (!pIsSociety) return false;
        } else {
          if (pIsWing || pIsSociety) return false;
          const isPlanPhoto = isPhotoPlanCat(p) || p.remarks?.toLowerCase().includes('property plan') || p.remarks?.toLowerCase().includes('photo plan') || p.photoTypeCode?.toUpperCase().includes('PLAN');
          if (isPhotoPlanCat(cat) && isPlanPhoto) return true;
          if (!isPhotoPlanCat(cat) && isPlanPhoto) return false;
        }

        return isPhotoMatch(cat.photoTypeCode, cat.photoTypeId, p.photoTypeCode, p.photoTypeId);
      })
      .sort((a, b) => {
        const diff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
        if (diff !== 0) return diff;
        return (a.propertyPhotoId ?? 0) - (b.propertyPhotoId ?? 0);
      })
      .map(p => mapPropertyPhotoToAdditionalImage(p, cat.photoTypeName));

    const isFullyLoaded = fullyLoadedIds?.has(cat.photoTypeId);

    if (catPhotos.length === 0 && !isFullyLoaded && cat.hasPhoto && (cat.viewUrl || cat.documentGuid)) {
      const isPlanCat = isPhotoPlanCat(cat);
      const isPlanSlot = isPlanCat || cat.photoTypeCode?.toUpperCase().includes('PLAN');
      if (!isPlanSlot) {
        const resolvedUrl = cat.documentGuid ? getViewDocumentUrl(cat.documentGuid) : cat.viewUrl;
        catPhotos = [{
          src: resolvedUrl || '',
          fullSrc: resolvedUrl || '',
          alt: cat.photoTypeName,
          title: cat.photoTypeName,
          photoTypeId: cat.photoTypeId,
          photoTypeCode: cat.photoTypeCode,
          propertyPhotoId: cat.propertyPhotoId,
          hasPhoto: true,
          documentGuid: cat.documentGuid?.toString(),
          downloadUrl: cat.documentGuid ? getDownloadDocumentUrl(cat.documentGuid.toString()) : (cat.viewUrl ? cat.viewUrl.replace('/view', '/download') : undefined),
        }];
      }
    }

    let uploadedCDCount: number | undefined;

    if (cat.photoTypeCode === 'CHANGE_DETECTION') {
      const uploadedCDPhotos = uploadedPhotos
        .filter(p => p.photoTypeId === cat.photoTypeId || p.photoTypeCode === 'CHANGE_DETECTION')
        .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
        .map(p => mapPropertyPhotoToAdditionalImage(p, cat.photoTypeName));

      uploadedCDCount = uploadedCDPhotos.length;

      const beforePhoto = uploadedCDPhotos.find(p => p.displayOrder === 1);
      const afterPhoto = uploadedCDPhotos.find(p => p.displayOrder === 2);

      catPhotos = [
        beforePhoto || { src: '', fullSrc: '', alt: 'Before (Old)', title: 'Before (Old)', photoTypeId: cat.photoTypeId, photoTypeCode: 'CHANGE_DETECTION', propertyPhotoId: 9998, hasPhoto: false, displayOrder: 1 },
        afterPhoto || { src: '', fullSrc: '', alt: 'After (New)', title: 'After (New)', photoTypeId: cat.photoTypeId, photoTypeCode: 'CHANGE_DETECTION', propertyPhotoId: 9999, hasPhoto: false, displayOrder: 2 }
      ];
    }

    const count = catPhotos.length > 0 ? catPhotos.length : (cat.hasPhoto ? 1 : 0);

    return {
      ...cat,
      photoCount: count,
      images: catPhotos,
      ...(uploadedCDCount !== undefined ? { photoCount: uploadedCDCount } : {}),
    };
  });
}

export function mapGroupedResponseToCategories(
  groupedData: PropertyPhotoGalleryDto,
  t?: (key: string) => string
): PhotoCategory[] {
  const systemCodes = ['FRONT', 'FLOOR', 'GIS', 'BACK', 'LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'BALCONY', 'TERRACE', 'PARKING', 'CHANGE_DETECTION', 'PHOTO_PLAN'];
  
  return (groupedData.photoTypes || []).map(group => {
    const nameFallback = group.photoTypeName || '';
    const nameVal = t ? getLocalizedCategoryName(group.photoTypeCode, nameFallback, t) : nameFallback;
    const mappedImages = (group.photos || [])
      .sort((a, b) => {
        const diff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
        if (diff !== 0) return diff;
        return (a.propertyPhotoId ?? 0) - (b.propertyPhotoId ?? 0);
      })
      .map(p => mapPropertyPhotoToAdditionalImage(p, nameVal));

    return {
      photoTypeId: group.photoTypeId,
      photoTypeCode: group.photoTypeCode,
      photoTypeName: nameVal,
      isCustom: !systemCodes.includes(group.photoTypeCode.toUpperCase()),
      images: mappedImages,
    };
  });
}
