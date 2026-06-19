import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import { mergeCategories } from '@/lib/utils/ptis-photo-plan-localization';
import { downloadDocumentClient } from '@/lib/utils/document-client-utils';
import { usePhotoPlanMutations } from './usePhotoPlanMutations';
import { useMediaDrawerState } from './useMediaDrawerState';

export interface UsePhotoPlanDrawerStateProps {
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  propertyId?: number;
  initialCategoryIndex?: number;
  fullyLoadedIds: Set<number>;
  onFullyLoadedIdsChange: (ids: Set<number>) => void;
}

export function usePhotoPlanDrawerState({
  categories,
  onCategoriesChange,
  propertyId,
  initialCategoryIndex = 0,
}: UsePhotoPlanDrawerStateProps) {
  const { openDrawer } = useMediaDrawerState();
  const searchParams = useSearchParams();

  const [selectedCategoryIndex, setSelectedCategoryIndexState] = useState(() =>
    initialCategoryIndex >= 0 && initialCategoryIndex < categories.length ? initialCategoryIndex : 0
  );

  const initialCat = categories[selectedCategoryIndex];
  const initialHasImages = initialCat?.images && initialCat.images.length > 0;

  const [selectedImageIndex, setSelectedImageIndexState] = useState<number | null>(() => {
    const val = searchParams.get('selectedImageIndex');
    if (val !== null) {
      const parsed = parseInt(val, 10);
      return !isNaN(parsed) ? parsed : (initialHasImages ? 0 : null);
    }
    return initialHasImages ? 0 : null;
  });

  const [viewMode, setViewModeState] = useState<'grid' | 'viewer' | 'compare'>(() => {
    const val = searchParams.get('viewMode');
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

  useEffect(() => {
    if (categories !== prevCategories) {
      Promise.resolve().then(() => {
        setPrevCategories(categories);
        setCachedCategories((prev) => mergeCategories(prev, categories));
      });
    }
  }, [categories, prevCategories]);

  const updateUrlParams = useCallback((newParams: Record<string, string | null>) => {
    if (typeof window === 'undefined') return;
    const current = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) current.delete(key);
      else current.set(key, value);
    });
    window.history.replaceState(null, '', `${window.location.pathname}?${current.toString()}`);
  }, []);

  const setSelectedImageIndex = useCallback((idx: number | null) => setSelectedImageIndexState(idx), []);

  const setViewMode = useCallback((mode: 'grid' | 'viewer' | 'compare') => setViewModeState(mode), []);

  const setSelectedCategoryIndex = useCallback((idx: number) => {
    setSelectedCategoryIndexState(idx);
    const targetCat = cachedCategories[idx];
    const hasImgs = targetCat?.images && targetCat.images.length > 0;
    const nextImgIdx = hasImgs ? 0 : null;
    const nextViewMode = targetCat?.photoTypeCode === 'CHANGE_DETECTION'
      ? (hasImgs ? 'compare' : 'grid')
      : (hasImgs ? 'viewer' : 'grid');

    setSelectedImageIndexState(nextImgIdx);
    setViewModeState(nextViewMode);
  }, [cachedCategories]);

  const setViewerIndexAndMode = useCallback((idx: number | null, mode: 'grid' | 'viewer' | 'compare') => {
    setSelectedImageIndexState(idx);
    setViewModeState(mode);
  }, []);

  const [prevInitialCategoryIndex, setPrevInitialCategoryIndex] = useState(initialCategoryIndex);
  
  if (initialCategoryIndex !== prevInitialCategoryIndex) {
    setPrevInitialCategoryIndex(initialCategoryIndex);
    setSelectedCategoryIndexState(initialCategoryIndex);
    const targetIndex = initialCategoryIndex >= 0 && initialCategoryIndex < categories.length ? initialCategoryIndex : 0;
    const targetCat = categories[targetIndex];
    const hasImages = targetCat?.images && targetCat.images.length > 0;

    let targetIdx: number | null = hasImages ? 0 : null;
    let targetMode: 'grid' | 'viewer' | 'compare' = targetCat?.photoTypeCode === 'CHANGE_DETECTION'
      ? (hasImages ? 'compare' : 'grid')
      : (hasImages ? 'viewer' : 'grid');
    
    const selParam = searchParams.get('selectedImageIndex');
    if (selParam !== null) {
      const parsed = parseInt(selParam, 10);
      if (!isNaN(parsed)) targetIdx = parsed;
    }
    const modeParam = searchParams.get('viewMode');
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

  const handleUpdate = useCallback((newCats: PhotoCategory[]) => { setCachedCategories(newCats); onCategoriesChange(newCats); }, [onCategoriesChange]);

  const mutations = usePhotoPlanMutations({
    propertyId,
    categories: cachedCategories,
    onCategoriesChange: handleUpdate,
    selectedCategoryIndex,
    selectedImageIndex,
    setSelectedImageIndex,
    viewMode,
    setViewMode,
    setViewerIndexAndMode,
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

    if (img.documentGuid) {
      void downloadDocumentClient(
        img.documentGuid,
        `${img.title.replace(/\s+/g, '_')}.png`
      );
      return;
    }

    const downloadHref = img.downloadUrl || img.src;
    if (downloadHref) {
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
    isLoadingPhotos: false, fetchError: null as string | null,
    loadPhotos: useCallback(async () => {}, []),
    mutations, isUploading: mutations.isUploading,
    handleNext, handlePrev, handleDownload, openDrawer,
  };
}

