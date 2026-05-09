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
  setWardAssignments: (updater: (prev: Record<string, { rateSectionNo: string; id: number; description: string }>) => Record<string, { rateSectionNo: string; id: number; description: string }>) => void;
  getRateSectionDisplayLabel: (rateSectionNo: string) => string;
  router: { refresh: () => void };
  t: (key: string, values?: Record<string, string | number>) => string;
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
  setWardAssignments,
  getRateSectionDisplayLabel,
  router,
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
        const assignedLabel = assignment 
          ? (assignment.description 
            ? `${assignment.rateSectionNo} - ${assignment.description}` 
            : getRateSectionDisplayLabel(assignment.rateSectionNo)) 
          : "";
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

      // Optimistically update selectedWards immediately for instant UI feedback
      const newSelectedWards = [...new Set([...selectedWards, ...validWards])];
      setSelectedWards(newSelectedWards);
      setSelectedWardsTotalCount(newSelectedWards.length);

      // Manually update ward assignments for immediate UI feedback
      setWardAssignments(prev => {
        const next = { ...prev };
        validWards.forEach(w => {
          next[w] = { rateSectionNo: selectedZoneNo || "", id: 0, description: "" };
        });
        return next;
      });

      const refreshResult = await refreshSelectedWardsAction(id);
      if (refreshResult.success) {
        setSelectedWards(refreshResult.wardNos);
        setSelectedWardsTotalCount(refreshResult.totalCount);
      }

      setCheckedAvailable(new Set());
      router.refresh();

    } catch {
      toast.error(t("wards.saveError"));
    }

    setLoading(false);
  }, [
    checkedAvailable, rates, selectedZoneNo, wardAssignments, selectedWards,
    setCheckedAvailable, setLoading, setSelectedWards, setSelectedWardsTotalCount,
    setWardAssignments, getRateSectionDisplayLabel, router, t
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

      // Optimistically remove from selectedWards immediately for instant UI feedback
      const newSelectedWards = selectedWards.filter((w: string) => !toMove.includes(w));
      setSelectedWards(newSelectedWards);
      setSelectedWardsTotalCount(newSelectedWards.length);

      // Manually remove from ward assignments for immediate UI feedback
      setWardAssignments(prev => {
        const next = { ...prev };
        toMove.forEach(w => {
          delete next[w];
        });
        return next;
      });

      const refreshResult = await refreshSelectedWardsAction(id);
      if (refreshResult.success) {
        setSelectedWards(refreshResult.wardNos);
        setSelectedWardsTotalCount(refreshResult.totalCount);
      }

      setCheckedSelected(new Set());
      router.refresh();

    } catch {
      toast.error(t("wards.deleteError"));
    }

    setLoading(false);
  }, [
    checkedSelected, rates, selectedZoneNo, setLoading, setSelectedWards, selectedWards,
    setSelectedWardsTotalCount, setCheckedSelected, setWardAssignments, router, t
  ]);

  return { moveToSelected, moveToAvailable };
}
