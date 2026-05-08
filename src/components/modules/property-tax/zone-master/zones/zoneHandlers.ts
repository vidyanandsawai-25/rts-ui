import { toast } from "sonner";
import { 
  deleteZoneAction, 
  fetchWardsPagedAction,
  createZoneAction,
  updateZoneAction
} from "@/app/[locale]/property-tax/zone-master/actions";
import { ZoneItem } from "@/types/zoneMaster.types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface HandleZoneDeleteParams {
  zoneId: number;
  zoneNo: string;
  description: string;
  zones: ZoneItem[];
  router: AppRouterInstance;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleZoneDelete({
  zoneId,
  zoneNo,
  description,
  zones,
  router,
  t
}: HandleZoneDeleteParams) {
  // Always fetch latest zone details from current zones list
  const zoneObj = zones.find((z) => z.id === zoneId);

  const zoneNoFinal = zoneObj?.zoneNo ?? zoneNo ?? "";
  const descriptionFinal = zoneObj?.description ?? description ?? "";

  const formattedName =
    zoneNoFinal && descriptionFinal
      ? `${zoneNoFinal} - ${descriptionFinal}`
      : zoneNoFinal || descriptionFinal;

  try {
    const result = await deleteZoneAction(zoneId);

    // ✅ Success
    if (result.success) {
      toast.success(
        t("messages.deleteSuccess", { name: formattedName })
      );
      router.refresh();
      return;
    }

    // 🔴 Case 1: Zone has wards (Fetch on demand to prevent API exhaustion on load)
    const wardsRes = await fetchWardsPagedAction(1, 1, undefined, zoneId);
    if (wardsRes && wardsRes.totalCount > 0) {
      toast.error(
        t("messages.zoneHasWardsBriefError", {
          zoneNo: zoneNoFinal,
          description: descriptionFinal,
        })
      );
      return;
    }

    const errorMsg = result.error?.toLowerCase() || "";

    // 🔴 Case 2: Zone used in Rate Section Master
    if (
      errorMsg.includes("rate") ||
      errorMsg.includes("section") ||
      errorMsg.includes("foreign key") ||
      errorMsg.includes("in use")
    ) {
      toast.error(t("messages.zoneInUseError"));
      return;
    }

    // 🔴 Fallback
    toast.error(
      t("messages.zoneDeleteGenericError")
    );
  } catch {
    toast.error(
      t("messages.zoneDeleteGenericError")
    );
  }
}

interface HandleZoneCreateParams {
  zoneData: Partial<ZoneItem>;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleZoneCreate({
  zoneData,
  t
}: HandleZoneCreateParams) {
  try {
    const result = await createZoneAction(zoneData);

    if (result.success) {
      toast.success(t("messages.createSuccess", { name: zoneData.zoneNo }));
      return { success: true, zoneNo: zoneData.zoneNo };
    } else {
      const errorMsg = result.error || "";
      if (errorMsg.includes("already exists") || errorMsg.includes("duplicate")) {
        return { success: false, isDuplicate: true, error: errorMsg };
      } else {
        toast.error(errorMsg || t("messages.createError"));
        return { success: false, isDuplicate: false, error: errorMsg };
      }
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : t("messages.unexpectedError"));
    return { success: false, error: error instanceof Error ? error.message : "Unexpected error" };
  }
}

interface HandleZoneUpdateParams {
  zoneId: number;
  zoneData: Partial<ZoneItem>;
  t: (key: string, values?: Record<string, unknown>) => string;
}

export async function handleZoneUpdate({
  zoneId,
  zoneData,
  t
}: HandleZoneUpdateParams) {
  try {
    const result = await updateZoneAction(zoneId, zoneData);

    if (result.success) {
      const zoneName = zoneData.description || zoneData.zoneNo || "";
      toast.success(t("messages.updateSuccess", { name: zoneName }));
      return { success: true };
    } else {
      toast.error(result.error || t("messages.updateError"));
      return { success: false, error: result.error };
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : t("messages.unexpectedError"));
    return { success: false, error: error instanceof Error ? error.message : "Unexpected error" };
  }
}
