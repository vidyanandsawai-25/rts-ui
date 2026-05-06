import { useCallback } from "react";
import { toast } from "sonner";
import {
  linkWardsToRateSectionAction,
  deleteSelectedWardsAction,
  refreshSelectedWardsAction
} from "@/app/[locale]/property-tax/rate-section-master/actions";
import { RateItem } from "@/types/rateSectionMaster.types";

interface UseLinkWardActionsParams {
  rates: RateItem[];
  selectedZoneNo: string | undefined;
  wardAssignments: Record<string, { rateSectionNo: string; description?: string }>;
  checkedAvailable: Set<string>;
  selectedWards: string[];
  setCheckedAvailable: (set: Set<string>) => void;
  checkedSelected: Set<string>;
  setCheckedSelected: (set: Set<string>) => void;
  setLoading: (loading: boolean) => void;
  setSelectedWards: (wards: string[]) => void;
  setSelectedWardsTotalCount: (count: number) => void;
  getRateSectionDisplayLabel: (rateSectionNo: string) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

export function useLinkWardActions({
  rates,
  selectedZoneNo,
  wardAssignments,
  checkedAvailable,
  selectedWards,
  setCheckedAvailable,
  checkedSelected,
  setCheckedSelected,
  setLoading,
  setSelectedWards,
  setSelectedWardsTotalCount,
  getRateSectionDisplayLabel,
  t
}: UseLinkWardActionsParams) {

  const moveToSelected = useCallback(async () => {
    const toMove = Array.from(checkedAvailable);

    if (toMove.length === 0) return;

    const selectedRate = rates.find(r => r.rateSectionNo === selectedZoneNo);
    if (!selectedRate?.id) {
      toast.error(t("wards.rateSectionNotFound"));
      return;
    }

    const id = selectedRate.id;
    const blockedWards: string[] = [];
    const validWards: string[] = [];

    toMove.forEach(w => {
      const assignment = wardAssignments[w];
      if (assignment && assignment.rateSectionNo !== selectedZoneNo) {
        blockedWards.push(w);
        return;
      }
      if (!selectedWards.includes(w)) {
        validWards.push(w);
      }
    });

    if (blockedWards.length > 0) {
      if (blockedWards.length === 1) {
        const assignment = wardAssignments[blockedWards[0]];
        const assignedLabel = assignment ? getRateSectionDisplayLabel(assignment.rateSectionNo) : "";
        const selectedLabel = getRateSectionDisplayLabel(selectedZoneNo || "");
        toast.warning(
          t("wards.alreadyPresentInOtherRateSection", {
            wardNo: blockedWards[0],
            rateSectionNo: assignedLabel,
            selectedRateSectionName: selectedLabel
          })
        );
      } else {
        toast.warning(
          t("wards.alreadyAssignedOther", { count: blockedWards.length })
        );
      }
    }

    if (validWards.length === 0) {
      setCheckedAvailable(new Set());
      return;
    }

    setLoading(true);

    try {
      const result = await linkWardsToRateSectionAction(id, validWards);

      if (!result.success) {
        toast.error(result.error || t("wards.saveError"));
        setLoading(false);
        return;
      }

      if (result.data?.hasFailures) {
        toast.warning(
          t("wards.partialSaveSuccess", {
            success: result.data.successCount,
            failed: result.data.failedCount
          })
        );
      } else {
        toast.success(t("wards.saveSuccess"));
      }

      const refreshResult = await refreshSelectedWardsAction(id);
      if (refreshResult.success) {
        setSelectedWards(refreshResult.wardNos);
        setSelectedWardsTotalCount(refreshResult.totalCount);
      }

      setCheckedAvailable(new Set());

    } catch {
      toast.error(t("wards.saveError"));
    }

    setLoading(false);
  }, [
    checkedAvailable, rates, selectedZoneNo, wardAssignments, selectedWards,
    setCheckedAvailable, setLoading, setSelectedWards, setSelectedWardsTotalCount,
    getRateSectionDisplayLabel, t
  ]);

  const moveToAvailable = useCallback(async () => {
    const toMove = Array.from(checkedSelected);

    if (toMove.length === 0) return;

    const selectedRate = rates.find(r => r.rateSectionNo === selectedZoneNo);
    if (!selectedRate?.id) {
      toast.error(t("wards.rateSectionNotFound"));
      return;
    }

    const id = selectedRate.id;

    setLoading(true);

    try {
      const result = await deleteSelectedWardsAction(id, toMove);

      if (!result.success) {
        toast.error(result.error || t("wards.deleteError"));
        setLoading(false);
        return;
      }

      toast.success(t("wards.deleteSuccess", { count: result.deletedCount }));

      const refreshResult = await refreshSelectedWardsAction(id);
      if (refreshResult.success) {
        setSelectedWards(refreshResult.wardNos);
        setSelectedWardsTotalCount(refreshResult.totalCount);
      }

      setCheckedSelected(new Set());

    } catch {
      toast.error(t("wards.deleteError"));
    }

    setLoading(false);
  }, [
    checkedSelected, rates, selectedZoneNo, setLoading, setSelectedWards,
    setSelectedWardsTotalCount, setCheckedSelected, t
  ]);

  return { moveToSelected, moveToAvailable };
}
