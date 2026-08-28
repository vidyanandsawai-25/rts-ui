"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PropertyType } from "@/types/property-type.types";
import { deletePropertyTypeAction } from "@/app/[locale]/property-tax/propertytype/action";
import type { ConfirmContextType } from "@/components/common/ConfirmProvider";

type TranslationFunction = ReturnType<typeof import("next-intl").useTranslations>;

interface UsePropertyTypeMasterHandlersProps {
  locale: string;
  t: TranslationFunction;
  tCommon: TranslationFunction;
  confirm: ConfirmContextType['confirm'];
  startTransition: React.TransitionStartFunction;
}

/**
 * Hook for PropertyTypeMaster table action handlers
 * 
 * Handles:
 * - Edit navigation
 * - Delete confirmation and API call
 * 
 * @param props - Handler configuration
 * @returns Action handlers for table rows
 */
export function usePropertyTypeMasterHandlers({
  locale,
  t,
  tCommon,
  confirm,
  startTransition,
}: UsePropertyTypeMasterHandlersProps) {
  const router = useRouter();

  const handleEdit = useCallback(
    (row: PropertyType) => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/propertytype/edit/${row.id}`);
      });
    },
    [router, locale, startTransition]
  );

  const handleDelete = useCallback(
    (row: PropertyType) => {
      confirm({
        variant: "delete",
        title: `${t("list.table.propertyDescription")}: ${row.propertyDescription}`,
        description: `${t("delete.confirmDescription")}`,
        meta: {
          name: row.propertyDescription,
        },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const result = await deletePropertyTypeAction(fd);
          if (result.success) {
            toast.success(
              t("success.deleted", { description: row.propertyDescription })
            );
            startTransition(() => {
              router.refresh();
            });
          } else {
            // Prefer the backend's specific message (e.g. linked property count)
            // over generic fallbacks based on status code
            let errorMessage = tCommon("errors.deleteError");
            const linkedCount = result.message?.match(/linked to (\d+) propert/i)?.[1];

            if (result.statusCode === 404) {
              errorMessage = t("apiErrors.notFound");
            } else if (linkedCount) {
              errorMessage = t("apiErrors.linkedToProperties", { count: linkedCount });
            } else if (result.message) {
              errorMessage = result.message;
            } else if (result.statusCode === 409) {
              errorMessage = t("apiErrors.referredInAutoWardEntry");
            } else if (result.statusCode === 400) {
              errorMessage = t("apiErrors.validationError");
            }
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, router, t, tCommon, startTransition]
  );

  return {
    handleEdit,
    handleDelete,
  };
}
