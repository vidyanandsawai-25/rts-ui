'use client';

import React from 'react';
import { PhotoPlanNamingModal } from './PhotoPlanNamingModal';
import { PhotoPlanCategoryModal } from './PhotoPlanCategoryModal';

interface PhotoPlanModalsProps {
  isNamingOpen: boolean;
  isAddCategoryOpen: boolean;
  onCloseNaming: () => void;
  onCloseCategory: () => void;
  activeCategoryName: string;
  activeCategoryTypeId: number;
  activeCategoryImagesLength: number;
  activeCategoryImagesMaxOrder: number;
  isReplacement: boolean;
  isPhotoUploading: boolean;
  isCategoryUploading: boolean;
  existingCategoryNames: string[];
  categoriesLength: number;
  handleNamingSubmit: (name: string, order: number, typeId: number, file?: File, remarks?: string) => void;
  handleCreateCategorySlot: (name: string, order?: number, desc?: string) => void;
}

export function PhotoPlanModals({
  isNamingOpen,
  isAddCategoryOpen,
  onCloseNaming,
  onCloseCategory,
  activeCategoryName,
  activeCategoryTypeId,
  activeCategoryImagesLength,
  activeCategoryImagesMaxOrder,
  isReplacement,
  isPhotoUploading,
  isCategoryUploading,
  existingCategoryNames,
  categoriesLength,
  handleNamingSubmit,
  handleCreateCategorySlot,
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

      {isAddCategoryOpen && (
        <PhotoPlanCategoryModal
          open
          onClose={onCloseCategory}
          defaultDisplayOrder={categoriesLength + 1}
          existingNames={existingCategoryNames}
          onSubmit={handleCreateCategorySlot}
          isLoading={isCategoryUploading}
        />
      )}
    </>
  );
}
