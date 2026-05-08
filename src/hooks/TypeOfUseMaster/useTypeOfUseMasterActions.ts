import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import {
  deleteUseTypeWithSubTypes,
  deleteUseGroupWithCascade,
  deleteUseGroup,
  deleteSubType,
} from "@/app/[locale]/property-tax/typeofusemaster/actions";
import type { UseGroup, UseType, UseSubType } from "@/types/typeOfUse.types";
import { countTypesForGroup } from "@/components/modules/property-tax/typeofusemaster/typeOfUseMasterUtils";

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

export function useTypeOfUseMasterActions(t: TranslatorFunction, allTypes: UseType[]) {
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

  const handleDeleteGroup = (g: UseGroup) => {
    const groupId = String(g.typeOfUseGroupId);

    if (!groupId) {
      toast.error(t('messages.invalidGroupRecord'));
      return;
    }

    const typesCount = countTypesForGroup(g, allTypes);
    const hasTypes = typesCount > 0;

    executeDelete({
      variant: hasTypes ? "warning" : "delete",
      title: hasTypes ? t("messages.deleteGroupWithTypesTitle") : t("messages.deleteConfirmation"),
      description: hasTypes ? t("messages.deleteGroupWithTypesDescription") : undefined,
      meta: { name: g.groupName },
      confirmText: hasTypes ? t("messages.deleteAll") : undefined,
      deleteAction: () => hasTypes 
        ? deleteUseGroupWithCascade(Number(groupId))
        : deleteUseGroup(groupId),
      successMessage: t('messages.groupDeletedSuccess', { name: g.groupName }),
      errorMessage: t('messages.groupDeleteFailed'),
    });
  };

  const handleDeleteType = (useType: UseType) => {
    const typeId = String(useType.typeOfUseId);

    if (!typeId) {
      toast.error(t('messages.invalidTypeRecord'));
      return;
    }

    executeDelete({
      variant: "warning",
      title: t("messages.deleteTypeWithSubTypesTitle"),
      description: t("messages.deleteTypeWithSubTypesDescription"),
      meta: { name: useType.description },
      confirmText: t("messages.deleteAll"),
      deleteAction: () => deleteUseTypeWithSubTypes(Number(typeId)),
      successMessage: t('messages.typeDeletedSuccess', { name: useType.description }),
      errorMessage: t('messages.typeDeleteFailed'),
    });
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
