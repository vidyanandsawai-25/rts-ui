"use client";

import React, { useState, useCallback } from "react";
import { useConfirm, useToast } from "@/components/common";
import {
  UploadDownloadFormModel,
  ExecuteLocalImportPayload,
} from "@/types/PropertyMedia/PropertyMedia.types";
import {
  executeLocalImportAction,
  executeLocalBulkUploadAction,
} from "@/app/[locale]/property-tax/property-media/action";
import { downloadPropertyMediaImages } from "@/lib/api/property-media/propertyMedia.client";

interface UseUploadDownloadSubmitProps {
  formData: UploadDownloadFormModel;
  activeTab: "upload" | "download";
  uploadSourceTab: "server" | "device";
  previewId?: string | null;
  validate: (data: UploadDownloadFormModel) => Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSubmittedOnce: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  closeAndRoute: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  mapApiError: (result: { statusCode?: number; message?: string }) => string;
}

export function useUploadDownloadSubmit({
  formData,
  activeTab,
  uploadSourceTab,
  previewId,
  validate,
  setErrors,
  setSubmittedOnce,
  onSuccess,
  closeAndRoute,
  t,
  mapApiError,
}: UseUploadDownloadSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();
  const toast = useToast();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent): Promise<void> => {
      if (e) e.preventDefault();
      setSubmittedOnce(true);

      const validationErrors = validate(formData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) return;

      if (activeTab === "upload") {
        if (uploadSourceTab === "device" && !previewId) {
          toast.error(
            t("uploadDownloadDrawer.noFilesSelectedError") ||
            "Please browse and upload files first"
          );
          return;
        }

        confirm({
          variant: "update",
          title: t("uploadDownloadDrawer.confirmUploadTitle") || "Upload Property Media",
          description:
            t("uploadDownloadDrawer.confirmUploadDescription") ||
            "Are you sure you want to upload the selected media files?",
          confirmText: t("uploadDownloadDrawer.uploadButton") || "Upload",
          onConfirm: async () => {
            setIsSubmitting(true);
            try {
              if (uploadSourceTab === "server") {
                const payload: ExecuteLocalImportPayload = {
                  photoTypeId: Number(formData.upload.subCategory),
                };

                const result = await executeLocalImportAction(payload);
                if (result.success) {
                  toast.success(t("uploadDownloadDrawer.success.uploaded") || "Files uploaded successfully");
                  onSuccess?.();
                  closeAndRoute();
                } else {
                  toast.error(result.error || t("uploadDownloadDrawer.apiErrors.operationFailed"));
                }
              } else {
                const result = await executeLocalBulkUploadAction({
                  previewId: String(previewId),
                });

                if (result.success) {
                  toast.success(t("uploadDownloadDrawer.success.uploaded") || "Files uploaded successfully");
                  onSuccess?.();
                  closeAndRoute();
                } else {
                  toast.error(result.error || t("uploadDownloadDrawer.apiErrors.operationFailed"));
                }
              }
            } catch (error) {
              toast.error(mapApiError({ message: (error as Error).message }));
            } finally {
              setIsSubmitting(false);
            }
          },
        });
      } else {
        setIsSubmitting(true);
        try {
          const downloadData = formData.download;
          toast.info(t("uploadDownloadDrawer.success.downloadStarted") || "Preparing download...");
          await downloadPropertyMediaImages({
            category: downloadData.category,
            photoTypeId: downloadData.subCategory,
            divisionId: downloadData.zone || undefined,
            wardIds: downloadData.ward?.length ? downloadData.ward : undefined,
            fromPropertyNo: downloadData.propertyFrom || undefined,
            toPropertyNo: downloadData.propertyTo || undefined,
          });
          toast.success(t("uploadDownloadDrawer.success.downloadCompleted") || "Images archive downloaded successfully.");
          onSuccess?.();
          closeAndRoute();
        } catch (error) {
          toast.error(mapApiError({ message: (error as Error).message }));
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [
      formData,
      activeTab,
      uploadSourceTab,
      previewId,
      validate,
      setErrors,
      setSubmittedOnce,
      onSuccess,
      closeAndRoute,
      confirm,
      t,
      mapApiError,
      toast,
    ]
  );

  return {
    isSubmitting,
    handleSubmit,
  };
}
