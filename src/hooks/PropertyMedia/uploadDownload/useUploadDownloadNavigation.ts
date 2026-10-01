"use client";

import { useState, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";

interface UseUploadDownloadNavigationProps {
  locale: string;
}

export function useUploadDownloadNavigation({ locale }: UseUploadDownloadNavigationProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/property-media`);
      });
    }, 400);
  }, [router, locale]);

  const handleCancel = useCallback(() => {
    closeAndRoute();
  }, [closeAndRoute]);

  return {
    open,
    setOpen,
    closeAndRoute,
    handleCancel,
  };
}
