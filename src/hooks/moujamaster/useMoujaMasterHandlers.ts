import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Mouja } from "@/types/mouja.types";
import { deleteMoujaAction } from "@/app/[locale]/property-tax/moujamaster/action";
import type { ConfirmContextType } from "@/components/common/ConfirmProvider";

type TranslationFunction = ReturnType<typeof import("next-intl").useTranslations>;

interface UseMoujaMasterHandlersProps {
  locale: string;
  t: TranslationFunction;
  tCommon: TranslationFunction;
  confirm: ConfirmContextType['confirm'];
  startTransition: React.TransitionStartFunction;
}

/**
 * Hook for MoujaMaster table action handlers
 * 
 * Handles:
 * - Edit navigation
 * - Delete confirmation and API call
 * 
 * @param props - Handler configuration
 * @returns Action handlers for table rows
 */
export function useMoujaMasterHandlers({
  locale,
  t,
  tCommon,
  confirm,
  startTransition,
}: UseMoujaMasterHandlersProps) {
  const router = useRouter();

  const handleEdit = useCallback(
    (row: Mouja) => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/moujamaster/edit/${row.id}`);
      });
    },
    [router, locale, startTransition]
  );

  const handleDelete = useCallback(
    (row: Mouja) => {
      confirm({
        variant: "delete",
        title: `${row.moujaNo} - ${row.moujaName}`,
        description: `${t("delete.confirmDescription")}`,
        meta: {
          name: row.moujaName,
        },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const result = await deleteMoujaAction(fd);
          if (result.success) {
            toast.success(
              t("success.deleted", { code: row.moujaNo })
            );
            startTransition(() => {
              router.refresh();
            });
          } else {
            let errorMessage = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              errorMessage = t("apiErrors.inUse");
            } else if (result.statusCode === 400) {
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
    [confirm, router, t, tCommon, startTransition]
  );

  return {
    handleEdit,
    handleDelete,
  };
}
