'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Images } from 'lucide-react';
import { Drawer } from '@/components/common';
import { PhotoPlanSidebar, type PhotoCategory } from './PhotoPlanSidebar';
import { PhotoPlanGrid } from './PhotoPlanGrid';
import { PhotoPlanViewer } from './PhotoPlanViewer';
import { PhotoPlanModals } from './PhotoPlanModals';
import { usePhotoPlanMutations } from '../../../../../hooks/ptis/photoplan/usePhotoPlanMutations';
import { usePhotoPlanCategoryMutations } from '../../../../../hooks/ptis/photoplan/usePhotoPlanCategoryMutations';
import { getPhotosByCategoryAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { mapPropertyPhotoToAdditionalImage } from './mediaData';

interface PhotoPlanDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  wardNo?: string;
  propertyNo?: string;
  initialCategoryIndex?: number;
  propertyId?: number;
  fullyLoadedIds: Set<number>;
  onFullyLoadedIdsChange: (ids: Set<number>) => void;
}

export function PhotoPlanDrawer({
  open,
  onClose,
  categories,
  onCategoriesChange,
  wardNo = '',
  propertyNo = '',
  initialCategoryIndex = 0,
  propertyId,
  fullyLoadedIds,
  onFullyLoadedIdsChange,
}: PhotoPlanDrawerProps): React.ReactNode {
  const t = useTranslations('ptis');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(() =>
    initialCategoryIndex >= 0 && initialCategoryIndex < categories.length ? initialCategoryIndex : 0
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'viewer'>('grid');
  const [rotation, setRotation] = useState(0);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const [cachedCategories, setCachedCategories] = useState<PhotoCategory[]>(() =>
    categories.map((cat) => ({ ...cat, images: cat.images || [] }))
  );
  const [prevCategories, setPrevCategories] = useState<PhotoCategory[]>(categories);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  if (categories !== prevCategories) {
    setCachedCategories(categories.map((cat) => ({ ...cat, images: cat.images || [] })));
    setPrevCategories(categories);
  }

  const activeCategory = cachedCategories[selectedCategoryIndex];
  const activeCategoryId = activeCategory?.photoTypeId;

  const loadPhotos = useCallback(async () => {
    if (!propertyId || !activeCategoryId || !activeCategory) return;
    const photoCount = activeCategory.photoCount ?? activeCategory.images?.length ?? 0;
    if (photoCount === 0) {
      onFullyLoadedIdsChange(new Set([...fullyLoadedIds, activeCategoryId]));
      return;
    }
    setIsLoadingPhotos(true);
    setFetchError(null);
    try {
      const res = await getPhotosByCategoryAction(propertyId, activeCategoryId);
      if (res.success && res.data) {
        const mapped = res.data.map((p) =>
          mapPropertyPhotoToAdditionalImage(p, activeCategory.photoTypeName)
        );
        const updated = cachedCategories.map((c) =>
          c.photoTypeId === activeCategoryId
            ? { ...c, images: mapped, photoCount: mapped.length }
            : c
        );
        setCachedCategories(updated);
        setTimeout(() => onCategoriesChange(updated), 0);
        onFullyLoadedIdsChange(new Set([...fullyLoadedIds, activeCategoryId]));
      } else {
        setFetchError(res.error || 'Failed to load images');
      }
    } catch {
      setFetchError('An unexpected error occurred while loading images.');
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [
    propertyId,
    activeCategoryId,
    activeCategory,
    cachedCategories,
    fullyLoadedIds,
    onCategoriesChange,
    onFullyLoadedIdsChange,
  ]);

  useEffect(() => {
    if (
      activeCategoryId &&
      !fullyLoadedIds.has(activeCategoryId) &&
      !isLoadingPhotos &&
      !fetchError
    ) {
      Promise.resolve().then(() => {
        loadPhotos();
      });
    }
  }, [activeCategoryId, fullyLoadedIds, isLoadingPhotos, fetchError, loadPhotos]);

  const handleUpdate = useCallback(
    (newCats: PhotoCategory[]) => {
      setCachedCategories(newCats);
      onCategoriesChange(newCats);
    },
    [onCategoriesChange]
  );

  const { isUploading: isCategoryUploading, handleCreateCategorySlot: apiCreateCategorySlot } =
    usePhotoPlanCategoryMutations({
      categories: cachedCategories,
      onCategoriesChange: handleUpdate,
    });

  const handleCreateCategorySlot = useCallback(
    async (name: string, order?: number, desc?: string) => {
      if (await apiCreateCategorySlot(name, order, desc)) setIsAddCategoryOpen(false);
    },
    [apiCreateCategorySlot]
  );

  const {
    fileInputRef,
    isNamingOpen,
    isUploading: isPhotoUploading,
    isReplacement,
    handleAddPhoto,
    handleReplacePhoto,
    handleFileChange,
    handleNamingSubmit,
    handleDeletePhoto,
    setIsNamingOpen,
  } = usePhotoPlanMutations({
    propertyId,
    categories: cachedCategories,
    onCategoriesChange: handleUpdate,
    selectedCategoryIndex,
    selectedImageIndex,
    setSelectedImageIndex,
    viewMode,
    setViewMode,
  });

  const isUploading = isPhotoUploading || isCategoryUploading;
  const currentImage =
    selectedImageIndex !== null ? activeCategory?.images[selectedImageIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedImageIndex !== null && activeCategory) {
      setRotation(0);
      setSelectedImageIndex((selectedImageIndex + 1) % activeCategory.images.length);
    }
  }, [selectedImageIndex, activeCategory]);

  const handlePrev = useCallback(() => {
    if (selectedImageIndex !== null && activeCategory) {
      setRotation(0);
      setSelectedImageIndex(
        (selectedImageIndex - 1 + activeCategory.images.length) % activeCategory.images.length
      );
    }
  }, [selectedImageIndex, activeCategory]);

  const handleDownload = useCallback(() => {
    const downloadHref = currentImage?.downloadUrl || currentImage?.src;
    if (downloadHref)
      Object.assign(document.createElement('a'), {
        href: downloadHref,
        download: `${currentImage.title.replace(/\s+/g, '_')}.png`,
      }).click();
  }, [currentImage]);

  if (!open) return null;
  const subtitleText = [wardNo && `Ward: ${wardNo}`, propertyNo && `Prop: ${propertyNo}`]
    .filter(Boolean)
    .join(' | ');
  const titleNode = (
    <div className="flex items-center gap-2">
      <Images className="w-5 h-5 text-blue-600" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-blue-900 leading-tight">
          {t('media.additionalImages') || 'Additional Images'}
        </span>
        <span className="text-[10px] text-blue-500 font-medium">{subtitleText}</span>
      </div>
    </div>
  );

  const imagesMaxOrder = activeCategory?.images?.length
    ? Math.max(...activeCategory.images.map((img) => img.displayOrder ?? 0))
    : 0;

  return createPortal(
    <Drawer open={open} onClose={onClose} title={titleNode} width="xl">
      <div className="relative flex flex-col xl:flex-row h-[calc(100vh-56px)] bg-slate-50 overflow-hidden">
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
          onSelectCategory={(idx) => {
            setSelectedCategoryIndex(idx);
            setFetchError(null);
            setSelectedImageIndex(null);
            setViewMode('grid');
          }}
          title={t('media.additionalImages') || 'Categories'}
          onAddSlot={() => setIsAddCategoryOpen(true)}
        />

        <div className="flex-1 flex flex-col bg-slate-50 relative group/viewer overflow-hidden">
          {viewMode === 'grid' ? (
            <PhotoPlanGrid
              categoryName={activeCategory?.photoTypeName || ''}
              images={activeCategory?.images || []}
              onSelectImage={(idx) => {
                setSelectedImageIndex(idx);
                setViewMode('viewer');
              }}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onReplacePhoto={handleReplacePhoto}
              isLoading={isLoadingPhotos}
              error={fetchError}
              onRetry={loadPhotos}
              photoCount={activeCategory?.photoCount}
            />
          ) : (
            <PhotoPlanViewer
              categoryName={activeCategory?.photoTypeName || ''}
              images={activeCategory?.images || []}
              selectedImageIndex={selectedImageIndex || 0}
              rotation={rotation}
              onBackToGrid={() => {
                setSelectedImageIndex(null);
                setViewMode('grid');
              }}
              onNext={handleNext}
              onPrev={handlePrev}
              onRotateLeft={() => setRotation((r) => (r - 90 + 360) % 360)}
              onRotateRight={() => setRotation((r) => (r + 90) % 360)}
              onResetRotation={() => setRotation(0)}
              onDownload={handleDownload}
              onUpload={handleAddPhoto}
              onReplace={handleReplacePhoto}
            />
          )}
        </div>
      </div>

      <PhotoPlanModals
        isNamingOpen={isNamingOpen}
        isAddCategoryOpen={isAddCategoryOpen}
        onCloseNaming={() => setIsNamingOpen(false)}
        onCloseCategory={() => setIsAddCategoryOpen(false)}
        activeCategoryName={activeCategory?.photoTypeName || ''}
        activeCategoryTypeId={activeCategory?.photoTypeId || 0}
        activeCategoryImagesLength={activeCategory?.images?.length || 0}
        activeCategoryImagesMaxOrder={imagesMaxOrder}
        isReplacement={isReplacement}
        isPhotoUploading={isPhotoUploading}
        isCategoryUploading={isCategoryUploading}
        existingCategoryNames={cachedCategories.map((c) => c.photoTypeName)}
        categoriesLength={cachedCategories.length}
        handleNamingSubmit={handleNamingSubmit}
        handleCreateCategorySlot={handleCreateCategorySlot}
      />
    </Drawer>,
    document.body
  );
}
