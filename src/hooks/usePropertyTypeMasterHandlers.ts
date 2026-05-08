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
            // Show appropriate error message based on status code
            let errorMessage = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              // Record linked with another record or in use
              errorMessage = t("apiErrors.inUse");
            } else if (result.statusCode === 400) {
              // Bad request / validation error
              errorMessage = t("apiErrors.validationError");
            } else if (result.statusCode === 404) {
              errorMessage = t("apiErrors.notFound");
            } else if (result.message) {
              errorMessage = result.message;
            }
            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, router, t, tCommon, locale, startTransition]
  );

  return {
    handleEdit,
    handleDelete,
  };
}
