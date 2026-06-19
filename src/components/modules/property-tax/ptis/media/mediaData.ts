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
  categories.forEach((category) => {
    category.images.forEach((img, idx) => {
      if (img.file) {
        formData.append(`files[${category.photoTypeCode}]`, img.file);
      }
      formData.append(`metadata[${category.photoTypeCode}][${idx}][displayOrder]`, (img.displayOrder || idx + 1).toString());
      formData.append(`metadata[${category.photoTypeCode}][${idx}][remarks]`, img.remarks || '');
      formData.append(`metadata[${category.photoTypeCode}][${idx}][title]`, img.title || '');
    });
  });
  return formData;
}

export function mapPropertyPhotoToAdditionalImage(p: PropertyPhotoDto, categoryName: string): AdditionalImage {
  const remarksStr = p.remarks || '';
  let parsedTitle = categoryName;
  let parsedRemarks = '';

  const defaultEnglishNames = [
    'property photo', 'property',
    'photo plan',
    'building photo', 'building', 'front', 'front view', 'front elevation',
    'sign board photo', 'sign board', 'signboard',
    'advertisement board photo', 'advertisement board', 'advertisement',
    'owner signature photo', 'owner signature', 'signature',
    'other photo', 'other',
    'floor plan', 'floor',
    'gis / satellite view', 'gis', 'satellite view', 'gis / satellite',
    'rear elevation', 'back',
    'living room', 'living',
    'kitchen',
    'bedroom',
    'bathroom',
    'balcony',
    'terrace view', 'terrace',
    'parking view', 'parking'
  ];

  if (remarksStr.includes(' | ')) {
    const [namePart, ...remarkParts] = remarksStr.split(' | ');
    const trimmedName = namePart?.trim() || '';
    const isDefault = !trimmedName || defaultEnglishNames.includes(trimmedName.toLowerCase()) || trimmedName.toLowerCase() === p.photoTypeCode?.toLowerCase();
    
    parsedTitle = isDefault ? categoryName : trimmedName;
    parsedRemarks = remarkParts.join(' | ');
  } else if (remarksStr) {
    const trimmedRemarks = remarksStr.trim();
    const isDefault = defaultEnglishNames.includes(trimmedRemarks.toLowerCase()) || trimmedRemarks.toLowerCase() === p.photoTypeCode?.toLowerCase();
    
    parsedTitle = isDefault ? categoryName : trimmedRemarks;
    parsedRemarks = '';
  }

  return {
    src: p.viewUrl || (p.documentGuid ? getViewDocumentUrl(p.documentGuid) : ''),
    fullSrc: p.viewUrl || (p.documentGuid ? getViewDocumentUrl(p.documentGuid) : ''),
    alt: parsedTitle,
    title: parsedTitle,
    photoTypeId: p.photoTypeId,
    photoTypeCode: p.photoTypeCode,
    propertyPhotoId: p.propertyPhotoId,
    hasPhoto: true,
    remarks: parsedRemarks,
    displayOrder: p.displayOrder,
    documentGuid: p.documentGuid?.toString(),
    downloadUrl: p.downloadUrl || (p.documentGuid ? getDownloadDocumentUrl(p.documentGuid.toString()) : undefined),
  };
}

export function findCategory(categories: PhotoCategory[], codeKeywords: string[], nameKeywords: string[]) {
  return categories.find((c) => {
    const code = c.photoTypeCode?.toUpperCase() || '';
    const name = c.photoTypeName?.toLowerCase() || '';
    return (
      codeKeywords.some((kw) => code.includes(kw)) || nameKeywords.some((kw) => name.includes(kw))
    );
  });
}

