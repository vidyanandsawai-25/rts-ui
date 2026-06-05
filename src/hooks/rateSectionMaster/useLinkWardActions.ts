import { useCallback } from "react";
import { toast } from "sonner";
import {
  linkWardsToRateSectionAction,
  deleteSelectedWardsAction,
  refreshSelectedWardsAction,
  getAllWardsForLinkAction,
  getAllRateSectionDetailsForRateSectionAction
} from "@/app/[locale]/property-tax/rate-section-master/actions";
import { RateItem } from "@/types/rateSectionMaster.types";

interface UseLinkWardActionsParams {
  rates: RateItem[];
  allRateSections: RateItem[];
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
  isViewAllSelectAllActive?: boolean;
  isAvailableSelectAllActive?: boolean;
  isRateSectionSelectAllActive?: boolean;
  setViewAllSelectAllLoading?: (loading: boolean) => void;
  setAvailableSelectAllLoading?: (loading: boolean) => void;
  setIsViewAllSelectAllActive?: (active: boolean) => void;
  setIsAvailableSelectAllActive?: (active: boolean) => void;
  setIsRateSectionSelectAllActive?: (active: boolean) => void;
  viewAllSearch?: string;
  availableSearch?: string;
}

export function useLinkWardActions({
  rates: _rates,
  allRateSections,
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
  t,
  isViewAllSelectAllActive = false,
  isAvailableSelectAllActive = false,
  isRateSectionSelectAllActive = false,
  setViewAllSelectAllLoading,
  setAvailableSelectAllLoading,
  setIsViewAllSelectAllActive,
  setIsAvailableSelectAllActive,
  setIsRateSectionSelectAllActive,
  viewAllSearch,
  availableSearch
}: UseLinkWardActionsParams) {

  const moveToSelected = useCallback(async () => {
    // Check if Select All is active for either ViewAll or Available tabs
    const isSelectAllMode = isViewAllSelectAllActive || isAvailableSelectAllActive;
    
    if (isSelectAllMode) {
      // Fetch all wards server-side
      // Use allRateSections (all rate sections) instead of rates (paginated) for lookup
      const selectedRate = allRateSections.find(r => String(r.id) === selectedZoneNo);
      if (!selectedRate?.id) {
        toast.error(t("wards.rateSectionNotFound"));
        return;
      }

      setLoading(true);
      if (isViewAllSelectAllActive && setViewAllSelectAllLoading) {
        setViewAllSelectAllLoading(true);
      }
      if (isAvailableSelectAllActive && setAvailableSelectAllLoading) {
        setAvailableSelectAllLoading(true);
      }

      try {
        // Determine which search term to use
        const searchTerm = isViewAllSelectAllActive ? viewAllSearch : availableSearch;
        
        const result = await getAllWardsForLinkAction(searchTerm);
        if (result.success && result.data) {
          // Filter out wards already in selected or assigned to another rate section
          const wardsToLink = result.data
            .filter(w => !selectedWards.includes(w.wardNo))
            .filter(w => {
              const assignment = wardAssignments[w.wardNo];
              return !assignment || assignment.rateSectionNo === selectedZoneNo;
            })
            .map(w => w.wardNo);

          if (wardsToLink.length === 0) {
            toast.info(t("wards.noWardsToLink"));
            return;
          }

          const linkResult = await linkWardsToRateSectionAction(selectedRate.id, wardsToLink);

          if (!linkResult.success) {
            toast.error(linkResult.error || t("wards.saveError"));
            return;
          }

          if (linkResult.data?.hasFailures) {
            toast.warning(
              t("wards.partialSaveSuccess", {
                success: linkResult.data.successCount,
                failed: linkResult.data.failedCount
              })
            );
          } else {
            toast.success(t("wards.saveSuccess"));
          }

          // Update state
          const newSelectedWards = [...new Set([...selectedWards, ...wardsToLink])];
          setSelectedWards(newSelectedWards);
          setSelectedWardsTotalCount(newSelectedWards.length);

          setWardAssignments(prev => {
            const next = { ...prev };
            wardsToLink.forEach(w => {
              next[w] = { rateSectionNo: selectedZoneNo || "", id: 0, description: "" };
            });
            return next;
          });

          const refreshResult = await refreshSelectedWardsAction(selectedRate.id);
          if (refreshResult.success) {
            setSelectedWards(refreshResult.wardNos);
            setSelectedWardsTotalCount(refreshResult.totalCount);
          }

          // Reset Select All state
          if (isViewAllSelectAllActive && setIsViewAllSelectAllActive) {
            setIsViewAllSelectAllActive(false);
          }
          if (isAvailableSelectAllActive && setIsAvailableSelectAllActive) {
            setIsAvailableSelectAllActive(false);
          }
          setCheckedAvailable(new Set());
          router.refresh();
        } else {
          toast.error(result.error || t("wards.fetchError"));
        }
      } finally {
        setLoading(false);
        if (setViewAllSelectAllLoading) setViewAllSelectAllLoading(false);
        if (setAvailableSelectAllLoading) setAvailableSelectAllLoading(false);
      }
      return;
    }

    // Normal mode: move individually checked wards
    const toMove = Array.from(checkedAvailable);

    if (toMove.length === 0) return;

    // Use allRateSections (all rate sections) instead of rates (paginated) for lookup
    const selectedRate = allRateSections.find(r => String(r.id) === selectedZoneNo);
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
    checkedAvailable, allRateSections, selectedZoneNo, wardAssignments, selectedWards,
    setCheckedAvailable, setLoading, setSelectedWards, setSelectedWardsTotalCount,
    setWardAssignments, getRateSectionDisplayLabel, router, t,
    isViewAllSelectAllActive, isAvailableSelectAllActive,
    setViewAllSelectAllLoading, setAvailableSelectAllLoading,
    setIsViewAllSelectAllActive, setIsAvailableSelectAllActive,
    viewAllSearch, availableSearch
  ]);

  const moveToAvailable = useCallback(async () => {
    // Check if Select All is active for RateSectionWards
    if (isRateSectionSelectAllActive) {
      // Use allRateSections (all rate sections) instead of rates (paginated) for lookup
      const selectedRate = allRateSections.find(r => String(r.id) === selectedZoneNo);
      if (!selectedRate?.id) {
        toast.error(t("wards.rateSectionNotFound"));
        return;
      }

      setLoading(true);

      try {
        // Fetch all wards for this rate section
        const result = await getAllRateSectionDetailsForRateSectionAction(selectedRate.id);
        if (!result.success || !result.wardNos || result.wardNos.length === 0) {
          toast.info(t("wards.noWardsToDelete"));
          setLoading(false);
          if (setIsRateSectionSelectAllActive) setIsRateSectionSelectAllActive(false);
          return;
        }

        const allWardNos = result.wardNos;

        // Delete all wards
        const deleteResult = await deleteSelectedWardsAction(selectedRate.id, allWardNos);

        if (!deleteResult.success) {
          toast.error(deleteResult.error || t("wards.deleteError"));
          setLoading(false);
          return;
        }

        toast.success(t("wards.deleteSuccess", { count: deleteResult.deletedCount }));

        // Clear all selections and refresh
        setSelectedWards([]);
        setSelectedWardsTotalCount(0);
        setCheckedSelected(new Set());

        // Update ward assignments
        setWardAssignments(prev => {
          const next = { ...prev };
          allWardNos.forEach(w => {
            delete next[w];
          });
          return next;
        });

        if (setIsRateSectionSelectAllActive) setIsRateSectionSelectAllActive(false);
        router.refresh();

      } catch {
        toast.error(t("wards.deleteError"));
      }

      setLoading(false);
      return;
    }

    // Normal mode: move individually checked wards
    const toMove = Array.from(checkedSelected);

    if (toMove.length === 0) return;

    // Use allRateSections (all rate sections) instead of rates (paginated) for lookup
    const selectedRate = allRateSections.find(r => String(r.id) === selectedZoneNo);
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
    checkedSelected, allRateSections, selectedZoneNo, setLoading, setSelectedWards, selectedWards,
    setSelectedWardsTotalCount, setCheckedSelected, setWardAssignments, router, t,
    isRateSectionSelectAllActive, setIsRateSectionSelectAllActive
  ]);

  return { moveToSelected, moveToAvailable };
}
