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
        toast.error(t("messages.fetchPropertiesFailed"));
      }
    } catch {
      toast.error(t("messages.fetchPropertiesFailed"));
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
    onSuccess: (wards: SelectOption[]) => void
  ) => {
    try {
      const result = await getAllWardsAction();
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
    onSuccess: (properties: SelectOption[]) => void
  ) => {
    try {
      const result = await getPropertiesByWardAction(wardId);
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
    handleBulkUpdate,
  };
};
