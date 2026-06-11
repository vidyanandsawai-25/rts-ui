import type { AdditionalImage } from './MediaImageCards';
import type { PropertyPhotoDto, PropertyPhotoTypeWithStatusDto, PropertyPhotoGalleryDto } from '@/types/photoplan.types';
import type { PhotoCategory } from './PhotoPlanSidebar';
import { getViewDocumentUrl, getDownloadDocumentUrl } from '@/lib/utils/document-utils';

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
  if (remarksStr.includes(' | ')) {
    const [namePart, ...remarkParts] = remarksStr.split(' | ');
    parsedTitle = namePart || categoryName;
    parsedRemarks = remarkParts.join(' | ');
  } else if (remarksStr) {
    parsedTitle = remarksStr;
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

export function mapSlotsToCategories(
  slots: PropertyPhotoTypeWithStatusDto[],
  uploadedPhotos: PropertyPhotoDto[] = [],
  fullyLoadedIds?: Set<number>
): PhotoCategory[] {
  const systemCodes = ['FRONT', 'FLOOR', 'GIS', 'BACK', 'LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'BALCONY', 'TERRACE', 'PARKING'];
  const baseCats = slots.map(s => ({
    photoTypeId: s.photoTypeId,
    photoTypeCode: s.photoTypeCode,
    photoTypeName: s.photoTypeName,
    isCustom: !systemCodes.includes(s.photoTypeCode.toUpperCase()),
    hasPhoto: s.hasPhoto,
    photoCount: s.photoCount,
    propertyPhotoId: s.propertyPhotoId,
    documentGuid: s.documentGuid,
    viewUrl: s.viewUrl,
  }));

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

    return { ...cat, images: catPhotos };
  });
}

export function mapGroupedResponseToCategories(
  groupedData: PropertyPhotoGalleryDto
): PhotoCategory[] {
  const systemCodes = ['FRONT', 'FLOOR', 'GIS', 'BACK', 'LIVING', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'BALCONY', 'TERRACE', 'PARKING'];
  
  return (groupedData.photoTypes || []).map(group => {
    const mappedImages = (group.photos || [])
      .sort((a, b) => {
        const diff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
        if (diff !== 0) return diff;
        return (a.propertyPhotoId ?? 0) - (b.propertyPhotoId ?? 0);
      })
      .map(p => mapPropertyPhotoToAdditionalImage(p, group.photoTypeName));

    return {
      photoTypeId: group.photoTypeId,
      photoTypeCode: group.photoTypeCode,
      photoTypeName: group.photoTypeName,
      isCustom: !systemCodes.includes(group.photoTypeCode.toUpperCase()),
      images: mappedImages,
    };
  });
}
