'use client';

import React from 'react';
import { PhotoPlanNamingModal } from './PhotoPlanNamingModal';

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
}: PhotoPlanModalsProps): React.ReactElement {
  return (
    <>
      {isNamingOpen && (
        <PhotoPlanNamingModal
          open
          onClose={onCloseNaming}
          onSubmit={handleNamingSubmit}
          availableTypes={[{ label: activeCategoryName, value: String(activeCategoryTypeId) }]}
          defaultDisplayOrder={activeCategoryImagesLength ? activeCategoryImagesMaxOrder + 1 : 1}
          defaultName={activeCategoryName}
          isReplacement={isReplacement}
          defaultPhotoTypeId={activeCategoryTypeId}
          isLoading={isPhotoUploading}
        />
      )}
    </>
  );
}
