import { toast } from "sonner";
import { 
  deleteWardAction, 
  createWardAction, 
  createWardRangeAction,
  linkWardsToZoneAction,
  getWardsByZoneAction,
  updateWardAction
} from "@/app/[locale]/property-tax/zone-master/actions";
import { WardItem } from "@/types/wardMaster.types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";
import { ConfirmOptions } from "@/components/common/ConfirmProvider";

interface HandleWardDeleteParams {
  row: WardItem;
  confirm: (options: ConfirmOptions) => void;
  refreshData: () => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

interface HandleWardEditParams {
  row: WardItem;
  searchParams: ReadonlyURLSearchParams;
  selectedZoneId: number | null;
  pathname: string;
  router: AppRouterInstance;
}

interface HandleWardCreateParams {
  wardNo: string;
  description: string;
  sequenceNo?: number;
  isActive: boolean;
  zoneId: number;
  t: (key: string, values?: Record<string, unknown>) => string;
}

interface HandleWardBulkCreateParams {
  prefix: string;
  from: string;
  to: string;
  zoneId: number;
  isActive: boolean;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleWardDelete({
  row,
  confirm,
  refreshData,
  t
}: HandleWardDeleteParams) {
  const wardId = row.id;
  const wardNo = row.wardNo;

  if (!wardId) {
    toast.error(t("messages.invalidWard"));
    return;
  }

  confirm({
    variant: "delete",
    title: t("wardList.deleteTitle"),
    description: t("dialogs.deleteDescription", {
      name: wardNo,
    }),
    confirmText: t("actions.delete"),
    cancelText: t("actions.cancel"),
    onConfirm: async () => {
      try {
        const result = await deleteWardAction(wardId);

        if (result.success) {
          toast.success(t("messages.wardDeleteSuccess"));
          refreshData();
        } else {
          const errorMsg = result.error?.toLowerCase() || "";

          // Check for "in use" or "referenced" errors
          if (
            errorMsg.includes("cannot be deleted") ||
            errorMsg.includes("referenced") ||
            errorMsg.includes("in use") ||
            errorMsg.includes("foreign key") ||
            errorMsg.includes("reference constraint") ||
            errorMsg.includes("dependent") ||
            errorMsg.includes("409")
          ) {
            toast.error(t("wardMessages.wardCannotBeDeleted", { wardNo }));
          } else {
            toast.error(t("messages.wardDeleteError"));
          }
        }
      } catch {
        toast.error(t("messages.wardDeleteException"));
      }
    },
  });
}

export function handleWardEdit({
  row,
  searchParams,
  selectedZoneId,
  pathname,
  router
}: HandleWardEditParams) {
  const params = new URLSearchParams(searchParams.toString());
  if (selectedZoneId !== null) {
    params.set("zoneId", String(selectedZoneId));
  }
  params.set("editWard", String(row.id));
  router.push(`${pathname}?${params.toString()}`);
}

export async function handleWardCreate({
  wardNo,
  description,
  sequenceNo,
  isActive,
  zoneId,
  t
}: HandleWardCreateParams) {
  const result = await createWardAction({
    wardNo,
    description,
    sequenceNo,
    isActive,
    zoneId,
  });

  if (result.success) {
    toast.success(t("createWardMessages.singleCreateSuccess", { name: wardNo }));
    return { success: true };
  } else {
    const errorMsg = result.error || "";
    if (errorMsg.includes("already exists") || errorMsg.includes("duplicate")) {
      return { success: false, isDuplicate: true, error: errorMsg };
    } else {
      toast.error(errorMsg || t("createWardMessages.createError"));
      return { success: false, isDuplicate: false, error: errorMsg };
    }
  }
}

export async function handleWardBulkCreate({
  prefix,
  from,
  to,
  zoneId,
  isActive,
  t
}: HandleWardBulkCreateParams) {
  const result = await createWardRangeAction(
    from,
    to,
    prefix,
    zoneId,
    isActive
  );

  if (!result.success) {
    // Parse error message to show custom duplicate ward message
    const errorMsg = result.error || t("createWardMessages.bulkCreateError");
    
    // Check if error contains ward number (e.g., "UT1 already exists" or similar patterns)
    const wardNoMatch = errorMsg.match(/([A-Z0-9]+)\s+(already|exist|duplicate)/i);
    if (wardNoMatch && wardNoMatch[1]) {
      toast.error(
        t("createWardMessages.duplicateWard", { wardNo: wardNoMatch[1] })
      );
    } else {
      // Show the original error or generic message
      toast.error(errorMsg);
    }
    return { success: false, error: result.error };
  }

  toast.success(
    t("createWardMessages.bulkCreateSuccess", {
      count: result.count || 0,
      from: prefix + from,
      to: prefix + to,
    })
  );

  return { success: true, count: result.count };
}

interface HandleFetchWardsByZoneParams {
  zoneId: number;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleFetchWardsByZone({
  zoneId,
  t
}: HandleFetchWardsByZoneParams) {
  try {
    const result = await getWardsByZoneAction({ id: zoneId, page: 1, pageSize: -1 });
    if (result.success && result.data) {
      return { success: true, wards: result.data.items || [] };
    } else {
      toast.error(result.error || t("wardMessages.failedToFetchWards"));
      return { success: false, wards: [] };
    }
  } catch {
    toast.error(t("wardMessages.failedToFetchWards"));
    return { success: false, wards: [] };
  }
}

interface HandleLinkWardsToZoneParams {
  currentZoneId: number;
  wardNos: string[];
  zoneWardsList: WardItem[];
  viewAllFilteredWards: WardItem[];
  onWardsChanged?: () => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleLinkWardsToZone({
  currentZoneId,
  wardNos,
  zoneWardsList,
  viewAllFilteredWards,
  onWardsChanged,
  t
}: HandleLinkWardsToZoneParams) {
  if (wardNos.length === 0) return { success: false };

  if (!currentZoneId) {
    toast.warning(t("wardMessages.selectZoneToAssign"));
    return { success: false };
  }

  // Check if any selected ward is already in the current zone
  const alreadyInZone: string[] = [];
  for (const wardNo of wardNos) {
    const existingWard = zoneWardsList.find(w => w.wardNo === wardNo);
    if (existingWard) {
      alreadyInZone.push(wardNo);
    }
  }

  if (alreadyInZone.length > 0) {
    const wardDetails = viewAllFilteredWards.find(w => w.wardNo === alreadyInZone[0]);
    const description = wardDetails?.description || alreadyInZone[0];
    toast.error(t("wardMessages.alreadyPresentInCurrentZone", {
      wardNo: alreadyInZone[0],
      description
    }));
    return { success: false };
  }

  try {
    const result = await linkWardsToZoneAction(currentZoneId, wardNos);

    if (!result.success) {
      toast.error(result.error || t("wardMessages.updateError"));
      return { success: false };
    }

    if (result.data?.failedCount && result.data.failedCount > 0) {
      const partialSuccessMessage = t("wardMessages.partialSuccess", {
         success: result.data.successCount,
         failed: result.data.failedCount
       });
       toast.warning(
        partialSuccessMessage === "wardMessages.partialSuccess"
           ? `Successfully linked ${result.data.successCount} ward(s); failed to link ${result.data.failedCount} ward(s).`
           : partialSuccessMessage
      );
    } else {
      toast.success(t("wardMessages.updateSuccess"));
    }

    // Refresh zone wards list
    const refreshResult = await getWardsByZoneAction({ id: currentZoneId, page: 1, pageSize: -1 });
    const updatedWards = refreshResult.success && refreshResult.data ? refreshResult.data.items || [] : [];

    if (onWardsChanged) onWardsChanged();
    
    return { success: true, updatedWards };
  } catch {
    toast.error(t("wardMessages.updateError"));
    return { success: false };
  }
}

interface HandleWardUpdateParams {
  wardId: number;
  wardData: Partial<WardItem>;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleWardUpdate({
  wardId,
  wardData,
  t
}: HandleWardUpdateParams) {
  try {
    const result = await updateWardAction(wardId, wardData);

    if (result.success) {
      toast.success(t("wardForm.updateSuccess", { wardNo: wardData.wardNo }));
      return { success: true };
    } else {
      toast.error(result.error || t("wardForm.updateError"));
      return { success: false, error: result.error };
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : t("messages.unexpectedError"));
    return { success: false, error: error instanceof Error ? error.message : "Unexpected error" };
  }
}
