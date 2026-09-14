'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useMediaDrawerState } from '@/hooks/ptis/photoplan/useMediaDrawerState';
import { useSearchParams } from 'next/navigation';
import { usePropertyMedia } from '@/hooks/ptis/photoplan/usePropertyMedia';
import { useMediaPanel } from '@/hooks/ptis/photoplan/useMediaPanelVisibility';
import { useConfirm } from '@/components/common';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import { type WaybackRelease, WAYBACK_STATIC_TILE_URL } from '@/lib/api/wayback.service';
import { latLngToTile } from '@/lib/utils/coordinate-utils';
import { PhotoPlanDrawer } from './PhotoPlanDrawer';
import { PropertyMediaPanelContent } from './PropertyMediaPanelContent';
import { PropertyMediaPanelSkeleton } from './PropertyMediaPanelSkeleton';
import { PropertyTypeModal } from './PropertyTypeModal';
import { toast } from 'sonner';
import { launchPhotoPlanDrawingToolAction, getPhotosByPropertyAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { getPropertyDrawPlanStatus } from '@/lib/api/property.service';
import type { WingWiseWingDetails } from '@/types/property-tax/apartment';

export interface PropertyItem {
  id?: number;
  isMainProperty?: boolean;
  categoryId?: number | null;
  propertyTypeId?: number | null;
  type?: string | number | null;
  societyDetailId?: number | null;
}

export interface PropertyMediaPanelProps {
  property?: PropertyItem;
  id?: number;
  propertyId?: number;
  isMainProperty?: boolean;
  categoryId?: number | null;
  propertyTypeId?: number | null;
  type?: string | number | null;
  societyDetailId?: number | null;
  wardNo?: string;
  propertyNo?: string;
  partitionNo?: string;
  propertyHolderName?: string;
  propertyHolderNameMarathi?: string;
  isQCApproved?: boolean;
  councilName?: string;
  ptisUsername?: string;
  ptisDisplayName?: string;
  ptisUserId?: string;
  ptisBackendUri?: string;
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
  loading?: boolean;
  initialLatitude?: number;
  initialLongitude?: number;
  initialWaybackReleases?: WaybackRelease[];
  onPhotosChange?: (photos: PropertyPhotoDto[]) => void;
  onPhotoSlotsChange?: (slots: PropertyPhotoTypeWithStatusDto[]) => void;
  wings?: WingWiseWingDetails[];
}

function PropertyMediaPanel({
  property,
  id,
  propertyId: propPropertyId,
  isMainProperty: propIsMainProperty,
  categoryId: propCategoryId,
  propertyTypeId: propPropertyTypeId,
  type: _propType,
  societyDetailId: propSocietyDetailId,
  wardNo = '',
  propertyNo = '',
  partitionNo = '',
  councilName: _councilName = 'THANE_Survey',
  ptisUsername: _propPtisUsername,
  ptisDisplayName: _propPtisDisplayName,
  ptisUserId: _propPtisUserId,
  ptisBackendUri: _propPtisBackendUri,
  initialPhotoSlots = [],
  initialPhotos = [],
  loading = false,
  initialLatitude,
  initialLongitude,
  initialWaybackReleases = [],
  onPhotosChange,
  onPhotoSlotsChange,
  wings = [],
}: PropertyMediaPanelProps): React.ReactElement {
  const searchParams = useSearchParams();
  const searchPropertyId = searchParams?.get('propertyId') || searchParams?.get('propertyid');
  const searchSocietyDetailId =
    searchParams?.get('societyDetailId') ||
    searchParams?.get('societydetailid') ||
    searchParams?.get('societyId') ||
    searchParams?.get('societyid') ||
    searchParams?.get('societyMasterId') ||
    searchParams?.get('societyMasterid');
  const searchWingDetailId = searchParams?.get('wingDetailId') || searchParams?.get('wingdetailid') || searchParams?.get('wingId') || searchParams?.get('wingid');
  const searchEntityType = searchParams?.get('entityType') || searchParams?.get('entitytype');
  const searchWardNo = searchParams?.get('wardNo') || searchParams?.get('wardno');
  const searchPropertyNo = searchParams?.get('propertyNo') || searchParams?.get('propertyno');
  const searchPartitionNo = searchParams?.get('partitionNo') || searchParams?.get('partitionno');

  const effectiveId = property?.id ?? propPropertyId ?? id ?? (searchPropertyId ? Number(searchPropertyId) : 0);
  const effectiveWardNo = wardNo || searchWardNo || '';
  const effectivePropertyNo = propertyNo || searchPropertyNo || '';
  const effectivePartitionNo = partitionNo !== undefined && partitionNo !== null && partitionNo !== '' ? partitionNo : (searchPartitionNo || null);

  const isPartitionEmptyOrMain = !effectivePartitionNo || effectivePartitionNo === '0' || String(effectivePartitionNo).trim() === '' || String(effectivePartitionNo).trim() === '-';
  const effectiveIsMainProperty = propIsMainProperty !== undefined ? propIsMainProperty : (property?.isMainProperty ?? isPartitionEmptyOrMain);
  const effectiveCategoryId = property?.categoryId ?? propCategoryId ?? 1;
  const effectivePropertyTypeId = property?.propertyTypeId ?? propPropertyTypeId;
  const effectiveSocietyDetailId = property?.societyDetailId ?? propSocietyDetailId;

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const { confirm } = useConfirm();
  const { isDrawerOpen, drawerInitialCategoryIndex, openDrawer, closeDrawer } =
    useMediaDrawerState();
  const { togglePanel } = useMediaPanel();

  const selectedWingId = searchParams?.get('wingId');
  const selectedWingDetailId = searchWingDetailId || searchParams?.get('wingDetailId');

  const matchedWing = React.useMemo(() => {
    return wings.find(
      (w) =>
        (selectedWingDetailId && String(w.wingDetailId) === selectedWingDetailId) ||
        (selectedWingId && String(w.wingMasterId) === selectedWingId)
    );
  }, [wings, selectedWingId, selectedWingDetailId]);

  const effectiveWingDetailId =
    matchedWing?.wingDetailId ??
    (selectedWingDetailId ? Number(selectedWingDetailId) : (wings && wings.length > 0 ? wings[0].wingDetailId : null));

  const effectiveWingName = matchedWing
    ? (matchedWing.wingName || `${matchedWing.wingNo} Wing`)
    : (wings && wings.length > 0 ? (wings[0].wingName || `${wings[0].wingNo} Wing`) : (searchParams?.get('wingName') || ''));

  const resolvedSocietyDetailId =
    effectiveSocietyDetailId ?? (searchSocietyDetailId ? Number(searchSocietyDetailId) : null) ?? matchedWing?.societyId ?? (wings && wings.length > 0 ? wings[0].societyId : null);

  const resolvedEntityType =
    searchEntityType ||
    (propPropertyTypeId === 140 || effectivePropertyTypeId === 140
      ? 'S'
      : (effectiveIsMainProperty && effectiveWingDetailId ? 'W' : (effectiveIsMainProperty && resolvedSocietyDetailId ? 'S' : 'P')));

  // Close the drawer if the propertyId changes (e.g. switching property) or if no property is selected
  const prevPropertyIdRef = useRef(effectiveId);
  useEffect(() => {
    if (isDrawerOpen && (effectiveId !== prevPropertyIdRef.current || !effectiveId || effectiveId <= 0)) {
      closeDrawer();
    }
    prevPropertyIdRef.current = effectiveId;
  }, [effectiveId, isDrawerOpen, closeDrawer]);

  const {
    hoverPreview,
    resetHoverPreview,
    categories,
    handleCategoriesChange,
    photoPlanCategory,
    propertyPhotoCategory,
    societyPhotoCategory,
    wingPhotoCategory,
    amenityPhotoCategory,
    photoPlanPhoto,
    propertyPhoto,
    societyPhoto,
    wingPhoto,
    amenityPhoto,
    isAmenityProperty,
    handleImageHover,
    handleImageLeave,
    cancelImageLeave,
    fullyLoadedIds,
    setFullyLoadedIds,
    setPhotos,
    gisPhoto,
    t,
  } = usePropertyMedia({
    initialPhotoSlots,
    initialPhotos,
    propertyId: effectiveId,
    initialLatitude,
    initialLongitude,
    initialWaybackReleases: initialWaybackReleases,
    onPhotosChange,
    onPhotoSlotsChange,
    wings,
    isMainProperty: effectiveIsMainProperty,
    categoryId: effectiveCategoryId,
    propertyTypeId: effectivePropertyTypeId,
    entityType: resolvedEntityType,
  });

  const getSelectPropertyErrorMsg = useCallback(() => {
    const rawMsg = t('error.selectPropertyFirst') || t('selectPropertyFirst');
    if (rawMsg && rawMsg !== 'error.selectPropertyFirst' && rawMsg !== 'selectPropertyFirst') {
      return rawMsg;
    }
    return 'Please select a property first.';
  }, [t]);

  const handleOpenDrawer = useCallback(
    (categoryIndex: number, imageIndex?: number, mode?: 'view' | 'create') => {
      if (!effectiveId || effectiveId <= 0) {
        toast.error(getSelectPropertyErrorMsg());
        return;
      }
      openDrawer(categoryIndex, imageIndex, mode);
    },
    [effectiveId, getSelectPropertyErrorMsg, openDrawer]
  );

  useEffect(() => {
    if (loading) {
      resetHoverPreview();
    }
  }, [loading, resetHoverPreview]);

  // Listen for media update events (e.g., photo plan uploads/changes) to refetch photos live
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMediaUpdated = async (event: Event) => {
      const customEvent = event as CustomEvent<{ propertyId?: number }>;
      const updatedPropId = customEvent.detail?.propertyId;
      if (updatedPropId && updatedPropId !== effectiveId) return;

      if (effectiveId && effectiveId > 0) {
        try {
          const res = await getPhotosByPropertyAction(effectiveId);
          if (res.success && Array.isArray(res.data)) {
            setPhotos(res.data);
          }
        } catch {
          // Non-blocking catch
        }
      }
    };

    window.addEventListener('ptis:media-updated', handleMediaUpdated);
    return () => window.removeEventListener('ptis:media-updated', handleMediaUpdated);
  }, [effectiveId, setPhotos]);

  // Keep PropertyMasterCard thumbnail synchronized with the loaded society / property photo
  useEffect(() => {
    const photoToSync = societyPhoto || propertyPhoto;
    if (typeof window !== 'undefined' && photoToSync && (photoToSync.documentGuid || photoToSync.src)) {
      window.dispatchEvent(
        new CustomEvent('ptis:sync-thumbnail', {
          detail: {
            propertyId: effectiveId,
            documentGuid: photoToSync.documentGuid,
            photoUrl: photoToSync.src || photoToSync.fullSrc,
          },
        })
      );
    }
  }, [effectiveId, societyPhoto, propertyPhoto]);

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

  const defaultPhotoTypeId = photoPlanCategory?.photoTypeId ?? 13;

  // Drawing Tool Launcher
  const launchDrawingApp = useCallback(
    async (options?: {
      type?: string | number | null;
      photoTypeId?: number | null;
      isAmenity?: boolean;
      societyDetailId?: number | null;
      wingDetailId?: number | null;
    }) => {
      if (!effectiveId || effectiveId <= 0) return;

      const toastId = toast.loading(t('media.preparingDrawingTool') || 'Preparing drawing tool...');
      try {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        const isAmenityFlag = options?.isAmenity || isAmenityProperty || propPropertyTypeId === 140 || effectivePropertyTypeId === 140;
        const targetEntityType = isAmenityFlag ? 'S' : resolvedEntityType;
        const targetPhotoTypeId = options?.photoTypeId ?? defaultPhotoTypeId;
        const targetSocietyDetailId = options?.societyDetailId ?? resolvedSocietyDetailId;
        const targetWingDetailId = options?.wingDetailId ?? effectiveWingDetailId;
        const res = await launchPhotoPlanDrawingToolAction(
          effectiveId,
          _councilName,
          currentUrl,
          _propPtisUsername,
          _propPtisDisplayName,
          _propPtisUserId,
          effectiveWardNo,
          effectivePropertyNo,
          effectivePartitionNo,
          _propPtisBackendUri,
          options?.type,
          isAmenityFlag,
          targetEntityType,
          targetSocietyDetailId,
          targetWingDetailId,
          targetPhotoTypeId
        );

        if (res.success && res.data?.launchUrl) {
          toast.success(t('media.redirectingDrawingTool') || 'Redirecting to drawing tool...', { id: toastId });
          window.location.assign(res.data.launchUrl);
        } else {
          toast.error(res.error || t('media.failedToLaunchDrawingTool') || 'Failed to launch drawing tool.', { id: toastId });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to launch drawing tool.', { id: toastId });
      }
    },
    [
      effectiveId,
      _councilName,
      _propPtisUsername,
      _propPtisDisplayName,
      _propPtisUserId,
      effectiveWardNo,
      effectivePropertyNo,
      effectivePartitionNo,
      _propPtisBackendUri,
      resolvedEntityType,
      resolvedSocietyDetailId,
      effectiveWingDetailId,
      effectivePropertyTypeId,
      isAmenityProperty,
      defaultPhotoTypeId,
      propPropertyTypeId,
      t,
    ]
  );

  // Draw Button Workflow Handler - Strictly follows the workflow rules
  const handleCreateClick = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      if (!effectiveId || effectiveId <= 0) {
        toast.error(getSelectPropertyErrorMsg());
        return;
      }

      // Rule 1: Button Visibility & Guard: Hide/bypass if root/main property
      if (effectiveIsMainProperty) {
        return;
      }

      const executeLaunchFlow = async () => {
        const statusToastId = toast.loading(t('media.checkingDetails') || 'Checking property details...');
        try {
          const apiRes = await getPropertyDrawPlanStatus(effectiveId);
          if (typeof toast?.dismiss === 'function') toast.dismiss(statusToastId);

          const rawRes = (apiRes as unknown as Record<string, unknown>) ?? {};
          const rawData = (rawRes.data ?? rawRes.items ?? rawRes.Items ?? rawRes) as unknown;
          const data = (Array.isArray(rawData) ? rawData[0] : ((rawData as Record<string, unknown>).items ?? (rawData as Record<string, unknown>).Items ?? rawData)) as Record<string, unknown> | undefined;

          if (!apiRes.success && !data) {
            toast.error(apiRes.error || 'Failed to fetch property details.');
            return;
          }

          const fetchedSocietyDetailId = data?.societyDetailId ?? data?.SocietyDetailId ?? data?.societyId ?? data?.SocietyId;
          const fetchedWingDetailId = data?.wingDetailId ?? data?.WingDetailId ?? data?.wingId ?? data?.WingId;
          const targetSocietyDetailId = (fetchedSocietyDetailId && Number(fetchedSocietyDetailId) > 0)
            ? Number(fetchedSocietyDetailId)
            : resolvedSocietyDetailId;
          const targetWingDetailId = (fetchedWingDetailId && Number(fetchedWingDetailId) > 0)
            ? Number(fetchedWingDetailId)
            : effectiveWingDetailId;

          // Rule 2: Individual / Amenity Handling
          const catName = String(data?.categoryName ?? data?.CategoryName ?? '').toLowerCase();
          const isAmenity = Number(data?.propertyTypeId) === 140 || catName.includes('amenity');
          const isIndividualOrAmenity =
            data?.isIndividualOrAmenity === true ||
            data?.requiresTypeAssignment === false ||
            isAmenity ||
            catName.includes('individual');

          if (isIndividualOrAmenity) {
            await launchDrawingApp({ isAmenity, societyDetailId: targetSocietyDetailId, wingDetailId: targetWingDetailId });
            return;
          }

          // Strict evaluation of HasType / CurrentType from backend API
          const rawTypeValue = data?.currentType ?? data?.CurrentType ?? data?.type ?? data?.Type;
          const hasTypeFlag = data?.hasType ?? data?.HasType;

          const hasTypeValue =
            hasTypeFlag === true ||
            (hasTypeFlag !== false &&
              rawTypeValue !== null &&
              rawTypeValue !== undefined &&
              String(rawTypeValue).trim() !== '' &&
              String(rawTypeValue).trim().toLowerCase() !== 'null');

          if (hasTypeValue && rawTypeValue) {
            // If hasType === true -> Execute direct redirect to CAD drawer
            await launchDrawingApp({ type: rawTypeValue as string | number, societyDetailId: targetSocietyDetailId, wingDetailId: targetWingDetailId });
            return;
          }

          // If hasType === false (Type is null/empty) -> Block redirect & open Type Selection Modal
          setIsTypeModalOpen(true);
        } catch (_err) {
          if (typeof toast?.dismiss === 'function') toast.dismiss(statusToastId);
          toast.error('Failed to check property details.');
        }
      };

      if (photoPlanPhoto && photoPlanPhoto.hasPhoto) {
        confirm({
          title: t('media.existingPlanFound') || 'Existing Plan Found',
          description: t('media.existingPlanEditConfirm') || 'This property already has a plan. Do you want to edit the plan?',
          confirmText: t('common.yes') || 'Yes',
          cancelText: t('common.no') || 'No',
          onConfirm: executeLaunchFlow,
          variant: 'info'
        });
      } else {
        await executeLaunchFlow();
      }
    },
    [
      effectiveId,
      effectiveIsMainProperty,
      setIsTypeModalOpen,
      launchDrawingApp,
      t,
      confirm,
      getSelectPropertyErrorMsg,
      photoPlanPhoto,
    ]
  );

  const handleTypeAssigned = useCallback(
    async (assignedType: string, isExistingSelection?: boolean) => {
      setIsTypeModalOpen(false);

      if (typeof window !== 'undefined' && effectiveId) {
        window.dispatchEvent(
          new CustomEvent('ptis:media-updated', {
            detail: { propertyId: effectiveId, type: assignedType },
          })
        );
      }

      // If user selected an existing building plan type, apply shared plan & NEVER redirect to CAD tool
      if (isExistingSelection) {
        toast.success(t.has?.('media.sharedPlanApplied') ? t('media.sharedPlanApplied') : `Plan Type ${assignedType} assigned. Shared plan applied to property.`);
        
        // Refresh photos for current property to display shared plan immediately
        if (effectiveId && effectiveId > 0) {
          try {
            const res = await getPhotosByPropertyAction(effectiveId);
            if (res.success && Array.isArray(res.data)) {
              setPhotos(res.data);
            }
          } catch {
            // Non-blocking catch
          }
        }
        return;
      }

      // If creating a NEW plan type -> Launch CAD drawing tool to draw custom plan
      await launchDrawingApp({ type: assignedType });
    },
    [effectiveId, launchDrawingApp, setIsTypeModalOpen, setPhotos, t]
  );

  if (loading) {
    return <PropertyMediaPanelSkeleton />;
  }

  return (
    <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 relative">
      <PropertyMediaPanelContent
        categories={categories}
        t={t}
        openDrawer={handleOpenDrawer}
        handleImageHover={handleImageHover}
        wings={wings}
        handleImageLeave={handleImageLeave}
        cancelImageLeave={cancelImageLeave}
        hoverPreview={hoverPreview}
        propertyPhoto={propertyPhoto}
        propertyPhotoCategory={propertyPhotoCategory}
        societyPhoto={societyPhoto}
        societyPhotoCategory={societyPhotoCategory}
        wingPhoto={wingPhoto}
        wingPhotoCategory={wingPhotoCategory}
        photoPlanPhoto={photoPlanPhoto}
        photoPlanCategory={photoPlanCategory}
        amenityPhoto={amenityPhoto}
        amenityPhotoCategory={amenityPhotoCategory}
        isAmenityProperty={isAmenityProperty}
        handleCreateClick={handleCreateClick}
        gisPhoto={gisPhoto}
        hasCoords={hasCoords}
        cdBeforeImg={cdBeforeImg}
        cdAfterImg={cdAfterImg}
        cdBeforeLabel={cdBeforeLabel}
        cdAfterLabel={cdAfterLabel}
        fallbackBeforeUrl={fallbackBeforeUrl}
        fallbackAfterUrl={fallbackAfterUrl}
        cdCategory={cdCategory}
        isMainProperty={effectiveIsMainProperty}
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

      {isDrawerOpen && effectiveId > 0 && (
        <PhotoPlanDrawer
          open={isDrawerOpen}
          onClose={closeDrawer}
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
          onPhotosChange={setPhotos}
          wardNo={wardNo}
          propertyNo={propertyNo}
          partitionNo={partitionNo}
          wingName={effectiveWingName}
          wingDetailId={effectiveWingDetailId}
          societyDetailId={resolvedSocietyDetailId}
          initialCategoryIndex={drawerInitialCategoryIndex}
          propertyId={effectiveId}
          fullyLoadedIds={fullyLoadedIds}
          onFullyLoadedIdsChange={setFullyLoadedIds}
          initialLatitude={hasCoords ? initialLatitude : undefined}
          initialLongitude={hasCoords ? initialLongitude : undefined}
          initialWaybackReleases={waybackReleases}
          onDrawPlan={effectiveIsMainProperty ? undefined : handleCreateClick}
          onRequestTypeModal={() => setIsTypeModalOpen(true)}
          isMainProperty={effectiveIsMainProperty}
        />
      )}

      {isTypeModalOpen && effectiveId && (
        <PropertyTypeModal
          open={isTypeModalOpen}
          onClose={() => setIsTypeModalOpen(false)}
          propertyId={effectiveId}
          societyDetailId={resolvedSocietyDetailId}
          wingDetailId={effectiveWingDetailId}
          onSuccess={handleTypeAssigned}
        />
      )}
    </div>
  );
}

export default React.memo(PropertyMediaPanel);
