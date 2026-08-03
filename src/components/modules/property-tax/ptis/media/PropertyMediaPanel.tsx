'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useMediaDrawerState } from '@/hooks/ptis/photoplan/useMediaDrawerState';
import { usePropertyMedia } from '@/hooks/ptis/photoplan/usePropertyMedia';
import { useMediaPanel } from '@/hooks/ptis/photoplan/useMediaPanelVisibility';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import { type WaybackRelease, WAYBACK_STATIC_TILE_URL } from '@/lib/api/wayback.service';
import { latLngToTile } from '@/lib/utils/coordinate-utils';
import { PhotoPlanDrawer } from './PhotoPlanDrawer';
import { PropertyMediaPanelContent } from './PropertyMediaPanelContent';
import { PropertyMediaPanelSkeleton } from './PropertyMediaPanelSkeleton';
import { toast } from 'sonner';
import { getCookieValue, decodeCookieValue } from '@/lib/utils/cookie';
import { launchPhotoPlanDrawingToolAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
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
  onPhotosChange?: (photos: PropertyPhotoDto[]) => void;
  onPhotoSlotsChange?: (slots: PropertyPhotoTypeWithStatusDto[]) => void;
}

function PropertyMediaPanel({
  wardNo = '',
  propertyNo = '',
  partitionNo = '',
  propertyId,
  initialPhotoSlots = [],
  initialPhotos = [],
  loading = false,
  initialLatitude,
  initialLongitude,
  initialWaybackReleases = [],
  onPhotosChange,
  onPhotoSlotsChange,
}: PropertyMediaPanelProps): React.ReactElement {
  const { isDrawerOpen, drawerInitialCategoryIndex, openDrawer, closeDrawer } =
    useMediaDrawerState();
  const { togglePanel } = useMediaPanel();

  // Close the drawer if the propertyId changes (e.g. searching/switching property)
  const prevPropertyIdRef = useRef(propertyId);
  useEffect(() => {
    if (isDrawerOpen && propertyId !== prevPropertyIdRef.current) {
      closeDrawer();
    }
    prevPropertyIdRef.current = propertyId;
  }, [propertyId, isDrawerOpen, closeDrawer]);

  const {
    showMoreImages,
    setShowMoreImages,
    hoverPreview,
    resetHoverPreview,
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
    setPhotos,
    t,
  } = usePropertyMedia({
    initialPhotoSlots,
    initialPhotos,
    propertyId,
    initialLatitude,
    initialLongitude,
    initialWaybackReleases: initialWaybackReleases,
    onPhotosChange,
    onPhotoSlotsChange,
  });

  useEffect(() => {
    if (loading) {
      resetHoverPreview();
    }
  }, [loading, resetHoverPreview]);
  const hasCoords = typeof initialLatitude === 'number' && Number.isFinite(initialLatitude) && typeof initialLongitude === 'number' && Number.isFinite(initialLongitude);
  const coords = hasCoords ? { lat: initialLatitude, lng: initialLongitude } : undefined;
  const waybackReleases = initialWaybackReleases;
  const cdCategory = categories.find((c) => c.photoTypeCode === 'CHANGE_DETECTION');
  let cdBeforeImg = cdCategory?.images?.[0]?.src || '';
  let cdAfterImg = cdCategory?.images?.[1]?.src || '';
  let cdBeforeLabel = t('media.beforeCustomLabel') || 'Before (Old)';
  let cdAfterLabel = t('media.afterCustomLabel') || 'After (New)';
  let fallbackBeforeUrl = '';
  let fallbackAfterUrl = '';
  if (hasCoords && waybackReleases.length > 0) {
    const activeCoords = coords!;
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
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!propertyId) {
        toast.error(t('media.drawingToolPropertyIdRequired') || 'Property ID is required.');
        return;
      }

      const toastId = toast.loading(t('media.preparingDrawingTool') || 'Preparing drawing tool...');
      try {
        const councilName = 'THANE_Survey';
        const returnUrl = typeof window !== 'undefined' ? window.location.href : '';
        const ptisUsername = getCookieValue('login_username');
        const rawDisplayName = getCookieValue('user_name');
        const ptisDisplayName = rawDisplayName ? decodeCookieValue(rawDisplayName) : undefined;
        const ptisUserId = getCookieValue('user_id');

        const result = await launchPhotoPlanDrawingToolAction(
          propertyId,
          councilName,
          returnUrl,
          ptisUsername,
          ptisDisplayName,
          ptisUserId
        );

        if (!result.success || !result.data?.launchUrl) {
           throw new Error(result.error || (t('media.launchUrlNotFound') || 'Launch URL not found in response.'));
        }

        const launchUrl = result.data.launchUrl;
        
        if (typeof launchUrl === 'string' && launchUrl.length > 0) {
           const url = new URL(launchUrl);
           if (url.protocol !== 'https:' && url.protocol !== 'http:') {
             throw new Error('Invalid launch URL protocol.');
           }
           toast.success(t('media.redirectingDrawingTool') || 'Redirecting to drawing tool...', { id: toastId });
           window.location.assign(url.toString());
        } else {
           throw new Error(t('media.launchUrlNotFound') || 'Launch URL not found in response.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : (t('media.unexpectedError') || 'An unexpected error occurred.');
        toast.error(errorMessage, { id: toastId });
      }
    },
    [propertyId, t]
  );

  if (loading) {
    return <PropertyMediaPanelSkeleton />;
  }

  return (
    <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 relative">
      <PropertyMediaPanelContent
        categories={categories}
        t={t}
        openDrawer={openDrawer}
        handleImageHover={handleImageHover}
        handleImageLeave={handleImageLeave}
        cancelImageLeave={cancelImageLeave}
        hoverPreview={hoverPreview}
        showMoreImages={showMoreImages}
        setShowMoreImages={setShowMoreImages}
        propertyPhoto={propertyPhoto}
        propertyPhotoCategory={propertyPhotoCategory}
        remainingImages={remainingImages}
        photoPlanPhoto={photoPlanPhoto}
        photoPlanCategory={photoPlanCategory}
        handleCreateClick={handleCreateClick}
        gisPhoto={gisPhoto}
        gisCategory={gisCategory}
        hasCoords={hasCoords}
        cdBeforeImg={cdBeforeImg}
        cdAfterImg={cdAfterImg}
        cdBeforeLabel={cdBeforeLabel}
        cdAfterLabel={cdAfterLabel}
        fallbackBeforeUrl={fallbackBeforeUrl}
        fallbackAfterUrl={fallbackAfterUrl}
        cdCategory={cdCategory}
      />

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

      {isDrawerOpen && (
        <PhotoPlanDrawer
          open={isDrawerOpen}
          onClose={closeDrawer}
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
          onPhotosChange={setPhotos}
          wardNo={wardNo}
          propertyNo={propertyNo}
          partitionNo={partitionNo}
          initialCategoryIndex={drawerInitialCategoryIndex}
          propertyId={propertyId}
          fullyLoadedIds={fullyLoadedIds}
          onFullyLoadedIdsChange={setFullyLoadedIds}
          initialLatitude={hasCoords ? initialLatitude : undefined}
          initialLongitude={hasCoords ? initialLongitude : undefined}
          initialWaybackReleases={waybackReleases}
          onDrawPlan={handleCreateClick}
        />
      )}
    </div>
  );
}

export default React.memo(PropertyMediaPanel);
