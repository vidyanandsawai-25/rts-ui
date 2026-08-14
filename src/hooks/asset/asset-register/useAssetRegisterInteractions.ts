'use client';

import { useCallback, useState } from 'react';
import type { AssetRegisterRow } from '@/types/asset/asset-register/municipal-asset-register.types';
import type { PropertyPhotoDto } from '@/types/asset/asset-register/media.types';
import { fetchGroupedAssetPhotosAction, fetchSubUnitsByAsset } from '@/app/[locale]/assets/municipal-Asset/asset-register/[categoryId]/action';
import type { AssetRegisterSubUnitItem } from '@/lib/api/asset/asset-register/municipal-asset-register.server.service';
import { mapExpandedSubUnitItems, mapGroupedAssetPhotosToPanelPhotos } from '@/components/modules/assets/municipal-Asset/asset-register/registerMappers';

type ExpandedSubUnit = AssetRegisterSubUnitItem & { isSubUnit?: boolean; parentId?: number };

type UseAssetPhotoPanelParams = {
  isPanelVisible: boolean;
  togglePanel: () => void;
};

export function useAssetPhotoPanel({
  isPanelVisible,
  togglePanel,
}: UseAssetPhotoPanelParams) {
  const [panelPhotos, setPanelPhotos] = useState<PropertyPhotoDto[]>([]);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [activePhotoFetchAssetId, setActivePhotoFetchAssetId] = useState<number | null>(null);

  const openImagePanelByAssetId = useCallback(async (assetId: number) => {
    if (activePhotoFetchAssetId === assetId) {
      return;
    }

    setActivePhotoFetchAssetId(assetId);
    setIsPhotosLoading(true);
    setPanelPhotos([]);
    if (!isPanelVisible) {
      togglePanel();
    }
    try {
      const res = await fetchGroupedAssetPhotosAction(assetId);

      // Prevent race conditions: only update photos if this is still the active asset request
      setActivePhotoFetchAssetId((currentActiveId) => {
        if (currentActiveId === assetId && res?.success && res?.data) {
          const photos = mapGroupedAssetPhotosToPanelPhotos(res.data);
          setPanelPhotos(photos);
        }
        return currentActiveId;
      });
    } catch (error) {
      console.error('Error fetching asset photos:', error);
    } finally {
      setActivePhotoFetchAssetId((prev) => (prev === assetId ? null : prev));
      setIsPhotosLoading(false);
    }
  }, [activePhotoFetchAssetId, isPanelVisible, togglePanel]);

  const handlePanelToggle = useCallback((onClosed?: () => void) => {
    const nextVisible = !isPanelVisible;
    togglePanel();
    if (!nextVisible) {
      onClosed?.();
      setPanelPhotos([]);
    }
  }, [isPanelVisible, togglePanel]);

  const closePanelFromQueryTransition = useCallback(() => {
    togglePanel();
    setPanelPhotos([]);
  }, [togglePanel]);

  return {
    panelPhotos,
    isPhotosLoading,
    openImagePanelByAssetId,
    handlePanelToggle,
    closePanelFromQueryTransition,
  };
}

export function useAssetSubunitExpansion() {
  const [expandedAssets, setExpandedAssets] = useState<Record<number, ExpandedSubUnit[]>>({});
  const [openSubunitRows, setOpenSubunitRows] = useState<Record<number, boolean>>({});
  const [loadingSubunits, setLoadingSubunits] = useState<Record<number, boolean>>({});

  const expandSubUnitsByAssetId = useCallback(async (parentId: number) => {
    setLoadingSubunits((prev) => ({ ...prev, [parentId]: true }));
    try {
      const response = await fetchSubUnitsByAsset(parentId);
      if (response && response.items) {
        setExpandedAssets((prev) => ({
          ...prev,
          [parentId]: mapExpandedSubUnitItems(response.items, parentId),
        }));
        setOpenSubunitRows((prev) => ({ ...prev, [parentId]: true }));
      }
    } catch (error) {
      console.error('Error expanding subunits:', error);
    } finally {
      setLoadingSubunits((prev) => ({ ...prev, [parentId]: false }));
    }
  }, []);

  const handleToggleExpand = useCallback(async (
    parentRow: AssetRegisterRow,
    onToggleQuery?: (parentId: number | null) => void
  ) => {
    const parentId = parentRow.id;
    if (parentId == null) return;

    if (openSubunitRows[parentId]) {
      setOpenSubunitRows((prev) => ({ ...prev, [parentId]: false }));
      onToggleQuery?.(null);
      return;
    }

    onToggleQuery?.(parentId);
    await expandSubUnitsByAssetId(parentId);
  }, [openSubunitRows, expandSubUnitsByAssetId]);

  return {
    expandedAssets,
    openSubunitRows,
    loadingSubunits,
    setOpenSubunitRows,
    handleToggleExpand,
  };
}
