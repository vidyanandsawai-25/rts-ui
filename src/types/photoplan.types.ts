export interface PropertyPhotoDto {
  propertyPhotoId: number;
  propertyId: number;
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  remarks?: string;
  documentBindingId?: number;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
  wingDetailId?: number;
  wingName?: string;
  societyDetailId?: number;
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

// ==========================================
// Society Photo DTOs
// ==========================================

export interface SocietyPhotoDto {
  societyPhotoId: number;
  societyId: number;
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  remarks?: string;
  documentBindingId?: number;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface SocietyPhotoTypeWithStatusDto {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  hasPhoto: boolean;
  photoCount?: number;
  societyPhotoId?: number;
  remarks?: string;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface SocietyPhotoUploadResponseDto {
  societyPhotoId: number;
  documentGuid: string;
  documentId: number;
  documentBindingId: number;
  societyId: number;
  photoTypeId: number;
  displayOrder?: number;
  remarks?: string;
  fileName: string;
  fileSizeBytes: number;
  storagePath: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface SocietyPhotoTypeGroupDto {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  hasPhoto: boolean;
  photoCount: number;
  photos: SocietyPhotoDto[];
}

export interface SocietyPhotoGalleryDto {
  societyId: number;
  totalPhotos: number;
  photoTypes: SocietyPhotoTypeGroupDto[];
}

// ==========================================
// Wing Photo DTOs
// ==========================================

export interface WingPhotoDto {
  wingPhotoId: number;
  wingId: number;
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  remarks?: string;
  documentBindingId?: number;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface WingPhotoTypeWithStatusDto {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  hasPhoto: boolean;
  photoCount?: number;
  wingPhotoId?: number;
  remarks?: string;
  documentGuid?: string;
  fileName?: string;
  mimeType?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface WingPhotoUploadResponseDto {
  wingPhotoId: number;
  documentGuid: string;
  documentId: number;
  documentBindingId: number;
  wingId: number;
  photoTypeId: number;
  displayOrder?: number;
  remarks?: string;
  fileName: string;
  fileSizeBytes: number;
  storagePath: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export interface WingPhotoTypeGroupDto {
  photoTypeId: number;
  photoTypeCode: string;
  photoTypeName: string;
  displayOrder?: number;
  hasPhoto: boolean;
  photoCount: number;
  photos: WingPhotoDto[];
}

export interface WingPhotoGalleryDto {
  wingId: number;
  totalPhotos: number;
  photoTypes: WingPhotoTypeGroupDto[];
}
