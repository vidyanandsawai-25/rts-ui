'use client';

import React from 'react';
import { PhotoPlanNamingModal } from './PhotoPlanNamingModal';
import type { AdditionalImage } from './MediaImageCards';

interface PhotoPlanModalsProps {
  isNamingOpen: boolean;
  onCloseNaming: () => void;
  activeCategoryName: string;
  activeCategoryTypeId: number;
  activeCategoryImagesLength: number;
  activeCategoryImagesMaxOrder: number;
  isReplacement: boolean;
  isPhotoUploading: boolean;
  handleNamingSubmit: (
    name: string,
    order: number,
    typeId: number,
    file?: File,
    remarks?: string
  ) => void;
  replaceImage: AdditionalImage | null;
}

export function PhotoPlanModals({
  isNamingOpen,
  onCloseNaming,
  activeCategoryName,
  activeCategoryTypeId,
  activeCategoryImagesLength,
  activeCategoryImagesMaxOrder,
  isReplacement,
  isPhotoUploading,
  handleNamingSubmit,
  replaceImage,
}: PhotoPlanModalsProps): React.ReactElement {
  return (
    <>
      {isNamingOpen && (
        <PhotoPlanNamingModal
          open
          onClose={onCloseNaming}
          onSubmit={handleNamingSubmit}
          availableTypes={[{ label: activeCategoryName, value: String(activeCategoryTypeId) }]}
          defaultDisplayOrder={isReplacement && replaceImage ? (replaceImage.displayOrder ?? 1) : (activeCategoryImagesLength ? activeCategoryImagesMaxOrder + 1 : 1)}
          defaultName={isReplacement && replaceImage ? replaceImage.title : activeCategoryName}
          isReplacement={isReplacement}
          defaultPhotoTypeId={activeCategoryTypeId}
          isLoading={isPhotoUploading}
          defaultRemarks={isReplacement && replaceImage ? replaceImage.remarks : ''}
        />
      )}
    </>
  );
}
