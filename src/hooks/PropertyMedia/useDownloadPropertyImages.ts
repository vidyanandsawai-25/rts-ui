"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/common";
import { DownloadImagesQueryParams } from "@/types/PropertyMedia/PropertyMedia.types";
import { downloadPropertyMediaImages } from "@/lib/api/property-media/propertyMedia.client";
import { useTranslations } from "next-intl";

interface UseDownloadPropertyImagesOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom React Hook to manage state and execution for downloading property media images ZIP archive.
 */
export function useDownloadPropertyImages(options?: UseDownloadPropertyImagesOptions) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const toast = useToast();
  const t = useTranslations("propertyMedia");

  const handleDownloadImages = useCallback(
    async (params: DownloadImagesQueryParams): Promise<boolean> => {
      if (isDownloading) return false;

      if (!params.photoTypeId || !params.category) {
        const validationMsg = "Photo type and Category are required to download images.";
        toast.error(validationMsg);
        setDownloadError(validationMsg);
        return false;
      }

      setIsDownloading(true);
      setDownloadError(null);

      try {
        toast.info(t("uploadDownloadDrawer.success.downloadStarted") || "Preparing download...");
        await downloadPropertyMediaImages(params);
        toast.success(t("uploadDownloadDrawer.success.downloadCompleted") || "Images archive downloaded successfully.");
        options?.onSuccess?.();
        return true;
      } catch (err) {
        const error = err as Error;
        const msg = error.message || t("uploadDownloadDrawer.apiErrors.operationFailed") || "Download failed.";
        setDownloadError(msg);
        toast.error(msg);
        options?.onError?.(error);
        return false;
      } finally {
        setIsDownloading(false);
      }
    },
    [isDownloading, t, options, toast]
  );

  return {
    isDownloading,
    downloadError,
    handleDownloadImages,
  };
}
