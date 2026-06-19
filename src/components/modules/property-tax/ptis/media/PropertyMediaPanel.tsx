'use client';

import React, { useCallback } from 'react';
import { Images, X, Plus } from 'lucide-react';
import { Button } from '@/components/common';
import { MediaImageCard, AdditionalImagesGrid } from './MediaImageCards';
import { PhotoPlanDrawer } from './PhotoPlanDrawer';
import { ImageHoverPreview } from './ImageHoverPreview';
import { GisMapCard } from './GisMapCard';
import { ChangeDetectionCard } from './ChangeDetectionCard';
import { toast } from 'sonner';
import { useMediaDrawerState } from '@/hooks/ptis/photoplan/useMediaDrawerState';
import { usePropertyMedia } from '@/hooks/ptis/photoplan/usePropertyMedia';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';

export interface PropertyMediaPanelProps {
  wardNo?: string;
  propertyNo?: string;
  partitionNo?: string;
  propertyHolderName?: string;
  propertyHolderNameMarathi?: string;
  isQCApproved?: boolean;
  propertyId?: number;
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
}

function PropertyMediaPanel({
  wardNo = '', propertyNo = '', propertyId,
  initialPhotoSlots = [], initialPhotos = [],
}: PropertyMediaPanelProps): React.ReactElement {
  const { isDrawerOpen, drawerInitialCategoryIndex, openDrawer, closeDrawer } = useMediaDrawerState();

  const {
    showMoreImages, setShowMoreImages, hoverPreview, categories, handleCategoriesChange,
    photoPlanCategory, propertyPhotoCategory, gisCategory, gisPhoto, photoPlanPhoto,
    propertyPhoto, remainingImages, handleImageHover, handleImageLeave,
    fullyLoadedIds, setFullyLoadedIds, t,
  } = usePropertyMedia({ initialPhotoSlots, initialPhotos, propertyId });

  const handleCreateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer(photoPlanCategory ? categories.indexOf(photoPlanCategory) : 0, undefined, 'create');
  }, [photoPlanCategory, categories, openDrawer]);

  return (
    <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 relative">
      <ImageHoverPreview src={hoverPreview?.src ?? ''} src2={hoverPreview?.src2} title={hoverPreview?.title ?? ''} visible={hoverPreview !== null} />

      <div className="flex-1 overflow-y-auto p-2 flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-col gap-2 scrollbar-thin">
        <MediaImageCard
          src={propertyPhoto?.src || ''}
          fullSrc={propertyPhoto?.fullSrc || ''}
          alt={propertyPhoto?.alt || t('media.propertyPhoto')}
          label={propertyPhoto?.title || t('media.propertyPhoto')}
          hoverBorderColor="hover:border-blue-500"
          priority
          badgeText={!showMoreImages && remainingImages.length > 0 ? `+${remainingImages.length} More` : undefined}
          onClick={() => openDrawer(propertyPhotoCategory ? categories.indexOf(propertyPhotoCategory) : 0, 0)}
          onMouseEnter={() => handleImageHover(propertyPhoto?.fullSrc || propertyPhoto?.src || '', propertyPhoto?.title || t('media.propertyPhoto'))}
          onMouseLeave={handleImageLeave}
        >
          {remainingImages.length > 0 && (
            <Button
              variant="edit"
              size="xs"
              className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreImages((p) => !p);
              }}
              aria-label={showMoreImages ? 'Hide more images' : 'View more images'}
            >
              {showMoreImages ? <X className="w-3.5 h-3.5 cursor-pointer" /> : <Images className="w-3.5 h-3.5 cursor-pointer" />}
            </Button>
          )}
        </MediaImageCard>

        {showMoreImages && (
          <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
            <AdditionalImagesGrid
              images={remainingImages}
              onImageClick={(index) => {
                const clickedImg = remainingImages[index];
                const catIdx = categories.findIndex((c) => c.photoTypeId === clickedImg.photoTypeId);
                const targetCategory = categories[catIdx];
                const imgIdx = targetCategory ? targetCategory.images.findIndex((img) => img.propertyPhotoId === clickedImg.propertyPhotoId) : 0;
                openDrawer(catIdx >= 0 ? catIdx : 0, imgIdx >= 0 ? imgIdx : 0);
              }}
              onImageHover={handleImageHover}
              onImageLeave={handleImageLeave}
            />
          </div>
        )}

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <MediaImageCard
          src={photoPlanPhoto?.src || ''}
          fullSrc={photoPlanPhoto?.fullSrc || ''}
          alt={photoPlanPhoto?.alt || t('media.photoPlan')}
          label={photoPlanPhoto?.title || t('media.photoPlan')}
          hoverBorderColor="hover:border-purple-500"
          priority
          onClick={() => openDrawer(photoPlanCategory ? categories.indexOf(photoPlanCategory) : 0, 0)}
          onMouseEnter={() => handleImageHover(photoPlanPhoto?.fullSrc || photoPlanPhoto?.src || '', photoPlanPhoto?.title || t('media.photoPlan'))}
          onMouseLeave={handleImageLeave}
        >
          <Button
            variant="edit"
            size="xs"
            className="!h-7 !w-7 !p-0 shadow-lg bg-white cursor-pointer"
            onClick={handleCreateClick}
            aria-label="Create new plan"
          >
            <Plus className="w-3.5 h-3.5 cursor-pointer" />
          </Button>
        </MediaImageCard>

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <GisMapCard
          image={gisPhoto}
          onClick={() => openDrawer(gisCategory ? categories.indexOf(gisCategory) : 0, 0)}
          onMouseEnter={() => handleImageHover(gisPhoto?.fullSrc || gisPhoto?.src || '', gisPhoto?.title || t('media.satelliteView'))}
          onMouseLeave={handleImageLeave}
        />

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <ChangeDetectionCard
          onMouseEnter={() => {
            const cdCat = categories.find((c) => c.photoTypeCode === 'CHANGE_DETECTION');
            const beforeImg = cdCat?.images?.[0]?.src || '/images/thane-earth-2018.jpg';
            const afterImg = cdCat?.images?.[1]?.src || '/images/thane-earth-2026.jpg';
            handleImageHover(beforeImg, t('media.changeDetection') || 'Change Detection', afterImg);
          }}
          onMouseLeave={handleImageLeave}
          onClick={() => {
            const changeDetectionCategory = categories.find((c) => c.photoTypeCode === 'CHANGE_DETECTION');
            const changeDetectionIndex = changeDetectionCategory ? categories.indexOf(changeDetectionCategory) : -1;
            if (changeDetectionIndex !== -1) {
              openDrawer(changeDetectionIndex);
            } else {
              toast.error(t('error.generic') || 'Something went wrong.');
            }
          }}
        />
      </div>

      {isDrawerOpen && (
        <PhotoPlanDrawer
          open={isDrawerOpen} onClose={closeDrawer} categories={categories}
          onCategoriesChange={handleCategoriesChange} wardNo={wardNo} propertyNo={propertyNo}
          initialCategoryIndex={drawerInitialCategoryIndex} propertyId={propertyId}
          fullyLoadedIds={fullyLoadedIds} onFullyLoadedIdsChange={setFullyLoadedIds}
        />
      )}
    </div>
  );
}

export default React.memo(PropertyMediaPanel);
