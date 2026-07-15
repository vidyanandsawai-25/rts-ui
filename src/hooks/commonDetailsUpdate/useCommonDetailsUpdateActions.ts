"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import {
  getFieldConfigsAction,
  getFilteredPropertiesAction,
  getWingsAction,
  executeBulkUpdateAction,
  getAllWardsAction,
  getPropertiesByWardAction,
  getAllWingsAction,
  getScopeOptionsAction,
  getScopeCategoryOptionsAction,
  getAllZonesAction,
} from "@/app/[locale]/property-tax/common-details-update/actions";
import {
  BulkUpdateFieldConfig,
  PropertyPreviewRow,
  WingOption,
  PropertyFilterParams,
  BulkUpdatePayload,
  BulkUpdateResponse,
  SelectOption,
} from "@/types/common-details-update/common-details-update.types";
import { ScopeOption } from "@/lib/api/common-details-update/common-details-update.service";
import { PagedResponse } from "@/types/common.types";

export const useCommonDetailsUpdateActions = (
  t: (key: string, values?: Record<string, string | number>) => string
) => {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadFieldConfigs = useCallback(async (
    updateCode: string,
    onSuccess: (configs: BulkUpdateFieldConfig[]) => void
  ) => {
    try {
      const result = await getFieldConfigsAction(updateCode);
      if (result.success) {
        onSuccess(result.data);
      } else {
        toast.error(t("messages.fetchFieldConfigFailed"));
      }
    } catch {
      toast.error(t("messages.configLoadFailed"));
    }
  }, [t]);

  const loadProperties = useCallback(async (
    params: PropertyFilterParams,
    onSuccess: (data: PagedResponse<PropertyPreviewRow>) => void
  ) => {
    try {
      const result = await getFilteredPropertiesAction(params);
      if (result.success) {
        onSuccess(result.data);
      } else {
        toast.error(result.error || t("messages.fetchPropertiesFailed"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("messages.fetchPropertiesFailed"));
    }
  }, [t]);

  const loadWings = useCallback(async (
    wardId: number,
    onSuccess: (wings: WingOption[]) => void
  ) => {
    try {
      const result = await getWingsAction(wardId);
      if (result.success) {
        onSuccess(result.data);
      }
    } catch {
      // Wings are optional — silently ignore
    }
  }, []);

  /**
   * Loads all wards for the Ward Number dropdown.
   * Uses getWards from ward.services with PageSize=-1.
   */
  const loadAllWards = useCallback(async (
    zoneId: number | undefined,
    onSuccess: (wards: SelectOption[]) => void
  ) => {
    try {
      const result = await getAllWardsAction(zoneId);
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((ward) => ({
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
  }, []);

  /**
   * Loads properties for a specific ward.
   * Used to populate From/To Property dropdowns.
   */
  const loadPropertiesByWard = useCallback(async (
    wardId: number,
    updateCode: string,
    onSuccess: (properties: SelectOption[]) => void
  ) => {
    try {
      const result = await getPropertiesByWardAction(wardId, updateCode);
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((prop) => {
          // Format: "propertyNo-partitionNo" or just "propertyNo" if no partition
          // Use same format for both label and value to ensure unique keys
          // Treat '0' or empty as "no partition"
          const normalizedPartitionNo = String(prop.partitionNo ?? "").trim();
          const hasPartition = normalizedPartitionNo !== "" && normalizedPartitionNo !== "0";
          const displayValue = hasPartition
            ? `${prop.propertyNo}-${normalizedPartitionNo}`
            : prop.propertyNo;
          return {
            label: displayValue,
            value: displayValue, // Use unique value to avoid duplicate key errors
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
  }, []);

  /**
   * Loads all wings for the Wing dropdown.
   * Uses GET /Wing?PageSize=-1
   */
  const loadAllWings = useCallback(async (
    onSuccess: (wings: SelectOption[]) => void
  ) => {
    try {
      const result = await getAllWingsAction();
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((wing) => ({
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
  }, []);

  const loadScopeOptions = useCallback(async (
    onSuccess: (options: ScopeOption[]) => void
  ) => {
    try {
      const result = await getScopeOptionsAction();
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        onSuccess([]);
      }
    } catch (error) {
      logger.error("Failed to load scope options", { error: error as Error });
      onSuccess([]);
    }
  }, []);

  const loadScopeCategoryOptions = useCallback(async (
    categoryId: number,
    onSuccess: (option: ScopeOption) => void
  ) => {
    try {
      const result = await getScopeCategoryOptionsAction(categoryId);
      if (result.success && result.data) {
        onSuccess(result.data);
      }
    } catch (error) {
      logger.error("Failed to load scope category options", { error: error as Error });
    }
  }, []);

  const loadAllZones = useCallback(async (
    onSuccess: (zones: SelectOption[]) => void
  ) => {
    try {
      const result = await getAllZonesAction();
      if (result.success && result.data) {
        const items = result.data.items || [];
        const options: SelectOption[] = items.map((zone) => ({
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
  }, []);

  const handleBulkUpdate = useCallback(async (
    apiRoute: string,
    payload: BulkUpdatePayload,
    onSuccess: () => void
  ) => {
    setSaving(true);
    try {
      const result = await executeBulkUpdateAction({ apiRoute, ...payload });

      if (result.success && result.data) {
        const response = result.data as BulkUpdateResponse;
        // Use the message from API response or fallback to translation
        const successMessage = response.message || t("messages.updateSuccess");
        toast.success(successMessage);
        
        // Show additional info if there were failures
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
  }, [t, router]);

  return {
    saving,
    loadFieldConfigs,
    loadProperties,
    loadWings,
    loadAllWards,
    loadPropertiesByWard,
    loadAllWings,
    loadScopeOptions,
    loadScopeCategoryOptions,
    loadAllZones,
    handleBulkUpdate,
  };
};
