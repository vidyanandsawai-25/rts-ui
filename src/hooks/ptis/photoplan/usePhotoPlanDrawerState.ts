/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import { mergeCategories, areCategoriesEqual } from '@/lib/utils/ptis-photo-plan-localization';
import { downloadDocumentClient } from '@/lib/utils/document-client-utils';
import { usePhotoPlanMutations } from './usePhotoPlanMutations';
import { useMediaDrawerState } from './useMediaDrawerState';
import type { PropertyPhotoDto } from '@/types/photoplan.types';
import { getPhotosByPropertyAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { getPhotosByWingAction } from '@/app/[locale]/property-tax/ptis/WingPhoto.action';
import { getPhotosBySocietyAction } from '@/app/[locale]/property-tax/ptis/SocietyPhoto.action';

export interface UsePhotoPlanDrawerStateProps {
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  onPhotosChange?: (photos: PropertyPhotoDto[]) => void;
  propertyId?: number;
  wingDetailId?: number | null;
  societyId?: number | null;
  wingName?: string | null;
  initialCategoryIndex?: number;
  fullyLoadedIds: Set<number>;
  onFullyLoadedIdsChange: (ids: Set<number>) => void;
  onRequestTypeModal?: () => void;
  isMainProperty?: boolean;
}

export function usePhotoPlanDrawerState({
  categories,
  onCategoriesChange,
  onPhotosChange,
  propertyId,
  wingDetailId,
  societyId,
  wingName,
  initialCategoryIndex = 0,
  fullyLoadedIds,
  onFullyLoadedIdsChange,
  onRequestTypeModal,
  isMainProperty = false,
}: UsePhotoPlanDrawerStateProps) {
  const { openDrawer } = useMediaDrawerState();
  const searchParams = useSearchParams();

  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedCategoryIndex, setSelectedCategoryIndexState] = useState(() =>
    initialCategoryIndex >= 0 && initialCategoryIndex < categories.length ? initialCategoryIndex : 0
  );

  const initialCat = categories[selectedCategoryIndex];
  const initialHasImages = initialCat?.images && initialCat.images.length > 0;

  const [selectedImageIndex, setSelectedImageIndexState] = useState<number | null>(() => {
    const val = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('selectedImageIndex') ?? searchParams.get('selectedImageIndex'))
      : searchParams.get('selectedImageIndex');
    if (val !== null) {
      const parsed = parseInt(val, 10);
      return !isNaN(parsed) ? parsed : (initialHasImages ? initialCat.images.length - 1 : null);
    }
    return initialHasImages ? initialCat.images.length - 1 : null;
  });

  const [viewMode, setViewModeState] = useState<'grid' | 'viewer' | 'compare'>(() => {
    const val = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('viewMode') ?? searchParams.get('viewMode'))
      : searchParams.get('viewMode');
    if (val === 'grid' || val === 'viewer' || val === 'compare') return val;
    if (initialCat?.photoTypeCode === 'CHANGE_DETECTION') {
      return initialHasImages ? 'compare' : 'grid';
    }
    return initialHasImages ? 'viewer' : 'grid';
  });

  const [rotation, setRotation] = useState(0);

  const [cachedCategories, setCachedCategories] = useState<PhotoCategory[]>(() =>
    categories.map((cat) => ({ ...cat, images: cat.images || [] }))
  );
  const [prevCategories, setPrevCategories] = useState<PhotoCategory[]>(categories);

  const categoriesRef = useRef(categories);
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  function normalizeToPropertyPhoto(item: Record<string, unknown>, fallbackPropId: number): PropertyPhotoDto {
    return {
      propertyPhotoId: Number(item.propertyPhotoId || item.societyPhotoId || item.wingPhotoId || 0),
      propertyId: Number(item.propertyId || fallbackPropId || 0),
      photoTypeId: Number(item.photoTypeId || 0),
      photoTypeCode: String(item.photoTypeCode || ''),
      photoTypeName: String(item.photoTypeName || ''),
      displayOrder: Number(item.displayOrder || 1),
      remarks: item.remarks ? String(item.remarks) : undefined,
      documentBindingId: item.documentBindingId ? Number(item.documentBindingId) : undefined,
      documentGuid: item.documentGuid ? String(item.documentGuid) : undefined,
      fileName: item.fileName ? String(item.fileName) : undefined,
      mimeType: item.mimeType ? String(item.mimeType) : undefined,
      viewUrl: item.viewUrl ? String(item.viewUrl) : undefined,
      downloadUrl: item.downloadUrl ? String(item.downloadUrl) : undefined,
      wingDetailId: item.wingDetailId ? Number(item.wingDetailId) : undefined,
      wingName: item.wingName ? String(item.wingName) : undefined,
      societyDetailId: item.societyDetailId ? Number(item.societyDetailId) : undefined,
    };
  }

  const loadPhotos = useCallback(async () => {
    if (!propertyId) return;
    setIsLoadingPhotos(true);
    setFetchError(null);
    try {
      const [propRes, wingRes, socRes] = await Promise.all([
        getPhotosByPropertyAction(propertyId),
        wingDetailId ? getPhotosByWingAction(wingDetailId) : Promise.resolve(null),
        societyId ? getPhotosBySocietyAction(societyId) : Promise.resolve(null),
      ]);
      const fetchedPhotos: PropertyPhotoDto[] = [];
      if (propRes.success && propRes.data) fetchedPhotos.push(...propRes.data);
      if (wingRes?.success && wingRes.data) {
        wingRes.data.forEach((wp) => {
          const norm = normalizeToPropertyPhoto(wp as unknown as Record<string, unknown>, propertyId);
          const isPlan = norm.photoTypeCode?.toUpperCase().includes('PLAN') || norm.photoTypeId === 13;
          if (isPlan) return;
          if (!fetchedPhotos.some((p) => (p.documentGuid && p.documentGuid === norm.documentGuid) || (p.propertyPhotoId && p.propertyPhotoId === norm.propertyPhotoId))) {
            fetchedPhotos.push(norm);
          }
        });
      }
      if (socRes?.success && socRes.data) {
        socRes.data.forEach((sp) => {
          const norm = normalizeToPropertyPhoto(sp as unknown as Record<string, unknown>, propertyId);
          const isPlan = norm.photoTypeCode?.toUpperCase().includes('PLAN') || norm.photoTypeId === 13;
          if (isPlan) return;
          if (!fetchedPhotos.some((p) => (p.documentGuid && p.documentGuid === norm.documentGuid) || (p.propertyPhotoId && p.propertyPhotoId === norm.propertyPhotoId))) {
            fetchedPhotos.push(norm);
          }
        });
      }

      onPhotosChange?.(fetchedPhotos);

      const allCatIds = new Set(categoriesRef.current.map((c) => c.photoTypeId));
      onFullyLoadedIdsChange?.(allCatIds);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [propertyId, wingDetailId, societyId, onPhotosChange, onFullyLoadedIdsChange]);

  useEffect(() => {
    if (!propertyId) return;
    let isSubscribed = true;

    if (fullyLoadedIds.size === 0) {
      setIsLoadingPhotos(true);
      setFetchError(null);
      Promise.all([
        getPhotosByPropertyAction(propertyId),
        wingDetailId ? getPhotosByWingAction(wingDetailId) : Promise.resolve(null),
        societyId ? getPhotosBySocietyAction(societyId) : Promise.resolve(null),
      ])
        .then(([propRes, wingRes, socRes]) => {
          if (!isSubscribed) return;
          const fetchedPhotos: PropertyPhotoDto[] = [];
          if (propRes.success && propRes.data) fetchedPhotos.push(...propRes.data);
          if (wingRes?.success && wingRes.data) {
            wingRes.data.forEach((wp) => {
              const norm = normalizeToPropertyPhoto(wp as unknown as Record<string, unknown>, propertyId);
              const isPlan = norm.photoTypeCode?.toUpperCase().includes('PLAN') || norm.photoTypeId === 13;
              if (isPlan) return;
              if (!fetchedPhotos.some((p) => (p.documentGuid && p.documentGuid === norm.documentGuid) || (p.propertyPhotoId && p.propertyPhotoId === norm.propertyPhotoId))) {
                fetchedPhotos.push(norm);
              }
            });
          }
          if (socRes?.success && socRes.data) {
            socRes.data.forEach((sp) => {
              const norm = normalizeToPropertyPhoto(sp as unknown as Record<string, unknown>, propertyId);
              const isPlan = norm.photoTypeCode?.toUpperCase().includes('PLAN') || norm.photoTypeId === 13;
              if (isPlan) return;
              if (!fetchedPhotos.some((p) => (p.documentGuid && p.documentGuid === norm.documentGuid) || (p.propertyPhotoId && p.propertyPhotoId === norm.propertyPhotoId))) {
                fetchedPhotos.push(norm);
              }
            });
          }

          onPhotosChange?.(fetchedPhotos);

          const allCatIds = new Set(categoriesRef.current.map((c) => c.photoTypeId));
          onFullyLoadedIdsChange?.(allCatIds);
        })
        .catch((err) => {
          if (isSubscribed) {
            setFetchError(err instanceof Error ? err.message : 'Failed to load photos');
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setIsLoadingPhotos(false);
          }
        });
    } else {
      setIsLoadingPhotos(false);
    }

    return () => {
      isSubscribed = false;
    };
  }, [propertyId, wingDetailId, societyId, fullyLoadedIds.size, onPhotosChange, onFullyLoadedIdsChange]);

  const prevDrawerPropIdRef = useRef(propertyId);
  useEffect(() => {
    if (propertyId !== prevDrawerPropIdRef.current) {
      prevDrawerPropIdRef.current = propertyId;
      setSelectedCategoryIndexState(0);
      setSelectedImageIndexState(null);
    }
  }, [propertyId]);

  if (!areCategoriesEqual(categories, prevCategories)) {
    const merged = mergeCategories(cachedCategories, categories);
    const prevActiveCat = prevCategories[selectedCategoryIndex];
    const nextActiveCat = merged[selectedCategoryIndex];
    const prevCount = prevActiveCat?.images?.length ?? 0;
    const nextCount = nextActiveCat?.images?.length ?? 0;

    setPrevCategories(categories);
    setCachedCategories(merged);

    if (nextCount > prevCount && nextCount > 0) {
      setSelectedImageIndexState(nextCount - 1);
      setViewModeState('viewer');
    } else if (selectedImageIndex !== null && nextCount > 0 && selectedImageIndex >= nextCount) {
      setSelectedImageIndexState(nextCount - 1);
    } else if (nextCount === 0) {
      setSelectedImageIndexState(null);
    }
  }

  const updateUrlParams = useCallback((newParams: Record<string, string | null>) => {
    if (typeof window === 'undefined') return;
    const current = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) current.delete(key);
      else current.set(key, value);
    });
    window.history.replaceState(null, '', `${window.location.pathname}?${current.toString()}`);
  }, []);

  const setSelectedImageIndex = useCallback((idx: number | null) => setSelectedImageIndexState(idx), [setSelectedImageIndexState]);

  const setViewMode = useCallback((mode: 'grid' | 'viewer' | 'compare') => setViewModeState(mode), [setViewModeState]);

  const setSelectedCategoryIndex = useCallback((idx: number) => {
    setSelectedCategoryIndexState(idx);
    const targetCat = cachedCategories[idx];
    const hasImgs = targetCat?.images && targetCat.images.length > 0;
    const nextImgIdx = hasImgs ? targetCat.images.length - 1 : null;
    const nextViewMode = targetCat?.photoTypeCode === 'CHANGE_DETECTION'
      ? (hasImgs ? 'compare' : 'grid')
      : (hasImgs ? 'viewer' : 'grid');

    setSelectedImageIndexState(nextImgIdx);
    setViewModeState(nextViewMode);
  }, [cachedCategories, setSelectedCategoryIndexState, setSelectedImageIndexState, setViewModeState]);

  const setViewerIndexAndMode = useCallback((idx: number | null, mode: 'grid' | 'viewer' | 'compare') => {
    setSelectedImageIndexState(idx);
    setViewModeState(mode);
    updateUrlParams({
      photoCategoryIndex: selectedCategoryIndex.toString(),
      selectedImageIndex: idx !== null ? idx.toString() : null,
      viewMode: mode,
    });
  }, [setSelectedImageIndexState, setViewModeState, selectedCategoryIndex, updateUrlParams]);

  const [prevInitialCategoryIndex, setPrevInitialCategoryIndex] = useState(initialCategoryIndex);
  if (initialCategoryIndex !== prevInitialCategoryIndex) {
    setPrevInitialCategoryIndex(initialCategoryIndex);
    setSelectedCategoryIndexState(initialCategoryIndex);
    const targetCat = categories[initialCategoryIndex >= 0 && initialCategoryIndex < categories.length ? initialCategoryIndex : 0];
    const hasImages = targetCat?.images && targetCat.images.length > 0;
    let targetIdx: number | null = hasImages ? targetCat.images.length - 1 : null;
    let targetMode: 'grid' | 'viewer' | 'compare' = targetCat?.photoTypeCode === 'CHANGE_DETECTION' ? (hasImages ? 'compare' : 'grid') : (hasImages ? 'viewer' : 'grid');
    const selParam = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('selectedImageIndex') ?? searchParams.get('selectedImageIndex'))
      : searchParams.get('selectedImageIndex');
    if (selParam !== null && !isNaN(parseInt(selParam, 10))) targetIdx = parseInt(selParam, 10);
    const modeParam = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('viewMode') ?? searchParams.get('viewMode'))
      : searchParams.get('viewMode');
    if (modeParam === 'grid' || modeParam === 'viewer' || modeParam === 'compare') targetMode = modeParam;
    setSelectedImageIndexState(targetIdx);
    setViewModeState(targetMode);
  }

  useEffect(() => {
    updateUrlParams({
      photoCategoryIndex: selectedCategoryIndex.toString(),
      selectedImageIndex: selectedImageIndex !== null ? selectedImageIndex.toString() : null,
      viewMode,
    });
  }, [selectedCategoryIndex, selectedImageIndex, viewMode, updateUrlParams]);

  const activeCategory = cachedCategories[selectedCategoryIndex], activeCategoryId = activeCategory?.photoTypeId;

  const handleUpdate = useCallback((newCats: PhotoCategory[]) => {
    setPrevCategories(newCats);
    setCachedCategories(newCats);
    onCategoriesChange(newCats);
  }, [onCategoriesChange]);

  const selectedWingDetailId =
    wingDetailId ?? (searchParams.get('wingDetailId') ? Number(searchParams.get('wingDetailId')) : null);
  const selectedSocietyId =
    societyId ??
    (searchParams.get('societyId')
      ? Number(searchParams.get('societyId'))
      : searchParams.get('societyDetailId')
      ? Number(searchParams.get('societyDetailId'))
      : searchParams.get('societydetailid')
      ? Number(searchParams.get('societydetailid'))
      : null);
  const selectedWingName = wingName ?? searchParams.get('wingName') ?? null;

  const mutations = usePhotoPlanMutations({
    propertyId,
    wingDetailId: selectedWingDetailId,
    societyId: selectedSocietyId,
    wingName: selectedWingName,
    categories: cachedCategories,
    onCategoriesChange: handleUpdate,
    selectedCategoryIndex,
    selectedImageIndex,
    setSelectedImageIndex,
    viewMode,
    setViewMode,
    setViewerIndexAndMode,
    onRequestTypeModal,
    isMainProperty,
  });

  const { handleAddPhoto } = mutations;

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      handleAddPhoto();
      updateUrlParams({ action: null });
    }
  }, [searchParams, handleAddPhoto, updateUrlParams]);

  const handleNext = useCallback(() => {
    if (selectedImageIndex !== null && activeCategory) {
      setRotation(0);
      setSelectedImageIndex((selectedImageIndex + 1) % activeCategory.images.length);
    }
  }, [selectedImageIndex, activeCategory, setSelectedImageIndex]);

  const handlePrev = useCallback(() => {
    if (selectedImageIndex !== null && activeCategory) {
      setRotation(0);
      const len = activeCategory.images.length;
      setSelectedImageIndex((selectedImageIndex - 1 + len) % len);
    }
  }, [selectedImageIndex, activeCategory, setSelectedImageIndex]);

  const handleDownload = useCallback(() => {
    const img = selectedImageIndex !== null ? activeCategory?.images[selectedImageIndex] : null;
    if (!img) return;

    const guid = img.documentGuid || (img.src || img.downloadUrl || '').match(/\/documents\/([^/]+)/)?.[1];
    if (guid) {
      void downloadDocumentClient(
        decodeURIComponent(guid),
        `${img.title.replace(/\s+/g, '_')}.png`
      );
      return;
    }

    const downloadHref = img.downloadUrl || img.src;
    if (downloadHref && !downloadHref.includes('/api/documents/')) {
      Object.assign(document.createElement('a'), {
        href: downloadHref, download: `${img.title.replace(/\s+/g, '_')}.png`
      }).click();
    }
  }, [selectedImageIndex, activeCategory]);

  return {
    selectedCategoryIndex, setSelectedCategoryIndex,
    selectedImageIndex, setSelectedImageIndex,
    viewMode, setViewMode,
    rotation, setRotation,
    cachedCategories, activeCategory, activeCategoryId,
    isLoadingPhotos, fetchError,
    loadPhotos,
    mutations, isUploading: mutations.isUploading,
    handleNext, handlePrev, handleDownload, openDrawer,
  };
}
