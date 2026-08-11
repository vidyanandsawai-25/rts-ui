import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import {
  BulkUpdateFieldConfig,
  PropertyPreviewRow,
  WingOption,
  PropertyFilterParams,
  PropertyFilterByCategoryParams,
  BulkUpdatePayload,
  BulkUpdateResponse,
  SelectOption,
  CommonDetailsUpdateActions,
} from "@/types/common-details-update/common-details-update.types";
import { ScopeOption } from "@/lib/api/common-details-update/common-details-update.service";
import { PagedResponse } from "@/types/common.types";

export const useCommonDetailsUpdateActions = (
  t: (key: string, values?: Record<string, string | number>) => string,
  actions: Partial<CommonDetailsUpdateActions>
) => {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadFieldConfigs = useCallback(async (
    updateCode: string,
    onSuccess: (configs: BulkUpdateFieldConfig[]) => void
  ) => {
    try {
      if (!actions.getFieldConfigsAction) return;
      const result = await actions.getFieldConfigsAction(updateCode);
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        toast.error(t("messages.fetchFieldConfigFailed"));
      }
    } catch {
      toast.error(t("messages.configLoadFailed"));
    }
  }, [t, actions]);

  const loadProperties = useCallback(async (
    params: PropertyFilterParams,
    onSuccess: (data: PagedResponse<PropertyPreviewRow>) => void
  ) => {
    try {
      if (!actions.getFilteredPropertiesAction) return;
      const result = await actions.getFilteredPropertiesAction(params);
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        toast.error(result.error || t("messages.fetchPropertiesFailed"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("messages.fetchPropertiesFailed"));
    }
  }, [t, actions]);

  const loadPreviewListByCategory = useCallback(async (
    params: PropertyFilterByCategoryParams,
    onSuccess: (data: PagedResponse<PropertyPreviewRow>) => void
  ) => {
    try {
      if (!actions.getPreviewListByCategoryAction) return;
      if (!params.UpdateCode) {
        onSuccess({ items: [], totalCount: 0, pageNumber: 1, pageSize: params.PageSize || 10, totalPages: 0, hasPrevious: false, hasNext: false });
        return;
      }
      const result = await actions.getPreviewListByCategoryAction(params);
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        toast.error(result.error || t("messages.fetchPropertiesFailed"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("messages.fetchPropertiesFailed"));
    }
  }, [t, actions]);

  const loadWings = useCallback(async (
    wardId: number,
    onSuccess: (wings: WingOption[]) => void
  ) => {
    try {
      if (!actions.getWingsAction) return;
      const result = await actions.getWingsAction(wardId);
      if (result.success && result.data) {
        onSuccess(result.data);
      }
    } catch {
      // Wings are optional — silently ignore
    }
  }, [actions]);

  const loadAllWards = useCallback(async (
    zoneId: number | undefined,
    onSuccess: (wards: SelectOption[]) => void
  ) => {
    try {
      if (!actions.getAllWardsAction) return;
      const result = await actions.getAllWardsAction(zoneId);
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((ward: { id: number; wardNo: string }) => ({
          label: ward.wardNo,
          value: String(ward.id),
        }));
        onSuccess(options);
      } else {
        logger.warn("Failed to load wards");
        onSuccess([]);
      }
    } catch (error) {
      logger.error("Failed to load all wards", { error: error as Error });
      onSuccess([]);
    }
  }, [actions]);

  const loadPropertiesByWard = useCallback(async (
    wardId: number,
    updateCode: string,
    onSuccess: (properties: SelectOption[]) => void
  ) => {
    try {
      if (!actions.getPropertiesByWardAction) return;
      const result = await actions.getPropertiesByWardAction(wardId, updateCode);
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((prop: { propertyNo: string; partitionNo?: string }) => {
          const normalizedPartitionNo = String(prop.partitionNo ?? "").trim();
          const hasPartition = normalizedPartitionNo !== "" && normalizedPartitionNo !== "0";
          const displayValue = hasPartition
            ? `${prop.propertyNo}-${normalizedPartitionNo}`
            : prop.propertyNo;
          return {
            label: displayValue,
            value: displayValue,
          };
        });
        onSuccess(options);
      } else {
        logger.warn("Failed to load properties by ward");
        onSuccess([]);
      }
    } catch (error) {
      logger.error("Failed to load properties by ward", { error: error as Error });
      onSuccess([]);
    }
  }, [actions]);

  const loadPropertiesByCategory = useCallback(async (
    searchCategory: number,
    zoneId: number | undefined,
    wardId: number,
    pageNumber: number,
    pageSize: number,
    searchTerm?: string,
    propertyFrom?: string,
    onSuccess?: (data: PagedResponse<{ propertyId: number; propertyNo: string; partitionNo: string }>) => void
  ) => {
    try {
      if (!actions.getPropertiesByCategoryAction) return;
      const result = await actions.getPropertiesByCategoryAction(
        searchCategory,
        zoneId,
        wardId,
        pageNumber,
        pageSize,
        searchTerm,
        propertyFrom
      );
      if (result.success && result.data) {
        onSuccess?.(result.data);
      } else {
        logger.warn("Failed to load properties by category");
        onSuccess?.({
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 0,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
        });
      }
    } catch (error) {
      logger.error("Failed to load properties by category", { error: error as Error });
      onSuccess?.({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      });
    }
  }, [actions]);

  const loadAllWings = useCallback(async (
    onSuccess: (wings: SelectOption[]) => void
  ) => {
    try {
      if (!actions.getAllWingsAction) return;
      const result = await actions.getAllWingsAction();
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((wing: { id: number; wingNo: string }) => ({
          label: wing.wingNo,
          value: String(wing.id),
        }));
        onSuccess(options);
      } else {
        logger.warn("Failed to load wings");
        onSuccess([]);
      }
    } catch (error) {
      logger.error("Failed to load all wings", { error: error as Error });
      onSuccess([]);
    }
  }, [actions]);

  const loadScopeOptions = useCallback(async (
    onSuccess: (options: ScopeOption[]) => void
  ) => {
    try {
      if (!actions.getScopeOptionsAction) return;
      const result = await actions.getScopeOptionsAction();
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        onSuccess([]);
      }
    } catch (error) {
      logger.error("Failed to load scope options", { error: error as Error });
      onSuccess([]);
    }
  }, [actions]);

  const loadScopeCategoryOptions = useCallback(async (
    categoryId: number,
    onSuccess: (option: ScopeOption) => void
  ) => {
    try {
      if (!actions.getScopeCategoryOptionsAction) return;
      const result = await actions.getScopeCategoryOptionsAction(categoryId);
      if (result.success && result.data) {
        onSuccess(result.data);
      }
    } catch (error) {
      logger.error("Failed to load scope category options", { error: error as Error });
    }
  }, [actions]);

  const loadAllZones = useCallback(async (
    onSuccess: (zones: SelectOption[]) => void
  ) => {
    try {
      if (!actions.getAllZonesAction) return;
      const result = await actions.getAllZonesAction();
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((zone: { id: number; zoneNo: string }) => ({
          label: zone.zoneNo,
          value: String(zone.id),
        }));
        onSuccess(options);
      } else {
        logger.warn("Failed to load zones");
        onSuccess([]);
      }
    } catch (error) {
      logger.error("Failed to load all zones", { error: error as Error });
      onSuccess([]);
    }
  }, [actions]);

  const handleBulkUpdate = useCallback(async (
    apiRoute: string,
    payload: BulkUpdatePayload | BulkUpdatePayload[],
    onSuccess: () => void
  ) => {
    setSaving(true);
    try {
      if (!actions.executeBulkUpdateAction) return;
      const result = await actions.executeBulkUpdateAction({ apiRoute, payload });

      if (result.success && result.data) {
        const response = result.data as BulkUpdateResponse;
        const successMessage = response.message || t("messages.updateSuccess");
        toast.success(successMessage);

        if (response.items?.failedCount > 0) {
          toast.warning(t("messages.partialUpdate", {
            success: response.items.successCount,
            failed: response.items.failedCount
          }));
        }

        router.refresh();
        onSuccess();
      } else if (!result.success) {
        toast.error(result.error || t("messages.updateFailed"));
      }
    } catch (error) {
      logger.error("Bulk update failed", { apiRoute, error: error as Error });
      toast.error(t("messages.somethingWrong"));
    } finally {
      setSaving(false);
    }
  }, [t, router, actions]);

  return {
    saving,
    loadFieldConfigs,
    loadProperties,
    loadPreviewListByCategory,
    loadWings,
    loadAllWards,
    loadPropertiesByWard,
    loadPropertiesByCategory,
    loadAllWings,
    loadScopeOptions,
    loadScopeCategoryOptions,
    loadAllZones,
    handleBulkUpdate,
  };
};
