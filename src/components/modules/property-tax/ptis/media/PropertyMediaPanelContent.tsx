'use client';

import React from 'react';
import { Button } from '@/components/common';
import { Images, X, Plus } from 'lucide-react';
import { ImageHoverPreview } from './ImageHoverPreview';
import { MediaImageCard, AdditionalImagesGrid } from './MediaImageCards';
import { ChangeDetectionCard } from './ChangeDetectionCard';
import type { PhotoCategory } from './PhotoPlanSidebar';
import type { AdditionalImage } from './MediaImageCards';
import { toast } from 'sonner';
import type { HoverPreviewData } from '@/hooks/ptis/photoplan/useImageHoverPreview';

interface PropertyMediaPanelContentProps {
  categories: PhotoCategory[];
  t: (key: string) => string;
  openDrawer: (categoryIndex: number, imageIndex?: number, mode?: 'view' | 'create') => void;
  handleImageHover: (
    src: string,
    title: string,
    src2?: string,
    beforeLabel?: string,
    afterLabel?: string,
    fallbackSrc?: string,
    fallbackSrc2?: string
  ) => void;
  handleImageLeave: () => void;
  cancelImageLeave: () => void;
  hoverPreview: HoverPreviewData | null;
  showMoreImages: boolean;
  setShowMoreImages: React.Dispatch<React.SetStateAction<boolean>>;
  propertyPhoto?: AdditionalImage;
  propertyPhotoCategory?: PhotoCategory;
  remainingImages: AdditionalImage[];
  photoPlanPhoto?: AdditionalImage;
  photoPlanCategory?: PhotoCategory;
  handleCreateClick: (e: React.MouseEvent) => void;
  signaturePhoto?: AdditionalImage;
  signatureCategory?: PhotoCategory;
  cdBeforeImg: string;
  cdAfterImg: string;
  cdBeforeLabel: string;
  cdAfterLabel: string;
  fallbackBeforeUrl: string;
  fallbackAfterUrl: string;
  cdCategory?: PhotoCategory;
}

export function PropertyMediaPanelContent({
  categories,
  t,
  openDrawer,
  handleImageHover,
  handleImageLeave,
  cancelImageLeave,
  hoverPreview,
  showMoreImages,
  setShowMoreImages,
  propertyPhoto,
  propertyPhotoCategory,
  remainingImages,
  photoPlanPhoto,
  photoPlanCategory,
  handleCreateClick,
  signaturePhoto,
  signatureCategory,
  cdBeforeImg,
  cdAfterImg,
  cdBeforeLabel,
  cdAfterLabel,
  fallbackBeforeUrl,
  fallbackAfterUrl,
  cdCategory,
}: PropertyMediaPanelContentProps): React.ReactElement {
  return (
    <>
      <ImageHoverPreview
        key={hoverPreview?.src ?? 'empty'}
        src={hoverPreview?.src ?? ''}
        src2={hoverPreview?.src2}
        title={hoverPreview?.title ?? ''}
        beforeLabel={hoverPreview?.beforeLabel}
        afterLabel={hoverPreview?.afterLabel}
        fallbackSrc={hoverPreview?.fallbackSrc}
        fallbackSrc2={hoverPreview?.fallbackSrc2}
        visible={hoverPreview !== null}
        onMouseEnter={cancelImageLeave}
        onMouseLeave={handleImageLeave}
      />

      <div className="flex-1 overflow-y-auto p-2 flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-col gap-2 scrollbar-thin">
        <MediaImageCard
          src={propertyPhoto?.src || ''}
          documentGuid={propertyPhoto?.documentGuid}
          fullSrc={propertyPhoto?.fullSrc || ''}
          alt={propertyPhoto?.alt || t('media.propertyPhoto')}
          label={propertyPhoto?.title || t('media.propertyPhoto')}
          hoverBorderColor="hover:border-blue-500"
          badgeText={!showMoreImages && remainingImages.length > 0 ? `+${remainingImages.length} More` : undefined}
          onClick={() => openDrawer(propertyPhotoCategory ? categories.indexOf(propertyPhotoCategory) : 0, 0)}
          onMouseEnter={() => handleImageHover(propertyPhoto?.fullSrc || propertyPhoto?.src || '', propertyPhoto?.title || t('media.propertyPhoto'))}
          onMouseLeave={handleImageLeave}
          hasPhoto={propertyPhoto?.hasPhoto}
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
              onImageClick={(index: number) => {
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
          onClick={() => openDrawer(photoPlanCategory ? categories.indexOf(photoPlanCategory) : 0, 0)}
          onMouseEnter={() => handleImageHover(photoPlanPhoto?.fullSrc || photoPlanPhoto?.src || '', photoPlanPhoto?.title || t('media.photoPlan'))}
          onMouseLeave={handleImageLeave}
          hasPhoto={photoPlanPhoto?.hasPhoto}
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
        <MediaImageCard
          src={signaturePhoto?.src || ''}
          documentGuid={signaturePhoto?.documentGuid}
          fullSrc={signaturePhoto?.fullSrc || ''}
          alt={signaturePhoto?.alt || t('media.ownerSignaturePhoto') || 'Owner Signature Photo'}
          label={signaturePhoto?.title || t('media.ownerSignaturePhoto') || 'Owner Signature Photo'}
          hoverBorderColor="hover:border-green-500"
          onClick={() => {
            const idx = signatureCategory ? categories.indexOf(signatureCategory) : -1;
            if (idx !== -1) openDrawer(idx, 0);
          }}
          onMouseEnter={() => handleImageHover(signaturePhoto?.fullSrc || signaturePhoto?.src || '', signaturePhoto?.title || t('media.ownerSignaturePhoto') || 'Owner Signature Photo')}
          onMouseLeave={handleImageLeave}
          hasPhoto={signaturePhoto?.hasPhoto}
        />

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <ChangeDetectionCard
          beforeImageSrc={cdBeforeImg}
          afterImageSrc={cdAfterImg}
          beforeLabel={cdBeforeLabel}
          afterLabel={cdAfterLabel}
          fallbackBeforeSrc={fallbackBeforeUrl}
          fallbackAfterSrc={fallbackAfterUrl}
          onMouseEnter={() => {
            handleImageHover(cdBeforeImg, t('media.changeDetection') || 'Change Detection', cdAfterImg, cdBeforeLabel, cdAfterLabel, fallbackBeforeUrl, fallbackAfterUrl);
          }}
          onMouseLeave={handleImageLeave}
          onClick={() => {
            const changeDetectionIndex = cdCategory ? categories.indexOf(cdCategory) : -1;
            if (changeDetectionIndex !== -1) {
              openDrawer(changeDetectionIndex);
            } else {
              toast.error(t('error.generic') || 'Something went wrong.');
            }
          }}
        />
      </div>
    </>
  );
}
