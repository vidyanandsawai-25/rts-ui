import { toast } from "sonner";
import { deleteRateSectionDetailAction } from "@/app/[locale]/property-tax/rate-section-master/actions";
import { HandleWardDeleteParams, HandleWardEditParams } from "@/types/rateSectionMaster.types";

export async function handleWardDelete({
  row,
  rateSectionLabel,
  effectiveSelectedRateSection,
  confirm,
  setDeletedIds,
  onWardsChanged,
  t
}: HandleWardDeleteParams) {
  const id = row.id;
  const wardNo = row.wardNo;
  const description = row.description;

  if (id == null || typeof id !== 'number') {
    toast.error(t('wards.invalidRecord'));
    return;
  }

  const displayRateSection = rateSectionLabel || effectiveSelectedRateSection || "";
  const safeWardNo = wardNo ?? "";
  const formattedWardName = description ? `${safeWardNo} - ${description}` : safeWardNo;

  confirm({
    variant: "delete",
    title: t('wards.deleteTitle'),
    description: t('wards.deleteConfirm', { wardNo: safeWardNo, displayZone: displayRateSection }),
    onConfirm: async () => {
      try {
        const result = await deleteRateSectionDetailAction(id);
        if (result.success) {
          setDeletedIds(prev => new Set([...prev, id]));
          toast.success(t('wards.deleteSuccess', { count: 1 }));
          if (onWardsChanged) onWardsChanged();
        } else {
          const errorMsg = result.message?.toLowerCase() || result.error?.toLowerCase() || "";
          
          // Check for "referenced by other entities" or "in use" error message
          if (
            errorMsg.includes("referenced by other entities") ||
            errorMsg.includes("cannot delete") ||
            errorMsg.includes("still referenced") ||
            errorMsg.includes("foreign key") ||
            errorMsg.includes("in use")
          ) {
            // Show custom localized error message
            toast.error(t('wards.inUseError', { wardName: formattedWardName }));
          } else {
            toast.error(result.message || result.error || t('wards.deleteError'));
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
          toast.error(t('wards.inUseError', { wardName: formattedWardName }));
        } else {
          toast.error(t('wards.deleteError'));
        }
      }
    },
  });
}

export function handleWardEdit({ row, searchParams, router }: HandleWardEditParams) {
  const params = new URLSearchParams(searchParams.toString());
  // Handle case-insensitive property names from API
  const wardId = row.wardId ?? (row as Record<string, unknown>)["WardId"];
  const rateSectionDetailsId = row.id ?? (row as Record<string, unknown>)["Id"];

  if (wardId) {
    params.set("ward", String(wardId));
  }

  if (rateSectionDetailsId) {
    params.set("id", String(rateSectionDetailsId));
  }

  params.set("editWard", "");
  router.push(`?${params.toString()}`);
}
