'use client';

import React, { useCallback } from 'react';
import { Images, X, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/common';
import { MediaImageCard, AdditionalImagesGrid } from './MediaImageCards';
import { PhotoPlanDrawer } from './PhotoPlanDrawer';
import { ImageHoverPreview } from './ImageHoverPreview';
import { GisMapCard } from './GisMapCard';
import { ChangeDetectionCard } from './ChangeDetectionCard';
import { toast } from 'sonner';
import { useMediaDrawerState } from '@/hooks/ptis/photoplan/useMediaDrawerState';
import { usePropertyMedia } from '@/hooks/ptis/photoplan/usePropertyMedia';
import { useMediaPanel } from '@/hooks/ptis/photoplan/useMediaPanelVisibility';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import { type WaybackRelease, WAYBACK_STATIC_TILE_URL } from '@/lib/api/wayback.service';
import { getDefaultCoordinates, latLngToTile } from '@/lib/utils/coordinate-utils';

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
  loading?: boolean;
  initialLatitude?: number;
  initialLongitude?: number;
  initialWaybackReleases?: WaybackRelease[];
}

function PropertyMediaPanel({
  wardNo = '',
  propertyNo = '',
  propertyId,
  initialPhotoSlots = [],
  initialPhotos = [],
  loading = false,
  initialLatitude,
  initialLongitude,
  initialWaybackReleases = [],
}: PropertyMediaPanelProps): React.ReactElement {
  const { isDrawerOpen, drawerInitialCategoryIndex, openDrawer, closeDrawer } =
    useMediaDrawerState();
  const { isPanelVisible, togglePanel } = useMediaPanel();

  const {
    showMoreImages,
    setShowMoreImages,
    hoverPreview,
    categories,
    handleCategoriesChange,
    photoPlanCategory,
    propertyPhotoCategory,
    gisCategory,
    gisPhoto,
    photoPlanPhoto,
    propertyPhoto,
    remainingImages,
    handleImageHover,
    handleImageLeave,
    cancelImageLeave,
    fullyLoadedIds,
    setFullyLoadedIds,
    t,
  } = usePropertyMedia({
    initialPhotoSlots,
    initialPhotos,
    propertyId,
    initialLatitude,
    initialLongitude,
  });

  // Derive coordinates and releases directly from server-side props
  const hasCoords =
    typeof initialLatitude === 'number' &&
    Number.isFinite(initialLatitude) &&
    typeof initialLongitude === 'number' &&
    Number.isFinite(initialLongitude);
  const coords = hasCoords ? { lat: initialLatitude, lng: initialLongitude } : getDefaultCoordinates();
  const waybackReleases = initialWaybackReleases;

  const cdCategory = categories.find((c) => c.photoTypeCode === 'CHANGE_DETECTION');

  let cdBeforeImg = cdCategory?.images?.[0]?.src || '';
  let cdAfterImg = cdCategory?.images?.[1]?.src || '';
  let cdBeforeLabel = t('media.beforeCustomLabel') || 'Before (Old)';
  let cdAfterLabel = t('media.afterCustomLabel') || 'After (New)';

  // Always pre-calculate fallback Wayback satellite tile URLs (only if coordinates are present)
  let fallbackBeforeUrl = '';
  let fallbackAfterUrl = '';
  if (hasCoords && waybackReleases.length > 0) {
    const activeCoords = coords;
    const tile = latLngToTile(activeCoords.lat, activeCoords.lng, 17);
    const beforeRelease = waybackReleases[0];
    const afterRelease = waybackReleases[waybackReleases.length - 1];

    if (beforeRelease && afterRelease) {
      fallbackBeforeUrl = WAYBACK_STATIC_TILE_URL(beforeRelease.releaseId, tile.x, tile.y, tile.z);
      fallbackAfterUrl = WAYBACK_STATIC_TILE_URL(afterRelease.releaseId, tile.x, tile.y, tile.z);

      const hasBeforePhoto = cdCategory?.images?.[0]?.hasPhoto;
      const hasAfterPhoto = cdCategory?.images?.[1]?.hasPhoto;

      if (!cdBeforeImg || !hasBeforePhoto) {
        cdBeforeImg = fallbackBeforeUrl;
        cdBeforeLabel = `Before (${beforeRelease.year})`;
      }
      if (!cdAfterImg || !hasAfterPhoto) {
        cdAfterImg = fallbackAfterUrl;
        cdAfterLabel = `After (${afterRelease.year})`;
      }
    }
  }

  const handleCreateClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openDrawer(
        photoPlanCategory ? categories.indexOf(photoPlanCategory) : 0,
        undefined,
        'create'
      );
    },
    [photoPlanCategory, categories, openDrawer]
  );

  if (loading) {
    return (
      <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 p-2.5 gap-2.5 animate-pulse min-h-[500px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-1 min-h-[110px] flex items-center justify-center"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 relative">
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
          fullSrc={propertyPhoto?.fullSrc || ''}
          alt={propertyPhoto?.alt || t('media.propertyPhoto')}
          label={propertyPhoto?.title || t('media.propertyPhoto')}
          hoverBorderColor="hover:border-blue-500"
          badgeText={
            !showMoreImages && remainingImages.length > 0
              ? `+${remainingImages.length} More`
              : undefined
          }
          onClick={() =>
            openDrawer(propertyPhotoCategory ? categories.indexOf(propertyPhotoCategory) : 0, 0)
          }
          onMouseEnter={() =>
            handleImageHover(
              propertyPhoto?.fullSrc || propertyPhoto?.src || '',
              propertyPhoto?.title || t('media.propertyPhoto')
            )
          }
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
              {showMoreImages ? (
                <X className="w-3.5 h-3.5 cursor-pointer" />
              ) : (
                <Images className="w-3.5 h-3.5 cursor-pointer" />
              )}
            </Button>
          )}
        </MediaImageCard>

        {showMoreImages && (
          <div className="col-span-full sm:col-span-3 lg:col-span-1 flex flex-col gap-2">
            <AdditionalImagesGrid
              images={remainingImages}
              onImageClick={(index) => {
                const clickedImg = remainingImages[index];
                const catIdx = categories.findIndex(
                  (c) => c.photoTypeId === clickedImg.photoTypeId
                );
                const targetCategory = categories[catIdx];
                const imgIdx = targetCategory
                  ? targetCategory.images.findIndex(
                      (img) => img.propertyPhotoId === clickedImg.propertyPhotoId
                    )
                  : 0;
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
          onClick={() =>
            openDrawer(photoPlanCategory ? categories.indexOf(photoPlanCategory) : 0, 0)
          }
          onMouseEnter={() =>
            handleImageHover(
              photoPlanPhoto?.fullSrc || photoPlanPhoto?.src || '',
              photoPlanPhoto?.title || t('media.photoPlan')
            )
          }
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

        {/* Arrow button moved to outer container to keep it fixed in the middle of the 4 cards */}

        <div className="border-t border-slate-300 flex-shrink-0 sm:hidden lg:block" />
        <GisMapCard
          image={gisPhoto}
          hasCoords={hasCoords}
          onClick={() => openDrawer(gisCategory ? categories.indexOf(gisCategory) : 0, 0)}
          onMouseEnter={() =>
            handleImageHover(
              gisPhoto?.fullSrc || gisPhoto?.src || '',
              gisPhoto?.title || t('media.satelliteView')
            )
          }
          onMouseLeave={handleImageLeave}
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
            handleImageHover(
              cdBeforeImg,
              t('media.changeDetection') || 'Change Detection',
              cdAfterImg,
              cdBeforeLabel,
              cdAfterLabel,
              fallbackBeforeUrl,
              fallbackAfterUrl
            );
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

      {/* Arrow button anchored exactly in the middle of the panel on desktop */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-5 z-50 sm:hidden lg:block">
        <button
          type="button"
          onClick={togglePanel}
          className="w-10 h-24 flex items-center justify-center bg-transparent p-0 border-none outline-none focus:outline-none cursor-pointer hover:scale-110 active:scale-95 group transition-transform duration-200"
          aria-label="Close panel"
        >
          <ChevronRight
            className="w-6 h-6 text-[#64748B] group-hover:text-[#2563EB] scale-y-[3.5] scale-x-[1.5] opacity-75 group-hover:opacity-100 animate-pulse group-hover:animate-none transition-all"
            strokeWidth={2.5}
          />
        </button>
      </div>

      {isDrawerOpen && isPanelVisible && (
        <PhotoPlanDrawer
          open={isDrawerOpen}
          onClose={closeDrawer}
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
          wardNo={wardNo}
          propertyNo={propertyNo}
          initialCategoryIndex={drawerInitialCategoryIndex}
          propertyId={propertyId}
          fullyLoadedIds={fullyLoadedIds}
          onFullyLoadedIdsChange={setFullyLoadedIds}
          initialLatitude={hasCoords ? initialLatitude : undefined}
          initialLongitude={hasCoords ? initialLongitude : undefined}
          initialWaybackReleases={waybackReleases}
        />
      )}
    </div>
  );
}

export default React.memo(PropertyMediaPanel);
