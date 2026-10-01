'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { useMediaDrawerState } from '@/hooks/ptis/photoplan/useMediaDrawerState';
import { useSearchParams } from 'next/navigation';
import { usePropertyMedia } from '@/hooks/ptis/photoplan/usePropertyMedia';
import { useMediaPanel } from '@/hooks/ptis/photoplan/useMediaPanelVisibility';
import { useConfirm } from '@/components/common';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import { type WaybackRelease, WAYBACK_STATIC_TILE_URL, DEFAULT_WAYBACK_RELEASES } from '@/lib/api/wayback.service';
import { latLngToTile, extractCoordinates } from '@/lib/utils/coordinate-utils';
import { PhotoPlanDrawer } from './PhotoPlanDrawer';
import { PropertyMediaPanelContent } from './PropertyMediaPanelContent';
import { PropertyMediaPanelSkeleton } from './PropertyMediaPanelSkeleton';
import { PropertyTypeModal } from './PropertyTypeModal';
import { toast } from 'sonner';
import { launchPhotoPlanDrawingToolAction, getPhotosByPropertyAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { getPhotoSlotsAction, getPropertyPhotosAction } from '@/app/[locale]/property-tax/ptis/media-fetch.action';
import { getWingPhotoTypesWithStatusAction, getPhotosByWingAction } from '@/app/[locale]/property-tax/ptis/WingPhoto.action';
import { getSocietyPhotoTypesWithStatusAction, getPhotosBySocietyAction } from '@/app/[locale]/property-tax/ptis/SocietyPhoto.action';
import { getPropertyDrawPlanStatus } from '@/lib/api/property.service';
import { getWingWiseDetailsAction } from '@/app/[locale]/property-tax/ptis/apartment/action';
import { fetchWardIdAction } from '@/app/[locale]/property-tax/ptis/actions';
import type { WingWiseWingDetails } from '@/types/property-tax/apartment';

const wingWiseDetailsCache = new Map<string, WingWiseWingDetails[]>();
const wardIdCache = new Map<string, number>();

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
  propertyDescription?: string;
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
  wingName?: string;
  wingDetailId?: number | null;
  societyBuildingPhotoGuid?: string;
  societyPhotoUrl?: string;
  societyLatitude?: number;
  societyLongitude?: number;
  isQuickDataEntry?: boolean;
}

