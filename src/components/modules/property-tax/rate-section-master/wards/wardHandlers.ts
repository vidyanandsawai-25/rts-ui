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

  if (id == null || typeof id !== 'number') {
    toast.error(t('wards.invalidRecord'));
    return;
  }

  const displayRateSection = rateSectionLabel || effectiveSelectedRateSection || "";

  confirm({
    variant: "delete",
    title: t('wards.deleteTitle'),
    description: t('wards.deleteConfirm', { wardNo: wardNo || "", displayZone: displayRateSection }),
    onConfirm: async () => {
      try {
        const result = await deleteRateSectionDetailAction(id);
        if (result.success) {
          setDeletedIds(prev => new Set([...prev, id]));
          toast.success(t('wards.deleteSuccess', { count: 1 }));
          if (onWardsChanged) onWardsChanged();
        } else {
          toast.error(result.message || result.error || t('wards.deleteError'));
        }
      } catch {
        toast.error(t('wards.deleteError'));
      }
    },
  });
}

export function handleWardEdit({ row, searchParams, router }: HandleWardEditParams) {
  const params = new URLSearchParams(searchParams.toString());
  const wardId = row.wardId;
  const rateSectionDetailsId = row.id;

  if (wardId) {
    params.set("ward", String(wardId));
  }

  if (rateSectionDetailsId) {
    params.set("id", String(rateSectionDetailsId));
  }

  params.set("editWard", "");
  router.push(`?${params.toString()}`);
}
