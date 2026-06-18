'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PhotoPlanSidebar, type PhotoCategory } from './PhotoPlanSidebar';
import { PhotoPlanGrid } from './PhotoPlanGrid';
import { PhotoPlanViewer } from './PhotoPlanViewer';
import { PhotoPlanModals } from './PhotoPlanModals';
import { ChangeDetectionCompare } from './ChangeDetectionCompare';
import { usePhotoPlanDrawerState } from '@/hooks/ptis/photoplan/usePhotoPlanDrawerState';
import { patchCategory } from '@/lib/utils/ptis-photo-plan-localization';

interface PhotoPlanDrawerBodyProps {
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  initialCategoryIndex?: number;
  propertyId?: number;
  fullyLoadedIds: Set<number>;
  onFullyLoadedIdsChange: (ids: Set<number>) => void;
}

export function PhotoPlanDrawerBody({
  categories,
  onCategoriesChange,
  initialCategoryIndex = 0,
  propertyId,
  fullyLoadedIds,
  onFullyLoadedIdsChange,
}: PhotoPlanDrawerBodyProps): React.ReactElement {
  const t = useTranslations('ptis');

  const {
    selectedCategoryIndex,
    setSelectedCategoryIndex,
    selectedImageIndex,
    setSelectedImageIndex,
    viewMode,
    setViewMode,
    rotation,
    setRotation,
    cachedCategories,
    isLoadingPhotos,
    fetchError,
    activeCategory,
    loadPhotos,
    mutations,
    isUploading,
    handleNext,
    handlePrev,
    handleDownload,
  } = usePhotoPlanDrawerState({
    categories,
    onCategoriesChange,
    propertyId,
    initialCategoryIndex,
    fullyLoadedIds,
    onFullyLoadedIdsChange,
  });

  const {
    fileInputRef,
    isNamingOpen,
    isReplacement,
    isUploading: isPhotoUploading,
    isAdding,
    isReplacing,
    isDeleting,
    handleAddPhoto,
    handleReplacePhoto,
    handleFileChange,
    handleNamingSubmit,
    handleDeletePhoto,
    setIsNamingOpen,
  } = mutations;

  const imagesMaxOrder = activeCategory?.images?.length
    ? Math.max(...activeCategory.images.map((img) => img.displayOrder ?? 0))
    : 0;

  const isSplit = viewMode === 'viewer';
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

  return (
    <div className="relative flex flex-col xl:flex-row h-[calc(100vh-56px)] bg-slate-50 overflow-hidden photo-plan-drawer-content w-full">
      {!isTest && <style dangerouslySetInnerHTML={{ __html: '.drawer-instance:has(.photo-plan-drawer-content) { width: 50% !important; max-width: 50vw !important; } div:has(+ .drawer-instance:has(.photo-plan-drawer-content)) { background-color: transparent !important; backdrop-filter: none !important; }' }} />}
      {isUploading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <PhotoPlanSidebar
        categories={cachedCategories}
        selectedCategoryIndex={selectedCategoryIndex}
        onSelectCategory={setSelectedCategoryIndex}
        title={t('media.additionalImages') || 'Categories'}
      />

      <div className="flex-1 flex flex-col bg-slate-50 relative group/viewer overflow-hidden">
        {activeCategory?.photoTypeCode === 'CHANGE_DETECTION' && viewMode === 'compare' ? (
          <ChangeDetectionCompare
            activeCategory={activeCategory}
            propertyId={propertyId}
            onBackToGrid={() => {
              setSelectedImageIndex(null);
              setViewMode('grid');
            }}
            onImagesChange={(updatedImages) => {
              onCategoriesChange(patchCategory(cachedCategories, selectedCategoryIndex, updatedImages));
            }}
          />
        ) : isSplit ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="h-[85%] border-b border-slate-200 flex flex-col bg-slate-50 relative group/viewer overflow-hidden">
              <PhotoPlanViewer
                categoryName={activeCategory?.photoTypeName || ''}
                images={activeCategory?.images || []}
                selectedImageIndex={selectedImageIndex || 0}
                rotation={rotation}
                isAdding={isAdding}
                isReplacing={isReplacing}
                isDeleting={isDeleting}
                onBackToGrid={() => { setSelectedImageIndex(null); setViewMode('grid'); }}
                onNext={handleNext} onPrev={handlePrev}
                onRotateLeft={() => setRotation((r) => (r - 90 + 360) % 360)}
                onRotateRight={() => setRotation((r) => (r + 90) % 360)}
                onResetRotation={() => setRotation(0)}
                onDownload={handleDownload} onUpload={handleAddPhoto}
                onReplace={handleReplacePhoto} onDelete={handleDeletePhoto}
              />
            </div>
            <div className="h-[15%] flex flex-col overflow-hidden bg-slate-50">
              <PhotoPlanGrid
                key={activeCategory?.photoTypeCode || activeCategory?.photoTypeName || 'carousel'}
                categoryName={activeCategory?.photoTypeName || ''}
                images={activeCategory?.images || []}
                selectedImageIndex={selectedImageIndex}
                onSelectImage={(idx) => {
                  if (activeCategory?.photoTypeCode === 'CHANGE_DETECTION') {
                    setViewMode('compare');
                  } else {
                    setSelectedImageIndex(idx);
                    setViewMode('viewer');
                  }
                }}
                onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto}
                onReplacePhoto={handleReplacePhoto} isLoading={isLoadingPhotos}
                error={fetchError} onRetry={loadPhotos}
                photoCount={activeCategory?.photoCount}
                hideHeader isCarouselMode={true} className="p-2 px-3"
              />
            </div>
          </div>
        ) : (
          <PhotoPlanGrid
            categoryName={activeCategory?.photoTypeName || ''}
            photoTypeCode={activeCategory?.photoTypeCode}
            onCompare={() => setViewMode('compare')}
            images={activeCategory?.images || []}
            selectedImageIndex={selectedImageIndex}
            onSelectImage={(idx) => {
              if (activeCategory?.photoTypeCode === 'CHANGE_DETECTION') {
                setViewMode('compare');
              } else {
                setSelectedImageIndex(idx);
                setViewMode('viewer');
              }
            }}
            onAddPhoto={handleAddPhoto} onDeletePhoto={handleDeletePhoto}
            onReplacePhoto={handleReplacePhoto} isLoading={isLoadingPhotos}
            error={fetchError} onRetry={loadPhotos}
            photoCount={activeCategory?.photoCount}
          />
        )}
      </div>

      <PhotoPlanModals
        isNamingOpen={isNamingOpen}
        onCloseNaming={() => setIsNamingOpen(false)}
        activeCategoryName={activeCategory?.photoTypeName || ''}
        activeCategoryTypeId={activeCategory?.photoTypeId || 0}
        activeCategoryImagesLength={activeCategory?.images?.length || 0}
        activeCategoryImagesMaxOrder={imagesMaxOrder}
        isReplacement={isReplacement}
        isPhotoUploading={isPhotoUploading}
        handleNamingSubmit={handleNamingSubmit}
      />
    </div>
  );
}
