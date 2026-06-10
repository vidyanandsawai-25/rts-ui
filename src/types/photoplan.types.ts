export interface PropertyPhotoDto {
  propertyPhotoId: number;
  propertyId: number;
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  remarks?: string;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface PropertyPhotoTypeWithStatusDto {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  hasPhoto: boolean;
  photoCount?: number;
  propertyPhotoId?: number;
  remarks?: string;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface PropertyPhotoUploadResponseDto {
  propertyPhotoId: number;
  documentGuid: string;
  documentId: number;
  documentBindingId: number;
  propertyId: number;
  photoTypeId: number;
  displayOrder?: number;
  remarks?: string;
  fileName: string;
  fileSizeBytes: number;
  storagePath: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface PropertyPhotoTypeGroupDto {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  hasPhoto: boolean;
  photoCount: number;
  photos: PropertyPhotoDto[];
}

export interface PropertyPhotoGalleryDto {
  propertyId: number;
  totalPhotos: number;
  photoTypes: PropertyPhotoTypeGroupDto[];
}
