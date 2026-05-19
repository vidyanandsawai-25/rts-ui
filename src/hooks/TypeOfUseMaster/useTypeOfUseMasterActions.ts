import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import {
  deleteUseGroup,
  deleteUseType,
  deleteSubType,
  checkTypeHasSubTypes,
  checkGroupHasTypes,
} from "@/app/[locale]/property-tax/typeofusemaster/actions";
import type { UseGroup, UseType, UseSubType } from "@/types/typeOfUse.types";

type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

/**
 * Configuration for delete operation
 */
interface DeleteConfig {
  variant: "delete" | "warning";
  title: string;
  description?: string;
  meta: { name: string };
  confirmText?: string;
  deleteAction: () => Promise<void>;
  successMessage: string;
  errorMessage: string;
  ignoreNextRedirect?: boolean;
}

export function useTypeOfUseMasterActions(t: TranslatorFunction) {
  const router = useRouter();
  const { confirm } = useConfirm();

  /**
   * Generic delete handler that encapsulates the common delete flow
   * Handles confirmation, execution, success/error toasts, and router refresh
   */
  const executeDelete = async (config: DeleteConfig) => {
    confirm({
      variant: config.variant,
      title: config.title,
      description: config.description,
      meta: config.meta,
      confirmText: config.confirmText,
      onConfirm: async () => {
        try {
          await config.deleteAction();
          toast.success(config.successMessage);
          router.refresh();
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : '';
          
          // Ignore Next.js redirect "error" if specified
          if (config.ignoreNextRedirect && errorMsg.includes("NEXT_REDIRECT")) {
            return;
          }
          
          toast.error(errorMsg || config.errorMessage);
        }
      },
    });
  };

  const handleDeleteGroup = async (g: UseGroup) => {
    const groupId = g.typeOfUseGroupId;

    if (!groupId) {
      toast.error(t('messages.invalidGroupRecord'));
      return;
    }

    try {
      // Check if group has types
      const { hasTypes } = await checkGroupHasTypes(groupId);
      
      if (hasTypes) {
        toast.error(t('messages.groupHasTypes'));
        return;
      }

      // If no types, proceed with delete
      executeDelete({
        variant: "delete",
        title: t("messages.deleteConfirmation"),
        meta: { name: g.groupName },
        deleteAction: () => deleteUseGroup(groupId),
        successMessage: t('messages.groupDeletedSuccess', { name: g.groupName }),
        errorMessage: t('messages.groupDeleteFailed'),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to check group dependencies';
      toast.error(errorMsg);
    }
  };

  const handleDeleteType = async (useType: UseType) => {
    const typeId = useType.typeOfUseId;

    if (!typeId) {
      toast.error(t('messages.invalidTypeRecord'));
      return;
    }

    try {
      // Check if type has sub-types
      const { hasSubTypes } = await checkTypeHasSubTypes(typeId);
      
      if (hasSubTypes) {
        toast.error(t('messages.typeHasSubTypes'));
        return;
      }

      // If no sub-types, proceed with delete
      executeDelete({
        variant: "delete",
        title: t("messages.deleteConfirmation"),
        meta: { name: useType.description },
        deleteAction: () => deleteUseType(typeId),
        successMessage: t('messages.typeDeletedSuccess', { name: useType.description }),
        errorMessage: t('messages.typeDeleteFailed'),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to check type dependencies';
      toast.error(errorMsg);
    }
  };

  const handleDeleteSubType = (s: UseSubType) => {
    executeDelete({
      variant: "delete",
      title: t("messages.deleteConfirmation"),
      meta: { name: s.description },
      deleteAction: () => deleteSubType(String(s.subTypeOfUseId)),
      successMessage: t('messages.subTypeDeletedSuccess', { name: s.description }),
      errorMessage: t('messages.subTypeDeleteFailed'),
      ignoreNextRedirect: true,
    });
  };

  return {
    handleDeleteGroup,
    handleDeleteType,
    handleDeleteSubType,
  };
}