export function mapSlotsToCategories(
  slots: PropertyPhotoTypeWithStatusDto[],
  uploadedPhotos: PropertyPhotoDto[] = [],
  fullyLoadedIds?: Set<number>,
  t?: ((key: string) => string) & { has?: (key: string) => boolean }
): PhotoCategory[] {
  const systemCodes = ['FRONT', 'FLOOR', 'GIS', 'BACK', 'LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'BALCONY', 'TERRACE', 'PARKING'];
  const baseCats = slots.map(s => {
    const nameFallback = s.photoTypeName || '';
    const nameVal = t ? getLocalizedCategoryName(s.photoTypeCode, nameFallback, t) : nameFallback;
    return {
      photoTypeId: s.photoTypeId,
      photoTypeCode: s.photoTypeCode,
      photoTypeName: nameVal,
      isCustom: !systemCodes.includes(s.photoTypeCode.toUpperCase()),
      hasPhoto: s.hasPhoto,
      photoCount: s.photoCount,
      propertyPhotoId: s.propertyPhotoId,
      documentGuid: s.documentGuid,
      viewUrl: s.viewUrl,
    };
  });

  // Append virtual Change Detection category
  const hasChangeDetection = baseCats.some(c => c.photoTypeCode === 'CHANGE_DETECTION');
  if (!hasChangeDetection) {
    const cdName = t ? (t.has?.('media.changeDetection') ? t('media.changeDetection') : 'Change Detection') : 'Change Detection';
    baseCats.push({
      photoTypeId: 9999,
      photoTypeCode: 'CHANGE_DETECTION',
      photoTypeName: cdName,
      isCustom: false,
      hasPhoto: true,
      photoCount: 2,
      propertyPhotoId: undefined,
      documentGuid: undefined,
      viewUrl: undefined,
    });
  }

  return baseCats.map(cat => {
    let catPhotos = uploadedPhotos
      .filter(p => p.photoTypeId === cat.photoTypeId)
      .sort((a, b) => {
        const diff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
        if (diff !== 0) return diff;
        return (a.propertyPhotoId ?? 0) - (b.propertyPhotoId ?? 0);
      })
      .map(p => mapPropertyPhotoToAdditionalImage(p, cat.photoTypeName));

    const isFullyLoaded = fullyLoadedIds?.has(cat.photoTypeId);

    if (catPhotos.length === 0 && !isFullyLoaded && cat.hasPhoto && (cat.viewUrl || cat.documentGuid)) {
      catPhotos = [{
        src: cat.viewUrl || (cat.documentGuid ? getViewDocumentUrl(cat.documentGuid) : ''),
        fullSrc: cat.viewUrl || (cat.documentGuid ? getViewDocumentUrl(cat.documentGuid) : ''),
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

    if (cat.photoTypeCode === 'CHANGE_DETECTION') {
      const uploadedCDPhotos = uploadedPhotos
        .filter(p => p.photoTypeId === cat.photoTypeId || p.photoTypeCode === 'CHANGE_DETECTION')
        .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
        .map(p => mapPropertyPhotoToAdditionalImage(p, cat.photoTypeName));

      const beforePhoto = uploadedCDPhotos.find(p => p.displayOrder === 1);
      const afterPhoto = uploadedCDPhotos.find(p => p.displayOrder === 2);

      catPhotos = [
        beforePhoto || {
          src: '/images/thane-earth-2018.jpg',
          fullSrc: '/images/thane-earth-2018.jpg',
          alt: '2018 Satellite View',
          title: '2018 Satellite View',
          photoTypeId: cat.photoTypeId,
          photoTypeCode: 'CHANGE_DETECTION',
          propertyPhotoId: 9998,
          hasPhoto: true,
          displayOrder: 1,
        },
        afterPhoto || {
          src: '/images/thane-earth-2026.jpg',
          fullSrc: '/images/thane-earth-2026.jpg',
          alt: '2026 Satellite View',
          title: '2026 Satellite View',
          photoTypeId: cat.photoTypeId,
          photoTypeCode: 'CHANGE_DETECTION',
          propertyPhotoId: 9999,
          hasPhoto: true,
          displayOrder: 2,
        }
      ];
    }

    return { ...cat, images: catPhotos };
  });
}

export function mapGroupedResponseToCategories(
  groupedData: PropertyPhotoGalleryDto,
  t?: (key: string) => string
): PhotoCategory[] {
  const systemCodes = ['FRONT', 'FLOOR', 'GIS', 'BACK', 'LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'BALCONY', 'TERRACE', 'PARKING'];
  
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
