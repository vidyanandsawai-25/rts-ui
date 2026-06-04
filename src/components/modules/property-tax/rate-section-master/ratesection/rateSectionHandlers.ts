import { toast } from "sonner";
import { deleteRateSectionAction } from "@/app/[locale]/property-tax/rate-section-master/actions";
import { HandleRateSectionDeleteParams } from "@/types/rateSectionMaster.types";

export async function handleRateSectionDelete({
  rateId,
  rateName,
  rateNo,
  wardCounts,
  searchParams,
  pathname,
  rates,
  router,
  onDeleteSuccess,
  t,
  setDeletingId
}: HandleRateSectionDeleteParams) {
  setDeletingId(rateId);
  const formattedName = rateNo ? `${rateNo} - ${rateName}` : rateName;
  const hasWards = rateId ? (wardCounts[rateId] || 0) > 0 : false;

  try {
    const result = await deleteRateSectionAction(Number(rateId));
    if (result.success) {
      toast.success(t('messages.deleteSuccess', { name: formattedName }));

      const params = new URLSearchParams(searchParams.toString());
      const deletedZone = rateId;
      const currentZone = searchParams.get("zone");

      if (deletedZone && currentZone === deletedZone) {
        const remaining = rates.filter(r => String(r.id) !== deletedZone);

        if (remaining.length > 0 && remaining[0].id) {
          params.set("zone", String(remaining[0].id));
        } else {
          params.delete("zone");
        }
      }

      router.push(`${pathname}?${params.toString()}`);
      router.refresh();

      if (onDeleteSuccess) onDeleteSuccess();
    } else {
      const errorMsg = result.error?.toLowerCase() || result.message?.toLowerCase() || "";
      
      // Check for "referenced by other entities" error message
      if (
        errorMsg.includes("referenced by other entities") ||
        errorMsg.includes("cannot delete") ||
        errorMsg.includes("still referenced") ||
        errorMsg.includes("foreign key") ||
        errorMsg.includes("in use")
      ) {
        // Show custom localized error message
        toast.error(t('messages.inUseError', { name: formattedName }));
      } else if (hasWards) {
        toast.warning(t('dialogs.deleteErrorWards', { name: formattedName }));
      } else {
        toast.error(result.error || result.message || t('messages.deleteError'));
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    const errorLower = msg.toLowerCase();
    
    if (
      errorLower.includes("referenced by other entities") ||
      errorLower.includes("cannot delete") ||
      errorLower.includes("still referenced") ||
      errorLower.includes("foreign key") ||
      errorLower.includes("in use")
    ) {
      // Show custom localized error message
      toast.error(t('messages.inUseError', { name: formattedName }));
    } else if (hasWards) {
      toast.warning(t('dialogs.deleteErrorWards', { name: formattedName }));
    } else {
      toast.error(t('messages.deleteError'));
    }
  } finally {
    setDeletingId(null);
  }
}
