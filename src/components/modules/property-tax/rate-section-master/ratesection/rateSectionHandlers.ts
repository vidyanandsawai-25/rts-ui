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
  const hasWards = rateNo ? (wardCounts[rateNo] || 0) > 0 : false;

  try {
    const result = await deleteRateSectionAction(Number(rateId));
    if (result.success) {
      toast.success(t('messages.deleteSuccess', { name: formattedName }));

      const params = new URLSearchParams(searchParams.toString());
      const deletedZone = rateNo;
      const currentZone = searchParams.get("zone");

      if (deletedZone && currentZone === deletedZone) {
        const remaining = rates.filter(r => r.rateSectionNo !== deletedZone);

        if (remaining.length > 0 && remaining[0].rateSectionNo) {
          params.set("zone", remaining[0].rateSectionNo);
        } else {
          params.delete("zone");
        }
      }

      router.push(`${pathname}?${params.toString()}`);
      router.refresh();

      if (onDeleteSuccess) onDeleteSuccess();
    } else {
      if (hasWards) {
        toast.warning(t('dialogs.deleteErrorWards', { name: formattedName }));
      } else {
        const errorMsg = result.error?.toLowerCase() || "";
        
        if (
          errorMsg.includes("409") || 
          errorMsg.includes("cannot be deleted") || 
          errorMsg.includes("in use") ||
          errorMsg.includes("rate") ||
          errorMsg.includes("foreign key")
        ) {
          toast.warning(t('dialogs.deleteErrorRateMaster', { name: formattedName }));
        } else {
          toast.error(t('messages.deleteError'));
        }
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    const errorLower = msg.toLowerCase();
    
    if (
      errorLower.includes("409") ||
      errorLower.includes("cannot be deleted") ||
      errorLower.includes("record is in use") ||
      errorLower.includes("foreign key")
    ) {
      if (hasWards) {
        toast.warning(t('dialogs.deleteErrorWards', { name: formattedName }));
      } else {
        toast.warning(t('dialogs.deleteErrorRateMaster', { name: formattedName }));
      }
    } else {
      toast.error(t('messages.deleteError'));
    }
  } finally {
    setDeletingId(null);
  }
}