function PropertyMediaPanel({
  property,
  id,
  propertyId: propPropertyId,
  isMainProperty: propIsMainProperty,
  categoryId: propCategoryId,
  propertyTypeId: propPropertyTypeId,
  propertyDescription,
  type: _propType,
  societyDetailId: propSocietyDetailId,
  wardNo = '',
  propertyNo = '',
  partitionNo = '',
  councilName: _councilName,
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
  wingName: propWingName,
  wingDetailId: propWingDetailId,
  societyBuildingPhotoGuid,
  societyPhotoUrl,
  societyLatitude,
  societyLongitude,
  isQuickDataEntry,
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

  const isNavigating = Boolean(
    searchPropertyId && propPropertyId && Number(searchPropertyId) !== propPropertyId
  );
  const effectiveId = (searchPropertyId ? Number(searchPropertyId) : 0) || property?.id || propPropertyId || id || 0;
  const isPanelLoading = loading || isNavigating;
  const effectiveWardNo = wardNo || searchWardNo || '';
  const effectivePropertyNo = propertyNo || searchPropertyNo || '';
  const effectivePartitionNo = partitionNo !== undefined && partitionNo !== null && partitionNo !== '' ? partitionNo : (searchPartitionNo || null);

  const searchCategoryId = searchParams?.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const isIndividualFromParams = (searchParams?.get('hideWing') === 'true' && searchParams?.get('hideSociety') === 'true');
  const effectiveCategoryId = property?.categoryId ?? propCategoryId ?? searchCategoryId ?? (isIndividualFromParams ? 2 : 1);
  const isApartment = effectiveCategoryId === 1;
  const isPartitionEmptyOrMain = !effectivePartitionNo || effectivePartitionNo === '0' || String(effectivePartitionNo).trim() === '' || String(effectivePartitionNo).trim() === '-';
  const effectiveIsMainProperty = isApartment ? (propIsMainProperty !== undefined ? propIsMainProperty : (property?.isMainProperty ?? isPartitionEmptyOrMain)) : false;
  const effectivePropertyTypeId = property?.propertyTypeId ?? propPropertyTypeId;
  const effectiveSocietyDetailId = property?.societyDetailId ?? propSocietyDetailId;

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const { confirm } = useConfirm();
  const { isDrawerOpen, drawerInitialCategoryIndex, openDrawer, closeDrawer } =
    useMediaDrawerState();
  const { togglePanel } = useMediaPanel();

  const [fetchedWings, setFetchedWings] = useState<WingWiseWingDetails[]>([]);

  const effectiveWings = React.useMemo(() => {
    if (wings && wings.length > 0) return wings;
    return fetchedWings;
  }, [wings, fetchedWings]);

  const [activeWingParams, setActiveWingParams] = useState<{
    wingId: number | null;
    wingDetailId: number | null;
    societyId: number | null;
  } | null>(null);

  useEffect(() => {
    const handleParamsChange = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, string | null>>).detail;
      if (!detail) return;
      const wId = detail.wingId ? Number(detail.wingId) : null;
      const wdId = detail.wingDetailId ? Number(detail.wingDetailId) : null;
      const sId = (detail.societyDetailId || detail.societyId) ? Number(detail.societyDetailId || detail.societyId) : null;
      setActiveWingParams({ wingId: wId, wingDetailId: wdId, societyId: sId });
    };
    window.addEventListener('ptis:wing-params-changed', handleParamsChange);
    return () => window.removeEventListener('ptis:wing-params-changed', handleParamsChange);
  }, []);

  const searchWingName = searchParams?.get('wingName') || searchParams?.get('wingname') || searchParams?.get('wingNo') || searchParams?.get('wingno');
  const selectedWingId = searchParams?.get('wingId');
  const selectedWingDetailId = searchWingDetailId || searchParams?.get('wingDetailId');
  const searchWardId = searchParams?.get('wardId') || searchParams?.get('wardid');
  const queryPropNo = effectivePropertyNo;

  useEffect(() => {
    let isSubscribed = true;
    if (
      effectiveWings.length === 0 &&
      (selectedWingDetailId || searchWingDetailId) &&
      queryPropNo &&
      (searchWardId || effectiveWardNo)
    ) {
      const resolveAndFetchWings = async () => {
        try {
          let targetWardId = searchWardId;
          if (!targetWardId && effectiveWardNo) {
            if (wardIdCache.has(effectiveWardNo)) {
              targetWardId = String(wardIdCache.get(effectiveWardNo)!);
            } else {
              const wardRes = await fetchWardIdAction(effectiveWardNo);
              if (wardRes.success && wardRes.data?.wardId) {
                targetWardId = String(wardRes.data.wardId);
                wardIdCache.set(effectiveWardNo, wardRes.data.wardId);
              }
            }
          }
          if (targetWardId) {
            const cacheKey = `${targetWardId}_${queryPropNo}`;
            if (wingWiseDetailsCache.has(cacheKey)) {
              const cached = wingWiseDetailsCache.get(cacheKey)!;
              if (isSubscribed && cached.length > 0) {
                setFetchedWings(cached);
                return;
              }
            }
            const res = await getWingWiseDetailsAction(targetWardId, queryPropNo);
            if (isSubscribed && res.success && res.data?.wings && res.data.wings.length > 0) {
              setFetchedWings(res.data.wings);
              wingWiseDetailsCache.set(cacheKey, res.data.wings);
            }
          }
        } catch {
          // Non-blocking catch
        }
      };
      void resolveAndFetchWings();
    }
    return () => {
      isSubscribed = false;
    };
  }, [effectiveWings.length, selectedWingDetailId, searchWingDetailId, searchWardId, effectiveWardNo, queryPropNo]);

  const matchedWing = React.useMemo(() => {
    const currentWingDetailId = activeWingParams?.wingDetailId !== undefined
      ? activeWingParams.wingDetailId
      : (propWingDetailId ?? selectedWingDetailId);
    const currentWingId = activeWingParams?.wingId !== undefined ? activeWingParams.wingId : selectedWingId;
    return effectiveWings.find(
      (w) =>
        (currentWingDetailId && String(w.wingDetailId) === String(currentWingDetailId)) ||
        (currentWingId && String(w.wingMasterId) === String(currentWingId)) ||
        (propWingName && (
          (w.wingName && w.wingName.trim().toLowerCase() === propWingName.trim().toLowerCase()) ||
          (w.wingNo && w.wingNo.trim().toLowerCase() === propWingName.trim().toLowerCase()) ||
          (w.wingName && w.wingName.trim().toLowerCase() === `${propWingName.trim().toLowerCase()} wing`) ||
          (w.wingName && w.wingName.trim().toLowerCase() === `wing ${propWingName.trim().toLowerCase()}`)
        )) ||
        (searchWingName && (
          (w.wingName && w.wingName.toLowerCase() === searchWingName.toLowerCase()) ||
          (w.wingNo && w.wingNo.toLowerCase() === searchWingName.toLowerCase()) ||
          (w.wingName && w.wingName.toLowerCase() === `wing ${searchWingName.toLowerCase()}`) ||
          (w.wingName && w.wingName.toLowerCase() === `${searchWingName.toLowerCase()} wing`)
        ))
    );
  }, [effectiveWings, selectedWingId, selectedWingDetailId, propWingDetailId, propWingName, searchWingName, activeWingParams]);

  const effectiveWingDetailId =
    propWingDetailId !== undefined && propWingDetailId !== null
      ? propWingDetailId
      : (activeWingParams?.wingDetailId !== undefined
        ? activeWingParams.wingDetailId
        : (matchedWing?.wingDetailId ??
          (selectedWingDetailId ? Number(selectedWingDetailId) : (!isQuickDataEntry && effectiveWings && effectiveWings.length > 0 ? effectiveWings[0].wingDetailId : null))));

  const effectiveWingName =
    (propWingName && propWingName.trim()) ||
    (matchedWing?.wingName && matchedWing.wingName.trim()) ||
    (matchedWing?.wingNo && `${matchedWing.wingNo} Wing`) ||
    (searchWingName && searchWingName.trim()) ||
    (!isQuickDataEntry && effectiveWings && effectiveWings.length > 0 ? (effectiveWings[0].wingName || (effectiveWings[0].wingNo ? `${effectiveWings[0].wingNo} Wing` : '')) : '');

  const resolvedSocietyDetailId =
    activeWingParams?.societyId ??
    effectiveSocietyDetailId ??
    (searchSocietyDetailId ? Number(searchSocietyDetailId) : null) ??
    matchedWing?.societyId ??
    (effectiveWings && effectiveWings.length > 0 ? effectiveWings[0].societyId : null);

  const isAmenityFlag =
    propPropertyTypeId === 140 ||
    effectivePropertyTypeId === 140 ||
    effectiveCategoryId === 140 ||
    Boolean(
      propertyDescription && (
        propertyDescription.includes('अॅमिनीटी') ||
        propertyDescription.includes('अ‍ॅमिनीटी') ||
        propertyDescription.toLowerCase().includes('amenity')
      )
    ) ||
    Boolean(
      effectivePartitionNo && String(effectivePartitionNo).trim().toUpperCase().startsWith('AM')
    );

  const resolvedEntityType =
    searchEntityType ||
    (isAmenityFlag
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
    wings: effectiveWings,
    wingName: effectiveWingName,
    wingDetailId: effectiveWingDetailId,
    isMainProperty: effectiveIsMainProperty,
    categoryId: effectiveCategoryId,
    propertyTypeId: effectivePropertyTypeId,
    propertyDescription,
    partitionNo: effectivePartitionNo,
    entityType: resolvedEntityType,
    isAmenity: isAmenityFlag,
    societyPhotoFallbackGuid: societyBuildingPhotoGuid,
    societyPhotoFallbackUrl: societyPhotoUrl,
    societyLatitude,
    societyLongitude,
    isQuickDataEntry,
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
    if (isPanelLoading) {
      resetHoverPreview();
    }
  }, [isPanelLoading, resetHoverPreview]);

  // Listen for media update events (e.g., photo plan uploads/changes) to refetch photos live
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMediaUpdated = async (event: Event) => {
      const customEvent = event as CustomEvent<{ propertyId?: number }>;
      const updatedPropId = customEvent.detail?.propertyId;
      if (updatedPropId && effectiveId && updatedPropId !== effectiveId) return;

      if (effectiveId && effectiveId > 0) {
        try {
          const promises: Promise<unknown>[] = [
            getPhotoSlotsAction(effectiveId),
            getPropertyPhotosAction(effectiveId),
          ];

          if (effectiveWingDetailId && effectiveWingDetailId > 0) {
            promises.push(getWingPhotoTypesWithStatusAction(effectiveWingDetailId));
            promises.push(getPhotosByWingAction(effectiveWingDetailId));
          } else {
            promises.push(Promise.resolve({ success: true, data: [] }));
            promises.push(Promise.resolve({ success: true, data: [] }));
          }

          if (resolvedSocietyDetailId && resolvedSocietyDetailId > 0) {
            promises.push(getSocietyPhotoTypesWithStatusAction(resolvedSocietyDetailId));
            promises.push(getPhotosBySocietyAction(resolvedSocietyDetailId));
          } else {
            promises.push(Promise.resolve({ success: true, data: [] }));
            promises.push(Promise.resolve({ success: true, data: [] }));
          }

          const [slotsRes, photosRes, wingSlotsRes, wingPhotosRes, socSlotsRes, socPhotosRes] = await Promise.all(promises);
          const sRes = slotsRes as { success: boolean; data?: PropertyPhotoTypeWithStatusDto[] };
          const pRes = photosRes as { success: boolean; data?: PropertyPhotoDto[] };

          if (pRes?.success && Array.isArray(pRes.data)) {
            const fetchedPhotos = [...pRes.data];
            const wPhotosRes = wingPhotosRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
            if (wPhotosRes?.success && Array.isArray(wPhotosRes.data)) {
              const mappedWingPhotos = wPhotosRes.data.map((wp: Record<string, unknown>) => ({
                propertyPhotoId: Number(wp.wingPhotoId || wp.propertyPhotoId || 0),
                propertyId: Number(wp.wingId || wp.propertyId || 0),
                photoTypeId: Number(wp.photoTypeId || 0),
                photoTypeCode: String(wp.photoTypeCode || ''),
                photoTypeName: String(wp.photoTypeName || ''),
                displayOrder: Number(wp.displayOrder || 0),
                remarks: wp.remarks ? String(wp.remarks) : undefined,
                documentBindingId: wp.documentBindingId ? Number(wp.documentBindingId) : undefined,
                documentGuid: wp.documentGuid ? String(wp.documentGuid) : undefined,
                fileName: wp.fileName ? String(wp.fileName) : undefined,
                mimeType: wp.mimeType ? String(wp.mimeType) : undefined,
                viewUrl: wp.viewUrl ? String(wp.viewUrl) : undefined,
                downloadUrl: wp.downloadUrl ? String(wp.downloadUrl) : undefined,
                wingDetailId: wp.wingDetailId ? Number(wp.wingDetailId) : undefined,
                wingName: wp.wingName ? String(wp.wingName) : undefined,
              }));
              mappedWingPhotos.forEach((wp) => {
                const existingIdx = fetchedPhotos.findIndex(
                  (p) =>
                    p.propertyPhotoId === wp.propertyPhotoId &&
                    (p.wingDetailId === wp.wingDetailId || (!p.wingDetailId && !wp.wingDetailId))
                );
                if (existingIdx !== -1) {
                  fetchedPhotos[existingIdx] = { ...fetchedPhotos[existingIdx], ...wp };
                } else {
                  fetchedPhotos.push(wp as PropertyPhotoDto);
                }
              });
            }

            const sPhotosRes = socPhotosRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
            if (sPhotosRes?.success && Array.isArray(sPhotosRes.data)) {
              const mappedSocPhotos = sPhotosRes.data.map((sp: Record<string, unknown>) => ({
                propertyPhotoId: Number(sp.societyPhotoId || sp.propertyPhotoId || 0),
                propertyId: Number(sp.societyId || sp.propertyId || 0),
                photoTypeId: Number(sp.photoTypeId || 0),
                photoTypeCode: String(sp.photoTypeCode || ''),
                photoTypeName: String(sp.photoTypeName || ''),
                displayOrder: Number(sp.displayOrder || 0),
                remarks: sp.remarks ? String(sp.remarks) : undefined,
                documentBindingId: sp.documentBindingId ? Number(sp.documentBindingId) : undefined,
                documentGuid: sp.documentGuid ? String(sp.documentGuid) : undefined,
                fileName: sp.fileName ? String(sp.fileName) : undefined,
                mimeType: sp.mimeType ? String(sp.mimeType) : undefined,
                viewUrl: sp.viewUrl ? String(sp.viewUrl) : undefined,
                downloadUrl: sp.downloadUrl ? String(sp.downloadUrl) : undefined,
                societyDetailId: resolvedSocietyDetailId || undefined,
              }));
              mappedSocPhotos.forEach((sp) => {
                const existingIdx = fetchedPhotos.findIndex(
                  (p) =>
                    p.propertyPhotoId === sp.propertyPhotoId &&
                    p.photoTypeCode?.toUpperCase() === sp.photoTypeCode?.toUpperCase()
                );
                if (existingIdx !== -1) {
                  fetchedPhotos[existingIdx] = { ...fetchedPhotos[existingIdx], ...sp };
                } else {
                  fetchedPhotos.push(sp as PropertyPhotoDto);
                }
              });
            }

            setPhotos(fetchedPhotos);
            onPhotosChange?.(fetchedPhotos);
          }

          if (sRes?.success && Array.isArray(sRes.data)) {
            const fetchedSlots = [...sRes.data];
            const wSlotsRes = wingSlotsRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
            if (wSlotsRes?.success && Array.isArray(wSlotsRes.data)) {
              const mappedWingSlots = wSlotsRes.data.map((ws: Record<string, unknown>) => ({
                photoTypeId: Number(ws.photoTypeId),
                photoTypeCode: String(ws.photoTypeCode || ws.photoTypeSlotCode || ''),
                photoTypeName: String(ws.photoTypeName || ws.photoTypeSlotName || ''),
                displayOrder: Number(ws.displayOrder || 0),
                hasPhoto: Boolean(ws.hasPhoto),
                photoCount: Number(ws.photoCount || 0),
                propertyPhotoId: Number(ws.wingPhotoId || ws.propertyPhotoId || 0),
                remarks: ws.remarks ? String(ws.remarks) : undefined,
                documentBindingId: ws.documentBindingId ? Number(ws.documentBindingId) : undefined,
                documentGuid: ws.documentGuid ? String(ws.documentGuid) : undefined,
                fileName: ws.fileName ? String(ws.fileName) : undefined,
                mimeType: ws.mimeType ? String(ws.mimeType) : undefined,
                viewUrl: ws.viewUrl ? String(ws.viewUrl) : undefined,
              }));
              mappedWingSlots.forEach((ws) => {
                const existingIdx = fetchedSlots.findIndex(
                  (s) =>
                    (s.photoTypeCode && ws.photoTypeCode && s.photoTypeCode.toUpperCase() === ws.photoTypeCode.toUpperCase()) ||
                    (s.photoTypeId === ws.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('WING_'))
                );
                if (existingIdx !== -1) {
                  fetchedSlots[existingIdx] = { ...fetchedSlots[existingIdx], ...ws };
                } else {
                  fetchedSlots.push(ws as PropertyPhotoTypeWithStatusDto);
                }
              });
            }

            const sSlotsRes = socSlotsRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
            if (sSlotsRes?.success && Array.isArray(sSlotsRes.data)) {
              const mappedSocSlots = sSlotsRes.data.map((ss: Record<string, unknown>) => ({
                photoTypeId: Number(ss.photoTypeId),
                photoTypeCode: String(ss.photoTypeCode || ss.photoTypeSlotCode || ''),
                photoTypeName: String(ss.photoTypeName || ss.photoTypeSlotName || ''),
                displayOrder: Number(ss.displayOrder || 0),
                hasPhoto: Boolean(ss.hasPhoto),
                photoCount: Number(ss.photoCount || 0),
                propertyPhotoId: Number(ss.societyPhotoId || ss.propertyPhotoId || 0),
                remarks: ss.remarks ? String(ss.remarks) : undefined,
                documentBindingId: ss.documentBindingId ? Number(ss.documentBindingId) : undefined,
                documentGuid: ss.documentGuid ? String(ss.documentGuid) : undefined,
                fileName: ss.fileName ? String(ss.fileName) : undefined,
                mimeType: ss.mimeType ? String(ss.mimeType) : undefined,
                viewUrl: ss.viewUrl ? String(ss.viewUrl) : undefined,
              }));
              mappedSocSlots.forEach((ss) => {
                const existingIdx = fetchedSlots.findIndex(
                  (s) =>
                    (s.photoTypeCode && ss.photoTypeCode && s.photoTypeCode.toUpperCase() === ss.photoTypeCode.toUpperCase()) ||
                    (s.photoTypeId === ss.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('SOCIETY_'))
                );
                if (existingIdx !== -1) {
                  fetchedSlots[existingIdx] = { ...fetchedSlots[existingIdx], ...ss };
                } else {
                  fetchedSlots.push(ss as PropertyPhotoTypeWithStatusDto);
                }
              });
            }
            onPhotoSlotsChange?.(fetchedSlots);
          }
        } catch {
          // Non-blocking catch
        }
      }
    };

    window.addEventListener('ptis:media-updated', handleMediaUpdated);
    return () => window.removeEventListener('ptis:media-updated', handleMediaUpdated);
  }, [effectiveId, effectiveWingDetailId, resolvedSocietyDetailId, setPhotos, onPhotosChange, onPhotoSlotsChange]);

  // Keep PropertyMasterCard thumbnail synchronized with the loaded society / property photo
  useEffect(() => {
    // In apartment society view (main property), only sync when society photo is available.
    // When viewing an individual unit, sync the unit's property photo.
    const photoToSync = effectiveIsMainProperty ? societyPhoto : (propertyPhoto || societyPhoto);
    const syncCategory = effectiveIsMainProperty ? 'Society Place Photo' : (propertyPhotoCategory?.photoTypeName || 'Property Front Photo');
    const syncCode = effectiveIsMainProperty ? (societyPhotoCategory?.photoTypeCode || 'SOCIETY_PLACE') : (propertyPhotoCategory?.photoTypeCode || 'PROPERTY_FRONT');

    if (typeof window !== 'undefined' && photoToSync && (photoToSync.documentGuid || photoToSync.src)) {
      window.dispatchEvent(
        new CustomEvent('ptis:sync-thumbnail', {
          detail: {
            propertyId: effectiveId,
            documentGuid: photoToSync.documentGuid,
            photoUrl: photoToSync.src || photoToSync.fullSrc,
            category: syncCategory,
            photoTypeCode: syncCode,
          },
        })
      );
    }
  }, [effectiveId, societyPhoto, propertyPhoto, effectiveIsMainProperty, propertyPhotoCategory, societyPhotoCategory]);

  const parsedCoords = React.useMemo(() => {
    return extractCoordinates([
      { latitude: initialLatitude, longitude: initialLongitude },
      matchedWing as unknown as Record<string, unknown>,
      ...(Array.isArray(effectiveWings) ? effectiveWings : []).map((w) => w as unknown as Record<string, unknown>),
      property as unknown as Record<string, unknown>,
      { latitude: societyLatitude, longitude: societyLongitude },
    ]);
  }, [initialLatitude, initialLongitude, matchedWing, effectiveWings, property, societyLatitude, societyLongitude]);

  const hasCoords = parsedCoords.hasCoords;
  const effectiveLat = parsedCoords.latitude;
  const effectiveLng = parsedCoords.longitude;
  const waybackReleases =
    initialWaybackReleases && initialWaybackReleases.length > 0
      ? initialWaybackReleases
      : DEFAULT_WAYBACK_RELEASES;
  const cdCategory = categories.find((c) => c.photoTypeCode === 'CHANGE_DETECTION');
  let cdBeforeImg = cdCategory?.images?.[0]?.src || '';
  let cdAfterImg = cdCategory?.images?.[1]?.src || '';
  let cdBeforeLabel = t('media.beforeCustomLabel') || 'Before (Old)';
  let cdAfterLabel = t('media.afterCustomLabel') || 'After (New)';
  let fallbackBeforeUrl = '';
  let fallbackAfterUrl = '';
  if (hasCoords && effectiveLat !== undefined && effectiveLng !== undefined) {
    const tile = latLngToTile(effectiveLat, effectiveLng, 17);
    const beforeRelease = waybackReleases[0] || DEFAULT_WAYBACK_RELEASES[0];
    const afterRelease = waybackReleases[waybackReleases.length - 1] || DEFAULT_WAYBACK_RELEASES[DEFAULT_WAYBACK_RELEASES.length - 1];

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

        let effectiveReturnUrl = currentUrl;
        if (targetSocietyDetailId && effectiveReturnUrl) {
          try {
            const parsedUrl = new URL(effectiveReturnUrl, window.location.origin);
            if (!parsedUrl.searchParams.has('societyDetailId')) {
              parsedUrl.searchParams.set('societyDetailId', String(targetSocietyDetailId));
              effectiveReturnUrl = parsedUrl.toString();
            }
          } catch {
            // Ignore URL parse error
          }
        }

        const effectiveCouncilName =
          _councilName ||
          process.env.NEXT_PUBLIC_COUNCIL_NAME ||
          process.env.COUNCIL_NAME ||
          '';
        const res = await launchPhotoPlanDrawingToolAction(
          effectiveId,
          effectiveCouncilName,
          effectiveReturnUrl,
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
          const isAmenity = Number(data?.propertyTypeId) === 140 || catName.includes('amenity') || isAmenityFlag;
          const isIndividualOrAmenity =
            data?.isIndividualOrAmenity === true ||
            data?.requiresTypeAssignment === false ||
            isAmenity ||
            catName.includes('individual') ||
            catName.includes('industry') ||
            catName.includes('plot') ||
            effectiveCategoryId === 2 ||
            effectiveCategoryId === 3 ||
            effectiveCategoryId === 4;

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
      effectiveCategoryId,
      effectiveWingDetailId,
      resolvedSocietyDetailId,
      isAmenityFlag,
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
    [effectiveId, launchDrawingApp, setIsTypeModalOpen, setPhotos]
  );

  return (
    <>
      {isPanelLoading ? (
        <PropertyMediaPanelSkeleton />
      ) : (
        <div className="h-auto lg:h-full w-full flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 relative overflow-hidden">
          {/* Panel Header with Title and Close Button */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/50 shrink-0 select-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{t('media.mediaGallery') || 'Photo Plan'}</span>
            </div>
            <button
              type="button"
              onClick={togglePanel}
              className="p-1 rounded-md hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Close panel"
              aria-label="Close photo plan panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <PropertyMediaPanelContent
            categories={categories}
            t={t}
            openDrawer={handleOpenDrawer}
            handleImageHover={handleImageHover}
            wings={effectiveWings}
            wingName={effectiveWingName}
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
            isQuickDataEntry={isQuickDataEntry}
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
        </div>
      )}

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
          initialLatitude={hasCoords ? effectiveLat : undefined}
          initialLongitude={hasCoords ? effectiveLng : undefined}
          initialWaybackReleases={waybackReleases}
          onDrawPlan={effectiveIsMainProperty ? undefined : handleCreateClick}
          onRequestTypeModal={() => setIsTypeModalOpen(true)}
          isMainProperty={effectiveIsMainProperty}
          zIndex={130}
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
    </>
  );
}

export default React.memo(PropertyMediaPanel);
