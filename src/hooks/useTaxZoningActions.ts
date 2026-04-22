"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createTaxZoningAction,
  updateTaxZoningAction,
} from "@/app/[locale]/property-tax/taxzoning/actions";
import { ZoningRecord, PreviewRow, Ward } from "@/types/taxzoning.types";
import { PagedResponse } from "@/types/common.types";

export const useTaxZoningActions = (t: (key: string, values?: Record<string, string | number>) => string) => {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleUpdate = async ({
    zone,
    ward,
    previewData,
    records,
    wardsData,
    onSuccess
  }: {
    zone: string;
    ward: string[];
    previewData: PreviewRow[];
    records: ZoningRecord[];
    wardsData: PagedResponse<Ward>;
    onSuccess: () => void;
  }) => {
    try {
      setSaving(true);

      if (ward.length === 1) {
        const wardExists = records.some(r => r.wardId === Number(ward[0]));
        if (!wardExists) {
          const wardData = wardsData.items.find((w: Ward) => String(w.wardId) === ward[0]);
          const wardName = wardData?.wardNo || ward[0];
          toast.error(`${t('messages.wardNotFound')}: ${wardName}. ${t('messages.wardNotFoundDetail')}`);
          return;
        }

        const payload = {
          taxZoneId: Number(zone),
          wardId: Number(ward[0]),
          propertyNo: "",
          fromProperty: previewData[0].propertyNo,
          toProperty: previewData[previewData.length - 1].propertyNo,
          isActive: true,
          updatedBy: 1,
          propertyId: 0,
        };

        const result = await updateTaxZoningAction(payload);
        if (!result.success) {
          toast.error(t(result.message));
          return;
        }
        toast.success(t(result.message));
      } else {
        const validWards: string[] = [];
        const nonExistentWards: string[] = [];
        for (const wardId of ward) {
          if (records.some(r => r.wardId === Number(wardId))) {
            validWards.push(wardId);
          } else {
            const wardData = wardsData.items.find((w: Ward) => String(w.wardId) === wardId);
            nonExistentWards.push(wardData?.wardNo || wardId);
          }
        }

        if (nonExistentWards.length > 0) {
          toast.error(`${t('messages.wardsNotFound')}: ${nonExistentWards.join(', ')}. ${t('messages.wardNotFoundDetail')}`);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        for (const wardId of validWards) {
          try {
            const payload = {
              taxZoneId: Number(zone),
              wardId: Number(wardId),
              propertyNo: "", fromProperty: "", toProperty: "",
              isActive: true, updatedBy: 1, propertyId: 0,
            };
            const result = await updateTaxZoningAction(payload);
            if (result.success) successCount++; else errorCount++;
          } catch (_err) { errorCount++; }
        }

        if (successCount > 0 && errorCount === 0) {
          toast.success(`${t('messages.dbOperationCompleted')} ${successCount} ${t('messages.wardsUpdatedSuccessfully')}`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.warning(`${successCount} ${t('messages.wardsUpdatedSuccessfully')}, ${errorCount} ${t('messages.wardsFailed')}`);
        } else {
          toast.error(t('messages.updateFailed'));
          return;
        }
      }

      router.refresh();
      onSuccess();
    } catch (error) {
      console.error("Tax zoning update failed:", error);
      toast.error(t('messages.somethingWrong'));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async (importedChanges: ZoningRecord[], clearImported: () => void) => {
    if (!importedChanges.length) {
      toast.error(t('messages.noChanges'));
      return;
    }

    try {
      setSaving(true);
      let newCount = 0, updateCount = 0, errorCount = 0;

      for (const row of importedChanges) {
        try {
          const payload = {
            taxZoneId: row.taxZoneId,
            wardId: row.wardId,
            propertyNo: "",
            fromProperty: row.fromProperty,
            toProperty: row.toProperty,
            isActive: true,
            updatedBy: 1,
            propertyId: 0,
          };

          const result = row.status === "New" 
            ? await createTaxZoningAction(payload) 
            : await updateTaxZoningAction(payload);

          if (result.success) {
            if (row.status === "Updated") updateCount++; else newCount++;
          } else {
            errorCount++;
          }
        } catch (_err) { errorCount++; }
      }

      if (newCount > 0 || updateCount > 0) {
        let message = "";
        if (newCount > 0 && updateCount > 0) {
          message = `${t('messages.dbOperationCompleted')} ${newCount} ${t('messages.newRecordsCreatedAnd')} ${updateCount} ${t('messages.recordsUpdatedSuccessfully')}`;
        } else if (newCount > 0) {
          message = `${t('messages.dbOperationCompleted')} ${newCount} ${t('messages.newRecordsCreated')}`;
        } else if (updateCount > 0) {
          message = `${t('messages.dbOperationCompleted')} ${updateCount} ${t('messages.recordsUpdatedSuccessfully')}`;
        }

        if (errorCount > 0) {
          message += `. ⚠️ ${errorCount} ${t('messages.recordsFailed')}`;
          toast.warning(message);
        } else {
          toast.success(message);
        }

        clearImported();
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast.error(t('messages.noRecordsProcessed'));
      }
    } catch (err) {
      console.error("❌ Bulk update critical error:", err);
      toast.error(t('messages.criticalError'));
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleUpdate, handleBulkUpdate };
};
